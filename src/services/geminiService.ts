// ============================================================================
// DevPilot — Gemini Flash AI Service (Fast Knowledge Base Engine)
// ============================================================================

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const STORAGE_KEY_GEMINI_KEY = 'devpilot_gemini_api_key';
const STORAGE_KEY_AI_KEY = 'devpilot_ai_key';

/**
 * Retrieve active Gemini API Key from environment or localStorage
 */
export function getActiveGeminiKey(): string {
  if (typeof window === 'undefined') return '';

  const localKey =
    localStorage.getItem(STORAGE_KEY_GEMINI_KEY)?.trim() ||
    localStorage.getItem(STORAGE_KEY_AI_KEY)?.trim() ||
    '';

  if (localKey && localKey.length > 10) return localKey;

  const envKey =
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ||
    (import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined)?.trim() ||
    '';

  return envKey;
}

/**
 * Save user Gemini API key to browser storage (if provided via settings/backend)
 */
export function saveActiveGeminiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, trimmed);
    localStorage.setItem(STORAGE_KEY_AI_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    localStorage.removeItem(STORAGE_KEY_AI_KEY);
  }
}

/**
 * Priority list of fast Gemini Flash models
 */
const FLASH_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const SYSTEM_INSTRUCTION = `You are DevPilot AI, an ultra-fast, expert software engineering companion, technical mentor, and programming copilot.
You possess deep, comprehensive knowledge across ALL modern technical stacks, engineering disciplines, and software concepts, including:
1. Programming Languages & Systems: C, C++, Python, Java, JavaScript, TypeScript, Go, Rust, C#, Kotlin, Swift, SQL, Bash/Shell.
2. Full-Stack Web & Mobile Development: React, Next.js, Vue, Svelte, Angular, Node.js, Express, Django, FastAPI, Spring Boot, Flutter, React Native, REST APIs, GraphQL, WebSockets, Tailwind CSS.
3. Data Structures & Algorithms (DSA): Arrays, Strings, Linked Lists, Stacks, Queues, Hash Tables, Trees, BSTs, Heaps, Graphs, Sorting, Searching, Dynamic Programming, Greedy, Backtracking, and Asymptotic Complexity (Big-O time & space).
4. System Design & Distributed Systems: High Availability, Scalability, Microservices, Caching (Redis/Memcached), Message Queues (Kafka, RabbitMQ), Load Balancing, Database Sharding, Replication, Consistency Models, CAP Theorem, CDN.
5. Databases & Storage: Relational Databases (PostgreSQL, MySQL), NoSQL (MongoDB, DynamoDB), Vector Databases, Indexing (B-Tree, Hash, GIN), Query Optimization, ACID transactions, Normalization (1NF to 3NF/BCNF).
6. DevOps, Cloud & Infrastructure: Docker, Kubernetes, Linux/Unix internals, CI/CD pipelines (GitHub Actions, GitLab CI), AWS, Google Cloud, Azure, Terraform, Nginx, Observability & Monitoring.
7. Operating Systems & Networking: Process vs Thread, CPU scheduling, Memory Management, Virtual Memory, Deadlocks, Inter-Process Communication (IPC), OSI 7 layers, TCP/IP, UDP, DNS, HTTP/HTTPS, SSL/TLS handshakes, WebSockets.
8. Cybersecurity & Secure Coding: OWASP Top 10, SQL Injection, XSS, CSRF, Authentication (JWT, OAuth2, OpenID Connect), Cryptography (AES, RSA, Hashing & Salting), Network Security.
9. Artificial Intelligence & Machine Learning: Supervised/Unsupervised models, Neural Networks, Deep Learning, Transformers, LLMs, Vector Embeddings, MLOps, Model Evaluation.
10. Comprehensive Developer Roadmaps & Architecture: Creating detailed, step-by-step roadmaps for any language or stack, project breakdowns, clean architecture, and design patterns (Factory, Singleton, Observer, SOLID principles).

RESPONSE GUIDELINES:
- When a user asks for a roadmap or learning path (e.g., "roadmap of C language", "frontend roadmap", "DevOps guide"), provide an organized, multi-stage milestone guide from foundational syntax to real-world production projects and tools.
- Provide clean, runnable, idiomatic code examples with syntax formatting.
- For algorithmic queries, explain the intuition, edge cases, and analyze both Time and Space complexity.
- Maintain a clear, professional, concise, and developer-friendly tone.

STRICT OUT-OF-SCOPE BEHAVIOR:
If a user asks about topics completely unrelated to technology, software, programming, or engineering (such as movie gossip, cooking recipes, sports scores, medical advice, celebrity drama, or astrology), reply politely with:
"I am DevPilot AI, dedicated to software engineering, programming languages, technical stacks, system design, and developer roadmaps. This topic is outside my technical domain, but feel free to ask me anything about your code, tech stack, architecture, or software projects!"`;

