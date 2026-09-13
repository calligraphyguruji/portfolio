import React from 'react';
import { experience } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Briefcase, Calendar, Clock, ShieldCheck } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="03 // Verified Pedigree"
        title="Experience"
        number="03 — 06"
        description="Industry internship history with strict adherence to verified facts and exact timelines."
      />

      <div className="rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800/80 dark:border-slate-800/80 light:border-[#E4E0D8] p-6 sm:p-8 shadow-sm">
        <div className="divide-y divide-slate-800 dark:divide-slate-800 light:divide-stone-300">
          {experience.map((item) => (
            <div key={item.id} className="py-6 first:pt-2 last:pb-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-950/70 dark:bg-cyan-950/70 light:bg-sky-100 text-cyan-400 dark:text-cyan-400 light:text-sky-800 border border-cyan-500/30 dark:border-cyan-500/30 light:border-sky-300">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <h3 className="font-display font-bold text-lg text-white dark:text-white light:text-stone-900 uppercase tracking-wide">
                      {item.role}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400 dark:text-cyan-400 light:text-sky-700 mt-1 block">
                    {item.company}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-400 light:text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.duration}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-300 dark:text-slate-300 light:text-stone-800">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-400 light:text-sky-700" />
                    {item.durationLength}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-800/60 dark:bg-slate-800/60 light:bg-white text-slate-300 dark:text-slate-300 light:text-stone-800 border border-slate-700/50 dark:border-slate-700/50 light:border-stone-300 shadow-xs">
                  Domain: Artificial Intelligence &amp; Machine Learning
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-950/40 dark:bg-emerald-950/40 light:bg-emerald-50 text-emerald-300 dark:text-emerald-300 light:text-emerald-800 border border-emerald-500/30 dark:border-emerald-500/30 light:border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Scope
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
