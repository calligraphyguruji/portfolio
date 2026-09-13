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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 px-5 sm:px-8 py-3.5 flex items-center justify-between border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas-dark/90 backdrop-blur-md border-slate-800/80 shadow-lg shadow-black/20'
          : 'bg-canvas-dark/60 backdrop-blur-sm border-transparent'
      }`}
    >
      {/* Brand Monogram */}
      <a
        aria-label="Aman Mishra Home"
        className="group inline-flex items-center gap-1.5 focus:outline-none"
        href="#"
      >
        <span className="font-serif text-2xl tracking-tight font-medium italic text-white group-hover:text-cyan-400 transition-colors">
          Aman.
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block mb-1 animate-pulse"></span>
      </a>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-slate-400">
        {navigationLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:text-cyan-400"
          >
            {link.name}
          </a>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Availability Badge */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wide uppercase bg-slate-800/90 text-slate-300 border border-slate-700/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Avail. for Work
        </span>

        {/* Social Quick Links */}
        <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all"
            aria-label="GitHub Profile"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={personalInfo.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={personalInfo.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all"
            aria-label="LeetCode Profile"
          >
            <Code className="w-4 h-4" />
          </a>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all focus-visible:outline-none"
          aria-label="Toggle color theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Contact Pill Button */}
        <a
          href="#contact"
          className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-slate-900 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
        >
          Contact
        </a>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] bg-canvas-dark/98 backdrop-blur-xl border-b border-slate-800 p-6 space-y-4 shadow-2xl z-50">
          <nav className="flex flex-col space-y-3">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-400 py-1 border-b border-slate-800/50"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-around border-t border-slate-800">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white"
              aria-label="LeetCode"
            >
              <Code className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
