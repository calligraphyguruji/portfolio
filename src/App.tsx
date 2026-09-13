import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { ProblemSolving } from './components/sections/ProblemSolving';
import { Learning } from './components/sections/Learning';
import { Contact } from './components/sections/Contact';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    // Default to Light mode matching Compound ink-on-paper style reference
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
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-[#171717] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow space-y-6 sm:space-y-10">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <ProblemSolving />
        <Learning />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
