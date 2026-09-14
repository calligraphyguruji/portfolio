import {
  PersonalInfo,
  ExperienceItem,
  SkillCategory,
  Project,
  LearningItem,
} from '../types';

export const personalInfo: PersonalInfo = {
  name: 'Aman Mishra',
  role: 'CSE Student · Software Developer',
  college: 'NIET Greater Noida',
  degree: 'B.Tech in Computer Science & Engineering',
  graduationYear: '2029',
  location: 'Greater Noida, Uttar Pradesh, India',
  summary:
    'Building practical software with strong foundations in C++, DSA, full-stack development, and AI/ML. Passionate about engineering high-performance systems and user-focused web architectures.',
  socials: {
    github: 'https://github.com/calligraphyguruji',
    linkedin: 'https://www.linkedin.com/in/calligraphygurji/',
    leetcode: 'https://leetcode.com/u/calligraphyguruji/',
    email: 'amanmishra7774@gmail.com',
  },
};

export const educationInfo = {
  degree: 'B.Tech — Computer Science & Engineering',
  institution: 'NIET Greater Noida',
  timeline: '2025 – 2029',
  cgpa: '9.38',
  status: 'Current Student',
};

export const experience: ExperienceItem[] = [
  {
    id: 'codomax-internship',
    role: 'AI & ML Intern',
    company: 'Codomax Solution',
    duration: '12 July – 12 August',
    durationLength: '1 month',
  },
];

export const groupedSkills = {
  LANGUAGES: ['C++', 'C', 'Python', 'Java', 'JavaScript'],
  FRONTEND: ['React', 'Tailwind CSS', 'HTML', 'CSS'],
  BACKEND: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs'],
  DATABASE: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  ENGINEERING: ['DSA', 'OOP', 'Git', 'GitHub', 'Linux'],
  'AI / ML': ['Machine Learning', 'Data Analysis', 'GenAI'],
};

export const skillCategories: SkillCategory[] = [
  {
    category: 'Languages',
    iconName: 'Code2',
    skills: groupedSkills.LANGUAGES,
  },
  {
    category: 'Frontend',
    iconName: 'Layout',
    skills: groupedSkills.FRONTEND,
  },
  {
    category: 'Backend',
    iconName: 'Server',
    skills: groupedSkills.BACKEND,
  },
  {
    category: 'Databases',
    iconName: 'Database',
    skills: groupedSkills.DATABASE,
  },
  {
    category: 'Systems & Core',
    iconName: 'Cpu',
    skills: groupedSkills.ENGINEERING,
  },
  {
    category: 'AI & Intelligence',
    iconName: 'Brain',
    skills: groupedSkills['AI / ML'],
  },
];

export const whatIBuild = [
  {
    id: 'fullstack',
    title: 'FULL-STACK APPLICATIONS',
    tagline: 'End-to-end web architectures with modern client-server synergy',
    description:
      'Designing and developing scalable web applications using React, Tailwind CSS, Node.js, and relational/document databases. Focused on fast load times, accessible design, and maintainable component hierarchies.',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'MongoDB', 'REST APIs'],
    highlight: 'Flagship project KaushalNexus built from scratch to production.',
  },
  {
    id: 'backend',
    title: 'BACKEND & REST APIs',
    tagline: 'Robust server logic, clean endpoints, and database schema design',
    description:
      'Engineering performant RESTful APIs using Express.js and FastAPI. Implementing secure routing, data validation, database connection pooling, and caching with Redis and SQL/NoSQL stores.',
    technologies: ['Node.js', 'Express.js', 'FastAPI', 'PostgreSQL', 'Redis'],
    highlight: 'Strict schema integrity, error handling, and modular service patterns.',
  },
  {
    id: 'aiml',
    title: 'AI / ML INTEGRATION',
    tagline: 'Applied machine learning pipelines and generative intelligence',
    description:
      'Exploring predictive modeling, natural language processing, and generative AI integrations. Hands-on experience gained during industry internship at Codomax Solution working on applied AI/ML pipelines.',
    technologies: ['Python', 'Machine Learning', 'Data Analysis', 'GenAI', 'FastAPI'],
    highlight: 'Industry-verified internship in AI & ML solutions.',
  },
  {
    id: 'dsa',
    title: 'DSA & SOFTWARE ENGINEERING',
    tagline: 'Algorithmic efficiency, time-space optimization, and clean C++',
    description:
      'Deep algorithmic problem solving in modern C++. Solid understanding of memory allocation, pointer mechanics, asymptotic time complexity, and data structure internals across 150+ LeetCode problems.',
    technologies: ['C++', 'STL', 'Dynamic Programming', 'Graph Theory', 'Trees'],
    highlight: '150+ LeetCode problems solved with verified algorithmic rigor.',
  },
];

