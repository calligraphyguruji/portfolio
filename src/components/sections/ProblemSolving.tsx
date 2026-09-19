import React from 'react';
import { dsaRepo } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import {
  Code,
  Github,
  ArrowUpRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const ProblemSolving: React.FC = () => {
  const stats = useLeetCodeStats();

  const linearTopics = dsaRepo.topics.filter((t) => t.category === 'Linear');
  const nonLinearTopics = dsaRepo.topics.filter((t) => t.category === 'Non-Linear');
  const advancedTopics = dsaRepo.topics.filter(
    (t) => t.category === 'Advanced Algorithms'
  );

  return (
    <section id="dsa" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Faint Watermark Typography */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          ALGORITHMS
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400">
                /ALGORITHMIC RIGOR
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                LIVE SYNCED
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
              LeetCode &amp; Problem Solving
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={dsaRepo.leetcodeProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFA116]/10 hover:bg-[#FFA116]/20 text-[#171717] dark:text-white border border-[#FFA116]/30 text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
            >
              <Code className="w-4 h-4 text-[#FFA116]" />
              <span>LeetCode Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={dsaRepo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] text-[#171717] dark:text-white border border-black/[0.08] dark:border-[#383838] text-xs font-semibold uppercase tracking-wider hover:border-black dark:hover:border-white transition-all shadow-2xs"
            >
              <Github className="w-4 h-4" />
              <span>C++ DSA Repo</span>
            </a>
          </div>
        </div>

        {/* Dynamic LeetCode Live Metric Dashboard Card */}
        <div className="relative z-10 my-8 p-6 sm:p-8 rounded-[24px] bg-black/[0.02] dark:bg-[#1C1C1C] border border-black/[0.06] dark:border-[#383838] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Main Counter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFA116]/15 text-[#FFA116]">
                <Trophy className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E93] dark:text-slate-400">
                Connected Profile: @calligraphyguruji
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#171717] dark:text-white">
                {stats.totalSolved}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#5E5E5E] dark:text-slate-400">
                Problems Solved
              </span>
              {stats.loading && (
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
              )}
            </div>

            <p className="text-xs text-[#5E5E5E] dark:text-slate-400 max-w-md leading-relaxed">
              Dynamically fetched from LeetCode API. Updates automatically whenever a new problem is solved.
            </p>
          </div>

          {/* Breakdown Grid: Easy, Medium, Hard, Global Rank */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto lg:shrink-0">
            {/* Easy */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.06] dark:border-[#383838] space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                  Easy
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white">
                {stats.easySolved}
              </div>
            </div>

            {/* Medium */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.06] dark:border-[#383838] space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  Medium
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white">
                {stats.mediumSolved}
              </div>
            </div>

            {/* Hard */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.06] dark:border-[#383838] space-y-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">
                  Hard
                </span>
                <Trophy className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white">
                {stats.hardSolved}
              </div>
            </div>

            {/* Global Ranking */}
            <div
              className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.06] dark:border-[#383838] space-y-1 min-w-0 sm:min-w-[108px]"
              title={stats.ranking ? `Global Rank: ${stats.ranking.toLocaleString('en-US')}` : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-cyan-400 font-bold">
                  Rank
                </span>
                <span className="text-[10px] font-mono text-slate-400">Global</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#171717] dark:text-white tracking-tight whitespace-nowrap">
                {stats.ranking ? stats.ranking.toLocaleString('en-US') : 'Top 10%'}
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Topic Categories */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Linear Data Structures */}
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-[#1C1C1C] border border-black/[0.06] dark:border-[#383838] space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block">
              Linear Foundations
            </span>
            <div className="flex flex-wrap gap-2">
              {linearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#262626] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-[#383838]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Hierarchical & Non-Linear */}
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-[#1C1C1C] border border-black/[0.06] dark:border-[#383838] space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block">
              Trees &amp; Graphs
            </span>
            <div className="flex flex-wrap gap-2">
              {nonLinearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#262626] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-[#383838]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Advanced Optimization & Graph Algorithms */}
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-[#1C1C1C] border border-black/[0.06] dark:border-[#383838] space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block">
              Advanced Paradigms
            </span>
            <div className="flex flex-wrap gap-2">
              {advancedTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#262626] text-[#171717] dark:text-slate-300 border border-black/[0.06] dark:border-[#383838]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
