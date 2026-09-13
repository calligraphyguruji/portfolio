import {
  PersonalInfo,
  ExperienceItem,
  SkillCategory,
  Project,
  DsaTopic,
  LearningItem,
} from '../types';

export const personalInfo: PersonalInfo = {
  name: 'Aman Mishra',
  role: 'Computer Science Engineering Student / Aspiring Software Developer',
  college: 'NIET, Greater Noida',
  degree: 'B.Tech in Computer Science Engineering',
  graduationYear: '2029 (Expected)',
  location: 'Greater Noida, Uttar Pradesh, India',
  summary:
    'I’m Aman Mishra, a Computer Science Engineering student and aspiring Software Developer passionate about building practical, scalable, and user-focused applications. I enjoy solving problems with C++ and DSA while exploring full-stack development, AI/ML, and modern software engineering. I’m constantly learning, building projects, and improving my skills with the goal of creating impactful technology.',
  socials: {
    github: 'https://github.com/calligraphyguruji',
    linkedin: 'https://www.linkedin.com/in/calligraphygurji/',
    leetcode: 'https://leetcode.com/u/calligraphyguruji/',
    email: 'amanmishra7774@gmail.com',
  },
};

export const experience: ExperienceItem[] = [
  {
    id: 'codomax-internship',
    role: 'AI & ML Intern',
    company: 'Codomax Solutions',
    duration: '12 July – 12 August',
    durationLength: '1 month',
  },
];

export const skillCategories: SkillCategory[] = [
  {
    category: 'Programming Languages',
    iconName: 'Code2',
    skills: ['C++', 'C', 'Python', 'Java', 'JavaScript'],
  },
  {
    category: 'Frontend Development',
    iconName: 'Layout',
    skills: ['HTML5', 'CSS3', 'React.js', 'Tailwind CSS', 'Responsive Web Design'],
  },
  {
    category: 'Backend & APIs',
    iconName: 'Server',
    skills: ['FastAPI', 'Node.js', 'Express.js', 'REST APIs'],
  },
  {
    category: 'Databases & Caching',
    iconName: 'Database',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  },
  {
    category: 'Core Computer Science',
    iconName: 'Cpu',
    skills: [
      'Data Structures & Algorithms',
      'OOP',
      'Full-Stack Development',
      'Backend Development',
      'API Development',
      'Software Engineering',
    ],
  },
  {
    category: 'AI & Machine Learning',
    iconName: 'Brain',
    skills: ['Machine Learning', 'Data Analysis', 'AI/ML Integration', 'Generative AI'],
  },
  {
    category: 'Developer Tools',
    iconName: 'Wrench',
    skills: ['Git', 'GitHub', 'VS Code', 'Postman', 'Linux', 'Vite'],
  },
];

export const projects: Project[] = [
  {
    id: 'kaushal-nexus',
    title: 'KaushalNexus',
    tagline: 'Skilling & Employment-Outcome Tracking Platform',
    description:
      'A full-stack skilling and employment-outcome tracking platform focused on skill gaps, training outcomes, employment matching, and workforce analytics.',
    tier: 'flagship',
    technologies: [
      'React.js',
      'Vite',
      'Tailwind CSS',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Celery',
      'JWT / RBAC',
      'REST APIs',
      'Machine Learning',
    ],
    features: [
      'Skill-gap analysis and recommendations',
      'Employment/training outcome tracking',
      'Job matching based on skills, location, and readiness',
      'Regional skill-gap analytics',
      'Follow-up workflows',
      'Role-based authentication',
      'Privacy and consent controls',
      'ML-based skill similarity',
      'Wage prediction',
    ],
    liveUrl: 'https://kaushal-nexus.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji',
  },
  {
    id: 'youtube-clone',
    title: 'YouTube Clone',
    tagline: 'Responsive Video Browsing Frontend',
    description: 'A responsive YouTube-inspired frontend project.',
    tier: 'core',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'React.js'],
    features: [
      'Responsive UI',
      'Video browsing/content layouts',
      'Component-based architecture',
    ],
    githubUrl: 'https://github.com/calligraphyguruji/YouTube-Clone',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors Game',
    tagline: 'Interactive DOM & State Game',
    description:
      'A browser-based game focused on JavaScript fundamentals, DOM manipulation, and interactive UI.',
    tier: 'core',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    features: [
      'Gameplay',
      'Score tracking',
      'Dynamic UI',
      'Deployed application',
    ],
    liveUrl: 'https://rock-paper-scissors-game-phi.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji/rock-paper-scissors-game',
  },
];

export const dsaRepo = {
  title: 'LeetCode Solutions',
  description: 'A growing collection of C++ algorithm and data-structure solutions.',
  githubUrl: 'https://github.com/calligraphyguruji/LeetCode-Questions',
  leetcodeProfile: 'https://leetcode.com/u/calligraphyguruji/',
  topics: [
    { name: 'Arrays', category: 'Linear' },
    { name: 'Strings', category: 'Linear' },
    { name: 'Linked Lists', category: 'Linear' },
    { name: 'Trees', category: 'Non-Linear' },
    { name: 'Graphs', category: 'Non-Linear' },
    { name: 'BFS / DFS', category: 'Advanced Algorithms' },
    { name: 'Dynamic Programming', category: 'Advanced Algorithms' },
    { name: 'Greedy', category: 'Advanced Algorithms' },
    { name: 'Dijkstra', category: 'Advanced Algorithms' },
    { name: 'DSU', category: 'Advanced Algorithms' },
    { name: 'MST', category: 'Advanced Algorithms' },
  ] as DsaTopic[],
};

export const currentlyLearning: LearningItem[] = [
  { topic: 'Advanced C++', status: 'In Progress', category: 'Languages' },
  { topic: 'JavaScript / React', status: 'Deepening', category: 'Frontend' },
  { topic: 'Node.js / Express', status: 'In Progress', category: 'Backend' },
  { topic: 'FastAPI', status: 'Deepening', category: 'Backend' },
  { topic: 'Machine Learning & AI', status: 'In Progress', category: 'Intelligence' },
  { topic: 'System Design', status: 'In Progress', category: 'Architecture' },
];

export const navigationLinks = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'DSA', href: '#dsa' },
  { name: 'Learning', href: '#learning' },
  { name: 'Contact', href: '#contact' },
];
