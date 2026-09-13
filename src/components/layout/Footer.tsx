import React from 'react';
import { personalInfo } from '../../data/portfolioData';
import { Github, Linkedin, Code, ArrowUp, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#E5E7EB] dark:border-[#262626] bg-white dark:bg-[#0B0F17] px-5 sm:px-8 pt-12 pb-16 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-serif text-2xl font-medium italic text-[#171717] dark:text-white">
              Aman Mishra
            </span>
            <p className="text-xs text-[#5E5E5E] dark:text-slate-400 mt-1 font-normal">
              Computer Science Engineering &bull; NIET, Greater Noida (Class of 2029)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
              aria-label="LeetCode"
            >
              <Code className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="p-2 rounded-full bg-[#F3F3F3] dark:bg-[#161B22] text-[#171717] dark:text-white border border-[#E5E7EB] dark:border-[#262626] hover:opacity-75 transition-opacity"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-[#171717] text-white hover:bg-[#222222] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 transition-all ml-1 shadow-xs"
              aria-label="Scroll to top"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E5E7EB] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A0A0A0] dark:text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Aman Mishra. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Engineered with Compound Editorial Aesthetics
          </p>
        </div>
      </div>
    </footer>
  );
};
