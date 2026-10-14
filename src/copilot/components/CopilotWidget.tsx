import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Bot,
  Briefcase,
  Copy,
  Check,
  Square,
  RefreshCw,
} from 'lucide-react';
import { ResumeCard } from './ResumeCard.tsx';
import type { ChatMessage, CopilotChatResponse } from '../types.ts';

const SUGGESTED_PROMPTS = [
  { label: 'Explain CredVidhi Architecture', query: 'Explain CredVidhi system architecture, finite state machine, and data flow.' },
  { label: 'Recruiter Fit: SDE Intern', query: 'Is Aman suitable for an SDE or Frontend internship? Give an evidence-backed evaluation.' },
  { label: 'Get Aman’s Resume (PDF)', query: 'gimme resume' },
  { label: 'DSA & LeetCode Foundations', query: 'What is Aman’s DSA experience and LeetCode problem solving background?' },
];

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

const MarkdownCode: React.FC<CodeBlockProps> = ({ className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeContent = String(children).replace(/\n$/, '');
  const isInline = !match && !codeContent.includes('\n');

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-rose-600 dark:text-rose-400 font-mono text-[11px] font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = match ? match[1] : 'code';

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#0F1117] text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181B24] border-b border-white/5 text-[11px] font-mono">
        <span className="uppercase text-slate-400 font-bold">{language}</span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          title="Copy code snippet"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] sm:text-xs font-mono leading-relaxed bg-[#0F1117] text-slate-200">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const CopilotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am **Mantri**, Aman Mishra's official AI advisor and engineering guide.\n\n*Your AI guide to Aman Mishra's engineering work.*\n\nI can explain his system architectures, deep-dive into projects like **CredVidhi** and **KaushalNexus**, evaluate his skills for **recruiter roles**, and cite verified sources from his repositories.\n\nWhat would you like to explore?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(
    () => 'conv-' + Math.random().toString(36).slice(2, 10)
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const apiUrl =
      (typeof import.meta !== 'undefined' &&
        import.meta.env?.VITE_MANTRI_API_URL) ||
      '/api/copilot';

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch {}

        if (res.status === 429) {
          throw new Error('RATE_LIMIT');
        } else if (res.status === 504) {
          throw new Error('TIMEOUT');
        } else if (errData?.error) {
          throw new Error(errData.error);
        }
        throw new Error(`HTTP_${res.status}`);
      }

      const data = (await res.json()) as unknown as CopilotChatResponse;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        intent: data.intent,
        citations: data.citations,
        recruiterAlignment: data.recruiterAlignment,
        mermaidDiagram: data.mermaidDiagram,
        resumeCard: data.resumeCard,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: `aborted-${Date.now()}`,
            role: 'assistant',
            content: '*(Generation stopped by user)*',
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      console.error('[Mantri UI] Error:', err);
      let errorText =
        "I encountered a temporary connection issue. You can explore Aman's verified projects directly via the **Projects** section or re-try your question.";
      if (err?.message === 'RATE_LIMIT') {
        errorText =
          'Mantri is receiving too many requests right now. Please wait a moment and try again.';
      } else if (err?.message === 'TIMEOUT') {
        errorText = 'Mantri took too long to respond. Please try your question again.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorText,
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    handleStopGeneration();
    setConversationId('conv-' + Math.random().toString(36).slice(2, 10));
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Conversation reset. Ask Mantri about Aman's projects, modern C++ systems, React 19 architecture, or recruiter evaluations!",
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] scale-95'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
          }`}
          aria-label={isOpen ? 'Close Mantri' : 'Ask Mantri'}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase">
            {isOpen ? 'Close Mantri' : 'Ask Mantri'}
          </span>
        </button>
      </div>

      {/* Slide-over Mantri Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[480px] h-[660px] max-h-[82vh] bg-white dark:bg-[#12141A] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-50 dark:bg-[#181B24] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider font-mono">
                      Mantri
                    </h3>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Portfolio knowledge connected</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate max-w-[260px] sm:max-w-[320px]">
                    Your AI guide to Aman Mishra's engineering work.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Mantri"
                  aria-label="Close Mantri"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[88%] p-3.5 rounded-2xl relative group ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : msg.isError
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-bl-xs'
                        : 'bg-slate-100 dark:bg-[#1E2230] text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 rounded-bl-xs'
                    }`}
                  >
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-opacity"
                      title="Copy response"
                      aria-label="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Rich Markdown & LaTeX Content */}
                    <div className="leading-relaxed pr-4 overflow-hidden">
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code: MarkdownCode as any,
                            h1: ({ ...props }) => (
                              <h1 className="text-sm font-bold mt-2 mb-1.5 text-slate-900 dark:text-white font-mono" {...props} />
                            ),
                            h2: ({ ...props }) => (
                              <h2 className="text-xs font-bold mt-2 mb-1 text-slate-900 dark:text-white font-mono" {...props} />
                            ),
                            h3: ({ ...props }) => (
                              <h3 className="text-xs font-bold mt-2 mb-1 text-blue-600 dark:text-blue-400 font-mono" {...props} />
                            ),
                            p: ({ ...props }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                            ),
                            ul: ({ ...props }) => (
                              <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                            ),
                            ol: ({ ...props }) => (
                              <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                            ),
                            li: ({ ...props }) => (
                              <li className="leading-relaxed" {...props} />
                            ),
                            blockquote: ({ ...props }) => (
                              <blockquote className="border-l-2 border-blue-500 pl-3 my-2 italic text-slate-600 dark:text-slate-400" {...props} />
                            ),
                            table: ({ ...props }) => (
                              <div className="my-2.5 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
                                <table className="w-full text-left border-collapse text-[11px]" {...props} />
                              </div>
                            ),
                            th: ({ ...props }) => (
                              <th className="px-2.5 py-1.5 bg-black/5 dark:bg-white/5 font-mono font-bold text-slate-900 dark:text-white border-b border-black/10 dark:border-white/10" {...props} />
                            ),
                            td: ({ ...props }) => (
                              <td className="px-2.5 py-1.5 border-b border-black/5 dark:border-white/5" {...props} />
                            ),
                            a: ({ ...props }) => (
                              <a
                                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Resume PDF Download Card */}
                    {msg.resumeCard && (
                      <ResumeCard data={msg.resumeCard} />
                    )}

                    {/* Recruiter Badge Box */}
                    {msg.recruiterAlignment && (
                      <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Candidate Fit Summary:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.recruiterAlignment.suitableRoles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-mono"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations references */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Verified Sources:</span>
                        </div>
                        <div className="space-y-1">
                          {msg.citations.map((cite) => (
                            <a
                              key={cite.sourceId}
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-colors text-[11px] font-mono"
                            >
                              <span className="truncate">{cite.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.isError && (
                      <div className="mt-2 pt-2 border-t border-rose-500/20">
                        <button
                          type="button"
                          onClick={() => {
                            const lastUser = [...messages]
                              .reverse()
                              .find((m) => m.role === 'user');
                            if (lastUser) handleSend(lastUser.content);
                          }}
                          className="flex items-center gap-1 text-[11px] font-mono text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry question</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-[#1E2230] text-slate-500 w-full">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-xs font-mono">Mantri is generating response...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts Pill Carousel */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#151821] border-t border-black/5 dark:border-white/5 overflow-x-auto flex gap-2 no-scrollbar">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    key={prompt.label}
                    onClick={() => handleSend(prompt.query)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white dark:bg-[#1E2230] border border-black/10 dark:border-white/10 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-[#12141A] border-t border-black/10 dark:border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder="Ask Mantri about projects, architecture, DSA, and more..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1C202C] text-slate-800 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent"
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1"
                  title="Stop generating"
                  aria-label="Stop generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
