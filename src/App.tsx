import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { WhatIBuild } from './components/sections/WhatIBuild';
import { Skills } from './components/sections/Skills';
import { Experience } from './components/sections/Experience';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="atmospheric-bg min-h-screen text-[#171717] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300 selection:bg-[#171717] selection:text-white dark:selection:bg-white dark:selection:text-[#171717]">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow space-y-4 sm:space-y-8">
        <Hero />
        <Projects />
        <WhatIBuild />
        <Skills />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
