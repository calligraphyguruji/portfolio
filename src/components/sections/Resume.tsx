import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { educationInfo, personalInfo } from '../../data/portfolioData';
import { useLeetCodeStats } from '../../hooks/useLeetCodeStats';
import {
  Download,
  ExternalLink,
  FileText,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Code2,
  ShieldCheck,
} from 'lucide-react';

export const Resume: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const leetcodeStats = useLeetCodeStats();

  const resumeHighlights = [
    {
      icon: GraduationCap,
      label: 'Education',
      primary: educationInfo.degree,
      secondary: `${educationInfo.institution} · CGPA ${educationInfo.cgpa}`,
    },
    {
      icon: Briefcase,
      label: 'Experience',
      primary: 'AI & ML Intern · Codomax Digital Solutions',
      secondary: 'Lead Architect · KaushalNexus (SIH 2026)',
    },
    {
      icon: Code2,
      label: 'Key Technical Stack',
      primary: 'C++, React 19, FastAPI, PostgreSQL, Gemini AI',
      secondary: `${leetcodeStats.totalSolved}+ LeetCode Algorithmic Solutions Solved in C++`,
    },
  ];

  return (
    <section id="resume" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="editorial-panel p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        {/* Background Watermark */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        >
          RESUME
        </div>

        {/* Section Header */}
        <div className="relative z-10 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-medium tracking-widest uppercase text-[#8E8E93] dark:text-slate-400 block mb-1">
                /CURRICULUM VITAE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#171717] dark:text-white uppercase">
                My Resume
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#5E5E5E] dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified &bull; 2026 Edition</span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-400 max-w-2xl leading-relaxed mt-3 font-normal">
            View or download my latest resume to learn more about my experience, skills, projects, and education.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-stretch">
          {/* Left Column: Interactive Document Card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08]"
          >
            <div>
              {/* Document Identity Banner */}
              <div className="flex items-center justify-between gap-3 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-[#171717] dark:text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-mono font-semibold text-[#171717] dark:text-white">
                      Aman_Mishra_Resume.pdf
                    </h3>
                    <span className="text-xs font-mono text-[#8E8E93] dark:text-slate-400">
                      Standard ATS-Friendly PDF &bull; 55 KB
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready
                </span>
              </div>

              {/* Document Highlights Checklist */}
              <div className="py-6 space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block">
                  Document Overview
                </span>
                <div className="space-y-3.5">
                  {resumeHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]"
                      >
                        <div className="p-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] text-[#171717] dark:text-white shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono uppercase tracking-wider text-[#8E8E93] dark:text-slate-400">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white mt-0.5 truncate">
                            {item.primary}
                          </p>
                          <p className="text-xs text-[#5E5E5E] dark:text-slate-400 mt-0.5">
                            {item.secondary}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Metadata Footer */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5E5E5E] dark:text-slate-400 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Contact: {personalInfo.socials.email}
              </span>
              <span>Class of 2029</span>
            </div>
          </motion.div>

          {/* Right Column: Prominent Download & View Action Deck */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08]"
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8E8E93] dark:text-slate-400 block mb-2">
                Document Access
              </span>
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#171717] dark:text-white tracking-tight">
                Get Aman&apos;s Full Profile
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-400 mt-2 leading-relaxed">
                Direct access to the comprehensive one-page resume detailing systems architecture, technical competencies, algorithms, and verified industry work.
              </p>

              {/* Action Buttons */}
              <div className="pt-6 sm:pt-8 space-y-3.5">
                {/* Primary Download CTA */}
                <a
                  href="/resume.pdf"
                  download="Aman_Mishra_Resume.pdf"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171717] dark:focus-visible:ring-white group"
                  aria-label="Download Aman Mishra Resume PDF (Aman_Mishra_Resume.pdf)"
                >
                  <Download className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span>Download Resume</span>
                </a>

                {/* Secondary View CTA */}
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.12] dark:border-white/[0.15] hover:border-black dark:hover:border-white text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#171717] dark:text-white transition-all duration-200 hover:shadow-xs active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171717] dark:focus-visible:ring-white group"
                  aria-label="View Aman Mishra Resume PDF in a new browser tab"
                >
                  <span>View Resume</span>
                  <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* ATS & Compatibility Footnote */}
            <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#5E5E5E] dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Format: PDF (Aman_Mishra_Resume.pdf)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#5E5E5E] dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Optimized for ATS scanners and tech screeners</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
