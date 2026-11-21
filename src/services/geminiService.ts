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
 * Save user Gemini API key to browser storage
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
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash-lite',
];

const SYSTEM_INSTRUCTION = `You are DevPilot AI, an ultra-fast, intelligent Computer Science Learning Companion and programming tutor for software engineering students.
Your core knowledge base is deeply grounded in the curriculum and tutorial style of GeeksforGeeks and W3Schools across 9 major subjects:
1. Programming Fundamentals (Python, C++, Java, JavaScript, memory management, pointers, OOP)
2. Data Structures & Algorithms (Arrays, Trees, Graphs, Sorting, Dynamic Programming, Big-O analysis)
3. Database Management Systems (SQL, ACID, Normalization, Joins, Indexing, Transactions)
4. Operating Systems (Processes, Threads, Scheduling, Deadlocks, Virtual Memory, Paging)
5. Computer Networks (OSI 7 Layers, TCP/IP, 3-way handshake, DNS, Subnetting, HTTP/HTTPS)
6. Artificial Intelligence (A* search, Minimax, heuristic reasoning, intelligent agents)
7. Machine Learning (Supervised/Unsupervised models, Gradient Descent, Overfitting, Metrics)
8. Cyber Security (Cryptography, AES/RSA, SQL Injection, XSS, CSRF, SSL/TLS, Salting)
9. Modern Web Development (HTML5, CSS Flexbox/Grid, React hooks/lifecycle, REST APIs, JWT)

STRICT BOUNDARY INSTRUCTION:
If a user asks about topics completely outside Computer Science, coding, math for computing, or software engineering (such as movie gossip, cooking recipes, cricket/sports scores, personal medical diagnoses, or astrology), reply politely with:
"I apologize, but this topic is currently outside my technical knowledge base. As your DevPilot Computer Science Learning Companion, I specialize exclusively in Computer Science and software engineering (grounded in GeeksforGeeks and W3Schools topics). Please ask me any coding, algorithm, system design, or CS interview question!"

When answering Computer Science questions:
- Provide structured, clear explanations with syntax-highlighted code.
- Explain code line-by-line when breaking down concepts.
- Provide time & space complexity ($O(N)$, $O(\\log N)$, etc.) for algorithms.
- Be encouraging, precise, and fast!`;

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
            maxOutputTokens: 2048,
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
          throw new Error('INVALID_API_KEY: Please check your Gemini API key from Google AI Studio.');
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
