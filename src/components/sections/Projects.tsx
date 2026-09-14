import React, { useState } from 'react';
import { projects } from '../../data/portfolioData';
import { Project } from '../../types';
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Sparkles,
  Layers,
  Brain,
  Code2,
  Gamepad2,
  BookOpen,
} from 'lucide-react';

interface ProjectsProps {
  onSelectProject?: (id: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onSelectProject }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', 'FULL-STACK', 'AI / ML', 'FRONTEND', 'ALGORITHMS'];

  const filteredProjects = projects.filter((p) => {
    if (filter === 'ALL') return true;
    if (filter === 'FULL-STACK') return p.category === 'Full-Stack';
    if (filter === 'AI / ML') return p.category === 'AI / ML';
    if (filter === 'FRONTEND') return p.category === 'Frontend' || p.category === 'Game';
    if (filter === 'ALGORITHMS') return p.category === 'Algorithms';
    return true;
  });

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      window.location.hash = `#/project/${projectId}`;
    }
  };

  const getThemeGradient = (id?: string) => {
    if (id === 'kaushal-nexus') {
      return {
        bg: 'from-indigo-950 via-slate-900 to-black',
        accent: 'text-cyan-300',
        icon: Sparkles,
      };
    }
    if (id === 'internship-advisor') {
      return {
        bg: 'from-violet-950 via-purple-950 to-black',
        accent: 'text-emerald-300',
        icon: Brain,
      };
    }
    if (id === 'amazon-clone') {
      return {
        bg: 'from-amber-950 via-zinc-900 to-black',
        accent: 'text-amber-300',
        icon: Layers,
      };
    }
    if (id === 'rock-paper-scissors') {
      return {
        bg: 'from-emerald-950 via-teal-950 to-black',
        accent: 'text-lime-300',
        icon: Gamepad2,
      };
    }
    if (id === 'leetcode-solutions') {
      return {
        bg: 'from-blue-950 via-slate-900 to-black',
        accent: 'text-sky-300',
        icon: Code2,
      };
    }
    return {
      bg: 'from-red-950 via-stone-900 to-black',
      accent: 'text-red-300',
      icon: BookOpen,
    };
  };

  return (
    <section id="work" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Faint Watermark Typography */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          PORTFOLIO
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
              /SELECTED WORK [{projects.length}]
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
              Featured Projects
            </h2>
          </div>

          {/* Filter Controls & View All Link */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    filter === cat
                      ? 'bg-white dark:bg-[#1C2230] text-[#171717] dark:text-white shadow-xs'
                      : 'text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <a
              href="https://github.com/calligraphyguruji?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#12161F] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs transition-all"
            >
              <span>GitHub Repos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          {filteredProjects.map((project: Project) => {
            const theme = getThemeGradient(project.id);
            const ThemeIcon = theme.icon;

            return (
              <article
                key={project.id}
                className="group rounded-[28px] bg-stone-50/70 dark:bg-[#161B26]/80 border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between hover:border-black/25 dark:hover:border-white/25 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Clickable Visual Preview Container (Redirects to project about/case-study page) */}
                  <div
                    onClick={() => handleProjectClick(project.id)}
                    className={`relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br ${theme.bg} p-6 flex flex-col justify-between border border-black/10 dark:border-white/10 group-hover:shadow-lg transition-all cursor-pointer select-none group/preview`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleProjectClick(project.id);
                      }
                    }}
                    aria-label={`View full details for ${project.title}`}
                  >
                    {/* Top Badge & Clickable Arrow Button */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/15 backdrop-blur-md text-white border border-white/20">
                        <ThemeIcon className={`w-3 h-3 ${theme.accent}`} />
                        {project.badge || project.tier.toUpperCase()}
                      </span>

                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover/preview:scale-110 group-hover/preview:rotate-12 transition-transform shadow-lg">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Visual Interface Mockup Details */}
                    <div className="space-y-2 text-white relative z-10">
                      <div className={`font-mono text-[11px] ${theme.accent} uppercase tracking-widest`}>
                        {project.category} &bull; Click to View Case Study
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {project.title}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 max-w-sm">
                        {project.tagline}
                      </p>
                    </div>

                    {/* Subtle Hover Reveal Cue */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider shadow-xl transform translate-y-2 group-hover/preview:translate-y-0 transition-transform">
                        <span>Read About Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="space-y-2 pt-2">
                    <h3
                      onClick={() => handleProjectClick(project.id)}
                      className="text-xl sm:text-2xl font-sans font-bold text-[#171717] dark:text-white hover:underline underline-offset-4 cursor-pointer"
                    >
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Technologies & Action Footer */}
                <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5 max-w-[65%]">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono bg-white dark:bg-[#1A2130] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-mono bg-black/[0.03] dark:bg-white/[0.05] text-[#8E8E93]">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProjectClick(project.id)}
                      className="text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:underline underline-offset-4"
                    >
                      Case Study &rarr;
                    </button>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-white dark:bg-[#1A2130] border border-black/[0.06] dark:border-white/[0.08] text-[#171717] dark:text-white hover:border-black dark:hover:border-white transition-colors"
                        title="Open Live App"
                        aria-label="Live Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-white dark:bg-[#1A2130] border border-black/[0.06] dark:border-white/[0.08] text-[#171717] dark:text-white hover:border-black dark:hover:border-white transition-colors"
                      title="GitHub Repository"
                      aria-label="GitHub Repo"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
