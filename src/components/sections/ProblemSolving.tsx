import React from 'react';
import { dsaRepo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Terminal, Github, Code, ArrowUpRight } from 'lucide-react';

export const ProblemSolving: React.FC = () => {
  const linearTopics = dsaRepo.topics.filter((t) => t.category === 'Linear');
  const nonLinearTopics = dsaRepo.topics.filter((t) => t.category === 'Non-Linear');
  const advancedTopics = dsaRepo.topics.filter((t) => t.category === 'Advanced Algorithms');

  return (
    <section id="dsa" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="05 // Algorithmic Rigor"
        title="DSA &amp; Problem Solving"
        number="05"
        description="Structured problem solving in C++ across fundamental data structures and advanced graph/DP algorithms."
      />

      <div className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] compound-shadow p-6 sm:p-8 space-y-8 transition-colors">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xl font-sans font-medium text-[#171717] dark:text-white">
                {dsaRepo.title}
              </h3>
              <p className="text-xs text-[#5E5E5E] dark:text-slate-400 mt-0.5 font-normal">
                {dsaRepo.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={dsaRepo.leetcodeProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-200 border border-[#E5E7EB] dark:border-[#262626] text-xs font-mono hover:border-[#A0A0A0] transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-[#6F6F6F] dark:text-slate-400" />
              <span>LeetCode Profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href={dsaRepo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold uppercase tracking-wider hover:bg-[#222222] dark:hover:bg-slate-200 transition-all active:scale-95 shadow-xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>C++ Repo</span>
            </a>
          </div>
        </div>

        {/* Algorithm Topic Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Linear Data Structures */}
          <div className="p-5 rounded-[16px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F] dark:text-slate-400 block">
              Linear Foundations
            </span>
            <div className="flex flex-wrap gap-2">
              {linearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-2.5 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#121722] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Hierarchical & Non-Linear */}
          <div className="p-5 rounded-[16px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F] dark:text-slate-400 block">
              Trees &amp; Graphs
            </span>
            <div className="flex flex-wrap gap-2">
              {nonLinearTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-2.5 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#121722] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* Advanced Optimization & Graph Algorithms */}
          <div className="p-5 rounded-[16px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F] dark:text-slate-400 block">
              Advanced Paradigms
            </span>
            <div className="flex flex-wrap gap-2">
              {advancedTopics.map((topic) => (
                <span
                  key={topic.name}
                  className="px-2.5 py-1 rounded-full text-xs font-mono bg-white dark:bg-[#121722] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]"
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
