import React from 'react';
import { currentlyLearning } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';

export const Learning: React.FC = () => {
  return (
    <section id="learning" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="06 // Active Horizons"
        title="Currently Learning"
        number="06"
        description="Active areas of technical expansion, algorithmic depth, and architectural research."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentlyLearning.map((item) => (
          <div
            key={item.topic}
            className="p-6 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] flex items-center justify-between hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all duration-200 shadow-xs group"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F] dark:text-slate-400 block">
                {item.category}
              </span>
              <h4 className="text-base font-sans font-medium text-[#171717] dark:text-white">
                {item.topic}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] text-[#171717] dark:text-slate-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
