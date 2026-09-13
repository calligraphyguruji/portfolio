import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { Mail, Copy, Check, Github, Linkedin, Code, ArrowUpRight } from 'lucide-react';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personalInfo.socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-20 px-5 sm:px-8 max-w-4xl mx-auto text-center">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-mono font-bold uppercase text-cyan-400 block mb-2">
            Initiate Contact
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Let’s Build Something Impactful
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Currently open to software engineering internships, collaborative technical projects, and systems development.
        </p>

        {/* Primary Contact Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a
            href={`mailto:${personalInfo.socials.email}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-slate-900 font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-slate-200 active:scale-95 transition-all"
          >
            <Mail className="w-4 h-4 text-slate-900" />
            <span>Send Email</span>
          </a>

          <button
            onClick={copyEmail}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 hover:border-slate-500 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Email Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{personalInfo.socials.email}</span>
              </>
            )}
          </button>
        </div>

        {/* Social Cards Grid */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">GitHub</span>
                <span className="text-[10px] font-mono text-slate-400">@calligraphyguruji</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>

          <a
            href={personalInfo.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">LinkedIn</span>
                <span className="text-[10px] font-mono text-slate-400">in/calligraphygurji</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>

          <a
            href={personalInfo.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400 group-hover:text-amber-300 transition-colors">
                <Code className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">LeetCode</span>
                <span className="text-[10px] font-mono text-slate-400">u/calligraphyguruji</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
};
