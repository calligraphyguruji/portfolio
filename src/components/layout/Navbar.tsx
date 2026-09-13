import React, { useState, useEffect } from 'react';
import { navigationLinks, personalInfo } from '../../data/portfolioData';
import { Github, Linkedin, Code, Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navigationLinks.map((link) => link.href.substring(1));
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Compound Warm Cream Announcement Bar — Flush at very top edge */}
      <div className="w-full bg-[#FFE9BF] dark:bg-[#221B10] border-b border-[#F5DC9C] dark:border-[#382C18] text-[#171717] dark:text-[#FFE9BF] py-2 px-4 sm:px-8 text-center text-xs sm:text-[13px] font-sans transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-[#FFE9BF] shrink-0" />
            <span className="font-normal">
              Available for Summer 2025/2026 Engineering Internships &amp; Roles
            </span>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717] text-white dark:bg-[#FFE9BF] dark:text-[#171717] text-xs font-medium hover:bg-[#222222] dark:hover:bg-white transition-all shadow-xs"
          >
            <span>Get in touch</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        className={`sticky top-0 z-50 px-5 sm:px-8 py-3.5 flex items-center justify-between border-b transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-[#E5E7EB] dark:border-[#262626] shadow-xs'
            : 'bg-white dark:bg-[#0B0F17] border-[#E5E7EB] dark:border-[#262626]'
        }`}
      >
        {/* Brand Monogram */}
        <a
          aria-label="Aman Mishra Home"
          className="group inline-flex items-center gap-2 focus:outline-none"
          href="#"
        >
          <span className="font-serif text-2xl tracking-tight font-medium italic text-[#171717] dark:text-white group-hover:opacity-75 transition-opacity">
            Aman.
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F] dark:text-slate-400 border-l border-[#E5E7EB] dark:border-[#262626] pl-2.5">
            Class of &apos;29
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium uppercase tracking-widest text-[#5E5E5E] dark:text-slate-400">
          {navigationLinks.map((link) => {
            const sectionId = link.href.substring(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`relative py-1 transition-colors duration-150 focus-visible:outline-none ${
                  isActive
                    ? 'text-[#171717] dark:text-white font-semibold'
                    : 'hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#171717] dark:bg-white rounded-full"></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Social Quick Links */}
          <div className="hidden sm:flex items-center gap-1">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#161B22] rounded-full transition-all"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#161B22] rounded-full transition-all"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#161B22] rounded-full transition-all"
              aria-label="LeetCode Profile"
            >
              <Code className="w-4 h-4" />
            </a>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#161B22] rounded-full transition-all focus-visible:outline-none"
            aria-label="Toggle color theme"
            title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#171717]" />
            )}
          </button>

          {/* Contact Pill Button */}
          <a
            href="#contact"
            className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#171717] text-white hover:bg-[#222222] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 active:scale-95 transition-all shadow-xs"
          >
            Contact
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#5E5E5E] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[105px] bg-white/98 dark:bg-[#0B0F17]/98 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-[#262626] p-6 space-y-4 shadow-xl z-50">
            <nav className="flex flex-col space-y-3">
              {navigationLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium uppercase tracking-wider text-[#171717] dark:text-slate-200 hover:opacity-75 py-2 border-b border-[#E5E7EB] dark:border-[#262626]"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="pt-3 flex items-center justify-around border-t border-[#E5E7EB] dark:border-[#262626]">
              <a
                href={personalInfo.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5E5E5E] dark:text-slate-300 hover:text-[#171717] dark:hover:text-white"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5E5E5E] dark:text-slate-300 hover:text-[#171717] dark:hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={personalInfo.socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#5E5E5E] dark:text-slate-300 hover:text-[#171717] dark:hover:text-white"
                aria-label="LeetCode"
              >
                <Code className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
