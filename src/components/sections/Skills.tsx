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
    <section id="skills" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="02 // Technical Capabilities"
        title="Technical Skills"
        number="02"
        description="Structured competency matrix across systems programming, full-stack web, databases, and computer science foundations."
      />

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                selectedFilter === filter
                  ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs'
                  : 'bg-[#F3F3F3] dark:bg-[#121722] text-[#5E5E5E] dark:text-slate-400 border border-[#E5E7EB] dark:border-[#262626] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              {filter === 'All' ? 'All Tracks' : filter}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-[#6F6F6F] dark:text-slate-400">
          {totalSkillsCount} Skills Cataloged
        </span>
      </div>

      {/* Skills Grid with 20px compound cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedCategories.map((group) => {
          const Icon = iconMap[group.iconName] || Code2;
          return (
            <div
              key={group.category}
              className="p-6 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all duration-200 flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-sans font-medium tracking-tight text-[#171717] dark:text-white">
                    {group.category}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-500 transition-colors"
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
