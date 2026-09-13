import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('/images/potrait.png');

  return (
    <section className="relative pt-8 sm:pt-14 pb-16 px-5 sm:px-8 max-w-5xl mx-auto">
      {/* Editorial Identity & Typography */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        {/* Availability Micro Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] text-xs text-[#5E5E5E] dark:text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>NIET Computer Science &bull; Class of 2029</span>
        </div>

        {/* Dramatic Size Jump Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-normal tracking-[-0.03em] leading-[0.98] text-[#171717] dark:text-white uppercase">
          Aman Mishra
        </h1>

        {/* Quiet Editorial Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-[#5E5E5E] dark:text-slate-300 font-normal leading-[1.60] max-w-2xl mx-auto">
          Computer Science Engineering student at{' '}
          <strong className="font-medium text-[#171717] dark:text-white">
            {personalInfo.college}
          </strong>
          . Building high-performance systems in C++, scalable full-stack web applications, and AI/ML architectures.
        </p>

        {/* Restrained Interactive Controls */}
        <div className="pt-2 flex items-center justify-center gap-6">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-[#222222] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <span>Explore Works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#contact"
            className="text-xs font-medium uppercase tracking-wider text-[#171717] dark:text-slate-300 underline underline-offset-4 decoration-1 hover:opacity-75 transition-opacity"
          >
            Get in touch
          </a>
        </div>
      </div>

      {/* The Centerpiece: Compound Product Preview Card with 4-layer atmospheric shadow */}
      <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
        <div className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] compound-shadow p-3 sm:p-5 transition-all duration-300">
          {/* Subtle Card Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E5E7EB] dark:border-[#262626] px-1 text-xs text-[#6F6F6F] dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#171717] dark:bg-slate-300" />
              <span>profile_preview.sys</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Candidate</span>
            </div>
          </div>

          {/* Framed Visual Portrait & Details */}
          <div className="relative rounded-[16px] overflow-hidden bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626] mt-3 sm:mt-4 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group">
            <img
              src={imgSrc}
              onError={() => {
                setImgSrc(
                  'https://lh3.googleusercontent.com/aida/AEtjO1V-9zy4Nab4C0EmMHj8j8Xcoj3m9XtPDgnoMxk0vJ0h0dBuv5aMoUTs9CBuzyVunVbHVaWkF4gh1XByz-wkEh0H5ZAFX4OJc8fSHoRxB06datg3h4Cmu9ld0srFVLNx9JvB7YfiYpvxhQXBSm-dNzNXzDIThbMyAwe-7AryMK5KFdY7UsV6cA3hWN0p6iNhjcifUZh72HZcv_wyS5qR3aH3OhmW0TDQgISl_0P5NujYTLMlJzPx70R_Wqvh'
                );
              }}
              alt="Aman Mishra"
              className="w-full h-full object-cover object-top filter grayscale contrast-[1.05] group-hover:grayscale-0 transition-all duration-700 ease-out"
            />

            {/* Bottom Overlay Label */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between text-white">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300 block">
                  Candidate Dossier
                </span>
                <span className="text-base sm:text-lg font-medium tracking-tight block">
                  Aman Mishra &bull; Software Developer
                </span>
              </div>
              <a
                href={personalInfo.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-mono tracking-wide text-white border border-white/20 transition-colors"
              >
                <span>github/calligraphyguruji</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Footer Metadata Grid inside Preview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 sm:pt-5">
            <div className="p-3 rounded-[12px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0] dark:text-slate-400 block mb-0.5">
                Institution
              </span>
              <span className="text-xs font-medium text-[#171717] dark:text-white block truncate">
                NIET Greater Noida
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0] dark:text-slate-400 block mb-0.5">
                Core Specialization
              </span>
              <span className="text-xs font-medium text-[#171717] dark:text-white block truncate">
                C++ Systems &bull; Full-Stack
              </span>
            </div>
            <div className="p-3 rounded-[12px] bg-[#F3F3F3] dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#262626]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A0A0A0] dark:text-slate-400 block mb-0.5">
                Status
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block truncate">
                Open to Internships
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Highlights Bar */}
      <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-[20px] bg-[#F3F3F3] dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626]">
        <div className="text-center py-1">
          <div className="text-3xl sm:text-4xl font-sans font-normal text-[#171717] dark:text-white tracking-tight">
            2029
          </div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 mt-1">
            B.Tech CSE Class (NIET)
          </div>
        </div>
        <div className="text-center py-1 sm:border-x border-[#E5E7EB] dark:border-[#262626]">
          <div className="text-3xl sm:text-4xl font-sans font-normal text-[#171717] dark:text-white tracking-tight">
            4+
          </div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 mt-1">
            Engineered Projects
          </div>
        </div>
        <div className="text-center py-1">
          <div className="text-3xl sm:text-4xl font-sans font-normal text-[#171717] dark:text-white tracking-tight">
            11+
          </div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 mt-1">
            Algorithmic DSA Topics
          </div>
        </div>
      </div>
    </section>
  );
};
