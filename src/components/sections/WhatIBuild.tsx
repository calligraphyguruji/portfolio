import React, { useState } from 'react';
import { whatIBuild } from '../../data/portfolioData';
import { ArrowUpRight, X, Sparkles, Terminal, Code2, Cpu } from 'lucide-react';

const iconMap = {
  fullstack: LayersIcon,
  backend: Terminal,
  aiml: Sparkles,
  dsa: Code2,
};

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Cpu {...props} />;
}

export const WhatIBuild: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('fullstack');

  return (
    <section id="build" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Watermark Typography matching Screenshot 3 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          CAPABILITIES
        </div>

        {/* Section Heading */}
        <div className="relative z-10 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
            /WHAT I BUILD
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
            Engineering Scope
          </h2>
        </div>

        {/* Interactive Expandable Rows matching Screenshot 3 */}
        <div className="relative z-10 divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {whatIBuild.map((item) => {
            const isActive = activeId === item.id;
            const Icon = iconMap[item.id as keyof typeof iconMap] || Terminal;

            if (isActive) {
              return (
                <div
                  key={item.id}
                  className="my-6 rounded-[28px] bg-[#14161C] text-white p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-white/10 transition-all duration-300"
                >
                  {/* Floating Mockup / Architecture Window Preview bursting through top edge */}
                  <div className="hidden md:block absolute -top-8 right-12 w-72 h-44 rounded-2xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-black p-4 border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform select-none pointer-events-none">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-[10px] font-mono text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="ml-2 font-mono">{item.id}.architecture.sys</span>
                    </div>
                    <div className="pt-2.5 font-mono text-[11px] text-slate-300 space-y-1">
                      <div>&gt; Stack: {item.technologies.slice(0, 3).join(', ')}</div>
                      <div>&gt; Status: Production Rigor</div>
                      <div className="text-emerald-400">&gt; Verified: True</div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="space-y-4 max-w-xl">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-mono uppercase tracking-widest">
                          {item.tagline}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight text-white uppercase">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {item.description}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                          Technologies &amp; Tools:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 border border-white/15 text-white"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs font-mono text-cyan-300 pt-1">
                        &bull; {item.highlight}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveId('')}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                      aria-label="Close details"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className="w-full py-6 sm:py-8 flex items-center justify-between text-left group hover:px-2 transition-all duration-200 cursor-pointer"
              >
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-sans font-bold uppercase tracking-tight text-[#171717] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 font-normal">
                    {item.tagline}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#171717] dark:text-white group-hover:bg-[#171717] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black group-hover:rotate-45 transition-all shadow-xs shrink-0 ml-4">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
