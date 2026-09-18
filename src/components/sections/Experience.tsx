import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { educationInfo, dsaRepo } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import { Sparkles, ArrowUpRight, GraduationCap, Code2, Award } from 'lucide-react';

interface ExperienceRowItem {
  id: string;
  company: string;
  role: string;
  period: string;
  type: string;
  summary: string;
}

export const Experience: React.FC = () => {
  const [hoveredRow, setHoveredRow] = useState<string | null>('codomax');
  const shouldReduceMotion = useReducedMotion();
  const leetcodeStats = useLeetCodeStats();

  const experienceList: ExperienceRowItem[] = [
    {
      id: 'codomax',
      company: 'Codomax Digital Solutions',
      role: 'AI & ML Intern',
      period: '12 July 2026 – 12 August 2026',
      type: 'Industry Internship',
      summary: 'Engineered AI/ML pipelines, prompt constraints, and Gemini REST API integrations.',
    },
    {
      id: 'sih2026',
      company: 'Smart India Hackathon 2026',
      role: 'Lead Full-Stack Architect · KaushalNexus (PS 135)',
      period: 'Aug 2026 – Present',
      type: 'National Innovation',
      summary: 'Built longitudinal learner tracking & district analytics platform with FastAPI & React 19.',
    },
    {
      id: 'niet',
      company: 'NIET Greater Noida',
      role: `B.Tech in Computer Science & Engineering (CGPA ${educationInfo.cgpa})`,
      period: '2025 – 2029',
      type: 'Academic Excellence',
      summary: 'Core CS curriculum: Data structures, algorithms, operating systems, and discrete math.',
    },
    {
      id: 'leetcode',
      company: 'LeetCode Algorithmic Track',
      role: 'C++ Systems & Algorithmic Problem Solver',
      period: `${leetcodeStats.totalSolved}+ Solved`,
      type: 'Algorithmic Rigor',
      summary: 'Optimized asymptotic runtime and memory footprint across core linear and non-linear DSA.',
    },
  ];

  /* Floating tilted preview cards matching the signature Dribbble interaction */
  const renderFloatingCard = (id: string) => {
    if (id === 'codomax') {
      return (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#fdfdfd] text-neutral-900 shadow-2xl border border-white/20 flex items-center gap-1.5 sm:gap-2 select-none">
          {/* Screen 1: Dashboard with charts */}
          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0F172A] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-sans border border-neutral-700/60 shadow-md">
            <div className="flex items-center justify-between text-[6px] text-cyan-400">
              <span className="font-bold">Gemini 1.5</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-white/20 rounded-full w-4/5" />
              <div className="flex items-end gap-0.5 h-6 pt-1">
                <div className="w-1.5 h-3 bg-cyan-400 rounded-xs" />
                <div className="w-1.5 h-5 bg-indigo-500 rounded-xs" />
                <div className="w-1.5 h-4 bg-purple-400 rounded-xs" />
                <div className="w-1.5 h-6 bg-cyan-300 rounded-xs" />
              </div>
            </div>
            <div className="p-0.5 rounded bg-cyan-500/20 text-cyan-300 text-center font-mono text-[5.5px]">
              AI Pipeline
            </div>
          </div>

          {/* Screen 2: Center Phone Feature Screen */}
          <div className="w-18 sm:w-22 aspect-[9/16] rounded-xl bg-[#090D16] text-white p-1.5 sm:p-2 flex flex-col justify-between items-center text-[7px] font-sans border border-cyan-500/40 shadow-xl">
            <div className="w-5 h-1 bg-white/20 rounded-full" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-[6.5px] font-bold text-center text-cyan-200">
                Codomax ML
              </div>
            </div>
            <div className="w-full py-0.5 rounded bg-white/10 text-emerald-400 text-center text-[5.5px] font-mono">
              200ms Latency
            </div>
          </div>

          {/* Screen 3: Metrics List */}
          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0F172A] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-sans border border-neutral-700/60 shadow-md">
            <div className="text-[6px] text-amber-300 font-bold">Inference</div>
            <div className="space-y-1 text-[5.5px] text-neutral-300 font-mono">
              <div className="flex justify-between"><span>Acc</span><span className="text-emerald-400">98.4%</span></div>
              <div className="flex justify-between"><span>Tokens</span><span>12.4k</span></div>
              <div className="flex justify-between"><span>JSON</span><span className="text-cyan-300">Valid</span></div>
            </div>
            <div className="py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold text-center text-[5.5px]">
              Active
            </div>
          </div>
        </div>
      );
    }

    if (id === 'sih2026') {
      return (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#fdfdfd] text-neutral-900 shadow-2xl border border-white/20 flex items-center gap-1.5 sm:gap-2 select-none">
          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0B0F19] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-sans border border-neutral-700/60 shadow-md">
            <div className="text-cyan-400 font-bold text-[6.5px]">SIH PS-135</div>
            <div className="space-y-1">
              <div className="text-[6px] text-neutral-400">District Map</div>
              <div className="h-4 w-full bg-cyan-950/60 border border-cyan-500/20 rounded flex items-center justify-center text-[5px] text-cyan-300">
                Interactive Heatmap
              </div>
            </div>
            <div className="p-0.5 rounded bg-white/10 text-white text-center text-[5.5px]">Finalist</div>
          </div>

          <div className="w-18 sm:w-22 aspect-[9/16] rounded-xl bg-[#090C14] text-white p-1.5 sm:p-2 flex flex-col justify-between items-center text-[7px] border border-cyan-500/40 shadow-xl font-mono">
            <div className="w-5 h-1 bg-white/20 rounded-full" />
            <div className="text-center">
              <div className="text-cyan-300 font-bold text-[7px]">KaushalNexus</div>
              <div className="text-[5.5px] text-neutral-400 mt-0.5">Govt Analytics</div>
            </div>
            <div className="p-1 rounded bg-cyan-500/15 text-cyan-300 text-[5.5px] text-center w-full">
              FastAPI + React 19
            </div>
            <div className="text-[5.5px] text-emerald-400 font-bold">100% Deployed</div>
          </div>

          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0B0F19] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-sans border border-neutral-700/60 shadow-md">
            <div className="text-neutral-400 text-[6px]">Learner Cohort</div>
            <div className="text-lg font-black text-white leading-tight">10k+</div>
            <div className="py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold text-center text-[5.5px]">
              Live Vercel
            </div>
          </div>
        </div>
      );
    }

    if (id === 'niet') {
      return (
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#fdfdfd] text-neutral-900 shadow-2xl border border-white/20 flex items-center gap-1.5 sm:gap-2 select-none">
          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#111622] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-sans border border-neutral-700/60 shadow-md">
            <div className="flex items-center gap-1 text-amber-400">
              <GraduationCap className="w-2.5 h-2.5" />
              <span>CSE Core</span>
            </div>
            <div className="text-white font-bold text-[7.5px] leading-tight">NIET Greater Noida</div>
            <div className="p-0.5 rounded bg-white/10 text-slate-300 text-center text-[5.5px]">
              2025–2029
            </div>
          </div>

          <div className="w-18 sm:w-22 aspect-[9/16] rounded-xl bg-[#0E121D] text-white p-1.5 sm:p-2 flex flex-col justify-between items-center text-[7px] border border-amber-500/40 shadow-xl font-sans">
            <div className="w-5 h-1 bg-white/20 rounded-full" />
            <div className="text-center">
              <div className="text-amber-300 text-[6px] uppercase font-bold tracking-wider">Academics</div>
              <div className="text-2xl font-black text-white leading-none mt-1">9.38</div>
            </div>
            <div className="text-[6px] text-emerald-400 font-mono">Current CGPA</div>
          </div>

          <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#111622] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-mono border border-neutral-700/60 shadow-md">
            <div className="text-neutral-400 text-[6px]">Disciplines</div>
            <div className="text-slate-200 text-[5.5px] leading-relaxed">DSA<br />OS<br />DBMS</div>
            <div className="py-0.5 rounded bg-amber-400 text-neutral-950 font-bold text-center text-[5.5px]">
              Dean's Honor
            </div>
          </div>
        </div>
      );
    }

    // LeetCode Practice Mockup
    return (
      <div className="p-2 sm:p-2.5 rounded-2xl bg-[#fdfdfd] text-neutral-900 shadow-2xl border border-white/20 flex items-center gap-1.5 sm:gap-2 select-none">
        <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0E131F] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-mono border border-neutral-700/60 shadow-md">
          <div className="flex items-center gap-1 text-cyan-400">
            <Code2 className="w-2.5 h-2.5" />
            <span>LeetCode</span>
          </div>
          <div className="text-white font-bold text-[7.5px]">Modern C++</div>
          <div className="p-0.5 rounded bg-white/10 text-emerald-400 text-center text-[5.5px]">
            Streak Active
          </div>
        </div>

        <div className="w-18 sm:w-22 aspect-[9/16] rounded-xl bg-[#090D17] text-white p-1.5 sm:p-2 flex flex-col justify-between items-center text-[7px] border border-sky-500/40 shadow-xl font-mono">
          <div className="w-5 h-1 bg-white/20 rounded-full" />
          <div className="text-center">
            <div className="text-sky-300 text-[6px] uppercase font-bold">Solved</div>
            <div className="text-2xl font-black text-white leading-none mt-1">{leetcodeStats.totalSolved}</div>
          </div>
          <div className="text-[5.5px] text-emerald-400 font-mono">0ms Asymptotics</div>
        </div>

        <div className="w-16 sm:w-20 aspect-[9/16] rounded-xl bg-[#0E131F] text-white p-1.5 sm:p-2 flex flex-col justify-between text-[6.5px] font-mono border border-neutral-700/60 shadow-md">
          <div className="text-neutral-400 text-[6px]">Memory</div>
          <div className="text-slate-200 text-[5.5px]">O(1) Space<br />Strict STL</div>
          <div className="py-0.5 rounded bg-cyan-400 text-neutral-950 font-bold text-center text-[5.5px]">
            Verified
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16 relative z-10">
      {/* Dark Obsidian Frame matching Screenshot (#262626 neutral charcoal) */}
      <div className="rounded-[28px] sm:rounded-[36px] bg-[#262626] border border-[#383838] p-6 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden shadow-2xl text-white select-none">
        {/* Background Watermark Typography directly behind /EXPERIENCE text matching Screenshot */}
        <div
          aria-hidden="true"
          className="absolute top-2 sm:top-4 md:top-6 left-6 sm:left-10 md:left-14 lg:left-16 text-5xl sm:text-7xl md:text-8xl lg:text-[7.25rem] font-black uppercase tracking-[0.14em] text-[#343434] select-none pointer-events-none whitespace-nowrap z-0"
        >
          EXPERIENCE
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 sm:pb-10 border-b border-[#383838]">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans tracking-tight text-white uppercase">
            /EXPERIENCE
          </h2>

          <span className="text-xs sm:text-sm font-sans text-neutral-400 tracking-wide">
            6 months of experience
          </span>
        </div>

        {/* Experience List Rows matching Screenshot */}
        <div className="relative z-10 divide-y divide-[#343434]">
          {experienceList.map((item) => {
            const isHovered = hoveredRow === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredRow(item.id)}
                className="py-7 sm:py-9 px-2 flex items-center justify-between gap-6 group cursor-pointer transition-colors relative"
              >
                {/* Left Side: Company & Role */}
                <div className="space-y-1 max-w-lg">
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight group-hover:text-neutral-200 transition-colors">
                    {item.company}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 font-sans">
                    {item.role}
                  </p>
                </div>

                {/* Floating Tilted Mockup Preview on Hover matching Screenshot */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 10, rotate: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: -6 }}
                      exit={{ opacity: 0, scale: 0.85, y: 5 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                      }
                      className="hidden md:flex absolute right-44 lg:right-64 -top-6 sm:-top-8 z-30 pointer-events-none transform -rotate-6 filter drop-shadow-2xl"
                    >
                      {renderFloatingCard(item.id)}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Right Side: Timeline Period */}
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-sans text-neutral-400 tracking-wide">
                    {item.period}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* LeetCode Verification Ribbon */}
        <div className="mt-8 pt-6 border-t border-[#383838] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400 relative z-10">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Verified 150+ C++ Algorithmic Challenges on LeetCode</span>
          </div>
          <a
            href={dsaRepo.leetcodeProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md"
          >
            <span>Visit LeetCode Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
