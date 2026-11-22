// ============================================================================
// DevPilot — Premium ChatGPT-Style Floating Chat Composer
// ============================================================================
import React, { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Square, Mic, MicOff, Sparkles, Paperclip } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text?: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  disabled?: boolean;
  placeholder?: string;
  onQuickPrompt?: (prompt: string) => void;
}

export default function ChatComposer({
  input,
  setInput,
  onSend,
  isStreaming,
  onStopStreaming,
  disabled = false,
  placeholder = 'Ask DevPilot anything about your code, roadmaps, or system design...',
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height up to 150px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [input]);

  // Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput(input ? `${input} ${transcript}` : transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [input, setInput]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  const canSubmit = input.trim().length > 0 && !disabled;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all focus-within:border-indigo-500/80 dark:focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:ring-cyan-500/20">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-white placeholder:text-slate-400 focus:outline-none max-h-[150px] chat-scroll font-medium"
        />

        {/* Composer Action Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-800 text-slate-300">
          <div className="flex items-center gap-1">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? 'Stop listening' : 'Speak message'}
              className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-500/15 text-rose-400 animate-pulse'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Quick helper badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-cyan-300">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Gemini Flash 3D</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Keyboard hint */}
            <span className="hidden md:inline-block text-xs text-slate-400 select-none font-medium">
              Enter to send, Shift + Enter for new line
            </span>

            {/* Stop or Send Action Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                aria-label="Stop generating response"
                className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => onSend()}
                aria-label="Send message"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  canSubmit
                    ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 scale-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed scale-95'
                }`}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
