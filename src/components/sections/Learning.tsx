import React from 'react';
import { currentlyLearning } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';

export const Learning: React.FC = () => {
  return (
    <section id="learning" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="06 // Active Horizons"
        title="Currently Learning"
        number="06 — 06"
        description="Active areas of technical expansion, algorithmic depth, and architectural research."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentlyLearning.map((item) => (
          <div
            key={item.topic}
            className="p-6 rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] flex items-center justify-between hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-stone-400 transition-all duration-300 shadow-sm group"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500 dark:text-slate-500 light:text-stone-500 block">
                {item.category}
              </span>
              <h4 className="font-display font-bold text-base text-white dark:text-white light:text-stone-900 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 light:group-hover:text-sky-700 transition-colors">
                {item.topic}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 dark:bg-cyan-950/50 light:bg-sky-100 border border-cyan-500/30 dark:border-cyan-500/30 light:border-sky-300 text-cyan-300 dark:text-cyan-300 light:text-sky-900 text-[10px] font-mono font-medium shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dark:bg-cyan-400 light:bg-sky-600 animate-pulse"></span>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
