import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, RotateCcw, ExternalLink, ShieldCheck, Bot, Briefcase, Copy, Check, } from 'lucide-react';
const SUGGESTED_PROMPTS = [
    { label: 'Explain CredVidhi Architecture', query: 'Explain CredVidhi system architecture, finite state machine, and data flow.' },
    { label: 'Recruiter Fit: SDE Intern', query: 'Is Aman suitable for an SDE or Frontend internship? Give an evidence-backed evaluation.' },
    { label: 'How does KaushalNexus work?', query: 'How does KaushalNexus match learners to internships and what AI does it use?' },
    { label: 'DSA & LeetCode Foundations', query: 'What is Aman’s DSA experience and LeetCode problem solving background?' },
];
export const CopilotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => [
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I am Aman Mishra's **AI Portfolio Copilot**.\n\nI can explain his system architectures, deep-dive into projects like **CredVidhi** and **KaushalNexus**, evaluate his skills for **recruiter roles**, and cite verified sources from his repositories.\n\nWhat would you like to explore?",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);
    const handleSend = async (queryToSend) => {
        const text = (queryToSend || input).trim();
        if (!text || isLoading)
            return;
        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            // Call serverless /api/copilot/chat
            const res = await fetch('/api/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map((m) => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content,
                    })),
                }),
            });
            if (!res.ok) {
                throw new Error(`API returned HTTP ${res.status}`);
            }
            const data = (await res.json());
            const assistantMsg = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.answer,
                intent: data.intent,
                citations: data.citations,
                recruiterAlignment: data.recruiterAlignment,
                mermaidDiagram: data.mermaidDiagram,
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        }
        catch (err) {
            console.error('[Copilot UI] Error:', err);
            // Fallback message
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: "I encountered a temporary connection issue. You can explore Aman's verified projects directly via the **Projects** section or re-try your question.",
                    timestamp: Date.now(),
                    isError: true,
                },
            ]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleReset = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: "Conversation reset. Ask me about Aman's projects, modern C++ systems, React 19 architecture, or recruiter evaluations!",
                timestamp: Date.now(),
            },
        ]);
    };
    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed bottom-6 right-6 z-50", children: _jsxs("button", { onClick: () => setIsOpen((prev) => !prev), className: `flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 ${isOpen
                        ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] scale-95'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 hover:scale-105 active:scale-95'}`, "aria-label": isOpen ? 'Close AI Portfolio Copilot' : 'Open AI Portfolio Copilot', children: [_jsx(Sparkles, { className: "w-4 h-4 animate-pulse" }), _jsx("span", { className: "text-xs font-mono font-bold tracking-wider uppercase", children: isOpen ? 'Close Copilot' : 'Ask Portfolio Copilot' })] }) }), _jsx(AnimatePresence, { children: isOpen && (_jsxs(motion.div, { initial: { opacity: 0, y: 30, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 30, scale: 0.95 }, transition: { duration: 0.2 }, className: "fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[460px] h-[640px] max-h-[80vh] bg-white dark:bg-[#12141A] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans", children: [_jsxs("div", { className: "px-4 py-3.5 bg-slate-50 dark:bg-[#181B24] border-b border-black/10 dark:border-white/10 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400", children: _jsx(Bot, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-bold text-[#171717] dark:text-white uppercase tracking-wider font-mono", children: "AI Portfolio Copilot" }), _jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" }), _jsx("span", { children: "Grounded in verified codebase" })] })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: handleReset, title: "Reset Conversation", className: "p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors", children: _jsx(RotateCcw, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm", children: [messages.map((msg) => (_jsxs("div", { className: `flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`, children: [_jsxs("div", { className: `max-w-[88%] p-3.5 rounded-2xl relative group ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-xs'
                                                : msg.isError
                                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-bl-xs'
                                                    : 'bg-slate-100 dark:bg-[#1E2230] text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5 rounded-bl-xs'}`, children: [_jsx("button", { onClick: () => handleCopy(msg.id, msg.content), className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-opacity", title: "Copy response", children: copiedId === msg.id ? (_jsx(Check, { className: "w-3 h-3 text-emerald-500" })) : (_jsx(Copy, { className: "w-3 h-3" })) }), _jsx("div", { className: "whitespace-pre-wrap leading-relaxed pr-5", children: msg.content }), msg.recruiterAlignment && (_jsxs("div", { className: "mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400", children: [_jsx(Briefcase, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Candidate Fit Summary:" })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: msg.recruiterAlignment.suitableRoles.map((role) => (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-mono", children: role }, role))) })] })), msg.citations && msg.citations.length > 0 && (_jsxs("div", { className: "mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400", children: [_jsx(ShieldCheck, { className: "w-3 h-3 text-emerald-500" }), _jsx("span", { children: "Verified Sources:" })] }), _jsx("div", { className: "space-y-1", children: msg.citations.map((cite) => (_jsxs("a", { href: cite.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-between gap-2 p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 transition-colors text-[11px] font-mono", children: [_jsx("span", { className: "truncate", children: cite.title }), _jsx(ExternalLink, { className: "w-3 h-3 shrink-0" })] }, cite.sourceId))) })] }))] }), _jsx("span", { className: "text-[10px] font-mono text-slate-400 mt-1 px-1", children: new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) })] }, msg.id))), isLoading && (_jsxs("div", { className: "flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-[#1E2230] text-slate-500 w-fit", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 animate-spin text-blue-500" }), _jsx("span", { className: "text-xs font-mono", children: "Consulting portfolio knowledge base..." })] })), _jsx("div", { ref: messagesEndRef })] }), messages.length <= 2 && (_jsx("div", { className: "px-4 py-2 bg-slate-50 dark:bg-[#151821] border-t border-black/5 dark:border-white/5 overflow-x-auto flex gap-2 no-scrollbar", children: SUGGESTED_PROMPTS.map((prompt) => (_jsx("button", { onClick: () => handleSend(prompt.query), className: "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white dark:bg-[#1E2230] border border-black/10 dark:border-white/10 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-all text-left", children: prompt.label }, prompt.label))) })), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                handleSend();
                            }, className: "p-3 bg-white dark:bg-[#12141A] border-t border-black/10 dark:border-white/10 flex items-center gap-2", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask about projects, architecture, recruiter fit...", className: "flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1C202C] text-slate-800 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent", disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading || !input.trim(), className: "p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors", "aria-label": "Send message", children: _jsx(Send, { className: "w-4 h-4" }) })] })] })) })] }));
};