/**
 * Call Gemini Flash with automatic model fallback
 */
export async function queryGeminiFlash(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  customApiKey?: string
): Promise<{ text: string; modelUsed: string; error?: string }> {
  const apiKey = (customApiKey || getActiveGeminiKey()).trim();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Format past history into Gemini contents format
  const recentHistory = history.slice(-6); // Keep last 3 turns for fast contextual responses
  const contents: GeminiMessage[] = recentHistory.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  // Append latest user prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  let lastError = '';

  // Try each Flash model in order
  for (const model of FLASH_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return { text: reply, modelUsed: model };
        }
      } else {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.error?.message || response.statusText;
        lastError = `[${model}] ${errMsg}`;

        // If key is invalid or quota exceeded, break immediately
        if (response.status === 400 && errMsg.toLowerCase().includes('api_key')) {
          throw new Error('INVALID_API_KEY: Please check your Gemini API key.');
        }
        if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED: Gemini API rate limit reached. Please wait a moment.');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('INVALID_API_KEY') || err.message?.includes('QUOTA_EXCEEDED')) {
        throw err;
      }
      lastError = err?.message || String(err);
    }
  }

  throw new Error(`Gemini Flash query failed: ${lastError}`);
}

export type StreamChunkCallback = (textChunk: string, fullAccumulatedText: string) => void;

/**
 * Call Gemini Flash with real-time progressive SSE streaming
 * Automatically falls back to standard query if SSE streaming is unsupported or fails
 */
export async function streamGeminiFlash(
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  onChunk: StreamChunkCallback,
  options?: {
    customApiKey?: string;
    signal?: AbortSignal;
  }
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = (options?.customApiKey || getActiveGeminiKey()).trim();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Format past history into Gemini contents format
  const recentHistory = history.slice(-6);
  const contents: GeminiMessage[] = recentHistory.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  // Append latest user prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 3000,
    },
  });

  let lastError = '';

  // Attempt real SSE streaming with each Flash model in priority order
  for (const model of FLASH_MODELS) {
    if (options?.signal?.aborted) {
      throw new Error('ABORTED');
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: options?.signal,
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);
              const partText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (partText) {
                accumulatedText += partText;
                onChunk(partText, accumulatedText);
              }
            } catch {
              // Ignore malformed partial chunks in SSE stream
            }
          }
        }

        if (accumulatedText.trim().length > 0) {
          return { text: accumulatedText, modelUsed: model };
        }
      } else {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.error?.message || response.statusText;
        lastError = `[${model}] ${errMsg}`;

        if (response.status === 400 && errMsg.toLowerCase().includes('api_key')) {
          throw new Error('INVALID_API_KEY: Please check your Gemini API key.');
        }
        if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED: Gemini API rate limit reached. Please wait a moment.');
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'ABORTED') {
        throw new Error('ABORTED');
      }
      if (err.message?.includes('INVALID_API_KEY') || err.message?.includes('QUOTA_EXCEEDED')) {
        throw err;
      }
      lastError = err?.message || String(err);
    }
  }

  // Graceful fallback to standard queryGeminiFlash if streaming was rejected
  return queryGeminiFlash(prompt, history, apiKey);
}
