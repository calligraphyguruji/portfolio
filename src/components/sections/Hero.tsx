import React, { useState, useRef } from 'react';
import { personalInfo, educationInfo } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import { ArrowUpRight, Github, Linkedin, Code, Mail, Youtube } from 'lucide-react';

export const Hero: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('/images/potrait.png');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const leetcodeStats = useLeetCodeStats();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleImageError = () => {
    setImgSrc(
      'https://lh3.googleusercontent.com/aida/AEtjO1V-9zy4Nab4C0EmMHj8j8Xcoj3m9XtPDgnoMxk0vJ0h0dBuv5aMoUTs9CBuzyVunVbHVaWkF4gh1XByz-wkEh0H5ZAFX4OJc8fSHoRxB06datg3h4Cmu9ld0srFVLNx9JvB7YfiYpvxhQXBSm-dNzNXzDIThbMyAwe-7AryMK5KFdY7UsV6cA3hWN0p6iNhjcifUZh72HZcv_wyS5qR3aH3OhmW0TDQgISl_0P5NujYTLMlJzPx70R_Wqvh'
    );
  };

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-12">
      {/* Grand Editorial Frame matching Reference */}
      <div className="editorial-panel p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Top: Grand Editorial Headline in ONE Horizontal Line */}
        <div className="w-full text-center select-none pt-2 sm:pt-4 overflow-hidden">
          <h1 className="flex items-center justify-center gap-x-3 sm:gap-x-6 md:gap-x-8 text-4xl sm:text-6xl md:text-7xl lg:text-[6.8rem] xl:text-[8rem] font-extrabold uppercase tracking-tight leading-none whitespace-nowrap">
            <span className="text-stroke-outline">AMAN</span>
            <span className="text-[#171717] dark:text-white">MISHRA</span>
          </h1>
        </div>

        {/* Middle: 3-Column Balanced Layout */}
        <div className="w-full mt-6 sm:mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-12 items-center lg:items-end gap-8 relative z-10">
          {/* Left Column: Software Developer & Intro */}
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left order-2 lg:order-1">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-1">
                Engineering &amp; Systems
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold tracking-tight text-[#171717] dark:text-white">
                Software Developer
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#5E5E5E] dark:text-slate-300 mt-1">
                CSE Student @ {personalInfo.college}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 leading-relaxed max-w-sm mx-auto lg:mx-0">
              &ldquo;{personalInfo.summary}&rdquo;
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
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

          {/* Center Column: Portrait with Cursor Spotlight Color Reveal */}
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div
              ref={cardRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] aspect-[4/5] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 border border-black/[0.08] dark:border-white/[0.15] shadow-2xl shadow-black/10 dark:shadow-black/70 cursor-crosshair select-none group"
            >
              {/* Base Layer: Grayscale Image */}
              <img
                src={imgSrc}
                onError={handleImageError}
                alt="Aman Mishra"
                className="w-full h-full object-cover object-top filter grayscale contrast-[1.08] brightness-[0.98] transition-transform duration-700 ease-out group-hover:scale-102"
              />

              {/* Dynamic Color Spotlight: Reveals natural photo color only within cursor circle */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
                style={{
                  opacity: isHovered ? 1 : 0,
                  WebkitMaskImage: isHovered
                    ? `radial-gradient(circle 105px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 50%, transparent 100%)`
                    : 'none',
                  maskImage: isHovered
                    ? `radial-gradient(circle 105px at ${mousePos.x}px ${mousePos.y}px, black 0%, black 50%, transparent 100%)`
                    : 'none',
                }}
              >
                <img
                  src={imgSrc}
                  onError={handleImageError}
                  alt="Aman Mishra Color Spotlight"
                  className="w-full h-full object-cover object-top filter contrast-[1.05] brightness-[1.02] transition-transform duration-700 ease-out group-hover:scale-102"
                />
              </div>

              {/* Subtle atmospheric vignette gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Social Pills Vertical Stack */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col flex-wrap items-center justify-center lg:items-end gap-2.5 w-full order-3">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Github className="w-4 h-4 text-[#171717] dark:text-white" />
              <span>GitHub</span>
            </a>

            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>

            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Code className="w-4 h-4 text-amber-500" />
              <span>LeetCode [{leetcodeStats.totalSolved}]</span>
            </a>

            <a
              href={personalInfo.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Youtube className="w-4 h-4 text-[#FF0000]" />
              <span>YouTube</span>
            </a>

            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-slate-200 hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Mail className="w-4 h-4 text-[#171717] dark:text-white" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Bottom Metadata Ribbon inside Hero Panel */}
        <div className="mt-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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
              {leetcodeStats.totalSolved} LeetCode Problems Solved in C++
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
