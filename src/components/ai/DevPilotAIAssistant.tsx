// ============================================================================
// DevPilot — DevPilot AI Learning Assistant
// ============================================================================
import { useState, useRef, useEffect } from 'react';
import {
  Brain, Sparkles, Send, X, Bot, User, Code2, AlertCircle, Key,
  Lightbulb, RefreshCw, ChevronRight, Terminal, BookOpen, Layers
} from 'lucide-react';
import { Button, Input, Textarea, Badge } from '../ui';
import { useTrackProgress, useAllTopics } from '../../hooks/useDatabase';
import { useProfile } from '../../store/useStore';
import { cn } from '../../utils/helpers';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'Explain recursion line-by-line with a simple C++/Python example',
  'What is the difference between SQL and NoSQL databases?',
  'Give me 3 beginner LeetCode array problems with hints',
  'How do embeddings and vector databases work in AI applications?',
  'Explain how a 5:00-7:00 PM rest block prevents developer burnout',
  'Recommend my next priority topic based on my current progress',
];

export default function DevPilotAIAssistant() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('devpilot_ai_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { tracks } = useTrackProgress();
  const { profile } = useProfile();
  const allTopics = useAllTopics();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **DevPilot AI**, your personal programming tutor and engineering coach.\n\nI am here to help you master Python, tackle C++ & DSA, learn full-stack web development, understand system design, and build real-world AI applications.\n\nYou can ask me to **explain code line by line**, **give progressive hints** for coding challenges, or **recommend your next learning step**.`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Handle local intelligent mock responses or live API calls
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // If user provided a Gemini API Key in localStorage, we can query Gemini!
      if (apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{
                  text: `You are DevPilot AI, a patient programming tutor and learning coach for a college student who is a beginner programmer aiming to become an AI-powered software developer.
Student Profile:
- Goal: ${profile.careerGoal}
- Priorities: 1. Python, 2. C++ & DSA, 3. Web Dev, 4. System Design, 5. AI/ML Apps, 6. College C programming.
Rules:
- Be encouraging, step-by-step, beginner friendly.
- When explaining code, explain line by line.
- When helping with DSA, give hints before the complete answer.
User request: ${text}`
                }]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiReply) {
            setMessages(prev => [...prev, {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: aiReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setLoading(false);
            return;
          }
        }
      }

      // Offline / Intelligent Built-in Tutor Engine (No API key required)
      setTimeout(() => {
        let reply = '';
        const q = text.toLowerCase();

        if (q.includes('next') && (q.includes('topic') || q.includes('priority') || q.includes('recommend'))) {
          const nextPy = allTopics.find(t => t.trackId === 'python' && t.status !== 'completed');
          const nextDsa = allTopics.find(t => t.trackId === 'cpp-dsa' && t.status !== 'completed');
          reply = `Based on your real DevPilot database curriculum:\n\n1. **Python Priority:** ${nextPy ? `**${nextPy.title}** (${nextPy.section})` : 'Python track complete!'}\n2. **C++ & DSA Priority:** ${nextDsa ? `**${nextDsa.title}**` : 'DSA track complete!'}\n\n**Tutor Tip:** Dedicate your 4:00–5:00 PM slot to Python and your 7:00–8:00 PM slot to C++ practice today!`;
        } else if (q.includes('recursion')) {
          reply = `### Understanding Recursion (Step-by-Step)\n\nRecursion happens when a function calls itself to solve a smaller piece of the same problem.\n\nEvery recursive function needs **two things**:\n1. **Base Case:** The condition that tells it when to STOP.\n2. **Recursive Step:** Where the function calls itself with a smaller input.\n\n\`\`\`python\ndef factorial(n):\n    # 1. Base case: If n is 1 or 0, return 1 immediately\n    if n <= 1:\n        return 1\n    \n    # 2. Recursive case: n multiplied by factorial of (n - 1)\n    return n * factorial(n - 1)\n\`\`\`\n\n**Line-by-line explanation:**\n- When \`factorial(3)\` runs, it asks for \`3 * factorial(2)\`.\n- \`factorial(2)\` pauses and calls \`2 * factorial(1)\`.\n- \`factorial(1)\` hits the base case and returns \`1\`.\n- Now the stack resolves: \`2 * 1 = 2\`, then \`3 * 2 = 6\`!\n\nWould you like a hint on how to write a recursive function for the Fibonacci sequence?`;
        } else if (q.includes('sql') && q.includes('nosql')) {
          reply = `### SQL vs NoSQL: Practical Developer Comparison\n\n- **SQL (Relational):** Data lives in structured tables with rows, columns, and strict relations (keys). Examples: **PostgreSQL, SQLite, MySQL**.\n  - *Best for:* User accounts, e-commerce orders, banking transactions (requires ACID guarantees).\n- **NoSQL (Non-Relational):** Data lives in flexible JSON documents or key-value stores. Examples: **MongoDB, Redis, Pinecone (Vector DB)**.\n  - *Best for:* Real-time chat messages, rapid prototyping, caching, vector embeddings for AI.\n\n**For your career:** Start with **PostgreSQL** in Web Development, and learn **Redis + Vector DBs** for your AI applications!`;
        } else if (q.includes('embeddings') || q.includes('vector')) {
          reply = `### How Embeddings & Vector Databases Power AI Apps\n\n1. **Embeddings:** When an AI reads text (like a paragraph from a PDF), it converts the meaning into a list of numbers called a vector (e.g. \`[0.24, -0.81, 0.55, ...]\`).\n2. **Similarity:** Similar sentences have vectors that point in nearly the same mathematical direction (cosine similarity).\n3. **Vector Database:** Instead of searching for exact words, a vector DB (like ChromaDB or Pinecone) finds the **most semantically relevant documents** to the user's question.\n4. **RAG (Retrieval-Augmented Generation):** Your app fetches those relevant document snippets and pastes them into your LLM prompt as context!\n\nThis is the core architecture for building the "PDF Q&A Assistant" project in your roadmap!`;
        } else if (q.includes('hint') || q.includes('array')) {
          reply = `### Two Sum: Progressive Hint System\n\n**Problem:** Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.\n\n- **Hint 1:** Can you solve it with two nested loops? (Brute force: O(N²) time complexity).\n- **Hint 2:** If you are looking at number \`x\`, what number do you need? You need \`target - x\`.\n- **Hint 3 (Optimal):** Instead of looping again to find \`target - x\`, use a **Hash Map / Dictionary** to remember every number you have seen and its index in O(1) time!\n\nTry writing the code using Hint 3, and let me know if you want me to inspect your solution!`;
        } else {
          reply = `That is a great engineering question! As your DevPilot tutor, here is the breakdown:\n\nWhen working on **${text}**, remember to start with the simplest working example before adding complexity.\n\n- **Step 1:** Define your inputs and expected outputs clearly.\n- **Step 2:** Write down the logic in plain English comments (pseudocode).\n- **Step 3:** Implement incrementally and test with edge cases (e.g. empty inputs or zeros).\n\n*(To connect live streaming responses from Google Gemini, click the Key icon in the top right to paste a Gemini API key. DevPilot works 100% offline without one as well!)*`;
        }

        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setLoading(false);
      }, 600);

    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error connecting to AI service: ${err}. Falling back to offline tutor mode.`,
        timestamp: 'Now'
      }]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs transition-all hover:scale-105 active:scale-95 border border-white/20"
      >
        <Sparkles size={16} className="text-amber-300 animate-pulse" />
        <span>DevPilot AI Tutor</span>
        <Badge variant="purple" className="text-[10px] bg-white/20 text-white">Coach</Badge>
      </button>

      {/* Slide-out / Modal Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-[480px] h-[90vh] sm:h-[680px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                    DevPilot AI
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Patient Tutor & Learning Coach</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowKeyModal(true)}
                  title="Configure Gemini API Key"
                  className={cn(
                    'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
                    apiKey && 'text-emerald-400'
                  )}
                >
                  <Key size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Prompt Carousel */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] shrink-0">
              {PRESET_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5 max-w-[90%]',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white font-bold text-[10px]',
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-violet-600 to-indigo-600'
                  )}>
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>

                  <div className={cn(
                    'p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-700/60'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                  DevPilot AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form
                onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a programming concept, debug code, or request hints..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button type="submit" size="sm" disabled={!input.trim() || loading} className="rounded-xl px-3 py-2.5">
                  <Send size={15} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* API Key Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Key size={16} className="text-emerald-500" />
                Configure AI API Provider (Optional)
              </h4>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              DevPilot includes an intelligent built-in tutor that works 100% offline without any API key. If you wish to connect live streaming LLM generations from Google Gemini, enter your free Gemini API key below:
            </p>

            <Input
              label="Google Gemini API Key"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 space-y-1">
              <p>• Your key is saved locally in your browser's localStorage only.</p>
              <p>• Never committed or exposed to third parties.</p>
              <p>• You can get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">aistudio.google.com</a>.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowKeyModal(false)}>Cancel</Button>
              <Button onClick={() => {
                localStorage.setItem('devpilot_ai_key', apiKey.trim());
                setShowKeyModal(false);
              }}>
                Save Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
