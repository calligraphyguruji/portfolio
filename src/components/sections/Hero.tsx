import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { ArrowRight, Mail, MapPin } from 'lucide-react';

export const Hero: React.FC = () => {
  const [imgSrc, setImgSrc] = useState('/images/potrait.png');

  return (
    <section className="relative pt-8 pb-16 px-5 sm:px-8 max-w-5xl mx-auto overflow-hidden">
      {/* Top Micro Bar: Availability & Specialty */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-sky-50 border border-cyan-500/30 dark:border-cyan-500/30 light:border-sky-300 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 dark:text-cyan-300 light:text-sky-800">
            Available for Internships &amp; Collaborations
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] tracking-widest font-semibold uppercase text-slate-400 dark:text-slate-400 light:text-stone-600">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 light:text-sky-600" />
          <span>{personalInfo.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left / Center: Centerpiece Portrait with Stitch Ambient Glow Halo */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] aspect-[4/5] flex items-center justify-center">
            {/* Ambient Radial Glow Aura from Stitch */}
            <div className="glow-aura absolute inset-0 -m-6 pointer-events-none z-0 rounded-full scale-110"></div>

            {/* Editorial Lead-in Script on top */}
            <div className="absolute -top-5 z-20 text-center">
              <span className="font-serif italic text-3xl sm:text-4xl text-slate-300 dark:text-slate-300 light:text-stone-700 tracking-tight font-normal drop-shadow-md">
                Hey, <span className="font-light text-cyan-300 dark:text-cyan-300 light:text-sky-700">there</span>
              </span>
            </div>

            {/* Architectural Portrait Container */}
            <div className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60 dark:shadow-black/60 light:shadow-stone-400/30 border border-slate-700/80 dark:border-slate-700/80 light:border-stone-300 bg-slate-900 group">
              <img
                src={imgSrc}
                onError={() => {
                  setImgSrc(
                    'https://lh3.googleusercontent.com/aida/AEtjO1V-9zy4Nab4C0EmMHj8j8Xcoj3m9XtPDgnoMxk0vJ0h0dBuv5aMoUTs9CBuzyVunVbHVaWkF4gh1XByz-wkEh0H5ZAFX4OJc8fSHoRxB06datg3h4Cmu9ld0srFVLNx9JvB7YfiYpvxhQXBSm-dNzNXzDIThbMyAwe-7AryMK5KFdY7UsV6cA3hWN0p6iNhjcifUZh72HZcv_wyS5qR3aH3OhmW0TDQgISl_0P5NujYTLMlJzPx70R_Wqvh'
                  );
                }}
                alt="Portrait of Aman Mishra"
                className="w-full h-full object-cover object-center grayscale-[15%] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Bottom Editorial Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute bottom-4 inset-x-5 flex justify-between items-end text-white/90">
                <span className="text-[9px] uppercase tracking-widest font-mono text-cyan-300">
                  Aman Mishra
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">
                  Code &amp; Systems
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dramatic Typographic Layering & Bio */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400 dark:text-cyan-400 light:text-sky-700 mb-2">
              Engineering &amp; Problem Solving
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[0.92] text-white dark:text-white light:text-stone-900 tracking-tighter uppercase">
              I AM <br />
              <span className="text-slate-300 dark:text-slate-300 light:text-stone-600">
                AMAN MISHRA
              </span>
            </h1>
          </div>

          {/* Subtitle & Role Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
            <p className="text-sm font-normal leading-relaxed text-slate-300 dark:text-slate-300 light:text-stone-700 max-w-md">
              Computer Science Engineering student at{' '}
              <strong className="text-white dark:text-white light:text-stone-900 font-semibold">
                {personalInfo.college}
              </strong>{' '}
              (Class of 2029). Focused on high-performance C++, DSA, and full-stack software development.
            </p>
            <div className="text-left sm:text-right border-l sm:border-l-0 sm:border-r border-cyan-500/40 pl-3 sm:pl-0 sm:pr-3">
              <span className="block font-display font-bold text-xs uppercase tracking-wider text-white dark:text-white light:text-stone-900">
                Aspiring
                <br />
                Software
                <br />
                Developer
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-white dark:bg-white light:bg-stone-900 text-slate-900 dark:text-slate-900 light:text-white text-center font-semibold text-xs tracking-wider uppercase hover:bg-slate-200 dark:hover:bg-slate-200 light:hover:bg-stone-800 active:scale-[0.98] transition-all shadow-md shadow-black/30"
            >
              Explore Projects
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="inline-flex items-center gap-2 py-3 px-5 rounded-full border border-slate-700 dark:border-slate-700 light:border-stone-300 text-slate-200 dark:text-slate-200 light:text-stone-800 text-center font-semibold text-xs tracking-wider uppercase bg-slate-800/60 dark:bg-slate-800/60 light:bg-stone-100 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-stone-200 hover:border-slate-500 active:scale-[0.98] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              Get In Touch
            </a>
          </div>
        </div>
      </div>

      {/* Metric Highlights Grid from Stitch */}
      <div className="mt-14 grid grid-cols-3 gap-3 p-4 rounded-3xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] shadow-lg">
        <div className="text-center py-2">
          <div className="font-display font-bold text-2xl sm:text-3xl text-white dark:text-white light:text-stone-900 tracking-tight">
            2029
          </div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-400 light:text-stone-600 mt-0.5">
            B.Tech CSE Class
          </div>
        </div>
        <div className="text-center py-2 border-x border-slate-800 dark:border-slate-800 light:border-stone-300">
          <div className="font-display font-bold text-2xl sm:text-3xl text-cyan-400 dark:text-cyan-400 light:text-sky-700 tracking-tight">
            4+
          </div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-400 light:text-stone-600 mt-0.5">
            Core Projects
          </div>
        </div>
        <div className="text-center py-2">
          <div className="font-display font-bold text-2xl sm:text-3xl text-white dark:text-white light:text-stone-900 tracking-tight">
            11+
          </div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-400 light:text-stone-600 mt-0.5">
            DSA Topic Areas
          </div>
        </div>
      </div>
    </section>
  );
};
