import React from 'react';
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
  return (
    <section id="skills" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="02 // Technical Capabilities"
        title="Technical Skills"
        number="02 — 06"
        description="Structured competency matrix across systems programming, full-stack web, databases, and computer science foundations."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skillCategories.map((group) => {
          const Icon = iconMap[group.iconName] || Code2;
          return (
            <div
              key={group.category}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 group-hover:bg-cyan-950/80 group-hover:border group-hover:border-cyan-500/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                    {group.category}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:text-white hover:border-slate-500 transition-colors"
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
