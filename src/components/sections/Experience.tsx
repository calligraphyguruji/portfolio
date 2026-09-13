import React from 'react';
import { experience } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Briefcase, Calendar, Clock, ShieldCheck } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="03 // Verified Pedigree"
        title="Experience"
        number="03"
        description="Industry internship history with strict adherence to verified facts and exact timelines."
      />

      <div className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] p-6 sm:p-8 shadow-xs">
        <div className="divide-y divide-[#E5E7EB] dark:divide-[#262626]">
          {experience.map((item) => (
            <div key={item.id} className="py-6 first:pt-2 last:pb-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626]">
                      <Briefcase className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-base sm:text-lg font-sans font-medium text-[#171717] dark:text-white">
                      {item.role}
                    </h3>
                  </div>
                  <span className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 mt-1 block pl-7 font-normal">
                    {item.company}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[#6F6F6F] dark:text-slate-400 pl-7 sm:pl-0">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A0A0A0] dark:text-slate-500" />
                    {item.duration}
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1.5 text-[#171717] dark:text-slate-200 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#6F6F6F] dark:text-slate-400" />
                    {item.durationLength}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626]">
                  Domain: Artificial Intelligence &amp; Machine Learning
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#F3F3F3] dark:bg-[#161B22] text-emerald-700 dark:text-emerald-400 border border-[#E5E7EB] dark:border-[#262626]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Verified 1-Month Scope
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
