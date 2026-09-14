import React, { useEffect } from 'react';
import { Project } from '../../types';
import { projects } from '../../data/portfolioData';
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  ExternalLink,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Share2,
  Terminal,
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onSelectProject: (id: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onSelectProject,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.id]);

  // Find next project for seamless sequential browsing
  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const prevProject =
    projects[(currentIndex - 1 + projects.length) % projects.length];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.title} — Aman Mishra Portfolio`,
          text: project.tagline,
          url: window.location.href,
        });
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 animate-fadeIn">
      {/* Top Back & Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs hover:shadow transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs transition-all"
            title="Share Project"
            aria-label="Share Project"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Editorial Case Study Panel */}
      <article className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute top-2 right-4 text-7xl sm:text-9xl md:text-[10rem] font-extrabold uppercase tracking-widest text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none whitespace-nowrap">
          {project.category || 'PROJECT'}
        </div>

        {/* Header Ribbon */}
        <div className="relative z-10 space-y-4 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-black/[0.05] dark:bg-white/[0.08] text-[#171717] dark:text-white border border-black/[0.06] dark:border-white/[0.1]">
              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-cyan-400" />
              {project.badge || project.tier.toUpperCase()}
            </span>
            {project.category && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-widest bg-black/[0.03] dark:bg-white/[0.04] text-[#5E5E5E] dark:text-slate-400">
                {project.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-[#171717] dark:text-white leading-[1.05]">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl font-medium text-[#5E5E5E] dark:text-slate-300 max-w-3xl leading-relaxed">
            {project.tagline}
          </p>

          {/* Quick Action Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Live Application</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white transition-all shadow-xs"
            >
              <Github className="w-4 h-4" />
              <span>Source Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Stats Matrix */}
        {project.stats && project.stats.length > 0 && (
          <div className="relative z-10 py-8 border-b border-black/[0.06] dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {project.stats.map((st) => (
              <div
                key={st.label}
                className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06]"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-1">
                  {st.label}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#171717] dark:text-white">
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Visual Mockup Banner */}
        <div className="relative z-10 my-8 rounded-[24px] overflow-hidden aspect-[16/8] bg-gradient-to-br from-stone-900 via-zinc-900 to-black p-6 sm:p-10 flex flex-col justify-between border border-black/10 dark:border-white/10 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
              {project.id}.dev
            </span>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-xs text-cyan-300 uppercase tracking-widest">
              Verified Project Artifact
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {project.title}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {project.technologies.slice(0, 5).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/10 backdrop-blur-md text-white border border-white/15"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Deep Dive Content Sections */}
        <div className="relative z-10 space-y-10 pt-4">
          {/* About Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400">
              /OVERVIEW &amp; MISSION
            </h2>
            <div className="text-sm sm:text-base text-[#171717] dark:text-slate-200 leading-relaxed space-y-3 font-sans">
              <p>{project.longDescription || project.description}</p>
            </div>
          </section>

          {/* Problem & Solution Grid */}
          {(project.problemStatement || project.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {project.problemStatement && (
                <div className="p-6 rounded-2xl bg-amber-500/[0.04] dark:bg-amber-400/[0.04] border border-amber-500/15 dark:border-amber-400/20 space-y-2">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Problem Identified
                  </span>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>
              )}

              {project.solution && (
                <div className="p-6 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-400/[0.04] border border-emerald-500/15 dark:border-emerald-400/20 space-y-2">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Engineered Solution
                  </span>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features Checklist */}
          {project.features && project.features.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400">
                /KEY CAPABILITIES &amp; HIGHLIGHTS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((feat) => (
                  <div
                    key={feat}
                    className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-[#171717] dark:text-slate-200 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Architecture Breakdown */}
          {project.architecture && project.architecture.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                /SYSTEM ARCHITECTURE &amp; DATA FLOW
              </h2>
              <div className="space-y-2.5">
                {project.architecture.map((arch) => (
                  <div
                    key={arch}
                    className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-xs sm:text-sm text-[#171717] dark:text-slate-300 font-mono flex items-start gap-3"
                  >
                    <Cpu className="w-4 h-4 text-indigo-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>{arch}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full Tech Stack Pills */}
          <section className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400">
              /TECHNOLOGIES UTILIZED
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#1A2130] text-[#171717] dark:text-slate-200 border border-black/[0.08] dark:border-white/[0.12] shadow-2xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* Navigation between Projects */}
          <div className="pt-8 mt-8 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => onSelectProject(prevProject.id)}
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              <span>&larr; Prev: {prevProject.title}</span>
            </button>

            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-mono font-medium uppercase tracking-wider text-[#171717] dark:text-white transition-colors"
            >
              All Projects (6)
            </button>

            <button
              onClick={() => onSelectProject(nextProject.id)}
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              <span>Next: {nextProject.title} &rarr;</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
