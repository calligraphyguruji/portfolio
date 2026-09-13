import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import { Mail, Copy, Check, Github, Linkedin, Code, ArrowUpRight } from 'lucide-react';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="contact" className="py-14 sm:py-20 px-5 sm:px-8 max-w-4xl mx-auto text-center">
      <SectionHeading
        eyebrow="07 // Direct Dispatch"
        title="Initiate Contact"
        number="07"
        description="Currently open to software engineering internships, collaborative technical projects, and systems development."
        align="center"
      />

      <div className="space-y-8">
        {/* Primary Contact Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a
            href={`mailto:${personalInfo.socials.email}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-semibold text-xs uppercase tracking-widest shadow-xs hover:bg-[#222222] dark:hover:bg-slate-200 active:scale-95 transition-all focus-visible:outline-none"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </a>

          <button
            onClick={copyEmail}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#E5E7EB] dark:border-[#262626] bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-slate-200 text-xs font-mono hover:border-[#A0A0A0] dark:hover:border-slate-500 active:scale-95 transition-all shadow-xs focus-visible:outline-none"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Email Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6F6F6F] dark:text-slate-400" />
                <span>{personalInfo.socials.email}</span>
              </>
            )}
          </button>
        </div>

        {/* Social Cards Grid */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626]">
                <Github className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-[#171717] dark:text-white block">
                  GitHub
                </span>
                <span className="text-[10px] font-mono text-[#6F6F6F] dark:text-slate-400">
                  @calligraphyguruji
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717] dark:group-hover:text-white transition-colors" />
          </a>

          <a
            href={personalInfo.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626]">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-[#171717] dark:text-white block">
                  LinkedIn
                </span>
                <span className="text-[10px] font-mono text-[#6F6F6F] dark:text-slate-400">
                  in/calligraphygurji
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717] dark:group-hover:text-white transition-colors" />
          </a>

          <a
            href={personalInfo.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] hover:border-[#A0A0A0] dark:hover:border-slate-600 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626]">
                <Code className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-[#171717] dark:text-white block">
                  LeetCode
                </span>
                <span className="text-[10px] font-mono text-[#6F6F6F] dark:text-slate-400">
                  u/calligraphyguruji
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#171717] dark:group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
};
