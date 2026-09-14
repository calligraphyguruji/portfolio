import React, { useState } from 'react';
import { personalInfo, educationInfo, dsaRepo } from '../../data/portfolioData';
import { ArrowUpRight, Github, Linkedin, Code, Mail } from 'lucide-react';

export const Hero: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('/images/potrait.png');

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-12">
      {/* Grand Editorial Frame matching Screenshot 1 */}
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Layer 1: Giant Editorial Headline (Outlined First Name + Filled Last Name) */}
        <div className="w-full text-center select-none pt-2 sm:pt-4">
          <h1 className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] xl:text-[10.5rem] font-extrabold uppercase tracking-tight leading-[0.88]">
            <span className="text-stroke-outline">AMAN</span>
            <span className="text-[#171717] dark:text-white">MISHRA</span>
          </h1>
        </div>

        {/* Layer 2: Centerpiece Portrait overlapping typography */}
        <div className="relative -mt-6 sm:-mt-12 md:-mt-16 lg:-mt-24 flex justify-center z-10">
          <div className="relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[460px] aspect-[4/5] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 border border-black/[0.08] dark:border-white/[0.15] shadow-2xl shadow-black/10 dark:shadow-black/70 group">
            <img
              src={imgSrc}
              onError={() => {
                setImgSrc(
                  'https://lh3.googleusercontent.com/aida/AEtjO1V-9zy4Nab4C0EmMHj8j8Xcoj3m9XtPDgnoMxk0vJ0h0dBuv5aMoUTs9CBuzyVunVbHVaWkF4gh1XByz-wkEh0H5ZAFX4OJc8fSHoRxB06datg3h4Cmu9ld0srFVLNx9JvB7YfiYpvxhQXBSm-dNzNXzDIThbMyAwe-7AryMK5KFdY7UsV6cA3hWN0p6iNhjcifUZh72HZcv_wyS5qR3aH3OhmW0TDQgISl_0P5NujYTLMlJzPx70R_Wqvh'
                );
              }}
              alt="Aman Mishra"
              className="w-full h-full object-cover object-top filter grayscale contrast-[1.08] brightness-[0.98] group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            {/* Subtle atmospheric vignette gradient */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Layer 3: Lower Left Identity & Lower Right Vertical Social Pills */}
        <div className="w-full relative z-20 mt-8 sm:mt-10 lg:-mt-28 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 pt-4">
          {/* Left Column: Role & Mission */}
          <div className="space-y-4 text-center lg:text-left max-w-md">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-1">
                Engineering &amp; Systems
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[#171717] dark:text-white">
                Software Developer
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#5E5E5E] dark:text-slate-300 mt-1">
                CSE Student @ {personalInfo.college}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 leading-relaxed">
              &ldquo;{personalInfo.summary}&rdquo;
            </p>

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">
              <a
                href="#work"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>View My Work</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#contact"
                className="text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white underline underline-offset-4 decoration-1 hover:opacity-75 transition-opacity"
              >
                Let&apos;s Connect &rarr;
              </a>
            </div>
          </div>

          {/* Right Column: Vertical Stack of Compact Rounded-Full Social Pills matching Screenshot 1 */}
          <div className="flex flex-row lg:flex-col flex-wrap items-center justify-center lg:items-end gap-2.5 w-full lg:w-auto">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Github className="w-4 h-4 text-[#171717] dark:text-white" />
              <span>GitHub</span>
            </a>

            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>

            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Code className="w-4 h-4 text-amber-500" />
              <span>LeetCode [150+]</span>
            </a>

            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#12161F] border border-black/[0.08] dark:border-white/[0.12] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Mail className="w-4 h-4 text-[#171717] dark:text-white" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Bottom Metadata Ribbon inside Hero Panel */}
        <div className="mt-12 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
              Academic Standing
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white">
              {educationInfo.degree} &bull; CGPA: {educationInfo.cgpa}
            </span>
          </div>
          <div className="sm:border-x border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
              Institution
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white">
              {educationInfo.institution} (Class of {educationInfo.timeline})
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-0.5">
              Algorithmic Problem Solving
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white">
              {dsaRepo.problemsSolved} LeetCode Problems Solved in C++
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
