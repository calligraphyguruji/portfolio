import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { services } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import { ArrowUpRight, X } from 'lucide-react';

export const WhatIBuild: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>('fullstack');
  const shouldReduceMotion = useReducedMotion();
  const leetcodeStats = useLeetCodeStats();

  /* Bespoke tilted graphic mockups matching the screenshot aesthetic tailored for software engineering */
  const renderFloatingMockup = (id: string) => {
    if (id === 'fullstack') {
      return (
        /* Outer Card Wrapper matching the 3-screen layout from screenshot */
        <div className="p-2 sm:p-2.5 rounded-2xl sm:rounded-[22px] bg-[#fdfdfd] text-neutral-900 shadow-2xl border border-white/20 flex items-center gap-2 select-none">
          {/* Screen 1: Reactive Client UI */}
          <div className="w-20 sm:w-24 md:w-26 aspect-[9/18] rounded-xl bg-neutral-900 text-white p-2 flex flex-col justify-between overflow-hidden shadow-md border border-white/10 font-sans text-[7px] leading-tight">
            <div>
              <div className="w-5 h-1 bg-white/30 rounded-full mx-auto mb-1.5" />
              <div className="text-[8px] font-bold text-white">KaushalNexus</div>
              <div className="text-[6.5px] text-cyan-400 font-mono mt-0.5">React 19 + Vite</div>
            </div>
            <div className="space-y-1">
              <div className="p-1 rounded bg-white/10 text-neutral-300">Learner Dashboard</div>
              <div className="p-1 rounded bg-white/10 text-neutral-300">District Telemetry</div>
            </div>
            <div className="py-1 rounded bg-cyan-500 text-neutral-950 font-bold text-center text-[7px]">
              Live App
            </div>
          </div>

          {/* Screen 2: Center glowing Service Engine */}
          <div className="w-22 sm:w-26 md:w-28 aspect-[9/18] rounded-xl bg-[#0F141E] text-white p-2 flex flex-col justify-between items-center overflow-hidden shadow-lg border border-cyan-500/30 font-sans relative">
            <div className="w-5 h-1 bg-white/30 rounded-full mb-1" />
            {/* Glowing Center Core */}
            <div className="relative my-auto flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 blur-xs shadow-lg shadow-cyan-500/40" />
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            </div>
            <div className="p-1.5 rounded-lg bg-white/10 text-[6.5px] text-cyan-200 text-center leading-snug w-full font-mono">
              &ldquo;FastAPI &bull; 14ms TTFB&rdquo;
            </div>
            <div className="w-4 h-4 rounded-full bg-cyan-400 text-neutral-900 flex items-center justify-center text-[8px] font-bold mt-1">
              &bull;
            </div>
          </div>

          {/* Screen 3: PostgreSQL & API Status */}
          <div className="w-20 sm:w-24 md:w-26 aspect-[9/18] rounded-xl bg-neutral-900 text-white p-2 flex flex-col justify-between overflow-hidden shadow-md border border-white/10 font-sans text-[7px]">
            <div>
              <div className="w-5 h-1 bg-white/30 rounded-full mx-auto mb-1.5" />
              <div className="w-full h-10 rounded-lg bg-gradient-to-tr from-indigo-600/80 to-purple-600/80 flex flex-col items-center justify-center font-bold text-white text-[8px]">
                <span>PostgreSQL</span>
                <span className="text-[6px] font-mono font-normal text-slate-300">Pool Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[6.5px] text-neutral-300 pt-1 font-mono">
              <span>Redis</span>
              <span className="text-emerald-400">99.8% Cache</span>
            </div>
            <div className="py-1 rounded bg-white/15 text-white font-mono text-center text-[7px]">
              REST API
            </div>
          </div>
        </div>
      );
    }

    if (id === 'backend') {
      return (
        <div className="w-72 sm:w-80 rounded-2xl bg-[#0F131C] p-3.5 shadow-2xl border border-white/15 text-white font-mono text-[10px] select-none">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="ml-1 text-slate-300">api.gateway.sys</span>
            </div>
            <span className="text-cyan-400 font-bold">FastAPI</span>
          </div>
          <div className="py-2.5 space-y-1.5 text-slate-300 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoints</span>
              <span className="text-emerald-400 font-bold">POST /v1/evaluate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Schema</span>
              <span className="text-indigo-300 font-bold">Pydantic v2 Strict</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Pool</span>
              <span className="text-cyan-300 font-bold">SQLAlchemy + Postgres</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-emerald-400 font-bold">
            <span>Status: 200 OK</span>
            <span>Redis Cache Hit</span>
          </div>
        </div>
      );
    }

    if (id === 'aiml') {
      return (
        <div className="w-72 sm:w-80 rounded-2xl bg-[#0B0F19] p-4 shadow-2xl border border-purple-500/20 text-white font-mono text-xs select-none">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] text-slate-400">
            <span className="text-purple-300 font-bold uppercase tracking-wider">Gemini Intelligence Studio</span>
            <span className="text-cyan-400">v1.5 Flash</span>
          </div>
          <div className="py-2.5 space-y-2">
            <div className="p-2 rounded bg-black/40 border border-white/10 text-[10px] space-y-1">
              <div className="text-slate-400">&gt; Prompt: Candidate Competency Analysis</div>
              <div className="text-emerald-400 font-bold">&gt; Strict JSON Validated (0.38s)</div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 pt-1">
              <span>Output: Diagnostic Roadmap</span>
              <span className="text-purple-300">Zero Hallucination</span>
            </div>
          </div>
        </div>
      );
    }

    // Algorithms & Optimization Mockup
    return (
      <div className="w-72 sm:w-80 rounded-2xl bg-[#0A0E17] p-4 shadow-2xl border border-white/15 text-white font-mono text-[10px] select-none">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] text-slate-400">
          <span className="text-cyan-400 font-bold uppercase">C++20 STL Optimization</span>
          <span className="text-emerald-400">{leetcodeStats.totalSolved}+ Solved</span>
        </div>
        <div className="py-2 space-y-2">
          <div className="h-10 w-full rounded bg-black/40 border border-white/10 relative overflow-hidden flex items-center px-2">
            <div className="w-full h-0.5 bg-blue-500/40 relative">
              <div className="absolute left-1/2 -top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400" />
            </div>
          </div>
          <div className="flex justify-between text-slate-400 text-[9px]">
            <span>Runtime: 0ms (Beats 100%)</span>
            <span className="text-sky-300 font-bold">O(N) Time &bull; O(1) Space</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="services" className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 relative z-10">
      {/* Anchor for backwards compatibility with #build */}
      <span id="build" className="sr-only" />

      {/* Top Left Section Title matching Screenshot */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-sans tracking-tight text-neutral-900 dark:text-white uppercase">
          /SERVICE
        </h2>
      </div>

      {/* Interactive Service Rows with Hover Details Card */}
      <div className="border-t border-black/[0.12] dark:border-white/[0.12]">
        {services.map((item) => {
          const isExpanded = activeId === item.id;

          if (isExpanded) {
            return (
              <motion.div
                key={item.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="my-6 rounded-2xl sm:rounded-[26px] bg-[#262626] text-white p-6 sm:p-10 lg:p-12 relative overflow-visible shadow-2xl border border-[#383838]"
              >
                {/* Floating Tilted Mockup Preview */}
                <div className="hidden md:flex absolute right-16 lg:right-28 -top-8 sm:-top-12 md:-top-16 z-20 select-none pointer-events-none transform -rotate-6 filter drop-shadow-2xl">
                  {renderFloatingMockup(item.id)}
                </div>

                {/* Card Interior Layout */}
                <div className="flex items-start justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-sm sm:max-w-md lg:max-w-lg">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-sans tracking-tight text-white uppercase">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed font-normal">
                      {item.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/10 text-neutral-200 border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Close Icon matching Screenshot */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(null);
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={`Close ${item.title} details`}
                  >
                    <X className="w-5 h-5 stroke-[2]" />
                  </button>
                </div>
              </motion.div>
            );
          }

          // Collapsed Service Row - Hovering expands details card matching screenshot
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveId(item.id);
                }
              }}
              aria-label={`Show details for ${item.title}`}
              className="group py-7 sm:py-9 px-1 flex items-center justify-between border-b border-black/[0.12] dark:border-white/[0.12] cursor-pointer select-none transition-colors relative"
            >
              {/* Left Side: Title matching Screenshot */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-sans tracking-tight text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors uppercase">
                {item.title}
              </h3>

              {/* Right Side: Arrow Icon with hover animation */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-900 dark:text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0">
                <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
