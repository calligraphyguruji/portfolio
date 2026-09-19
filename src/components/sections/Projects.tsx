import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { projects } from '../../data/portfolioData';
import { Project } from '../../types';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  Sparkles,
  Layers,
  Code2,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface ProjectsProps {
  onSelectProject?: (id: string) => void;
}

type TabType = 'All' | 'Real Project' | 'Exploration';

export const Projects: React.FC<ProjectsProps> = ({ onSelectProject }) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const shouldReduceMotion = useReducedMotion();
  const leetcodeStats = useLeetCodeStats();

  const tabs: TabType[] = ['All', 'Real Project', 'Exploration'];

  const filteredProjects = projects.filter((project) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Real Project') return project.projectType === 'real';
    if (activeTab === 'Exploration') return project.projectType === 'exploration';
    return true;
  });

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      window.location.hash = `#/project/${projectId}`;
    }
  };

  /* Bespoke fallback visual mockups for projects without a static image */
  const renderFallbackPreview = (project: Project) => {
    if (project.id === 'internship-advisor') {
      return (
        <div className="w-full h-full bg-[#0C1017] p-5 sm:p-6 flex flex-col justify-between select-none relative overflow-hidden font-mono text-xs">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Window Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] text-slate-400 font-medium">advisor_engine.py</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px]">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Gemini 1.5</span>
            </div>
          </div>

          {/* Terminal Content Mockup */}
          <div className="space-y-3 py-2 relative z-10">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-slate-300">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Target Analysis</div>
              <div className="text-white font-semibold text-xs sm:text-sm">Role: AI &amp; Machine Learning Intern</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-white/[0.03] border border-white/[0.05]">
                <div className="text-[10px] text-emerald-400">Validated Skills</div>
                <div className="text-white font-medium text-[11px] mt-0.5">Python, NumPy, JSON</div>
              </div>
              <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                <div className="text-[10px] text-purple-300">Target Gap</div>
                <div className="text-white font-medium text-[11px] mt-0.5">FastAPI, Vector DB</div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              Strict JSON Output Validated
            </span>
            <span className="text-slate-400">4-Week Study Plan Generated</span>
          </div>
        </div>
      );
    }

    if (project.id === 'amazon-clone') {
      return (
        <div className="w-full h-full bg-[#0F131A] p-5 sm:p-6 flex flex-col justify-between select-none relative overflow-hidden font-sans text-xs">
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Browser Navigation Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] font-mono text-slate-400">amazon.storefront/app</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <ShoppingCart className="w-3 h-3" />
              <span>Cart (3)</span>
            </div>
          </div>

          {/* Storefront Content Mockup */}
          <div className="space-y-2 py-1 relative z-10">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/[0.06]">
              <div className="w-10 h-10 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold text-xs truncate">Studio Wireless Pro Headphones</div>
                <div className="text-[11px] text-amber-300 font-mono font-bold">$199.99 &bull; In Stock</div>
              </div>
            </div>

            <div className="p-2 rounded bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Dynamic Multi-Page Checkout Ledger</span>
              <span className="text-emerald-400 font-mono text-[10px]">Pure Vanilla JS</span>
            </div>
          </div>

          {/* Architecture Badge */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 relative z-10">
            <span className="font-mono text-amber-300/90">HTML5 + CSS3 Grid + ES6 DOM</span>
            <span>Zero Framework Overhead</span>
          </div>
        </div>
      );
    }

    // LeetCode Solutions Mockup
    return (
      <div className="w-full h-full bg-[#0A0E17] p-5 sm:p-6 flex flex-col justify-between select-none relative overflow-hidden font-mono text-xs">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[11px] text-slate-400">solution.cpp</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px]">
            <Code2 className="w-2.5 h-2.5" />
            <span>C++20 STL</span>
          </div>
        </div>

        {/* Code Snippet Display */}
        <div className="p-3 rounded-lg bg-black/50 border border-white/[0.06] text-slate-300 space-y-1 my-1 relative z-10 font-mono text-[11px] leading-relaxed">
          <div><span className="text-blue-400">int</span> <span className="text-amber-300">maxArea</span>(<span className="text-cyan-300">vector</span>&lt;<span className="text-blue-400">int</span>&gt;&amp; h) &#123;</div>
          <div className="pl-4 text-slate-400">int l = 0, r = h.size() - 1, ans = 0;</div>
          <div className="pl-4 text-slate-400">while (l &lt; r) &#123; ans = max(ans, min(h[l], h[r]) * (r - l)); &#125;</div>
          <div>&#125;</div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 relative z-10">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3" />
            Runtime: 0ms (Beats 100%)
          </span>
          <span className="text-sky-300 font-bold">{leetcodeStats.totalSolved}+ Verified Solutions</span>
        </div>
      </div>
    );
  };

  return (
    <section id="work" className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Header with Ghost Watermark & /SELECTED WORK matching Reference Screenshot */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mb-8 sm:mb-12 overflow-hidden pt-2 select-none">
          {/* Faint Background Watermark Typography */}
          <div
            aria-hidden="true"
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-black uppercase tracking-[0.2em] text-black/[0.04] dark:text-white/[0.04] select-none pointer-events-none leading-none -mb-6 sm:-mb-10 md:-mb-14"
          >
            PORTFOLIO
          </div>

          {/* Centered Heading with /SELECTED WORK styling */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-sans tracking-tight text-neutral-900 dark:text-white uppercase relative z-10">
            /SELECTED WORK
          </h2>
        </div>

        {/* Filter Navigation Bar & View All Work CTA */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          {/* Filter Tabs matching Screenshot */}
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                    isActive
                      ? 'text-neutral-900 dark:text-white font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {/* Motion Active Indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterTab"
                      className="absolute inset-0 bg-neutral-100 dark:bg-white/10 rounded-full -z-10 shadow-xs"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {/* View All Work Action Link matching Screenshot */}
          <a
            href="https://github.com/calligraphyguruji?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveTab('All')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#12161F] text-xs sm:text-sm font-semibold tracking-wide text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white hover:shadow-xs transition-all duration-200 group/btn"
          >
            <span>View All Work</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
        </div>

        {/* 2-Column Projects Grid matching Screenshot */}
        <motion.div
          layout
          className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const isRealProject = project.projectType === 'real';

              return (
                <motion.article
                  key={project.id}
                  layout={!shouldReduceMotion}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                  }}
                  className="group flex flex-col justify-between select-none"
                >
                  <div className="space-y-4">
                    {/* Visual Preview Container */}
                    <div
                      onClick={() => handleProjectClick(project.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProjectClick(project.id);
                        }
                      }}
                      aria-label={`View case study for ${project.title}`}
                      className="relative rounded-2xl sm:rounded-[22px] overflow-hidden aspect-[16/10] bg-neutral-950 border border-black/10 dark:border-white/10 shadow-sm group-hover:shadow-xl transition-all duration-500 cursor-pointer group/preview"
                    >
                      {/* Real Screenshot or Rich Mockup */}
                      {project.thumbnail ? (
                        <div className="w-full h-full relative">
                          <img
                            src={project.thumbnail}
                            alt={`${project.title} preview`}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/preview:scale-[1.04]"
                          />
                          {/* Soft Vignette Overlay for Crisp Contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 opacity-60 group-hover/preview:opacity-40 transition-opacity duration-300 pointer-events-none" />
                        </div>
                      ) : (
                        renderFallbackPreview(project)
                      )}

                      {/* Top Badge (REAL PROJECT pill matching Screenshot) */}
                      {isRealProject && (
                        <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-white/95 text-neutral-900 dark:bg-black/85 dark:text-white backdrop-blur-md shadow-xs border border-black/5 dark:border-white/15">
                          REAL PROJECT
                        </span>
                      )}

                      {/* Floating Circular Arrow Button matching Screenshot center-right */}
                      <div
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl transition-all duration-300 group-hover/preview:scale-110 group-hover/preview:rotate-12 pointer-events-none"
                      >
                        <ArrowUpRight className="w-5 h-5 text-neutral-950 stroke-[2.2]" />
                      </div>

                      {/* Direct External Action Icons */}
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 sm:group-hover/preview:opacity-100 transition-opacity duration-200">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
                            title="Open Live App"
                            aria-label={`Open live app for ${project.title}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
                          title="Open GitHub Repository"
                          aria-label={`View source code for ${project.title}`}
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Content Section Below Preview matching Screenshot */}
                    <div className="space-y-2 pt-1">
                      {/* Project Title - Subtitle Format */}
                      <h3
                        onClick={() => handleProjectClick(project.id)}
                        className="text-lg sm:text-xl font-bold font-sans tracking-tight text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors cursor-pointer"
                      >
                        {project.title} - {project.tagline}
                      </h3>

                      {/* Pill Tags matching Screenshot */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {(project.tags && project.tags.length > 0
                          ? project.tags
                          : [project.category || 'Engineering', 'Full-Stack']
                        ).map((tag) => (
                          <span
                            key={tag}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium font-sans bg-neutral-100 dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
