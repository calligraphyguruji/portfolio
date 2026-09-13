import React from 'react';
import { projects } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { ExternalLink, Github, CheckCircle2, Star } from 'lucide-react';

export const Projects: React.FC = () => {
  const flagship = projects.find((p) => p.tier === 'flagship');
  const coreProjects = projects.filter((p) => p.tier === 'core');

  return (
    <section id="projects" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="04 // Engineered Works"
        title="Featured Projects"
        number="04"
        description="Production web applications, full-stack skilling architectures, and interactive frontend builds."
      />

      {/* Flagship Project: KaushalNexus */}
      {flagship && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-widest bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]">
              <Star className="w-3 h-3 text-[#171717] dark:text-amber-400" />
              Flagship Architecture
            </span>
          </div>

          <article className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] compound-shadow p-6 sm:p-8 space-y-6 transition-colors">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#262626] pb-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-sans font-normal tracking-tight text-[#171717] dark:text-white">
                  {flagship.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 mt-1 font-normal">
                  {flagship.tagline}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {flagship.liveUrl && (
                  <a
                    href={flagship.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold uppercase tracking-wider hover:bg-[#222222] dark:hover:bg-slate-200 transition-all shadow-xs active:scale-95"
                  >
                    <span>Live App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={flagship.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-2 px-5 rounded-full border border-[#E5E7EB] dark:border-[#262626] bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-300 text-xs font-semibold uppercase tracking-wider hover:bg-white dark:hover:bg-[#1f2937] transition-all active:scale-95 shadow-xs"
                >
                  <span>GitHub</span>
                  <Github className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-300 leading-[1.62] font-normal">
              {flagship.description}
            </p>

            {/* Verified Features Grid */}
            {flagship.features && (
              <div className="pt-1">
                <span className="text-[11px] uppercase font-mono tracking-widest text-[#6F6F6F] dark:text-slate-400 block mb-3">
                  Core Capabilities &amp; Highlights:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {flagship.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 p-3 rounded-[12px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] text-xs text-[#5E5E5E] dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies Pill Stack */}
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#262626]">
              <span className="text-[11px] uppercase font-mono tracking-widest text-[#6F6F6F] dark:text-slate-400 block mb-2">
                Tech Stack:
              </span>
              <div className="flex flex-wrap gap-2">
                {flagship.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Core Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coreProjects.map((project) => (
          <article
            key={project.id}
            className="p-6 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all duration-200 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-sans font-medium text-[#171717] dark:text-white">
                  {project.title}
                </h4>
                <div className="flex items-center gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
                      aria-label={`${project.title} live demo`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
                    aria-label={`${project.title} GitHub repository`}
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 leading-[1.58] font-normal">
                {project.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E5E7EB] dark:border-[#262626]">
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-[#F3F3F3] dark:bg-[#161B22] text-[#5E5E5E] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
