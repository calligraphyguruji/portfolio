import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { services } from '../../data/portfolioData';
import { ArrowUpRight, X } from 'lucide-react';

export const WhatIBuild: React.FC = () => {
  // Default to first item ('uiux-design') matching the reference screenshot
  const [activeId, setActiveId] = useState<string | null>('uiux-design');
  const shouldReduceMotion = useReducedMotion();

  /* Bespoke tilted graphic mockups matching the design studio aesthetic */
  const renderFloatingMockup = (id: string) => {
    if (id === 'uiux-design') {
      return (
        <div className="hidden md:flex absolute -top-8 sm:-top-12 md:-top-16 right-16 lg:right-28 z-20 select-none pointer-events-none transform -rotate-6 transition-transform duration-500 hover:rotate-0">
          {/* Outer Card Wrapper */}
          <div className="p-2 sm:p-2.5 rounded-2xl sm:rounded-[22px] bg-white/95 dark:bg-[#1A202C] shadow-2xl border border-black/10 dark:border-white/15 flex items-center gap-2">
            {/* Phone 1: AI Food Discovery Greeting */}
            <div className="w-20 sm:w-24 md:w-26 aspect-[9/18] rounded-xl bg-neutral-900 text-white p-2 flex flex-col justify-between overflow-hidden shadow-md border border-white/10 font-sans text-[7px] leading-tight">
              <div>
                <div className="w-5 h-1 bg-white/30 rounded-full mx-auto mb-1.5" />
                <div className="text-[8px] font-bold text-white">No idea what to eat?</div>
                <div className="text-[6.5px] text-neutral-400 mt-0.5">Let AI handle it.</div>
              </div>
              <div className="space-y-1">
                <div className="p-1 rounded bg-white/10 text-neutral-300">Spicy Ramen</div>
                <div className="p-1 rounded bg-white/10 text-neutral-300">Avocado Toast</div>
              </div>
              <div className="py-1 rounded bg-white text-neutral-900 font-bold text-center text-[7px]">
                Explore
              </div>
            </div>

            {/* Phone 2: Center glowing Orb Screen */}
            <div className="w-22 sm:w-26 md:w-28 aspect-[9/18] rounded-xl bg-[#0F141E] text-white p-2 flex flex-col justify-between items-center overflow-hidden shadow-lg border border-cyan-500/30 font-sans relative">
              <div className="w-5 h-1 bg-white/30 rounded-full mb-1" />
              {/* Glowing Center Orb */}
              <div className="relative my-auto flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 blur-xs shadow-lg shadow-cyan-500/40" />
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              </div>
              <div className="p-1.5 rounded-lg bg-white/10 text-[6.5px] text-neutral-200 text-center leading-snug w-full">
                &ldquo;Quick and spicy under $15&rdquo;
              </div>
              <div className="w-4 h-4 rounded-full bg-cyan-400 text-neutral-900 flex items-center justify-center text-[8px] font-bold mt-1">
                &bull;
              </div>
            </div>

            {/* Phone 3: Restaurant Food Detail Card */}
            <div className="w-20 sm:w-24 md:w-26 aspect-[9/18] rounded-xl bg-neutral-900 text-white p-2 flex flex-col justify-between overflow-hidden shadow-md border border-white/10 font-sans text-[7px]">
              <div>
                <div className="w-5 h-1 bg-white/30 rounded-full mx-auto mb-1.5" />
                <div className="w-full h-10 rounded-lg bg-gradient-to-tr from-amber-500/80 to-rose-500/80 flex items-center justify-center font-bold text-white text-[8px]">
                  Truffle Burger
                </div>
              </div>
              <div className="flex items-center justify-between text-[6.5px] text-neutral-300 pt-1">
                <span>Rating 4.9</span>
                <span className="font-mono text-amber-400">$14.50</span>
              </div>
              <div className="py-1 rounded bg-rose-500 text-white font-bold text-center text-[7px]">
                Order Now
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'web-design-dev') {
      return (
        <div className="hidden md:flex absolute -top-8 sm:-top-12 md:-top-14 right-16 lg:right-28 z-20 select-none pointer-events-none transform rotate-3 transition-transform duration-500 hover:rotate-0">
          <div className="w-72 sm:w-80 rounded-2xl bg-[#0F131C] p-3.5 shadow-2xl border border-white/15 text-white font-mono text-[10px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-1 text-slate-300">app.kaushalnexus.sys</span>
              </div>
              <span className="text-cyan-400 font-bold">React 19</span>
            </div>
            <div className="py-2.5 space-y-1.5 text-slate-300 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Throughput</span>
                <span className="text-emerald-400 font-bold">1.2k req/sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Client Engine</span>
                <span className="text-indigo-300 font-bold">Vite + Tailwind</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Async Backend</span>
                <span className="text-cyan-300 font-bold">FastAPI + Redis</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-emerald-400 font-bold">
              <span>Status: Production Green</span>
              <span>0.12s TTFB</span>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'branding') {
      return (
        <div className="hidden md:flex absolute -top-8 sm:-top-12 md:-top-14 right-16 lg:right-28 z-20 select-none pointer-events-none transform -rotate-3 transition-transform duration-500 hover:rotate-0">
          <div className="w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#131722] p-4 shadow-2xl border border-black/10 dark:border-white/15 text-neutral-900 dark:text-white font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 font-mono text-[9px] text-neutral-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider">Design System Specimen</span>
              <span>v2.4</span>
            </div>
            <div className="py-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-neutral-950 dark:bg-white" />
                <span className="w-6 h-6 rounded-full bg-cyan-500" />
                <span className="w-6 h-6 rounded-full bg-indigo-600" />
                <span className="w-6 h-6 rounded-full bg-emerald-500" />
                <span className="w-6 h-6 rounded-full bg-amber-400" />
              </div>
              <div className="font-bold text-sm tracking-tight uppercase">Geometric Sans Hierarchy</div>
              <div className="font-mono text-[10px] text-neutral-500 dark:text-slate-400">
                JetBrains Mono &bull; Plus Jakarta Sans
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Motions & Animations Mockup
    return (
      <div className="hidden md:flex absolute -top-8 sm:-top-12 md:-top-14 right-16 lg:right-28 z-20 select-none pointer-events-none transform rotate-5 transition-transform duration-500 hover:rotate-0">
        <div className="w-72 sm:w-80 rounded-2xl bg-[#0F1420] p-4 shadow-2xl border border-white/15 text-white font-mono text-[10px]">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[9px] text-slate-400">
            <span className="text-cyan-400 font-bold uppercase">Spring Motion Studio</span>
            <span>60 FPS</span>
          </div>
          <div className="py-2 space-y-2">
            <div className="h-10 w-full rounded bg-black/40 border border-white/10 relative overflow-hidden flex items-center px-2">
              <div className="w-full h-0.5 bg-cyan-500/40 relative">
                <div className="absolute left-1/3 -top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400" />
              </div>
            </div>
            <div className="flex justify-between text-slate-400 text-[9px]">
              <span>Bezier: (0.22, 1, 0.36, 1)</span>
              <span className="text-emerald-400">Reduced-Motion Safe</span>
            </div>
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

      {/* Interactive Accordion Rows matching Screenshot */}
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
                className="my-6 rounded-2xl sm:rounded-[26px] bg-[#18191E] text-white p-6 sm:p-10 lg:p-12 relative overflow-visible shadow-2xl border border-white/10"
              >
                {/* Floating Tilted Mockup Preview */}
                {renderFloatingMockup(item.id)}

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
                    onClick={() => setActiveId(null)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={`Close ${item.title} details`}
                  >
                    <X className="w-5 h-5 stroke-[2]" />
                  </button>
                </div>
              </motion.div>
            );
          }

          // Collapsed Row matching Screenshot
          return (
            <motion.div
              key={item.id}
              layout={!shouldReduceMotion}
              onClick={() => setActiveId(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveId(item.id);
                }
              }}
              aria-label={`Expand details for ${item.title}`}
              className="group py-7 sm:py-9 px-1 flex items-center justify-between border-b border-black/[0.12] dark:border-white/[0.12] cursor-pointer select-none transition-colors"
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-sans tracking-tight text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors uppercase">
                {item.title}
              </h3>

              <div className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-900 dark:text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
