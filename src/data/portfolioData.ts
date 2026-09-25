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
    youtube: 'https://www.youtube.com/@calligraphyguruji',
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
    company: 'Codomax Digital Solutions',
    duration: '12 July 2026 – 12 August 2026',
    durationLength: '1 month',
  },
];

export const groupedSkills = {
  LANGUAGES: ['C++', 'C', 'Java', 'Python', 'JavaScript'],
  FRONTEND: ['React', 'Vite', 'Redux', 'Tailwind CSS', 'HTML5', 'CSS3'],
  BACKEND: ['FastAPI', 'Node.js', 'Express.js', 'SQLAlchemy', 'REST APIs'],
  DATABASE: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'SQLite'],
  'AI / ML & DATA': ['Google Gemini AI', 'Machine Learning', 'Scikit-Learn', 'NumPy', 'Pandas', 'OpenCV'],
  'TOOLS & PLATFORMS': ['Docker', 'Git', 'GitHub', 'Postman', 'Linux', 'Vercel'],
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
    category: 'Backend & APIs',
    iconName: 'Server',
    skills: groupedSkills.BACKEND,
  },
  {
    category: 'Databases',
    iconName: 'Database',
    skills: groupedSkills.DATABASE,
  },
  {
    category: 'AI / ML & Data',
    iconName: 'Brain',
    skills: groupedSkills['AI / ML & DATA'],
  },
  {
    category: 'Tools & Platforms',
    iconName: 'Cpu',
    skills: groupedSkills['TOOLS & PLATFORMS'],
  },
];

