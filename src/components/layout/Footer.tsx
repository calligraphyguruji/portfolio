import React from 'react';
import { personalInfo } from '../../data/portfolioData';
import { Github, Linkedin, Code, ArrowUp, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-stone-300/80 bg-slate-950 dark:bg-canvas-dark light:bg-[#FAF9F6] px-5 sm:px-8 pt-12 pb-16 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-serif text-2xl font-medium italic text-white dark:text-white light:text-stone-900">
              Aman Mishra
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-stone-600 mt-1">
              Computer Science Engineering Student • NIET, Greater Noida
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="LeetCode"
            >
              <Code className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all ml-2"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Aman Mishra. All rights reserved.</p>
          <p className="font-mono text-[10px]">
            Designed with Google Stitch UI &amp; Modern React
          </p>
        </div>
      </div>
    </footer>
  );
};
