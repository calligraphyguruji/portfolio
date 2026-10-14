import type { KnowledgeDocument } from '../types.ts';

/**
 * Curated, Verified Portfolio Knowledge Base
 * Strictly grounded in real implementations and accessible codebases.
 */
export const VERIFIED_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  // 0. MANTRI AI ASSISTANT IDENTITY & CREATOR METADATA
  {
    id: 'mantri-identity',
    title: 'Mantri - AI Portfolio Assistant Identity & Creator',
    category: 'skills',
    url: 'https://www.calligraphyguruji.dev/',
    metadata: {
      updatedAt: '2026-10-13',
      roleAlignment: ['AI Assistant', 'Engineering Guide'],
      status: 'implemented',
    },
    content: `
Assistant Name: Mantri
Assistant Type: AI portfolio assistant
Portfolio Owner: Aman Mishra
Creator: Aman Mishra
Developer: Aman Mishra
Tagline: Your AI guide to Aman Mishra's engineering work.
Purpose: Help visitors explore Aman Mishra's engineering portfolio, projects, technical skills, system architectures, and experience.
Description: Aman Mishra built Mantri as the interactive technical guide for his portfolio (https://www.calligraphyguruji.dev). Mantri answers questions about Aman's projects (CredVidhi, KaushalNexus, Bodhi Sakha, LeetCode), evaluates candidate fit for recruiters, and explains system architectures.
`,
  },

  // 0.1. OFFICIAL RESUME & CV DOCUMENT
  {
    id: 'resume-document',
    title: 'Aman Mishra - Official Resume & Curriculum Vitae (PDF)',
    category: 'recruiter',
    url: 'https://www.calligraphyguruji.dev/Aman_Mishra_Resume.pdf',
    metadata: {
      updatedAt: '2026-10-14',
      roleAlignment: ['SDE Intern', 'Frontend Developer', 'Full-Stack Developer', 'AI/ML Intern'],
      status: 'implemented',
    },
    content: `
Document Title: Aman Mishra - Resume (Curriculum Vitae)
Format: ATS-Friendly PDF Document (55-63 KB)
Direct Download URL: https://www.calligraphyguruji.dev/Aman_Mishra_Resume.pdf
Relative URL: /Aman_Mishra_Resume.pdf
Alternative URL: /resume.pdf
Target Profile: Software Development Engineer (SDE) Intern / Frontend Developer / Full-Stack Engineer
Education: B.Tech in CSE at NIET Greater Noida (2025–2029, CGPA: 9.38)
Experience: AI & ML Intern at Codomax Digital Solutions
Key Competencies: Modern C++, 205+ LeetCode DSA Solutions, React 19, TypeScript, FastAPI, PostgreSQL, Redis, Gemini AI.
`,
  },

  // 1. BIOGRAPHY & PROFESSIONAL POSITIONING
  {
    id: 'bio-identity',
    title: 'Aman Mishra - Professional Identity & Background',
    category: 'skills',
    url: 'https://www.calligraphyguruji.dev/#about',
    metadata: {
      updatedAt: '2026-10-13',
      roleAlignment: ['Frontend Engineer', 'Full-Stack Developer', 'Software Development Engineer (SDE) Intern'],
      status: 'implemented',
    },
    content: `
Aman Mishra (Calligraphy Guruji) is an aspiring Software Developer and Computer Science & Engineering undergraduate at NIET Greater Noida (B.Tech 2025–2029, current CGPA: 9.38).
Based in Greater Noida, Uttar Pradesh, India.
Primary technical focus:
1. Systems rigor & modern C++ programming (C++17/20, STL, memory optimization, cache locality).
2. Data Structures & Algorithms (205+ solved LeetCode problems with Big-O runtime and space optimization).
3. Modern frontend engineering: React 18/19, TypeScript, Vite, Tailwind CSS, Framer Motion / Motion.
4. Full-stack application architecture: FastAPI (Python), Express.js (Node.js), PostgreSQL, Redis, REST APIs.
5. Applied AI/ML integrations: Google Gemini API, structured JSON parsing, deterministic prompt guardrails, and RAG architectures.
GitHub: https://github.com/calligraphyguruji
LinkedIn: https://www.linkedin.com/in/calligraphygurji/
LeetCode: https://leetcode.com/u/calligraphyguruji/
Portfolio: https://www.calligraphyguruji.dev/
`,
  },

  // 2. WORK EXPERIENCE
  {
    id: 'exp-codomax',
    title: 'AI & ML Internship at Codomax Digital Solutions',
    category: 'experience',
    url: 'https://www.calligraphyguruji.dev/#experience',
    metadata: {
      updatedAt: '2026-10-13',
      technologies: ['Python', 'Google Gemini AI', 'Machine Learning', 'Data Pipelines', 'Prompt Engineering'],
      roleAlignment: ['AI/ML Engineer', 'Python Developer', 'Data Engineer'],
      status: 'implemented',
    },
    content: `
Organization: Codomax Digital Solutions
Role: AI & ML Intern
Duration: 12 July 2026 – 12 August 2026 (1 month)
Key Responsibilities & Deliverables:
- Researched and integrated generative AI pipelines and Google Gemini LLM API into internal workflow prototypes.
- Built automated data processing scripts using Python (Pandas, NumPy) for cleaning and formatting inputs.
- Implemented structured output validation to guarantee deterministic JSON schemas from generative models.
- Collaborated on prompt engineering techniques and system instructions to minimize model hallucinations.
`,
  },

  // 3. CORE TECHNICAL SKILLS
  {
    id: 'skills-matrix',
    title: 'Verified Technical Skills & Tooling',
    category: 'skills',
    url: 'https://www.calligraphyguruji.dev/#skills',
    metadata: {
      updatedAt: '2026-10-13',
      roleAlignment: ['Frontend Engineer', 'Backend Engineer', 'SDE Intern', 'Full Stack Developer'],
      status: 'implemented',
    },
    content: `
Aman Mishra's verified technical skillset:
- Languages: C++, C, Java, Python, JavaScript, TypeScript, SQL, HTML5, CSS3.
- Frontend: React 18/19, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, HTML5 Semantic Elements, CSS3 Grid/Flexbox, WCAG 2.1 Accessibility.
- Backend & Microservices: FastAPI (Python), Express.js (Node.js), RESTful APIs, Pydantic v2 data validation, SQLAlchemy ORM, middleware pipeline design.
- Databases & Caching: PostgreSQL, Redis, MongoDB, MySQL, SQLite.
- AI/ML & NLP: Google Gemini SDK, Generative AI integration, Retrieval-Augmented Generation (RAG), Scikit-Learn, Prompt Engineering, NumPy, Pandas, OpenCV.
- Developer Tools & Infrastructure: Git, GitHub, Docker, Postman, Linux (bash/zsh), Vercel, Cloudflare Turnstile, Vite tooling.
`,
  },

  // 4. CREDVIDHI
  {
    id: 'project-credvidhi',
    title: 'CredVidhi - Enterprise Loan Processing & Deterministic Underwriting Platform',
    category: 'project',
    projectId: 'credvidhi',
    repository: 'CredVidhi',
    url: 'https://www.calligraphyguruji.dev/projects/credvidhi',
    metadata: {
      technologies: ['React 19', 'TypeScript', 'FastAPI', 'Python 3.11', 'PostgreSQL 16', 'Redis 7', 'Tailwind CSS', 'Google Gemini'],
      roleAlignment: ['Full-Stack Developer', 'Fintech Engineer', 'Backend Architect'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
Project Name: CredVidhi
Live URL: https://credvidhi.vercel.app/
Repository: https://github.com/calligraphyguruji/CredVidhi
Objective: Institutional digital loan processing and deterministic credit underwriting platform for retail lending, NBFCs, and banks.
Core Problem:
Traditional lending workflows take 5-14 days due to disjointed email handoffs for KYC verification, floating-point rounding drift in loan math, and opaque underwriting decisions.
Engineered Solution:
1. Deterministic Underwriting Engine: Zero-drift fixed-point arithmetic in INR (₹) calculating compound EMI, Debt-to-Income (DTI), and algorithmic credit risk grading.
2. 6-Stage Finite State Machine: Forward-only non-reversible lifecycle: Draft → Submitted → Under Review → Approved → Disbursed (with terminal Rejected state). Enforced inside PostgreSQL ACID transactions.
3. KYC Verification Workbench: Side-by-side visual document inspection interface for loan officers with discrepancy triage.
4. Append-Only Ledger: Cryptographic, immutable audit log in PostgreSQL tracking every state change, actor ID, and underwriting decision.
5. Redis 7 Caching: Rate-limiting tier, token bucket session management, and frequent loan query caching.
6. Guarded AI Support: Google Gemini integration with strict dual-layer domain boundary firewall preventing non-loan prompt abuse.
Architecture:
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS.
- Backend Gateway: Python FastAPI with asynchronous request dispatch and Pydantic v2 validation contracts.
- Database: PostgreSQL 16 append-only ledger schema.
- Cache: Redis 7 in-memory store.
`,
  },

  // 5. CREDVIDHI ARCHITECTURE DEEP DIVE
  {
    id: 'credvidhi-architecture-details',
    title: 'CredVidhi Architectural Decisions & Security Boundaries',
    category: 'architecture',
    projectId: 'credvidhi',
    repository: 'CredVidhi',
    url: 'https://www.calligraphyguruji.dev/projects/credvidhi',
    filePath: 'docs/architecture/credvidhi-system-topology.json',
    metadata: {
      technologies: ['FastAPI', 'PostgreSQL 16', 'Redis 7', 'Google Gemini', 'Pydantic v2'],
      roleAlignment: ['Backend Engineer', 'Systems Architect', 'Security Engineer'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
CredVidhi Architecture Deep Dive:
1. Request Lifecycle & Authentication:
   - Client sends JSON payload to FastAPI API Gateway.
   - Pydantic v2 executes strict schema validation and typing constraints.
   - JWT tokens verified with Role-Based Access Control (RBAC: Borrower, Loan Officer, Underwriter, Superadmin).
2. State Machine Transitions:
   - Managed by deterministic transition matrix.
   - Each state transition executes inside an ACID transaction envelope.
   - If document checks fail, state transitions to Discrepancy or Rejected; transitions cannot skip stages.
3. Persistence & Audit:
   - Primary data stored in PostgreSQL 16.
   - Append-only audit table records timestamp, user UUID, old_state, new_state, action, and payload hash.
4. Redis Role:
   - Enforces sliding-window rate limits (100 req/min per IP).
   - In-memory cache for loan calculator parameter tables.
5. Gemini AI Role & Failure Handling:
   - Participates solely in customer assistance and loan document FAQ explanation.
   - Sandboxed behind input sanitizers and domain boundary checks; cannot mutate underwriting states or approve loans.
   - Circuit breaker falls back to deterministic static FAQs if Gemini API times out (> 4000ms).
`,
  },

  // 6. KAUSHALNEXUS
  {
    id: 'project-kaushalnexus',
    title: 'KaushalNexus - Employment & Skilling Intelligence Platform',
    category: 'project',
    projectId: 'kaushal-nexus',
    repository: 'Kaushal-Nexus',
    url: 'https://www.calligraphyguruji.dev/projects/kaushal-nexus',
    metadata: {
      technologies: ['React 19', 'FastAPI', 'PostgreSQL', 'Redis', 'Google Gemini AI', 'Tailwind CSS', 'TypeScript'],
      roleAlignment: ['Full-Stack Developer', 'AI Engineer', 'Product Engineer'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
Project Name: KaushalNexus
Live URL: https://kaushal-nexus.vercel.app/
Repository: https://github.com/calligraphyguruji/Kaushal-Nexus
Context: Smart India Hackathon (SIH) 2026 Flagship Project for Problem Statement 135 (Youth Employability & Skilling Intelligence).
Core Problem:
Severe discrepancy between college/vocational curricula and dynamic market skill demand. Vocational students lack transparent roadmaps to close their skills gap, while district administrators lack longitudinal tracking.
Engineered Solution:
1. Longitudinal Learner Tracking: Multi-stage learner tracking monitoring skill milestones, coursework completions, and project outcomes.
2. AI Skill Gap Diagnostic Engine: Powered by Google Gemini API to analyze student profiles, compare against employer skill vectors, and output concrete roadmap interventions.
3. District & Regional Analytics: Administrative dashboard aggregating district-level employment indicators, demand spikes, and vocational training enrollments.
4. ML Opportunity Matching: Algorithmic matching between learner technical competency vectors and available internships/jobs.
5. High-Throughput Microservice: Asynchronous Python FastAPI backend with Pydantic validation, Redis caching for district metrics, and relational PostgreSQL schemas.
`,
  },

  // 7. BODHI SAKHA (GEMINI AI CHATBOT)
  {
    id: 'project-bodhisakha',
    title: 'Bodhi Sakha (बोधिसखा) - Full-Stack Conversational AI Assistant',
    category: 'project',
    projectId: 'gemini-ai-chatbot',
    repository: 'bodhi-sakha',
    url: 'https://www.calligraphyguruji.dev/projects/gemini-ai-chatbot',
    metadata: {
      technologies: ['React 19', 'JavaScript (ES6+)', 'Google Gemini API', 'Express.js', 'Vite', 'PostgreSQL', 'KaTeX', 'Markdown'],
      roleAlignment: ['AI Engineer', 'Frontend Engineer', 'Full-Stack Developer'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
Project Name: Bodhi Sakha (बोधिसखा)
Live URL: https://bodhi-sakha-phi.vercel.app/
Repository: https://github.com/calligraphyguruji/bodhi-sakha.git
Core Capabilities:
1. Low-Latency Streaming Dialogue: Real-time chunk-by-chunk response streaming using Server-Sent Events (SSE) and Google Gemini SDK (@google/generative-ai).
2. Deep Thinking Reasoning Mode: Dedicated analytical reasoning pipeline with thinking badges and step-by-step problem deconstruction.
3. Multi-Format Document Understanding: Ingests PDF, DOCX, and TXT files using serverless parsing (unpdf, mammoth) for grounded question answering.
4. LaTeX Mathematical & Markdown Rendering: Integrated KaTeX math formula parser alongside Markdown formatting.
5. Persistent Multi-User Sessions: Session and message storage in PostgreSQL with local persistence fallback.
6. Cultural UI Design: Saffron-accented, accessible responsive interface designed for both mobile and desktop screens.
`,
  },

  // 8. LEETCODE & PROBLEM SOLVING
  {
    id: 'leetcode-portfolio',
    title: 'LeetCode Problem Solving & Algorithmic Foundations',
    category: 'dsa',
    projectId: 'leetcode-solutions',
    repository: 'LeetCode-Questions',
    url: 'https://www.calligraphyguruji.dev/projects/leetcode-solutions',
    metadata: {
      technologies: ['Modern C++', 'STL', 'Dynamic Programming', 'Graph Theory', 'Trees', 'Big-O Analysis'],
      roleAlignment: ['SDE Intern', 'Core Software Engineer', 'Algorithms Engineer'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
LeetCode & Algorithmic Problem Solving:
LeetCode Profile: https://leetcode.com/u/calligraphyguruji/
GitHub Repository: https://github.com/calligraphyguruji/LeetCode-Questions
Key Metrics & Foundations:
- 205+ solved algorithmic problems on LeetCode implemented primarily in Modern C++ (C++17/C++20).
- Topic Specializations:
  * Linear Data Structures: Two Pointers, Sliding Window, Monotonic Stack, Linked Lists.
  * Tree & Graph Algorithms: DFS, BFS, Binary Search Trees, Dijkstra's, Topological Sort, Disjoint Set Union (DSU).
  * Dynamic Programming: 1D/2D memoization and tabulation, Knapsack variations, Longest Common Subsequence.
  * Greedy & Heaps: Priority queues, interval scheduling, custom comparators.
- Engineering Discipline:
  * Strict quantification of asymptotic time complexity O(N) and space complexity O(1)/O(N).
  * Direct utilization of C++ Standard Template Library (std::vector, std::unordered_map, std::priority_queue) for cache locality and minimal dynamic allocation.
`,
  },

  // 9. AMAZON & YOUTUBE CLONES
  {
    id: 'project-clones',
    title: 'Frontend Architecture Clones - Amazon & YouTube Web Apps',
    category: 'project',
    url: 'https://www.calligraphyguruji.dev/projects/amazon-clone',
    metadata: {
      technologies: ['JavaScript (ES6+)', 'HTML5', 'CSS3 Grid & Flexbox', 'DOM APIs', 'Responsive Design'],
      roleAlignment: ['Frontend Engineer', 'UI Developer'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
1. Amazon E-Commerce Clone:
   - Live URL: https://myecommerce-project-clone.vercel.app/
   - GitHub: https://github.com/calligraphyguruji/amazon-clone
   - Stack: Pure Vanilla JavaScript (ES6+), HTML5, modular CSS3 (Grid & Flexbox).
   - Highlights: Multi-page client architecture (storefront, interactive cart, checkout review, order tracking), dynamic product rendering, cart badge synchronization, zero third-party framework overhead.
2. YouTube Web Clone:
   - GitHub: https://github.com/calligraphyguruji/youtube-clone
   - Stack: HTML5, CSS3, JavaScript, Responsive Grid.
   - Highlights: High-fidelity layout engineering replicating YouTube's complex navigation sidebar, responsive video grid auto-fit columns, sticky header, and video detail view.
`,
  },

  // 10. RECRUITER GUIDANCE & EVALUATION
  {
    id: 'recruiter-guide',
    title: 'Recruiter Assessment & Candidate Evaluation Guide for Aman Mishra',
    category: 'recruiter',
    url: 'https://www.calligraphyguruji.dev/resume',
    metadata: {
      roleAlignment: ['SDE Intern', 'Frontend Developer', 'Full-Stack Developer', 'AI/ML Intern'],
      status: 'implemented',
      updatedAt: '2026-10-13',
    },
    content: `
Recruiter Assessment & Match Synthesis:
Target Roles:
1. Software Development Engineer (SDE) Intern:
   - Strong candidate: Demonstrates algorithmic proficiency with 205+ C++ LeetCode problems solved, clean knowledge of Big-O complexity, and systems fundamentals.
2. Frontend Developer / React Intern:
   - Exceptionally strong: Production experience with React 18/19, TypeScript, Vite, Tailwind CSS, accessibility compliance, and editorial UI craft.
3. Full-Stack Developer:
   - High competence: End-to-end applications built with FastAPI/Express backends, PostgreSQL schemas, and Redis caching (CredVidhi, KaushalNexus, Bodhi Sakha).
4. AI/ML Engineering Intern:
   - Practical applied experience: 1-month AI/ML internship at Codomax Digital Solutions, Gemini API integration, prompt boundary engineering, and multimodal RAG.
Key Hiring Attributes:
- High academic discipline: 9.38 CGPA in B.Tech CSE at NIET Greater Noida.
- Real production deployments: All primary projects are deployed live on Vercel with verified GitHub source repositories.
- Transparent limitations: Current student (Graduating 2029); seeking internships, co-ops, and junior developer opportunities rather than senior/staff positions.
`,
  },
];
