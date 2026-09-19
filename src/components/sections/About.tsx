import React from 'react';
import { personalInfo, educationInfo } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import {
  GraduationCap,
  Award,
  Terminal,
  MapPin,
} from 'lucide-react';

export const About: React.FC = () => {
  const leetcodeStats = useLeetCodeStats();
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          PROFILE
        </div>

        {/* Section Header */}
        <div className="relative z-10 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
            /ABOUT ME
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
            Engineering Foundations
          </h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          {/* Left Column: Narrative & Quote */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-sm sm:text-base md:text-lg text-[#5E5E5E] dark:text-slate-300 leading-relaxed font-normal">
              I am a second-year Computer Science Engineering student at{' '}
              <strong className="text-[#171717] dark:text-white font-semibold">
                NIET Greater Noida
              </strong>
              , maintaining a current cumulative GPA of{' '}
              <strong className="text-[#171717] dark:text-white font-semibold">
                {educationInfo.cgpa}
              </strong>
              . My engineering journey is anchored in computer science fundamentals: modern C++, data structures, object-oriented systems, and end-to-end full-stack web architectures.
            </p>

            <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-400 leading-relaxed font-normal">
              Beyond theory, I focus on shipping real software. From engineering our full-stack employment platform{' '}
              <strong className="text-[#171717] dark:text-white font-medium">KaushalNexus</strong> to completing a verified industry internship in AI/ML pipelines at{' '}
              <strong className="text-[#171717] dark:text-white font-medium">Codomax Digital Solutions</strong>, I strive to write code that is clean, resilient, and computationally efficient.
            </p>

            {/* Editorial Manifesto Quote */}
            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-[#1C1C1C] border-l-4 border-[#171717] dark:border-white space-y-2">
              <blockquote className="text-lg sm:text-xl font-sans font-medium text-[#171717] dark:text-white leading-snug">
                &ldquo;Rigorous computational thinking, disciplined DSA problem-solving, and practical user-facing software.&rdquo;
              </blockquote>
              <span className="text-xs font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block">
                Aman Mishra &bull; CSE &bull; Class of 2029
              </span>
            </div>
          </div>

          {/* Right Column: Academic & Attribute Highlights */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-[#1C1C1C] border border-black/[0.06] dark:border-[#383838] space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
                    Degree &amp; Institution
                  </span>
                  <span className="text-sm font-semibold text-[#171717] dark:text-white block">
                    {educationInfo.degree}
                  </span>
                  <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                    {educationInfo.institution} (Expected {educationInfo.timeline})
                  </span>
                </div>
              </div>

              <div className="border-t border-black/[0.06] dark:border-[#383838]" />

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white shrink-0">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
                    Academic Merit
                  </span>
                  <span className="text-sm font-semibold text-[#171717] dark:text-white block">
                    Cumulative GPA: {educationInfo.cgpa} / 10
                  </span>
                  <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                    Top academic percentile in CSE department
                  </span>
                </div>
              </div>

              <div className="border-t border-black/[0.06] dark:border-[#383838]" />

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white shrink-0">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
                    DSA Problem Solving
                  </span>
                  <span className="text-sm font-semibold text-[#171717] dark:text-white block">
                    {leetcodeStats.totalSolved} Problems Solved
                  </span>
                  <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                    Modern C++, STL, Complexity Analysis
                  </span>
                </div>
              </div>

              <div className="border-t border-black/[0.06] dark:border-[#383838]" />

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-[#171717] dark:text-white block">
                    {personalInfo.location}
                  </span>
                  <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                    Open to on-site (NCR/Bengaluru) &amp; remote roles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
