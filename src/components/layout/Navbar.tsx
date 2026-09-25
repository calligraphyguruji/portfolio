import React, { useState, useEffect } from 'react';
import { personalInfo, navigationLinks } from '../../data/portfolioData';
import { Menu, X, Sun, Moon, ArrowUpRight, Github, Linkedin, Code, Youtube } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ['hero', 'work', 'services', 'about', 'build', 'experience', 'resume', 'contact'];
      const scrollPos = window.scrollY + 160;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[#EAEBED]/85 dark:bg-[#090C10]/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Floating Status Pill matching Screenshot 1 */}
        <a
          href="#contact"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] shadow-sm hover:shadow transition-all group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wider uppercase text-[#171717] dark:text-slate-200">
            Available for Internship / Roles
          </span>
        </a>

        {/* Center: Editorial Nav Links with Counts */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-medium uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400">
          {navigationLinks.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-1.5 py-1 transition-colors ${
                  isActive
                    ? 'text-[#171717] dark:text-white font-semibold'
                    : 'hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                <span>{link.name}</span>
                {link.count && (
                  <span className="text-[10px] font-mono text-[#8E8E93] dark:text-slate-500">
                    [{link.count}]
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#171717] dark:bg-white rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Let's Talk Pill CTA + Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#5E5E5E] dark:text-slate-300 hover:text-[#171717] dark:hover:text-white transition-all shadow-xs"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-stone-800" />}
          </button>

          {/* Let's Talk CTA matching reference */}
          <a
            href="#contact"
            className="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <span>Let&apos;s Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white dark:bg-[#262626] border border-black/[0.08] dark:border-[#383838] text-[#171717] dark:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-4 top-20 rounded-3xl bg-white/98 dark:bg-[#262626]/98 backdrop-blur-2xl border border-black/[0.08] dark:border-[#383838] p-6 space-y-4 shadow-2xl z-50">
          <nav className="flex flex-col space-y-3">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium uppercase tracking-wider text-[#171717] dark:text-slate-200 py-2 border-b border-black/[0.05] dark:border-white/[0.08]"
              >
                <span>{link.name}</span>
                {link.count && (
                  <span className="text-xs font-mono text-[#8E8E93] dark:text-slate-400">
                    [{link.count}]
                  </span>
                )}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-around">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-black dark:hover:text-white"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-black dark:hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-black dark:hover:text-white"
              aria-label="LeetCode"
            >
              <Code className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-black dark:hover:text-white"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
