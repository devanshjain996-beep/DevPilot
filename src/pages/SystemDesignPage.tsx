// ============================================================================
// DevPilot — System Design Track Page
// ============================================================================
import { useState } from 'react';
import {
  Server, CheckCircle2, Search, ExternalLink, Cpu, Database, Network,
  Shield, Layers, ChevronDown, ChevronUp, Box, ArrowRight, Zap, Code
} from 'lucide-react';
import { Card, PageHeader, ProgressBar, Badge, Button, Checkbox, Textarea, StatCard } from '../components/ui';
import { useTopics, updateTopicStatus, updateTopicNotes } from '../hooks/useDatabase';
import { percentage, statusBg, cn } from '../utils/helpers';
import type { LearningStatus } from '../types';

// Structured detailed blueprints for the 6 practical design exercises
const SYSTEM_DESIGN_BLUEPRINTS: Record<string, {
  requirements: string[];
  components: string[];
  database: string;
  apis: string[];
  tradeoffs: string[];
  diagram: string;
}> = {
  'Design a URL Shortener': {
    requirements: [
      'Functional: Given a long URL, generate a short 7-character hash (e.g., bit.ly/3x8kY).',
      'Functional: Accessing short URL redirects with HTTP 301/302 to original URL.',
      'Non-Functional: High availability (99.99%), low latency reads (<20ms), URLs do not expire by default.',
    ],
    components: ['API Gateway / Rate Limiter', 'URL Shortening Application Service', 'Base62 Key Generation Service (KGS)', 'Redis Cache Cluster', 'Distributed Database (PostgreSQL / DynamoDB)'],
    database: 'Table: URL_Mapping (id: BIGINT PK, short_key: VARCHAR(7) UNIQUE INDEX, long_url: TEXT, created_at: TIMESTAMP, user_id: UUID, click_count: BIGINT)',
    apis: ['POST /api/v1/urls { long_url: string } -> { short_url: string, key: string }', 'GET /{short_key} -> 301 Redirect to long_url', 'GET /api/v1/urls/{short_key}/analytics -> { clicks, referrers }'],
    tradeoffs: ['301 Permanent Redirect (browser caches, fast) vs 302 Temporary Redirect (server tracks every analytics click).', 'Hash on the fly (MD5 + collision resolution) vs pre-generated keys in Redis/Key Generation Service (zero collisions).'],
    diagram: '[Client] -> [Load Balancer] -> [App Servers] -> [Redis Cache] -> [Primary DB (Read Replicas)]\n                                      -> [KGS Pre-generator]'
  },
  'Design a Chat Application': {
    requirements: [
      'Functional: 1-on-1 private messaging, online/offline status, message history sync across devices.',
      'Non-Functional: Real-time low latency (<100ms), durable message storage, end-to-end encryption capable.',
    ],
    components: ['WebSocket Gateway (persistent bidirectional connections)', 'Chat Service', 'Presence Service (Redis Heartbeats)', 'Push Notification Service (FCM/APNS)', 'Cassandra / MongoDB (message store)'],
    database: 'Message Table: (message_id: TIMEUUID PK, conversation_id: UUID, sender_id: UUID, content: TEXT, created_at: TIMESTAMP). Clustered by created_at DESC.',
    apis: ['WS /ws/chat?token={jwt}', 'POST /api/v1/messages/send { recipient_id, content }', 'GET /api/v1/conversations/{id}/messages?cursor={ts}&limit=50'],
    tradeoffs: ['WebSocket vs HTTP Long Polling vs gRPC: WebSockets provide lowest overhead for high-frequency duplex communication.', 'NoSQL (Cassandra/ScyllaDB) chosen over relational for write-heavy chat logs partitioning by conversation_id.'],
    diagram: '[User A] <-WebSocket-> [WS Gateway] -> [Kafka Event Queue] -> [Chat Service] -> [Cassandra DB]\n                                                                    -> [Presence Service]\n                                                                    -> [Push Notification Service]'
  },
  'Design a File Storage System': {
    requirements: [
      'Functional: Upload files up to 5GB, download files, generate shareable links, file versioning.',
      'Non-Functional: High durability (99.999999999%), chunked/resumable upload, global CDN caching for downloads.',
    ],
    components: ['API Server', 'Presigned URL Generator', 'Object Store (Amazon S3 / MinIO / Google Cloud Storage)', 'Metadata Database (PostgreSQL)', 'Block/Chunking Service', 'CDN (Cloudflare/CloudFront)'],
    database: 'Files Table: (file_id: UUID PK, user_id: UUID, file_name: VARCHAR, s3_bucket: VARCHAR, s3_key: VARCHAR, size_bytes: BIGINT, mime_type: VARCHAR, version: INT, created_at: TIMESTAMP)',
    apis: ['POST /api/v1/files/upload-initiate { filename, size } -> { upload_url: presignedS3Url, file_id }', 'POST /api/v1/files/upload-complete { file_id }', 'GET /api/v1/files/{file_id}/download -> Presigned S3 GET URL'],
    tradeoffs: ['Streaming file through application servers (causes server memory bottleneck) vs Presigned Direct Upload straight to Object Storage (saves server bandwidth/CPU).'],
    diagram: '[Client] -> [App Server] (requests presigned S3 URL)\n[Client] -> [Object Storage (S3)] (uploads chunk directly)\n[Client] -> [App Server] (saves metadata in PostgreSQL)'
  },
  'Design a Notification System': {
    requirements: [
      'Functional: Send multi-channel alerts (Email, SMS, Push Notification, In-App).',
      'Non-Functional: High throughput, rate limiting per user (prevent spamming), retry mechanism with exponential backoff.',
    ],
    components: ['Notification API Gateway', 'User Preference & Opt-out Service', 'RabbitMQ / Kafka priority queues', 'Workers per channel (Email Worker, SMS Worker, APNS/FCM Worker)', 'Third-party Providers (SendGrid, Twilio, FCM)'],
    database: 'Notifications: (id: UUID, user_id: UUID, channel: ENUM, status: PENDING/SENT/FAILED, template_id: VARCHAR, payload: JSONB, retry_count: INT)',
    apis: ['POST /api/v1/notifications/send { user_id, type, template_id, data }', 'GET /api/v1/notifications/user/{id}?unread_only=true'],
    tradeoffs: ['Priority queues (Critical OTPs bypass normal marketing newsletters in separate high-priority queues).', 'Idempotency keys prevent duplicate charged SMS/push notifications on retries.'],
    diagram: '[Internal Services] -> [Notification API] -> [Kafka Queues (High/Normal)]\n                             -> [Workers] -> [SendGrid / Twilio / FCM] -> [End User]'
  },
  'Design a Social Media Feed': {
    requirements: [
      'Functional: Users can post photos/text, follow users, and see a chronological or algorithmic timeline feed.',
      'Non-Functional: Fast feed rendering (<200ms), support celebrity accounts with millions of followers (hotkey problem).',
    ],
    components: ['Feed Generation Service', 'Fan-out Service (Push vs Pull model)', 'Social Graph Service (Neo4j / Redis Sets)', 'Redis Feed Cache (ZSETs with timestamp score)', 'Post Storage Service'],
    database: 'Posts: (post_id: UUID, user_id: UUID, content: TEXT, created_at: TIMESTAMP). Follows: (follower_id, followee_id). Feed Cache: Redis Sorted Set per user key.',
    apis: ['POST /api/v1/posts { text, media_urls }', 'GET /api/v1/feed?page=1&limit=20', 'POST /api/v1/users/{id}/follow'],
    tradeoffs: ['Fan-out on Write (Push): When user posts, write to all followers\' Redis feeds. (Fast read, slow if user has 10M followers).\nFan-out on Read (Pull): Merge feeds at query time (Heavy for active users).\nHybrid Approach: Push for normal users (<20k followers), pull on-demand for celebrities.'],
    diagram: '[User Post] -> [Post Service] -> [Kafka] -> [Fanout Worker]\n  -> Normal User: writes to followers\' Redis Feed ZSets\n  -> Celebrity: merged at read time by Feed Service'
  },
  'Design an AI Chatbot Application': {
    requirements: [
      'Functional: Streaming LLM conversation, context memory/conversation history, RAG document search, tool calling.',
      'Non-Functional: Streaming responses (first token <500ms), token cost tracking, user rate limiting, API failover.',
    ],
    components: ['FastAPI Backend with SSE (Server-Sent Events)', 'Redis Session Store (sliding window token buffer)', 'ChromaDB / Pinecone (Vector database for RAG)', 'LLM Gateway (OpenAI / Gemini / Anthropic with automatic fallback)', 'PostgreSQL (Chat logs & token usage analytics)'],
    database: 'Chat_Sessions: (session_id: UUID, user_id: UUID, title: VARCHAR, created_at). Messages: (message_id: UUID, session_id: UUID, role: user/assistant/tool, content: TEXT, tokens_used: INT, cost_cents: NUMERIC).',
    apis: ['POST /api/v1/chat/completions (Stream SSE: data: {"chunk": "..."})', 'POST /api/v1/chat/sessions { title }', 'GET /api/v1/chat/sessions/{id}/messages'],
    tradeoffs: ['Streaming SSE vs WebSockets: SSE is simpler, HTTP-based, perfect for one-directional token streaming.\nToken Budgeting: Trim conversation history with summarization or sliding window to keep context within limits.'],
    diagram: '[Client] -> [FastAPI (SSE)] -> [Redis Token Buffer] -> [Vector DB (Embeddings RAG)]\n                                  -> [LLM Gateway (Gemini/OpenAI)] -> Streams chunks back'
  }
};

