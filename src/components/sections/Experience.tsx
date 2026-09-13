import React from 'react';
import { experience } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Briefcase, Calendar, Clock } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="03 // Verified Pedigree"
        title="Experience"
        number="03 — 06"
        description="Industry internship history with strict adherence to verified facts and exact timelines."
      />

      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 sm:p-8 shadow-sm">
        <div className="divide-y divide-slate-800">
          {experience.map((item) => (
            <div key={item.id} className="py-6 first:pt-2 last:pb-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-950/70 text-cyan-400 border border-cyan-500/30">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                      {item.role}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400 mt-1 block">
                    {item.company}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.duration}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {item.durationLength}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-800/60 text-slate-400 border border-slate-700/50">
                  Domain: Artificial Intelligence &amp; Machine Learning
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
