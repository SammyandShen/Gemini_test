import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../hooks/useDeepResearch';
import { Send, Loader2, Sparkles, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatPanel({ messages, isLoading, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles size={18} />
          </div>
          <h1 className="font-medium text-lg tracking-tight">Deep Research</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <Search size={48} className="text-zinc-700" />
            <p className="text-center max-w-sm">
              Enter a topic to begin deep research. I will search the web and compile a comprehensive report for you.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-br-sm" 
                    : "bg-zinc-800/50 text-zinc-200 rounded-bl-sm border border-white/5"
                )}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full justify-start"
          >
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-zinc-800/50 text-zinc-200 rounded-bl-sm border border-white/5 flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-sm text-zinc-400 animate-pulse">Researching and compiling...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-950">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to research?"
            className="flex-1 bg-transparent border-none py-4 pl-4 pr-12 text-sm focus:outline-none text-zinc-100 placeholder:text-zinc-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">AI can make mistakes. Verify important info.</span>
        </div>
      </div>
    </div>
  );
}