export default function SystemDesignPage() {
  const topics = useTopics('system-design');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const completedCount = topics.filter(t => t.status === 'completed').length;
  const progressPct = percentage(completedCount, topics.length);

  const sections = ['Fundamentals', 'Intermediate', 'Design Exercises'];

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesSec = sectionFilter === 'all' || t.section === sectionFilter;
    return matchesSearch && matchesSec;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Design & Architecture"
        subtitle="Learn how high-scale distributed internet systems work, from DNS and databases to microservices and AI architecture."
        action={
          <Badge variant="purple" className="px-3 py-1 font-semibold text-sm">
            {progressPct}% Mastered
          </Badge>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Topics" value={topics.length} icon={<Server size={20} />} color="amber" />
        <StatCard label="Design Exercises" value={6} icon={<Layers size={20} />} color="violet" sub="Real-world system designs" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard label="Mastery Level" value={`${progressPct}%`} icon={<Cpu size={20} />} color="blue" />
      </div>

      {/* Progress Card */}
      <Card className="p-4 bg-slate-900 border-amber-500/30">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-200 flex items-center gap-2">
              <Server className="text-amber-400" size={18} />
              Software Architecture Progress: {completedCount} / {topics.length} concepts completed
            </span>
            <span className="text-amber-400 font-bold">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} color="amber" size="md" showPct={false} />
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search scaling, caching, microservices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={e => setSectionFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium w-full sm:w-auto"
        >
          <option value="all">All Sections</option>
          <option value="Fundamentals">Fundamentals (1-10)</option>
          <option value="Intermediate">Intermediate & Scaling (11-22)</option>
          <option value="Design Exercises">Practical Design Exercises (23-28)</option>
        </select>
      </div>

      {/* Grouped Topics */}
      <div className="space-y-6">
        {sections.map(section => {
          const secTopics = filteredTopics.filter(t => t.section === section);
          if (secTopics.length === 0) return null;

          const secDone = secTopics.filter(t => t.status === 'completed').length;
          const secPct = percentage(secDone, secTopics.length);

          return (
            <div key={section} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Box className="text-amber-400" size={18} />
                  {section}
                </h3>
                <Badge variant={section === 'Design Exercises' ? 'purple' : 'warning'}>
                  {secDone} / {secTopics.length} done ({secPct}%)
                </Badge>
              </div>

              <div className="space-y-3">
                {secTopics.map(topic => {
                  const blueprint = SYSTEM_DESIGN_BLUEPRINTS[topic.title];

                  return (
                    <Card key={topic.id} className="p-4 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={topic.status === 'completed'}
                            onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-400">#{topic.order}</span>
                              <h4 className={cn(
                                'text-sm font-semibold truncate',
                                topic.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                              )}>
                                {topic.title}
                              </h4>
                              <Badge className={statusBg(topic.status)}>
                                {topic.status.toUpperCase()}
                              </Badge>
                              {blueprint && (
                                <Badge variant="purple" className="flex items-center gap-1">
                                  <Zap size={10} /> Architecture Blueprint
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {topic.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={topic.status}
                            onChange={e => updateTopicStatus(topic.id, e.target.value as LearningStatus)}
                            className="text-xs bg-slate-100 dark:bg-slate-700 border-none rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="learning">Learning</option>
                            <option value="practising">Practising</option>
                            <option value="completed">Completed</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                            className="text-xs"
                          >
                            {expandedTopicId === topic.id ? 'Close' : blueprint ? 'View Architecture' : 'Exercises & Notes'}
                          </Button>
                        </div>
                      </div>

                      {expandedTopicId === topic.id && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                          {/* Rich Blueprint if this is one of the 6 Design Exercises */}
                          {blueprint && (
                            <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200">
                              <div>
                                <span className="font-bold text-amber-400 text-xs uppercase tracking-wider block mb-1">
                                  1. Requirements Analysis:
                                </span>
                                <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
                                  {blueprint.requirements.map((req, i) => <li key={i}>{req}</li>)}
                                </ul>
                              </div>

                              <div>
                                <span className="font-bold text-cyan-400 text-xs uppercase tracking-wider block mb-1">
                                  2. Architecture Flow & Diagram:
                                </span>
                                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto">
                                  {blueprint.diagram}
                                </pre>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="font-bold text-violet-400 text-xs uppercase tracking-wider block mb-1">
                                    3. Core Components:
                                  </span>
                                  <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
                                    {blueprint.components.map((c, i) => <li key={i}>{c}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider block mb-1">
                                    4. Database Schema:
                                  </span>
                                  <p className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
                                    {blueprint.database}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <span className="font-bold text-blue-400 text-xs uppercase tracking-wider block mb-1">
                                  5. API Endpoints:
                                </span>
                                <div className="space-y-1">
                                  {blueprint.apis.map((api, i) => (
                                    <div key={i} className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
                                      {api}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="font-bold text-rose-400 text-xs uppercase tracking-wider block mb-1">
                                  6. Trade-offs & Deep Dive:
                                </span>
                                <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
                                  {blueprint.tradeoffs.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                              </div>
                            </div>
                          )}

                          {topic.exercises && topic.exercises.length > 0 && !blueprint && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                              <span className="font-semibold text-amber-500 block mb-1">
                                Practical Exercises:
                              </span>
                              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                                {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                              </ul>
                            </div>
                          )}

                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Personal System Design Notes:
                            </span>
                            <Textarea
                              placeholder="Write architecture reflections, bottle-neck solutions, trade-off comparisons..."
                              value={topic.notes}
                              onChange={e => updateTopicNotes(topic.id, e.target.value)}
                              className="text-xs"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
