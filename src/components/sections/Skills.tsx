import React from 'react';
import { groupedSkills } from '../../data/portfolioData';

export const Skills: React.FC = () => {
  const skillGroups: { title: string; items: string[] }[] = [
    { title: 'LANGUAGES', items: groupedSkills.LANGUAGES },
    { title: 'FRONTEND', items: groupedSkills.FRONTEND },
    { title: 'BACKEND & APIS', items: groupedSkills.BACKEND },
    { title: 'DATABASES', items: groupedSkills.DATABASE },
    { title: 'AI / ML & DATA', items: groupedSkills['AI / ML & DATA'] },
    { title: 'TOOLS & PLATFORMS', items: groupedSkills['TOOLS & PLATFORMS'] },
  ];

  return (
    <section id="skills" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Faint Watermark Typography */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          SYSTEMS
        </div>

        {/* Header */}
        <div className="relative z-10 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
            /TECH STACK
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
            Core Competencies
          </h2>
        </div>

        {/* Grouped Typography Matrix (Zero Fake Bars or Percentages) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {skillGroups.map((group) => (
            <div
              key={group.title}
              className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all duration-200 group"
            >
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-3">
                {group.title}
              </span>

              <div className="text-base sm:text-lg font-sans font-medium text-[#171717] dark:text-white leading-relaxed">
                {group.items.map((skill: string, index: number) => (
                  <React.Fragment key={skill}>
                    <span className="inline-block hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                      {skill}
                    </span>
                    {index < group.items.length - 1 && (
                      <span className="text-[#8E8E93] dark:text-slate-500 mx-2 select-none">
                        &bull;
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
