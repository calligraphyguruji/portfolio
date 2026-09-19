import React from 'react';
import { personalInfo } from '../../data/portfolioData';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 pt-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#5E5E5E] dark:text-slate-400">
        <div className="text-center sm:text-left space-y-1">
          <div className="font-semibold text-sm text-[#171717] dark:text-white">
            {personalInfo.name}
          </div>
          <div>Software Developer &bull; CSE Student @ NIET Greater Noida</div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href={personalInfo.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={personalInfo.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            LeetCode
          </a>
          <a
            href={`mailto:${personalInfo.socials.email}`}
            className="hover:text-[#171717] dark:hover:text-white transition-colors"
          >
            Email
          </a>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-full bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white hover:scale-105 transition-all ml-2"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] font-mono text-[#8E8E93] dark:text-slate-500 pt-2">
        &copy; 2026 Aman Mishra. All rights reserved.
      </div>
    </footer>
  );
};
