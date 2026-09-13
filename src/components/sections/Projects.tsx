import React from 'react';
import { projects } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { ExternalLink, Github, CheckCircle2, Star } from 'lucide-react';

export const Projects: React.FC = () => {
  const flagship = projects.find((p) => p.tier === 'flagship');
  const coreProjects = projects.filter((p) => p.tier === 'core');

  return (
    <section id="projects" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="04 // Engineered Works"
        title="Featured Projects"
        number="04 — 06"
        description="Production web applications, full-stack skilling architectures, and interactive frontend builds."
      />

      {/* Flagship Project: KaushalNexus */}
      {flagship && (
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-950/80 dark:bg-cyan-950/80 light:bg-sky-100 text-cyan-300 dark:text-cyan-300 light:text-sky-900 border border-cyan-500/40 dark:border-cyan-500/40 light:border-sky-300">
              <Star className="w-3 h-3 text-cyan-400 dark:text-cyan-400 light:text-sky-700 fill-current" />
              Flagship Architecture
            </span>
          </div>

          <article className="group rounded-[2.5rem] bg-slate-900/90 dark:bg-slate-900/90 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] p-6 sm:p-10 shadow-xl relative overflow-hidden transition-colors">
            {/* Ambient Background Gradient Glow from Stitch */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-3 border-b border-slate-800 dark:border-slate-800 light:border-stone-300/80 pb-6">
                <div>
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white dark:text-white light:text-stone-900 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 light:group-hover:text-sky-700 transition-colors">
                    {flagship.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-cyan-400 dark:text-cyan-400 light:text-sky-700 mt-1">
                    {flagship.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {flagship.liveUrl && (
                    <a
                      href={flagship.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-white dark:bg-white light:bg-stone-900 text-slate-900 dark:text-slate-900 light:text-white text-xs font-semibold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-200 light:hover:bg-stone-800 transition-all shadow-sm active:scale-95"
                    >
                      <span>Live App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={flagship.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full border border-slate-700 dark:border-slate-700 light:border-stone-300 bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-slate-200 dark:text-slate-200 light:text-stone-800 text-xs font-semibold uppercase tracking-wider hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-stone-100 transition-all active:scale-95 shadow-xs"
                  >
                    <span>GitHub</span>
                    <Github className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 light:text-stone-700 leading-relaxed max-w-3xl">
                {flagship.description}
              </p>

              {/* Verified Features Grid */}
              {flagship.features && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-stone-600 block mb-3">
                    Core Capabilities &amp; Highlights:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {flagship.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 p-2.5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] text-xs text-slate-300 dark:text-slate-300 light:text-stone-800 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-400 light:text-sky-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies Pill Stack */}
              <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-stone-300/80">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-stone-600 block mb-2">
                  Tech Stack:
                </span>
                <div className="flex flex-wrap gap-2">
                  {flagship.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-200 dark:text-slate-200 light:text-stone-800 border border-slate-700 dark:border-slate-700 light:border-stone-300 shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Core Projects Grid: YouTube Clone & Rock Paper Scissors */}
      <div>
        <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-slate-400 dark:text-slate-400 light:text-stone-600 block mb-4">
          Interactive Web &amp; Frontend Builds
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreProjects.map((project) => (
            <article
              key={project.id}
              className="rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-stone-400 transition-all duration-300 shadow-md group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-cyan-400 dark:text-cyan-400 light:text-sky-700 block mb-1">
                      {project.tagline}
                    </span>
                    <h4 className="font-display font-bold text-2xl uppercase tracking-tight text-white dark:text-white light:text-stone-900 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 light:group-hover:text-sky-700 transition-colors">
                      {project.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-300 dark:text-slate-300 light:text-stone-700 hover:text-white dark:hover:text-white light:hover:text-stone-950 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-stone-200 transition-colors shadow-xs"
                        aria-label="View live demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-300 dark:text-slate-300 light:text-stone-700 hover:text-white dark:hover:text-white light:hover:text-stone-950 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-stone-200 transition-colors shadow-xs"
                      aria-label="View source code on GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-stone-700 leading-relaxed">
                  {project.description}
                </p>

                {project.features && (
                  <ul className="space-y-1.5 pt-1">
                    {project.features.map((feat) => (
                      <li
                        key={feat}
                        className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dark:bg-cyan-400 light:text-sky-600"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 dark:border-slate-800 light:border-stone-300/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-slate-300 dark:text-slate-300 light:text-stone-800 border border-slate-700/60 dark:border-slate-700/60 light:border-stone-300 shadow-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
