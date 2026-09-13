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
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {personalInfo.summary}
          </p>

          {/* Stitch Style Editorial Manifesto Quote */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-950/30 to-slate-900/50 border border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <span className="font-serif italic text-2xl sm:text-3xl text-slate-100 leading-snug block mb-3">
              “Building scalable, user-focused applications backed by computational rigor.”
            </span>
            <p className="text-[10px] tracking-widest font-mono font-bold uppercase text-cyan-400">
              Aman Mishra — Engineering Focus
            </p>
          </div>
        </div>

        {/* Right Column: Academic & Foundational Attributes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
              Academic Grounding
            </h3>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {personalInfo.degree}
                </span>
                <span className="text-xs text-slate-400 block">
                  {personalInfo.college}
                </span>
                <span className="text-[11px] font-mono text-cyan-400 mt-0.5 block">
                  Class of {personalInfo.graduationYear}
                </span>
              </div>
            </div>

            <div className="subtle-line my-2"></div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Location</span>
                <span className="text-xs text-slate-400 block">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            <div className="subtle-line my-2"></div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Primary Vectors
                </span>
                <span className="text-xs text-slate-400 block">
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