export const projects: Project[] = [
  {
    id: 'kaushal-nexus',
    title: 'KaushalNexus',
    tagline: 'Full-Stack Employment & Skilling Outcomes Platform',
    description:
      'A comprehensive web platform dedicated to bridging skilling outcomes, career readiness, and user opportunity. Engineered with modular React components, custom responsive Tailwind layouts, and robust backend data synchronization.',
    technologies: ['React', 'Tailwind CSS', 'JavaScript', 'REST APIs', 'Node.js'],
    features: [
      'Interactive skilling modules & dynamic pathways',
      'Real-time career assessment & progress tracking',
      'Clean editorial user interface with zero slop',
      'Responsive multi-breakpoint design across mobile & desktop',
    ],
    liveUrl: 'https://kaushal-nexus.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji/Kaushal-Nexus',
    tier: 'flagship',
  },
  {
    id: 'youtube-clone',
    title: 'YouTube Clone',
    tagline: 'High-Fidelity Video Streaming Interface',
    description:
      'A responsive, high-performance video streaming web application recreating core YouTube experiences: category video feeds, fluid search, video player view, channel metadata, and related recommendations.',
    technologies: ['React', 'Tailwind CSS', 'REST API', 'JavaScript'],
    features: [
      'Video feed with category filtering',
      'Dynamic video playback with channel stats',
      'Instant search and related content rendering',
      'Optimized loading states and responsive grid',
    ],
    githubUrl: 'https://github.com/calligraphyguruji/YouTube-Clone',
    tier: 'core',
  },
];

export const dsaRepo = {
  title: 'C++ Algorithmic Problem Solving',
  description:
    'Continuous algorithmic training in modern C++ with focus on computational efficiency and clean implementation.',
  problemsSolved: '150+',
  githubUrl: 'https://github.com/calligraphyguruji/C-Plus-Plus-DSA',
  leetcodeProfile: 'https://leetcode.com/u/calligraphyguruji/',
  topics: [
    { name: 'Arrays & Vectors', category: 'Linear' },
    { name: 'Strings & Two Pointers', category: 'Linear' },
    { name: 'Linked Lists', category: 'Linear' },
    { name: 'Stacks & Queues', category: 'Linear' },
    { name: 'Binary Trees & BST', category: 'Non-Linear' },
    { name: 'Heaps & Priority Queues', category: 'Non-Linear' },
    { name: 'Graphs (BFS/DFS)', category: 'Non-Linear' },
    { name: 'Recursion & Backtracking', category: 'Advanced Algorithms' },
    { name: 'Dynamic Programming', category: 'Advanced Algorithms' },
    { name: 'Greedy Algorithms', category: 'Advanced Algorithms' },
    { name: 'Bit Manipulation', category: 'Advanced Algorithms' },
  ],
};

export const currentlyLearning: LearningItem[] = [
  { topic: 'Advanced C++20 & Systems Programming', category: 'Systems', status: 'In Progress' },
  { topic: 'Distributed Systems & Microservices', category: 'Backend', status: 'In Progress' },
  { topic: 'Generative AI & LLM Orchestration', category: 'AI/ML', status: 'Deepening' },
];

export const navigationLinks = [
  { name: 'Work', href: '#work', count: '2' },
  { name: 'About', href: '#about' },
  { name: 'Build', href: '#build', count: '4' },
  { name: 'Experience', href: '#experience', count: 'Intern' },
  { name: 'Contact', href: '#contact' },
];
