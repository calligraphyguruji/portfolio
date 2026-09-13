import React from 'react';
import { dsaRepo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Terminal, Github, Code, ArrowUpRight } from 'lucide-react';

export const ProblemSolving: React.FC = () => {
  const linearTopics = dsaRepo.topics.filter((t) => t.category === 'Linear');
  const nonLinearTopics = dsaRepo.topics.filter((t) => t.category === 'Non-Linear');
  const advancedTopics = dsaRepo.topics.filter((t) => t.category === 'Advanced Algorithms');

  return (
    <section id="dsa" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="05 // Algorithmic Rigor"
        title="DSA &amp; Problem Solving"
        number="05 — 06"
        description="Structured problem solving in C++ across fundamental data structures and advanced graph/DP algorithms."
      />

      <div className="rounded-[2.5rem] bg-slate-900/90 dark:bg-slate-900/90 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden transition-colors">
        {/* Terminal Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 dark:border-slate-800 light:border-stone-300/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/70 dark:bg-cyan-950/70 light:bg-sky-100 text-cyan-400 dark:text-cyan-400 light:text-sky-800 border border-cyan-500/30 dark:border-cyan-500/30 light:border-sky-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white dark:text-white light:text-stone-900 uppercase tracking-tight">
                {dsaRepo.title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 mt-0.5">
                {dsaRepo.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={dsaRepo.leetcodeProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-100 text-amber-300 dark:text-amber-300 light:text-amber-900 border border-amber-500/30 dark:border-amber-500/30 light:border-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-amber-500/20 transition-all active:scale-95 shadow-xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>LeetCode Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href={dsaRepo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-white dark:bg-white light:bg-stone-900 text-slate-900 dark:text-slate-900 light:text-white text-xs font-semibold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-200 light:hover:bg-stone-800 transition-all active:scale-95 shadow-sm"
            >
              <Github className="w-3.5 h-3.5" />
              <span>C++ Repo</span>
            </a>
          </div>
        </div>

        {/* Algorithm Topic Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Linear Data Structures */}
          <div className="p-5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-[#E4E0D8] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 dark:text-cyan-400 light:text-sky-700 block">
              Linear Foundations
            </span>
            <div className="flex flex-wrap gap-2">
              {linearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 dark:bg-slate-800 light:bg-stone-100 text-slate-200 dark:text-slate-200 light:text-stone-800 border border-slate-700/80 dark:border-slate-700/80 light:border-stone-300 shadow-xs"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Hierarchical & Non-Linear */}
          <div className="p-5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-[#E4E0D8] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-indigo-400 dark:text-indigo-400 light:text-indigo-700 block">
              Trees &amp; Graphs
            </span>
            <div className="flex flex-wrap gap-2">
              {nonLinearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 dark:bg-slate-800 light:bg-stone-100 text-slate-200 dark:text-slate-200 light:text-stone-800 border border-slate-700/80 dark:border-slate-700/80 light:border-stone-300 shadow-xs"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Advanced Optimization & Graph Algorithms */}
          <div className="p-5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-[#E4E0D8] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 dark:text-emerald-400 light:text-emerald-700 block">
              Advanced Paradigms
            </span>
            <div className="flex flex-wrap gap-2">
              {advancedTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 dark:bg-slate-800 light:bg-stone-100 text-slate-200 dark:text-slate-200 light:text-stone-800 border border-slate-700/80 dark:border-slate-700/80 light:border-stone-300 shadow-xs"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Minimalist Code Terminal Aesthetic callout */}
        <div className="p-4 rounded-2xl bg-black/40 dark:bg-black/40 light:bg-white border border-slate-800 dark:border-slate-800 light:border-stone-300 font-mono text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-sky-600 animate-pulse"></span>
            <span className="text-slate-300 dark:text-slate-300 light:text-stone-800 font-semibold">
              std::vector&lt;Solution&gt; solutions;
            </span>
            <span className="text-slate-500 dark:text-slate-500 light:text-stone-500 text-[11px]">
              // C++ STL, Graph Traversals, DP Optimization
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500 light:text-stone-500">
            Target: LeetCode &amp; Competitive Algorithmic Proficiency
          </span>
        </div>
      </div>
    </section>
  );
};
