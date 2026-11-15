// ============================================================================
// DevPilot — Cloud Sync Engine & Automatic Saving Manager
// ============================================================================
import { supabase, isSupabaseConfigured } from './supabase';
import { db } from '../store/db';
import type { CloudSyncStatus } from '../types';

type Listener = (status: CloudSyncStatus, errorMsg?: string) => void;

class SyncEngine {
  private status: CloudSyncStatus = 'saved';
  private listeners: Set<Listener> = new Set();
  private lastError: string | null = null;
  private syncQueue: Array<{ table: string; data: any; operation: 'upsert' | 'delete' }> = [];
  private isProcessingQueue = false;
  private currentUserId: string | null = null;
  private realtimeChannel: any = null;

  constructor() {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.lastError || undefined);
    return () => this.listeners.delete(listener);
  }

  public getStatus(): CloudSyncStatus {
    return this.status;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  private setStatus(status: CloudSyncStatus, errorMsg?: string) {
    this.status = status;
    this.lastError = errorMsg || null;
    this.listeners.forEach((fn) => fn(status, errorMsg));
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
    if (userId && isSupabaseConfigured()) {
      this.setupRealtimeSubscription(userId);
      this.syncDownFromCloud(userId);
    } else {
      this.teardownRealtimeSubscription();
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.setStatus('offline');
    } else {
      this.setStatus('saving');
      this.processQueue();
    }
  }

  /**
   * Queue a database change for automatic cloud synchronization
   */
  public async queueChange(table: string, data: any, operation: 'upsert' | 'delete' = 'upsert') {
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    if (!isSupabaseConfigured() || !this.currentUserId) {
      // Offline / guest mode — stored in Dexie locally
      this.setStatus('saved');
      return;
    }

    // Attach user ownership
    const payload = { ...data };
    if (operation === 'upsert' && !payload.user_id && this.currentUserId) {
      payload.user_id = this.currentUserId;
      delete payload.userId; // snake_case for PostgreSQL
    }

    this.syncQueue.push({ table, data: payload, operation });
    this.setStatus('saving');
    this.processQueue();
  }

  /**
   * Process the queued synchronization items
   */
  public async processQueue() {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return;
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.isProcessingQueue = true;
    this.setStatus('saving');

    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue[0];
        let error: any = null;

        if (item.operation === 'upsert') {
          const res = await supabase.from(item.table).upsert(item.data, {
            onConflict: 'id',
          });
          error = res.error;
        } else if (item.operation === 'delete') {
          const res = await supabase.from(item.table).delete().eq('id', item.data.id);
          error = res.error;
        }

        if (error) {
          console.warn(`Sync failed for table ${item.table}:`, error);
          this.setStatus('error', error.message || 'Failed to save to cloud.');
          this.isProcessingQueue = false;
          return;
        }

        // Successfully synced item, remove from queue
        this.syncQueue.shift();
      }

      this.setStatus('saved');
    } catch (err: any) {
      console.error('Queue processing error:', err);
      this.setStatus('error', err?.message || 'Network sync error.');
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Manual retry triggered by user
   */
  public async retrySync() {
    if (this.currentUserId) {
      await this.processQueue();
      await this.syncDownFromCloud(this.currentUserId);
    }
  }

  /**
   * Realtime subscription for multi-device sync
   */
  private setupRealtimeSubscription(userId: string) {
    this.teardownRealtimeSubscription();

    const channel = supabase.channel(`user_data_${userId}`);

    const tables = ['timetable', 'tasks', 'dsa_problems', 'projects', 'goals', 'daily_settings'];
    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        async (payload) => {
          await this.handleRemoteChange(table, payload);
        }
      );
    });

    channel.subscribe();
    this.realtimeChannel = channel;
  }

  private teardownRealtimeSubscription() {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
  }

  /**
   * Handle incoming remote change from another device
   */
  private async handleRemoteChange(table: string, payload: any) {
    try {
      const dexieTable = (db as any)[this.mapSupabaseToDexieTable(table)];
      if (!dexieTable) return;

      if (payload.eventType === 'DELETE') {
        await dexieTable.delete(payload.old?.id);
      } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const localData = this.mapDbRowToLocal(payload.new);
        await dexieTable.put(localData);
      }
    } catch (err) {
      console.warn('Realtime sync handling error:', err);
    }
  }

  /**
   * Pull user's latest cloud records down into local Dexie store
   */
  public async syncDownFromCloud(userId: string) {
    if (!isSupabaseConfigured() || !userId) return;

    this.setStatus('saving');
    try {
      // 1. Timetable
      const { data: timetable } = await supabase.from('timetable').select('*').eq('user_id', userId);
      if (timetable && timetable.length > 0) {
        await db.timetable.bulkPut(timetable.map(this.mapDbRowToLocal));
      }

      // 2. Tasks
      const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId);
      if (tasks && tasks.length > 0) {
        await db.tasks.bulkPut(tasks.map(this.mapDbRowToLocal));
      }

      // 3. DSA Problems
      const { data: dsa } = await supabase.from('dsa_problems').select('*').eq('user_id', userId);
      if (dsa && dsa.length > 0) {
        await db.dsaProblems.bulkPut(dsa.map(this.mapDbRowToLocal));
      }

      // 4. Projects
      const { data: projects } = await supabase.from('projects').select('*').eq('user_id', userId);
      if (projects && projects.length > 0) {
        await db.projects.bulkPut(projects.map(this.mapDbRowToLocal));
      }

      // 5. Goals
      const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId);
      if (goals && goals.length > 0) {
        await db.goals.bulkPut(goals.map(this.mapDbRowToLocal));
      }

      // 6. Daily Settings
      const { data: settings } = await supabase.from('daily_settings').select('*').eq('user_id', userId);
      if (settings && settings.length > 0) {
        await db.dailySettings.bulkPut(settings.map(this.mapDbRowToLocal));
      }

      this.setStatus('saved');
    } catch (err) {
      console.warn('Sync down failed:', err);
      this.setStatus('error', 'Could not sync latest cloud updates.');
    }
  }

  private mapSupabaseToDexieTable(table: string): string {
    switch (table) {
      case 'dsa_problems': return 'dsaProblems';
      case 'daily_settings': return 'dailySettings';
      case 'weekly_slots': return 'weeklySlots';
      case 'schedule_exceptions': return 'scheduleExceptions';
      case 'weekly_reviews': return 'weeklyReviews';
      case 'study_logs': return 'studyLogs';
      default: return table;
    }
  }

  private mapDbRowToLocal(row: any): any {
    const local = { ...row };
    if (local.user_id) {
      local.userId = local.user_id;
      delete local.user_id;
    }
    return local;
  }
}

export const syncEngine = new SyncEngine();