export const services = [
  {
    id: 'fullstack',
    title: 'FULL-STACK WEB DEV',
    tagline: 'Client & Server Architecture',
    description:
      'Engineering scalable end-to-end web architectures, reactive client interfaces, and high-concurrency backend services.',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Node.js', 'PostgreSQL'],
    highlight: 'Production-ready codebases with clean separation of concerns and sub-second load times.',
  },
  {
    id: 'backend',
    title: 'BACKEND & REST APIs',
    tagline: 'Server Logic & Data Pipelines',
    description:
      'Designing robust server logic, high-throughput RESTful endpoints, relational database schemas, and Redis caching layers.',
    technologies: ['FastAPI', 'Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'SQLAlchemy'],
    highlight: 'Strict schema integrity, connection pooling, and resilient microservices.',
  },
  {
    id: 'aiml',
    title: 'AI & ML INTEGRATION',
    tagline: 'Generative AI & Intelligent Systems',
    description:
      'Embedding generative AI, Google Gemini pipelines, intelligent diagnostic engines, and automated data workflows into production applications.',
    technologies: ['Google Gemini AI', 'Python', 'Prompt Engineering', 'Structured JSON', 'Scikit-Learn'],
    highlight: 'Deterministic JSON schema parsing and real-time LLM inference pipelines.',
  },
  {
    id: 'dsa',
    title: 'ALGORITHMS & OPTIMIZATION',
    tagline: 'Systems Rigor & Algorithmic Efficiency',
    description:
      'High-performance software engineering in modern C++, time-space complexity optimization, and rigorous problem-solving.',
    technologies: ['Modern C++', 'STL', 'Dynamic Programming', 'Graph Theory', 'Big-O Analysis'],
    highlight: '150+ LeetCode problems solved with asymptotic runtime and space optimization.',
  },
];

export const whatIBuild = services;

export const projects: Project[] = [
  {
    id: 'kaushal-nexus',
    title: 'KaushalNexus',
    tagline: 'Employment & Skilling Intelligence Platform',
    category: 'Full-Stack',
    badge: 'SIH 2026 FLAGSHIP',
    tier: 'flagship',
    description:
      'A national-scale skilling intelligence platform built for Smart India Hackathon 2026 (Problem Statement 135), featuring longitudinal learner tracking, AI skill gap diagnostics via Gemini, district analytics, and ML job matching.',
    longDescription:
      'KaushalNexus was conceived and engineered for Smart India Hackathon 2026 to tackle youth employability and fragmented vocational data across districts. The platform provides a unified ecosystem where learners, educational institutions, and employers converge. Through automated diagnostic evaluation powered by Gemini AI, students uncover their exact competency blind spots, while administrators gain real-time visibility into district-wide skill demand patterns.',
    problemStatement:
      'India faces a widespread disconnect between educational curricula and dynamic market skill requirements. Vocational and college students lack actionable insights into which specific technical skills they need to acquire, while district administrations lack real-time longitudinal tracking to direct regional training initiatives.',
    solution:
      'Engineered an end-to-end full-stack platform uniting high-concurrency FastAPI microservices with a reactive React 19 frontend. Implemented an automated skills diagnostic engine using the Google Gemini API, Redis-cached analytics for rapid query delivery, and relational schema enforcement in PostgreSQL.',
    technologies: ['React 19', 'FastAPI', 'PostgreSQL', 'Redis', 'Gemini AI', 'Tailwind CSS', 'TypeScript'],
    features: [
      'Longitudinal learner tracking across multi-stage skill milestones',
      'AI-powered skill gap diagnostic engine powered by Google Gemini',
      'District and state-level vocational analytics dashboard',
      'Machine learning job and opportunity matching algorithms',
      'High-performance asynchronous API endpoints with Redis caching',
      'Accessible, editorial dark/light interface with zero cognitive clutter',
    ],
    architecture: [
      'Frontend: React 19 with Vite, Tailwind CSS, and custom responsive editorial panels',
      'Backend: Asynchronous Python FastAPI microservice architecture with Pydantic schema validation',
      'Persistence: PostgreSQL relational database with SQLAlchemy ORM and schema migration control',
      'Caching Layer: Redis in-memory cache for district aggregation metrics and session throughput',
      'AI Intelligence: Google Gemini API integration for natural language career pathway parsing',
    ],
    stats: [
      { label: 'Event Target', value: 'SIH 2026' },
      { label: 'Problem ID', value: 'PS 135' },
      { label: 'Architecture', value: 'Full-Stack' },
      { label: 'AI Model', value: 'Gemini 1.5' },
    ],
    liveUrl: 'https://kaushal-nexus.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji/Kaushal-Nexus',
    thumbnail: '/images/KaushalNexus-dashboard.png',
    projectType: 'real',
    tags: ['Full-Stack Platform', 'SIH 2026 Flagship'],
  },
  {
    id: 'internship-advisor',
    title: 'AI Internship Advisor',
    tagline: 'Generative AI Career & Skill Gap Diagnostic Engine',
    category: 'AI / ML',
    badge: 'GEMINI AI ENGINE',
    tier: 'core',
    projectType: 'real',
    tags: ['AI Career Advisor', 'Gemini 1.5 Engine'],
    description:
      'A smart, beginner-friendly Python application that leverages the Google Gemini API to analyze target internship roles or pasted job descriptions, diagnose missing skills, calculate study hours, and generate custom learning roadmaps.',
    longDescription:
      'The AI Internship Advisor bridges the ambiguity students encounter when preparing for technical internships. Instead of guessing what a company needs or aimlessly following generic advice, users input their desired role (or paste an actual job description) along with their current competencies. The engine queries the Gemini API with structured prompt constraints to extract priority-ranked skill gaps, realistic hour estimates, and a curated week-by-week learning roadmap with official documentation links.',
    problemStatement:
      'Job descriptions often contain exhaustive wishlists of technologies that intimidate students, making it hard to prioritize what to study first or accurately estimate the preparation timeline required.',
    solution:
      'Developed a deterministic prompt engineering contract that forces Google Gemini to output strict, validated JSON without conversational filler. Implemented clean Python error-handling, environment-variable credential isolation, and formatted terminal reports that break down study plans by week.',
    technologies: ['Python', 'Google Gemini API', 'Prompt Engineering', 'JSON', 'Requests', 'python-dotenv'],
    features: [
      'Target role and full job description natural language analysis',
      'Dynamic skill gap extraction isolating missing competencies from known skills',
      'Priority ranking (High, Medium, Low) for each missing skill',
      'Personalized study hour calculations based on user daily availability',
      'Deterministic week-by-week learning roadmap generation',
      'Direct links to official resources (FastAPI docs, GitHub Skills, etc.)',
    ],
    architecture: [
      'Engine: Python 3.8+ modular script utilizing Python Requests for low-latency HTTPS dispatch',
      'AI Integration: Google Gemini REST API endpoint configured with structured JSON mode',
      'Security: Environment configuration via python-dotenv to protect private API credentials',
      'Parser: Built-in Python JSON deserializer with automated fallback for malformed responses',
    ],
    stats: [
      { label: 'Engine', value: 'Python 3' },
      { label: 'AI Service', value: 'Gemini API' },
      { label: 'Output', value: 'Strict JSON' },
      { label: 'Interface', value: 'Interactive CLI' },
    ],
    githubUrl: 'https://github.com/calligraphyguruji/Internship-Advisor-Mini-Project',
  },
  {
    id: 'amazon-clone',
    title: 'Amazon E-Commerce Clone',
    tagline: 'Multi-Page Responsive E-Commerce Architecture',
    category: 'Frontend',
    badge: 'LIVE ON VERCEL',
    tier: 'core',
    projectType: 'real',
    tags: ['E-Commerce Architecture', 'Vercel Live'],
    description:
      'A multi-page e-commerce web application inspired by Amazon, replicating dynamic product rendering, interactive cart management, checkout order review, order history, and package delivery tracking using modern vanilla JavaScript and modular CSS.',
    longDescription:
      'Built without heavy third-party UI libraries, the Amazon Clone project is a comprehensive masterclass in core web fundamentals: DOM manipulation, event-driven state propagation, and responsive layouts with CSS Grid and Flexbox. The application features complete multi-page navigation including an interactive product storefront, shopping cart with live quantity counters, checkout review summary, historical orders ledger, and visual delivery status tracker.',
    problemStatement:
      'Modern web developers often lean on heavy frameworks without truly mastering fundamental browser APIs, state persistence, DOM rendering performance, and pure CSS layout paradigms.',
    solution:
      'Engineered an e-commerce architecture in pure HTML5, CSS3, and modern JavaScript (ES6+). Divided stylesheets into shared typography resets and dedicated page-specific modules. Implemented dynamic product dataset parsing with price calculation and cart update loops.',
    technologies: ['JavaScript (ES6+)', 'HTML5', 'CSS3 Grid & Flexbox', 'DOM APIs', 'Responsive Design'],
    features: [
      'Dynamic product catalog generation with ratings, reviews, and formatted pricing',
      'Interactive cart management with quantity selection and header counter updates',
      'Multi-page architecture: Storefront, Checkout Review, Order History, and Tracking',
      'Visual order delivery progress tracker with estimated arrival metrics',
      'Modular CSS architecture separating shared layout primitives from view-specific styles',
    ],
    architecture: [
      'Data Layer: Modular JavaScript product datasets and cart state models (`products.js`)',
      'UI Rendering: Pure DOM creation and event listener binding (`amazon.js`)',
      'Styling: Multi-tiered CSS separation (`general.css`, `amazon-header.css`, `checkout.css`, `tracking.css`)',
      'Layout: Mobile-first responsive grids and flexible navigation bars',
    ],
    stats: [
      { label: 'Deployment', value: 'Vercel Live' },
      { label: 'Architecture', value: 'Multi-Page' },
      { label: 'Stack', value: 'Vanilla JS (ES6+)' },
      { label: 'Frameworks', value: 'Zero Bloat' },
    ],
    liveUrl: 'https://myecommerce-project-clone.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji/amazon-clone',
    thumbnail: '/images/amazon-clone.png',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors Game',
    tagline: 'Interactive Browser Game with Real-Time State Engine',
    category: 'Game',
    badge: 'LIVE ON VERCEL',
    tier: 'core',
    projectType: 'real',
    tags: ['Interactive Game', 'Vercel Live'],
    description:
      'A classic browser-based game featuring player vs computer mechanics, randomized decision algorithms, instant win/loss/draw detection, dynamic score tracking, and an animated responsive interface deployed live on Vercel.',
    longDescription:
      'An interactive browser game engineered to demonstrate clean conditional state transitions, event handling, and dynamic DOM manipulation. Players pick Rock, Paper, or Scissors; the computer executes an unbiased pseudorandom choice via Math.random(); game rules evaluate the winner; and scores update seamlessly with instant visual feedback and reset support.',
    problemStatement:
      'Demonstrating clear, clean interactive UI event listeners, instant visual state updates, and deterministic game logic in client-side JavaScript.',
    solution:
      'Implemented clean conditional state trees, encapsulated game logic into modular functions, bound click event listeners to responsive touch/mouse targets, and deployed the production build on Vercel.',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'DOM Manipulation', 'Vercel Deployment'],
    features: [
      'Engaging Player vs Computer interactive gameplay',
      'Unbiased random computer choice generator mapped to move enums',
      'Instant Win, Loss, and Draw state evaluation',
      'Dynamic scoreboard with live score incrementation',
      'Restart and score reset functionality with clean UI state reset',
      'Mobile-responsive layout with tactile button active states',
    ],
    architecture: [
      'Logic: Modular JavaScript evaluation engine using conditional branching',
      'DOM Layer: Event-driven updates modifying text nodes and score elements directly',
      'Styling: Responsive CSS with flex centering, smooth transitions, and tactile hover feedback',
      'Deployment: Continuous deployment via Vercel edge network',
    ],
    stats: [
      { label: 'Deployment', value: 'Vercel Live' },
      { label: 'Stack', value: 'JS / CSS3 / HTML5' },
      { label: 'Game Logic', value: 'Deterministic' },
      { label: 'Interactivity', value: 'Instant Feedback' },
    ],
    liveUrl: 'https://rock-paper-scissors-game-seven-tawny.vercel.app/',
    githubUrl: 'https://github.com/calligraphyguruji/rock-paper-scissors-game',
    thumbnail: '/images/Rock-paper-scissors.png',
  },
  {
    id: 'leetcode-solutions',
    title: 'LeetCode Problem Solutions',
    tagline: '205 C++ Algorithmic Solutions in Modern C++',
    category: 'Algorithms',
    badge: '205 PROBLEMS SOLVED',
    tier: 'core',
    projectType: 'exploration',
    tags: ['Algorithms & DSA', '205 C++ Solved'],
    description:
      'A curated repository of 205+ optimized algorithmic solutions across core Data Structures & Algorithms, featuring detailed time and space complexity breakdowns, pattern classifications, and clean modern C++ implementations.',
    longDescription:
      'Dedicated algorithmic repository tracking continuous problem-solving practice on LeetCode. Each solution is implemented in modern C++ with an emphasis on asymptotic performance, cache locality, minimal memory allocation, and clean modular code. Topics range from linear data structures (two pointers, sliding window, monotonic stacks) to complex graph algorithms, tree traversals, and dynamic programming.',
    problemStatement:
      'Technical interview preparation demands not just solving problems, but understanding underlying computational patterns and writing robust, bug-free C++ code under tight runtime and space constraints.',
    solution:
      'Organized a structured curriculum of solutions categorized by paradigm (Dynamic Programming, Graph Theory, Trees, Greedy). Documented asymptotic complexities (Big-O time & space) and trade-offs for each approach.',
    technologies: ['C++', 'STL', 'Data Structures', 'Algorithms', 'Big-O Analysis', 'Competitive Programming'],
    features: [
      '205+ verified solutions across Easy, Medium, and Hard difficulty levels',
      'Comprehensive topic coverage: Trees, Graphs, DP, Linked Lists, Heaps, and Backtracking',
      'Optimized asymptotic runtimes leveraging cache-efficient C++ STL containers',
      'Clear inline comments explaining key edge cases and algorithmic invariants',
      'Active LeetCode profile with verified streak and problem solving badges',
    ],
    architecture: [
      'Languages: Modern C++ (C++17/C++20 standards)',
      'Standard Library: Advanced STL (`std::vector`, `std::unordered_map`, `std::priority_queue`, `std::deque`)',
      'Analysis: Rigorous Big-O time and space complexity quantification on every problem',
      'Organization: Domain-based directory structure separating linear and non-linear patterns',
    ],
    stats: [
      { label: 'Problems Solved', value: '205' },
      { label: 'Language', value: 'Modern C++' },
      { label: 'LeetCode Profile', value: 'Verified' },
      { label: 'Optimization', value: 'O(1) / O(N)' },
    ],
    liveUrl: 'https://leetcode.com/u/calligraphyguruji/',
    githubUrl: 'https://github.com/calligraphyguruji/LeetCode-Questions',
    thumbnail: '/images/leetcode-solutions.png',
  },
  {
    id: 'youtube-clone',
    title: 'YouTube Web Clone',
    tagline: 'High-Fidelity Video Streaming Interface',
    category: 'Frontend',
    badge: 'RESPONSIVE UI',
    tier: 'core',
    projectType: 'exploration',
    tags: ['Video Streaming Platform', 'Responsive UI'],
    description:
      'A responsive, modern video streaming web application recreating core YouTube experiences: category video feeds, fluid navigation sidebar, search interface, video player layout, channel metadata, and related video cards.',
    longDescription:
      'A frontend layout engineering project dedicated to reverse-engineering YouTube’s sophisticated responsive interface. Built with an emphasis on fluid grid layouts, flexible typography scaling, and accessible navigation. Demonstrates how complex content hierarchies — video listing grids, pill categories, sidebar toggles, and video playback views — can be crafted cleanly with maintainable CSS and component patterns.',
    problemStatement:
      'Complex video platforms feature multi-layered navigation drawers, sticky headers, dynamic thumbnail aspect ratios, and rich metadata ribbons that require meticulous responsive design.',
    solution:
      'Implemented clean semantic HTML5 markup, responsive CSS Grid layouts with fluid auto-fit columns, sticky navigation bars with glassmorphism touches, and reusable video card layouts.',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Grid', 'Flexbox'],
    features: [
      'Responsive video catalog grid adapting seamlessly from mobile to wide screens',
      'Category pill ribbon for topic-based browsing',
      'Video playback page mockup with channel info, like/share controls, and comments',
      'Recommended videos sidebar with compact thumbnail cards',
      'Collapsible sidebar navigation with clean iconography',
    ],
    architecture: [
      'Layout: CSS Grid with `repeat(auto-fill, minmax(280px, 1fr))` for fluid card sizing',
      'Navigation: Responsive drawer with flexbox alignment and sticky header anchors',
      'Markup: Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`)',
    ],
    stats: [
      { label: 'Layout', value: 'CSS Grid / Flex' },
      { label: 'Responsiveness', value: 'Mobile to 4K' },
      { label: 'Type', value: 'Frontend UI' },
      { label: 'Codebase', value: 'Semantic HTML' },
    ],
    githubUrl: 'https://github.com/calligraphyguruji/YouTube-Clone',
    thumbnail: '/images/youtube-clone.png',
  },
];

export const dsaRepo = {
  title: 'C++ Algorithmic Problem Solving',
  description:
    'Continuous algorithmic training in modern C++ with focus on computational efficiency and clean implementation.',
  problemsSolved: '205',
  githubUrl: 'https://github.com/calligraphyguruji/LeetCode-Questions',
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
  { name: 'Work', href: '#work', count: '6' },
  { name: 'Service', href: '#services', count: '4' },
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience', count: 'Intern' },
  { name: 'Contact', href: '#contact' },
];
