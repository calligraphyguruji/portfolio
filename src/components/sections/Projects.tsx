import React, { useState } from 'react';
import { projects } from '../../data/portfolioData';
import { ArrowUpRight, ExternalLink, Github, Sparkles, Layers } from 'lucide-react';

export const Projects: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'PROJECTS' | 'EXPERIENCE'>('ALL');

  return (
    <section id="work" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Faint Watermark Typography matching Screenshot 2 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          PORTFOLIO
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
              /SELECTED WORK
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
              Featured Projects
            </h2>
          </div>

          {/* Filter Controls & View All Link */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
              {(['ALL', 'PROJECTS', 'EXPERIENCE'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    filter === f
                      ? 'bg-white dark:bg-[#1C2230] text-[#171717] dark:text-white shadow-xs'
                      : 'text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <a
              href="https://github.com/calligraphyguruji?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#12161F] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs transition-all"
            >
              <span>View All Repos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Projects Grid matching Screenshot 2 */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          {/* Project 1: KaushalNexus */}
          {projects[0] && (
            <article className="group rounded-[28px] bg-stone-50/70 dark:bg-[#161B26]/80 border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 shadow-sm">
              <div className="space-y-4">
                {/* Visual Preview Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-6 flex flex-col justify-between border border-black/10 dark:border-white/10 group-hover:shadow-md transition-all">
                  {/* Top Badge & Circular Arrow Button */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/15 backdrop-blur-md text-white border border-white/20">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      FLAGSHIP PLATFORM
                    </span>

                    {projects[0].liveUrl && (
                      <a
                        href={projects[0].liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg"
                        aria-label="Open live project"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {/* Visual Interface Mockup Details */}
                  <div className="space-y-2 text-white">
                    <div className="font-mono text-[11px] text-cyan-300 uppercase tracking-widest">
                      Full-Stack Architecture
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {projects[0].title}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-sm">
                      {projects[0].tagline}
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#171717] dark:text-white">
                    {projects[0].title} &ndash; Skilling &amp; Career Readiness
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed">
                    {projects[0].description}
                  </p>
                </div>
              </div>

              {/* Technologies & Action Footer */}
              <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {projects[0].technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-[11px] font-mono bg-white dark:bg-[#1A2130] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {projects[0].liveUrl && (
                    <a
                      href={projects[0].liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:underline underline-offset-4"
                    >
                      <span>Live App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {projects[0].githubUrl && (
                    <a
                      href={projects[0].githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white dark:bg-[#1A2130] border border-black/[0.06] dark:border-white/[0.08] text-[#171717] dark:text-white hover:opacity-75"
                      aria-label="GitHub repo"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          )}

          {/* Project 2: YouTube Clone */}
          {projects[1] && (
            <article className="group rounded-[28px] bg-stone-50/70 dark:bg-[#161B26]/80 border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 shadow-sm">
              <div className="space-y-4">
                {/* Visual Preview Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-neutral-900 via-stone-900 to-black p-6 flex flex-col justify-between border border-black/10 dark:border-white/10 group-hover:shadow-md transition-all">
                  {/* Top Badge & Circular Arrow Button */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/15 backdrop-blur-md text-white border border-white/20">
                      <Layers className="w-3 h-3 text-red-400" />
                      FRONTEND SYSTEM
                    </span>

                    {projects[1].githubUrl && (
                      <a
                        href={projects[1].githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg"
                        aria-label="Open GitHub code"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {/* Visual Interface Details */}
                  <div className="space-y-2 text-white">
                    <div className="font-mono text-[11px] text-red-400 uppercase tracking-widest">
                      Media Streaming Client
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {projects[1].title}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-sm">
                      {projects[1].tagline}
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#171717] dark:text-white">
                    {projects[1].title} &ndash; Video Streaming Interface
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed">
                    {projects[1].description}
                  </p>
                </div>
              </div>

              {/* Technologies & Action Footer */}
              <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {projects[1].technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-[11px] font-mono bg-white dark:bg-[#1A2130] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {projects[1].githubUrl && (
                  <a
                    href={projects[1].githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:underline underline-offset-4"
                  >
                    <span>Source Code</span>
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
