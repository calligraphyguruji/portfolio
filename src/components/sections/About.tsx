import React from 'react';
import { personalInfo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { GraduationCap, MapPin, Code2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-14 sm:py-16 px-5 sm:px-8 max-w-5xl mx-auto">
      <SectionHeading
        eyebrow="01 // Background & Profile"
        title="About Me"
        number="01"
        description="A student of computer science, driven by algorithmic logic, backend efficiency, and practical engineering."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Summary & Journal Note */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-300 leading-[1.65] font-normal">
            {personalInfo.summary}
          </p>

          {/* Compound Editorial Journal Quote */}
          <div className="p-6 rounded-[20px] bg-[#F3F3F3] dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] space-y-3">
            <blockquote className="text-lg sm:text-xl font-sans font-normal text-[#171717] dark:text-white leading-snug">
              &ldquo;Building scalable, user-focused applications backed by computational rigor.&rdquo;
            </blockquote>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#6F6F6F] dark:text-slate-400 block">
              Aman Mishra &bull; Engineering Focus
            </span>
          </div>
        </div>

        {/* Right Column: Academic & Foundational Attributes */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] space-y-5 shadow-xs">
            <h3 className="text-xs uppercase font-mono font-medium tracking-widest text-[#6F6F6F] dark:text-slate-400">
              Academic Grounding
            </h3>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#171717] dark:text-white block">
                  {personalInfo.degree}
                </span>
                <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                  {personalInfo.college}
                </span>
                <span className="text-[11px] font-mono text-[#6F6F6F] dark:text-slate-400 mt-0.5 block">
                  Class of {personalInfo.graduationYear}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] dark:border-[#262626]"></div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#171717] dark:text-white block">
                  Location
                </span>
                <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] dark:border-[#262626]"></div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#171717] dark:text-white block">
                  Primary Vectors
                </span>
                <span className="text-xs text-[#5E5E5E] dark:text-slate-400 block">
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
