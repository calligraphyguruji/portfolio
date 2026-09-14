import React, { useState } from 'react';
import { educationInfo, dsaRepo } from '../../data/portfolioData';
import { Briefcase, GraduationCap, Code2, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Experience: React.FC = () => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const experienceRows = [
    {
      id: 'codomax',
      title: 'Codomax Solution',
      role: 'AI & ML Intern',
      period: '12 July – 12 August',
      type: 'Industry Internship (1 Month)',
      description:
        'Hands-on industry internship focused on Artificial Intelligence & Machine Learning pipelines, model evaluation, and backend API integration.',
      tag: 'Verified Scope',
      icon: Briefcase,
    },
    {
      id: 'niet',
      title: educationInfo.institution,
      role: educationInfo.degree,
      period: educationInfo.timeline,
      type: `Current CGPA: ${educationInfo.cgpa}`,
      description:
        'Rigorous computer science curriculum emphasizing core data structures, operating systems, object-oriented programming, and computational logic.',
      tag: 'Class of 2029',
      icon: GraduationCap,
    },
    {
      id: 'leetcode',
      title: 'LeetCode Problem Solving',
      role: 'C++ Systems & Algorithmic Practice',
      period: `${dsaRepo.problemsSolved} Solved`,
      type: 'Algorithmic Track',
      description:
        'Consistent problem solving across arrays, two pointers, trees, binary search, graphs (BFS/DFS), and dynamic programming in C++.',
      tag: 'Continuous Practice',
      icon: Code2,
    },
  ];

  return (
    <section id="experience" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* Large Dark Editorial Panel matching Screenshot 4 */}
      <div className="experience-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Faint Watermark Typography matching Screenshot 4 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-white/[0.04] select-none pointer-events-none whitespace-nowrap">
          EXPERIENCE
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-slate-400 block mb-1">
              /EXPERIENCE &amp; EDUCATION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-white uppercase">
              Track Record
            </h2>
          </div>

          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Internship &bull; Academics &bull; Rigor
          </span>
        </div>

        {/* Experience Rows matching Screenshot 4 */}
        <div className="relative z-10 divide-y divide-white/10 pt-4">
          {experienceRows.map((row) => {
            const Icon = row.icon;
            const isHovered = hoveredRow === row.id;

            return (
              <div
                key={row.id}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`py-7 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all duration-200 ${
                  isHovered ? 'bg-white/[0.02] px-2 rounded-2xl' : ''
                }`}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-white/10 text-cyan-300">
                      <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-sans font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {row.title}
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {row.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 pl-8 font-normal leading-relaxed">
                    {row.role} &bull; {row.description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pl-8 md:pl-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs sm:text-sm font-mono text-white font-medium">
                      {row.period}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {row.type}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/20 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LeetCode Profile Direct Link Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            Verified DSA repository &bull; LeetCode profile with 150+ solved challenges in C++
          </div>
          <a
            href={dsaRepo.leetcodeProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-slate-200 transition-all shadow-md"
          >
            <span>Visit LeetCode Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
