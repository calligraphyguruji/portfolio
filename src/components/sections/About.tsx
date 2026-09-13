import React from 'react';
import { personalInfo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { GraduationCap, MapPin, Code2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="01 // Background & Profile"
        title="About Me"
        number="01 — 06"
        description="A student of computer science, driven by algorithmic logic, backend efficiency, and practical engineering."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Summary & Manifesto */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 light:text-stone-700 leading-relaxed font-normal">
            {personalInfo.summary}
          </p>

          {/* Stitch Style Editorial Manifesto Quote */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-950/30 to-slate-900/50 dark:from-cyan-950/30 dark:to-slate-900/50 light:from-amber-100/40 light:to-stone-100/30 border border-cyan-500/20 dark:border-cyan-500/20 light:border-amber-200/60 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <span className="font-serif italic text-2xl sm:text-3xl text-slate-100 dark:text-slate-100 light:text-stone-900 leading-snug block mb-3">
              “Building scalable, user-focused applications backed by computational rigor.”
            </span>
            <p className="text-[10px] tracking-widest font-mono font-bold uppercase text-cyan-400 dark:text-cyan-400 light:text-amber-800">
              Aman Mishra — Engineering Focus
            </p>
          </div>
        </div>

        {/* Right Column: Academic & Foundational Attributes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-[#F1EFEA] border border-slate-800 dark:border-slate-800 light:border-[#E4E0D8] space-y-4 shadow-lg">
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-stone-600 mb-2">
              Academic Grounding
            </h3>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-sky-100 text-cyan-400 dark:text-cyan-400 light:text-sky-800 border border-cyan-500/30 dark:border-cyan-500/30 light:border-sky-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white dark:text-white light:text-stone-900 block">
                  {personalInfo.degree}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 block">
                  {personalInfo.college}
                </span>
                <span className="text-[11px] font-mono text-cyan-400 dark:text-cyan-400 light:text-sky-700 mt-0.5 block">
                  Class of {personalInfo.graduationYear}
                </span>
              </div>
            </div>

            <div className="subtle-line my-2"></div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-stone-200 text-slate-300 dark:text-slate-300 light:text-stone-700 border border-slate-700 dark:border-slate-700 light:border-stone-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white dark:text-white light:text-stone-900 block">Location</span>
                <span className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 block">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            <div className="subtle-line my-2"></div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-950/60 dark:bg-indigo-950/60 light:bg-indigo-50 text-indigo-400 dark:text-indigo-400 light:text-indigo-800 border border-indigo-500/30 dark:border-indigo-500/30 light:border-indigo-200">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white dark:text-white light:text-stone-900 block">
                  Primary Vectors
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 block">
                  C++, Data Structures, Full-Stack Architecture, AI/ML
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
