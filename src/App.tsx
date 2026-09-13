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
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-canvas-dark light:bg-[#FAF9F6] text-slate-100 dark:text-slate-100 light:text-stone-900 flex flex-col font-sans transition-colors duration-300">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-grow space-y-12">
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
