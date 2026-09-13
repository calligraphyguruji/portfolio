import React, { useState } from 'react';
import { skillCategories } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import {
  Code2,
  Layout,
  Server,
  Database,
  Cpu,
  Brain,
  Wrench,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Layout,
  Server,
  Database,
  Cpu,
  Brain,
  Wrench,
};

export const Skills: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterOptions = ['All', ...skillCategories.map((c) => c.category)];

  const displayedCategories =
    selectedFilter === 'All'
      ? skillCategories
      : skillCategories.filter((c) => c.category === selectedFilter);

  const totalSkillsCount = skillCategories.reduce(
    (acc, group) => acc + group.skills.length,
    0
  );

  return (
    <section id="skills" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="02 // Technical Capabilities"
        title="Technical Skills"
        number="02 — 06"
        description="Structured competency matrix across systems programming, full-stack web, databases, and computer science foundations."
      />

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                selectedFilter === filter
                  ? 'bg-cyan-500/20 dark:bg-cyan-500/20 light:bg-sky-100 text-cyan-300 dark:text-cyan-300 light:text-sky-900 border border-cyan-500/40 dark:border-cyan-500/40 light:border-sky-300 shadow-xs'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-stone-100 text-slate-400 dark:text-slate-400 light:text-stone-600 border border-slate-800 dark:border-slate-800 light:border-stone-200 hover:text-white dark:hover:text-white light:hover:text-stone-900'
              }`}
            >
              {filter === 'All' ? 'All Tracks' : filter}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-500 light:text-stone-500">
          {totalSkillsCount} Skills Cataloged
        </span>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCategories.map((group) => {
          const Icon = iconMap[group.iconName] || Code2;
          return (
            <div
              key={group.category}
              className="p-6 rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800/80 dark:border-slate-800/80 light:border-[#E4E0D8] hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-stone-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-white text-cyan-400 dark:text-cyan-400 light:text-sky-700 group-hover:bg-cyan-950/80 dark:group-hover:bg-cyan-950/80 light:group-hover:bg-sky-50 group-hover:border group-hover:border-cyan-500/40 transition-colors shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm tracking-wide text-white dark:text-white light:text-stone-900 uppercase">
                    {group.category}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-slate-800/60 dark:bg-slate-800/60 light:bg-white text-slate-300 dark:text-slate-300 light:text-stone-800 border border-slate-700/60 dark:border-slate-700/60 light:border-stone-300 hover:text-white dark:hover:text-white light:hover:text-stone-950 hover:border-slate-500 transition-colors shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
