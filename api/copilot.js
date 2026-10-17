import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

// src/copilot/data/verifiedKnowledge.ts
var VERIFIED_KNOWLEDGE_DOCUMENTS = [
  // 0. MANTRI AI ASSISTANT IDENTITY & CREATOR METADATA
  {
    id: "mantri-identity",
    title: "Mantri - AI Portfolio Assistant Identity & Creator",
    category: "skills",
    url: "https://www.calligraphyguruji.dev/",
    metadata: {
      updatedAt: "2026-10-13",
      roleAlignment: ["AI Assistant", "Engineering Guide"],
      status: "implemented"
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
`
  },
  // 0.1. OFFICIAL RESUME & CV DOCUMENT
  {
    id: "resume-document",
    title: "Aman Mishra - Official Resume & Curriculum Vitae (PDF)",
    category: "recruiter",
    url: "https://www.calligraphyguruji.dev/Aman_Mishra_Resume.pdf",
    metadata: {
      updatedAt: "2026-10-14",
      roleAlignment: ["SDE Intern", "Frontend Developer", "Full-Stack Developer", "AI/ML Intern"],
      status: "implemented"
    },
    content: `
Document Title: Aman Mishra - Resume (Curriculum Vitae)
Format: ATS-Friendly PDF Document (55-63 KB)
Direct Download URL: https://www.calligraphyguruji.dev/Aman_Mishra_Resume.pdf
Relative URL: /Aman_Mishra_Resume.pdf
Alternative URL: /resume.pdf
Target Profile: Software Development Engineer (SDE) Intern / Frontend Developer / Full-Stack Engineer
Education: B.Tech in CSE at NIET Greater Noida (2025\u20132029, CGPA: 9.38)
Experience: AI & ML Intern at Codomax Digital Solutions
Key Competencies: Modern C++, 205+ LeetCode DSA Solutions, React 19, TypeScript, FastAPI, PostgreSQL, Redis, Gemini AI.
`
  },
  // 1. BIOGRAPHY & PROFESSIONAL POSITIONING
  {
    id: "bio-identity",
    title: "Aman Mishra - Professional Identity & Background",
    category: "skills",
    url: "https://www.calligraphyguruji.dev/#about",
    metadata: {
      updatedAt: "2026-10-13",
      roleAlignment: ["Frontend Engineer", "Full-Stack Developer", "Software Development Engineer (SDE) Intern"],
      status: "implemented"
    },
    content: `
Aman Mishra (Calligraphy Guruji) is an aspiring Software Developer and Computer Science & Engineering undergraduate at NIET Greater Noida (B.Tech 2025\u20132029, current CGPA: 9.38).
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
`
  },
  // 2. WORK EXPERIENCE
  {
    id: "exp-codomax",
    title: "AI & ML Internship at Codomax Digital Solutions",
    category: "experience",
    url: "https://www.calligraphyguruji.dev/#experience",
    metadata: {
      updatedAt: "2026-10-13",
      technologies: ["Python", "Google Gemini AI", "Machine Learning", "Data Pipelines", "Prompt Engineering"],
      roleAlignment: ["AI/ML Engineer", "Python Developer", "Data Engineer"],
      status: "implemented"
    },
    content: `
Organization: Codomax Digital Solutions
Role: AI & ML Intern
Duration: 12 July 2026 \u2013 12 August 2026 (1 month)
Key Responsibilities & Deliverables:
- Researched and integrated generative AI pipelines and Google Gemini LLM API into internal workflow prototypes.
- Built automated data processing scripts using Python (Pandas, NumPy) for cleaning and formatting inputs.
- Implemented structured output validation to guarantee deterministic JSON schemas from generative models.
- Collaborated on prompt engineering techniques and system instructions to minimize model hallucinations.
`
  },
  // 3. CORE TECHNICAL SKILLS
  {
    id: "skills-matrix",
    title: "Verified Technical Skills & Tooling",
    category: "skills",
    url: "https://www.calligraphyguruji.dev/#skills",
    metadata: {
      updatedAt: "2026-10-13",
      roleAlignment: ["Frontend Engineer", "Backend Engineer", "SDE Intern", "Full Stack Developer"],
      status: "implemented"
    },
    content: `
Aman Mishra's verified technical skillset:
- Languages: C++, C, Java, Python, JavaScript, TypeScript, SQL, HTML5, CSS3.
- Frontend: React 18/19, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, HTML5 Semantic Elements, CSS3 Grid/Flexbox, WCAG 2.1 Accessibility.
- Backend & Microservices: FastAPI (Python), Express.js (Node.js), RESTful APIs, Pydantic v2 data validation, SQLAlchemy ORM, middleware pipeline design.
- Databases & Caching: PostgreSQL, Redis, MongoDB, MySQL, SQLite.
- AI/ML & NLP: Google Gemini SDK, Generative AI integration, Retrieval-Augmented Generation (RAG), Scikit-Learn, Prompt Engineering, NumPy, Pandas, OpenCV.
- Developer Tools & Infrastructure: Git, GitHub, Docker, Postman, Linux (bash/zsh), Vercel, Cloudflare Turnstile, Vite tooling.
`
  },
  // 4. CREDVIDHI
  {
    id: "project-credvidhi",
    title: "CredVidhi - Enterprise Loan Processing & Deterministic Underwriting Platform",
    category: "project",
    projectId: "credvidhi",
    repository: "CredVidhi",
    url: "https://www.calligraphyguruji.dev/projects/credvidhi",
    metadata: {
      technologies: ["React 19", "TypeScript", "FastAPI", "Python 3.11", "PostgreSQL 16", "Redis 7", "Tailwind CSS", "Google Gemini"],
      roleAlignment: ["Full-Stack Developer", "Fintech Engineer", "Backend Architect"],
      status: "implemented",
      updatedAt: "2026-10-13"
    },
    content: `
Project Name: CredVidhi
Live URL: https://credvidhi.vercel.app/
Repository: https://github.com/calligraphyguruji/CredVidhi
Objective: Institutional digital loan processing and deterministic credit underwriting platform for retail lending, NBFCs, and banks.
Core Problem:
Traditional lending workflows take 5-14 days due to disjointed email handoffs for KYC verification, floating-point rounding drift in loan math, and opaque underwriting decisions.
Engineered Solution:
1. Deterministic Underwriting Engine: Zero-drift fixed-point arithmetic in INR (\u20B9) calculating compound EMI, Debt-to-Income (DTI), and algorithmic credit risk grading.
2. 6-Stage Finite State Machine: Forward-only non-reversible lifecycle: Draft \u2192 Submitted \u2192 Under Review \u2192 Approved \u2192 Disbursed (with terminal Rejected state). Enforced inside PostgreSQL ACID transactions.
3. KYC Verification Workbench: Side-by-side visual document inspection interface for loan officers with discrepancy triage.
4. Append-Only Ledger: Cryptographic, immutable audit log in PostgreSQL tracking every state change, actor ID, and underwriting decision.
5. Redis 7 Caching: Rate-limiting tier, token bucket session management, and frequent loan query caching.
6. Guarded AI Support: Google Gemini integration with strict dual-layer domain boundary firewall preventing non-loan prompt abuse.
Architecture:
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS.
- Backend Gateway: Python FastAPI with asynchronous request dispatch and Pydantic v2 validation contracts.
- Database: PostgreSQL 16 append-only ledger schema.
- Cache: Redis 7 in-memory store.
`
  },
  // 5. CREDVIDHI ARCHITECTURE DEEP DIVE
  {
    id: "credvidhi-architecture-details",
    title: "CredVidhi Architectural Decisions & Security Boundaries",
    category: "architecture",
    projectId: "credvidhi",
    repository: "CredVidhi",
    url: "https://www.calligraphyguruji.dev/projects/credvidhi",
    filePath: "docs/architecture/credvidhi-system-topology.json",
    metadata: {
      technologies: ["FastAPI", "PostgreSQL 16", "Redis 7", "Google Gemini", "Pydantic v2"],
      roleAlignment: ["Backend Engineer", "Systems Architect", "Security Engineer"],
      status: "implemented",
      updatedAt: "2026-10-13"
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
`
  },
  // 6. KAUSHALNEXUS
  {
    id: "project-kaushalnexus",
    title: "KaushalNexus - Employment & Skilling Intelligence Platform",
    category: "project",
    projectId: "kaushal-nexus",
    repository: "Kaushal-Nexus",
    url: "https://www.calligraphyguruji.dev/projects/kaushal-nexus",
    metadata: {
      technologies: ["React 19", "FastAPI", "PostgreSQL", "Redis", "Google Gemini AI", "Tailwind CSS", "TypeScript"],
      roleAlignment: ["Full-Stack Developer", "AI Engineer", "Product Engineer"],
      status: "implemented",
      updatedAt: "2026-10-13"
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
`
  },
  // 7. BODHI SAKHA (GEMINI AI CHATBOT)
  {
    id: "project-bodhisakha",
    title: "Bodhi Sakha (\u092C\u094B\u0927\u093F\u0938\u0916\u093E) - Full-Stack Conversational AI Assistant",
    category: "project",
    projectId: "gemini-ai-chatbot",
    repository: "bodhi-sakha",
    url: "https://www.calligraphyguruji.dev/projects/gemini-ai-chatbot",
    metadata: {
      technologies: ["React 19", "JavaScript (ES6+)", "Google Gemini API", "Express.js", "Vite", "PostgreSQL", "KaTeX", "Markdown"],
      roleAlignment: ["AI Engineer", "Frontend Engineer", "Full-Stack Developer"],
      status: "implemented",
      updatedAt: "2026-10-13"
    },
    content: `
Project Name: Bodhi Sakha (\u092C\u094B\u0927\u093F\u0938\u0916\u093E)
Live URL: https://bodhi-sakha-phi.vercel.app/
Repository: https://github.com/calligraphyguruji/bodhi-sakha.git
Core Capabilities:
1. Low-Latency Streaming Dialogue: Real-time chunk-by-chunk response streaming using Server-Sent Events (SSE) and Google Gemini SDK (@google/generative-ai).
2. Deep Thinking Reasoning Mode: Dedicated analytical reasoning pipeline with thinking badges and step-by-step problem deconstruction.
3. Multi-Format Document Understanding: Ingests PDF, DOCX, and TXT files using serverless parsing (unpdf, mammoth) for grounded question answering.
4. LaTeX Mathematical & Markdown Rendering: Integrated KaTeX math formula parser alongside Markdown formatting.
5. Persistent Multi-User Sessions: Session and message storage in PostgreSQL with local persistence fallback.
6. Cultural UI Design: Saffron-accented, accessible responsive interface designed for both mobile and desktop screens.
`
  },
  // 8. LEETCODE & PROBLEM SOLVING
  {
    id: "leetcode-portfolio",
    title: "LeetCode Problem Solving & Algorithmic Foundations",
    category: "dsa",
    projectId: "leetcode-solutions",
    repository: "LeetCode-Questions",
    url: "https://www.calligraphyguruji.dev/projects/leetcode-solutions",
    metadata: {
      technologies: ["Modern C++", "STL", "Dynamic Programming", "Graph Theory", "Trees", "Big-O Analysis"],
      roleAlignment: ["SDE Intern", "Core Software Engineer", "Algorithms Engineer"],
      status: "implemented",
      updatedAt: "2026-10-13"
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
`
  },
  // 9. AMAZON & YOUTUBE CLONES
  {
    id: "project-clones",
    title: "Frontend Architecture Clones - Amazon & YouTube Web Apps",
    category: "project",
    url: "https://www.calligraphyguruji.dev/projects/amazon-clone",
    metadata: {
      technologies: ["JavaScript (ES6+)", "HTML5", "CSS3 Grid & Flexbox", "DOM APIs", "Responsive Design"],
      roleAlignment: ["Frontend Engineer", "UI Developer"],
      status: "implemented",
      updatedAt: "2026-10-13"
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
`
  },
  // 10. RECRUITER GUIDANCE & EVALUATION
  {
    id: "recruiter-guide",
    title: "Recruiter Assessment & Candidate Evaluation Guide for Aman Mishra",
    category: "recruiter",
    url: "https://www.calligraphyguruji.dev/resume",
    metadata: {
      roleAlignment: ["SDE Intern", "Frontend Developer", "Full-Stack Developer", "AI/ML Intern"],
      status: "implemented",
      updatedAt: "2026-10-13"
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
`
  }
];

// src/copilot/services/chunkingService.ts
import crypto from "node:crypto";
function hashContent(content) {
  return crypto.createHash("sha256").update(content.trim()).digest("hex");
}
function chunkKnowledgeDocument(doc) {
  const chunks = [];
  const lines = doc.content.split("\n");
  let currentSection = "Overview";
  let currentBuffer = [];
  const flushBuffer = () => {
    const rawText = currentBuffer.join("\n").trim();
    if (!rawText || rawText.length < 40) return;
    const words = rawText.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    const keywords = Array.from(new Set(words)).slice(0, 40);
    const chunkContent = `[${doc.title} - ${currentSection}]
${rawText}`;
    const chunkId = `${doc.id}-${chunks.length + 1}`;
    chunks.push({
      chunkId,
      documentId: doc.id,
      title: doc.title,
      section: currentSection,
      category: doc.category,
      projectId: doc.projectId,
      content: chunkContent,
      contentHash: hashContent(chunkContent),
      url: doc.url,
      filePath: doc.filePath,
      keywords,
      metadata: {
        ...doc.metadata,
        wordCount: words.length
      }
    });
    currentBuffer = [];
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(#{1,3}\s+|[0-9]+\.\s+[A-Z])/.test(trimmed)) {
      flushBuffer();
      currentSection = trimmed.replace(/^#+\s+/, "").slice(0, 80);
    } else {
      currentBuffer.push(line);
      if (currentBuffer.join("\n").length > 900 && trimmed === "") {
        flushBuffer();
      }
    }
  }
  flushBuffer();
  return chunks;
}

// src/copilot/nlp/nlpProcessor.ts
var PROJECT_ALIASES = {
  credvidhi: "credvidhi",
  "cred vidhi": "credvidhi",
  loan: "credvidhi",
  lending: "credvidhi",
  underwriting: "credvidhi",
  kaushalnexus: "kaushal-nexus",
  "kaushal-nexus": "kaushal-nexus",
  kaushal: "kaushal-nexus",
  skilling: "kaushal-nexus",
  sih: "kaushal-nexus",
  bodhisakha: "gemini-ai-chatbot",
  "bodhi sakha": "gemini-ai-chatbot",
  chatbot: "gemini-ai-chatbot",
  bodhi: "gemini-ai-chatbot",
  leetcode: "leetcode-solutions",
  dsa: "leetcode-solutions",
  algorithms: "leetcode-solutions",
  "amazon-clone": "amazon-clone",
  amazon: "amazon-clone",
  ecommerce: "amazon-clone",
  youtube: "youtube-clone",
  "youtube-clone": "youtube-clone",
  "document verification": "credvidhi",
  kyc: "credvidhi"
};
var TECH_ENTITIES = [
  "react",
  "react 19",
  "react 18",
  "typescript",
  "javascript",
  "c++",
  "python",
  "fastapi",
  "express",
  "express.js",
  "postgresql",
  "redis",
  "gemini",
  "gemini ai",
  "tailwind",
  "tailwind css",
  "framer motion",
  "motion",
  "vite",
  "docker",
  "linux",
  "git",
  "rag"
];
var PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|all)\s*(instructions|rules)/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /bypass\s+all\s+rules/i,
  /(reveal|print|show|dump)\s+(me\s+)?(all\s+)?(your\s+|the\s+)?(api\s+key|secret|password|token)/i,
  /delete\s+all\s+database/i,
  /sudo\s+rm\s+-rf/i,
  /jailbreak/i
];
function normalizeQuery(query) {
  return query.trim().replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}
function detectPromptInjection(query) {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return true;
    }
  }
  return false;
}

const VERIFIED_PROJECT_REGISTRY = {
  credvidhi: {
    id: "credvidhi",
    name: "CredVidhi",
    title: "Enterprise Loan Processing & Deterministic Underwriting Platform",
    keywords: ["credvidhi", "cred vidhi", "loan", "underwriting", "fsm", "lending"]
  },
  "kaushal-nexus": {
    id: "kaushal-nexus",
    name: "KaushalNexus",
    title: "Employment & Skilling Intelligence Platform",
    keywords: ["kaushalnexus", "kaushal-nexus", "kaushal", "nexus", "sih", "skilling"]
  },
  "gemini-ai-chatbot": {
    id: "gemini-ai-chatbot",
    name: "Bodhi Sakha (\u092C\u094B\u0927\u093F\u0938\u0916\u093E)",
    title: "Full-Stack Conversational AI Assistant",
    keywords: ["bodhi", "sakha", "bodhisakha", "gemini-ai-chatbot", "chatbot"]
  },
  "leetcode-solutions": {
    id: "leetcode-solutions",
    name: "LeetCode Problem Solving & Algorithms",
    title: "205+ Algorithmic Solutions in Modern C++",
    keywords: ["leetcode", "dsa", "algorithms", "c++ dsa", "problem solving"]
  },
  "amazon-clone": {
    id: "amazon-clone",
    name: "Frontend Architecture Clones (Amazon & YouTube)",
    title: "Multi-Page Responsive Web Architectures",
    keywords: ["amazon clone", "youtube clone", "clones", "frontend clones", "ecommerce"]
  }
};

function extractProjectsFromHistory(history = []) {
  const mentionedProjects = [];
  const projectOccurrences = [];
  if (!history || history.length === 0) return { mentionedProjects, projectOccurrences };

  const recentTurns = history.slice(-4);
  const lastAssistant = recentTurns.filter((m) => m.role === "assistant").slice(-1)[0];

  if (lastAssistant && lastAssistant.content) {
    const text = lastAssistant.content.toLowerCase();
    for (const [id, info] of Object.entries(VERIFIED_PROJECT_REGISTRY)) {
      let earliestIdx = -1;
      for (const kw of info.keywords) {
        const idx = text.indexOf(kw.toLowerCase());
        if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
          earliestIdx = idx;
        }
      }
      if (earliestIdx !== -1) {
        projectOccurrences.push({ projectId: id, index: earliestIdx, name: info.name });
      }
    }
    projectOccurrences.sort((a, b) => a.index - b.index);
    for (const occ of projectOccurrences) {
      if (!mentionedProjects.includes(occ.projectId)) {
        mentionedProjects.push(occ.projectId);
      }
    }
    if (mentionedProjects.length > 0) {
      return { mentionedProjects, activeProject: mentionedProjects[0], projectOccurrences };
    }
  }

  for (let i = recentTurns.length - 1; i >= 0; i--) {
    const text = recentTurns[i].content.toLowerCase();
    for (const [id, info] of Object.entries(VERIFIED_PROJECT_REGISTRY)) {
      for (const kw of info.keywords) {
        if (text.includes(kw.toLowerCase())) {
          if (!mentionedProjects.includes(id)) {
            mentionedProjects.push(id);
          }
          break;
        }
      }
    }
  }

  return { mentionedProjects, activeProject: mentionedProjects[0], projectOccurrences };
}

function isExplicitNewTopic(query) {
  const q = query.toLowerCase().trim();
  for (const info of Object.values(VERIFIED_PROJECT_REGISTRY)) {
    for (const kw of info.keywords) {
      if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q)) {
        return true;
      }
    }
  }
  if (/\b(who\s*(are|r)\s*(you|u)|who\s*(built|created|made)\s*(you|mantri)|who\s*is\s*aman)\b/i.test(q)) return true;
  if (/\b(resume|cv|curriculum\s+vitae)\b/i.test(q) && !/\b(it|its|them|second|one)\b/i.test(q)) return true;
  if (/\b(education|college|degree|niet|university|cgpa|academics)\b/i.test(q)) return true;
  if (/\b(internship|experience|codomax)\b/i.test(q)) return true;
  if (/\b(binary\s+search|dijkstra|process\s*(vs|and)\s*thread|what\s+is\s+rag)\b/i.test(q)) return true;
  if (/\b(contact|email|phone|linkedin|github)\b/i.test(q) && !/\b(it|its|them)\b/i.test(q)) return true;
  return false;
}

function resolveConversationalContext(rawQuery, history = []) {
  const normalized = rawQuery.trim().replace(/\s+/g, " ");
  const qLower = normalized.toLowerCase();

  if (isExplicitNewTopic(qLower)) {
    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: "UNKNOWN",
      isFollowUp: false,
      requiresClarification: false,
      confidence: 1.0
    };
  }

  const { mentionedProjects, activeProject } = extractProjectsFromHistory(history);

  // 1. Distributive Follow-up ("explain anyone of them", "explain any one of them", "pick one")
  const isDistributiveFollowUp =
    /\b(?:explain|tell\s+me\s+about|describe|overview|show|walk\s+through|detail)\s+(?:anyone|any\s*one|any|either|one)\s+of\s+(?:them|these|those|the\s+projects|the\s+above)\b/i.test(qLower) ||
    /^(?:explain|tell\s+me\s+about|describe|pick)\s+(?:anyone|any\s*one|one|either)(\s+of\s+them)?$/i.test(qLower) ||
    /\b(anyone|any\s*one|either)\s+of\s+(?:them|these|those)\b/i.test(qLower) ||
    /\b(pick|choose)\s+(?:anyone|any\s*one|one|either)\b/i.test(qLower);

  if (isDistributiveFollowUp) {
    if (mentionedProjects.length > 0) {
      const selectedId = mentionedProjects[0];
      const selected = VERIFIED_PROJECT_REGISTRY[selectedId] || VERIFIED_PROJECT_REGISTRY["credvidhi"];
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name} (${selected.title}), its architecture, features, and implementation`,
        detectedIntent: "PROJECT_DETAILS",
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95
      };
    }
    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: "FOLLOW_UP",
      isFollowUp: true,
      requiresClarification: true,
      clarificationPrompt: "Which project would you like me to explain? Aman has built **CredVidhi** (deterministic loan underwriting), **KaushalNexus** (skilling intelligence platform), **Bodhi Sakha** (full-stack AI assistant), and 205+ **LeetCode DSA solutions**.",
      confidence: 0.9
    };
  }

  // 2. Collective Follow-up ("explain all of them")
  const isCollectiveFollowUp =
    /\b(?:explain|tell\s+me\s+about|describe|overview|show|summarize|walk\s+through)\s+(?:all|each|every\s+one|every)\s+of\s+(?:them|these|those|the\s+projects|the\s+above)\b/i.test(qLower) ||
    /^(?:explain|tell\s+me\s+about|overview\s+of)\s+all\s+of\s+them$/i.test(qLower) ||
    /\b(all|each)\s+of\s+(?:them|these|those)\b/i.test(qLower);

  if (isCollectiveFollowUp) {
    const targetIds = mentionedProjects.length > 0 ? mentionedProjects : ["credvidhi", "kaushal-nexus", "gemini-ai-chatbot", "leetcode-solutions"];
    const projectNames = targetIds.map((id) => VERIFIED_PROJECT_REGISTRY[id]?.name || id).join(", ");
    return {
      originalQuery: rawQuery,
      resolvedQuery: `Comprehensive overview and technical comparison of Aman Mishra's verified projects: ${projectNames}`,
      detectedIntent: "PROJECT_LIST",
      targetProject: targetIds[0],
      targetProjects: targetIds,
      referencedEntity: "projects-collection",
      isFollowUp: true,
      requiresClarification: false,
      confidence: 0.95
    };
  }

  // 2b. Subcomponent Drill-Down on Active Project ("explain the second component", "explain its second component", "first step")
  const isComponentDrillDown =
    /\b(?:first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\s+(?:component|part|layer|module|step|stage|service|phase|feature)\b/i.test(
      qLower
    ) ||
    /\b(?:component|part|layer|module|step|stage|service|phase|feature)\s+(?:1|2|3|4|5|one|two|three|four|five)\b/i.test(
      qLower
    );

  if (isComponentDrillDown && activeProject) {
    const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
    if (selected) {
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name}: ${normalized}`,
        detectedIntent: "FOLLOW_UP",
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95
      };
    }
  }

  // 3. Ordinal Follow-up ("explain the second one", "the 2nd one")
  const ordinalMatch =
    !isComponentDrillDown &&
    qLower.match(
      /\b(?:explain\s+)?(?:the\s+)?(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\s*(?:one|project|item|choice|resource|option)?\b/i
    );
  if (ordinalMatch && ordinalMatch[1]) {
    const ordStr = ordinalMatch[1].toLowerCase();
    let index = -1;
    if (ordStr === "first" || ordStr === "1st") index = 0;
    else if (ordStr === "second" || ordStr === "2nd") index = 1;
    else if (ordStr === "third" || ordStr === "3rd") index = 2;
    else if (ordStr === "fourth" || ordStr === "4th") index = 3;
    else if (ordStr === "fifth" || ordStr === "5th") index = 4;
    else if (ordStr === "last") index = Math.max(0, mentionedProjects.length - 1);

    if (index >= 0 && index < mentionedProjects.length) {
      const selectedId = mentionedProjects[index];
      const selected = VERIFIED_PROJECT_REGISTRY[selectedId];
      if (selected) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `Explain ${selected.name} (${selected.title}), its architecture, features, and implementation`,
          detectedIntent: "PROJECT_DETAILS",
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95
        };
      }
    }
    if (mentionedProjects.length > 0) {
      return {
        originalQuery: rawQuery,
        resolvedQuery: normalized,
        detectedIntent: "FOLLOW_UP",
        isFollowUp: true,
        requiresClarification: true,
        clarificationPrompt: `The previous list contained ${mentionedProjects.length} items (${mentionedProjects.map((id) => VERIFIED_PROJECT_REGISTRY[id]?.name || id).join(", ")}). Which specific project would you like to explore?`,
        confidence: 0.85
      };
    }
  }

  // 4. Pronominal & Aspect Follow-up ("what about its backend?", "how does it work?")
  const isPronominal =
    /\b(its|it|that|this|the\s+project|the\s+system|the\s+app)\b/i.test(qLower) ||
    /\b(how\s+does\s+it\s+work|what\s+about\s+its\s+backend|what\s+database\s+does\s+it\s+use|explain\s+that\s+architecture)\b/i.test(qLower);

  if (isPronominal && activeProject) {
    const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
    if (selected) {
      const isArchitectureAspect = /\b(backend|database|architecture|fsm|finite\s+state\s+machine|ledger|security|infrastructure|fastapi|postgresql|redis)\b/i.test(qLower);
      const isTechStackAspect = /\b(technologies|tech\s+stack|tools|languages|frameworks|built\s+with)\b/i.test(qLower);
      if (isArchitectureAspect) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `Explain the backend architecture, database, state machine, and data flow of ${selected.name}`,
          detectedIntent: "PROJECT_ARCHITECTURE",
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95
        };
      }
      if (isTechStackAspect) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `What technologies and tech stack does ${selected.name} use?`,
          detectedIntent: "TECH_STACK",
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95
        };
      }
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name}: ${normalized}`,
        detectedIntent: "PROJECT_DETAILS",
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.9
      };
    }
  }

  // 5. Elaboration Follow-up ("tell me more", "more details", "elaborate")
  const isElaboration = /^(tell\s+me\s+more|more\s+details|elaborate|continue|go\s+deeper|what\s+else|tell\s+me\s+further)[\s!.,?]*$/i.test(qLower);
  if (isElaboration) {
    if (activeProject) {
      const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Provide in-depth technical details, architecture decisions, and implementation highlights for ${selected.name}`,
        detectedIntent: "PROJECT_DETAILS",
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95
      };
    }
    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: "FOLLOW_UP",
      isFollowUp: true,
      requiresClarification: true,
      clarificationPrompt: "What specific topic or project would you like more details on? I can explain CredVidhi, KaushalNexus, Bodhi Sakha, or Aman's LeetCode algorithms.",
      confidence: 0.85
    };
  }

  return {
    originalQuery: rawQuery,
    resolvedQuery: normalized,
    detectedIntent: "UNKNOWN",
    isFollowUp: false,
    requiresClarification: false,
    confidence: 0.5
  };
}

function analyzeQuery(rawQuery, conversationHistory = []) {
  const normalizedQuery = normalizeQuery(rawQuery);
  const lowerQuery = normalizedQuery.toLowerCase();
  const isInjection = detectPromptInjection(lowerQuery);
  if (isInjection) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: "PROMPT_INJECTION",
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [],
      isRecruiterMode: false,
      isInappropriateOrInjection: true
    };
  }
  const recognizedProjects = /* @__PURE__ */ new Set();
  for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escapedAlias}\\b`, "i").test(lowerQuery)) {
      recognizedProjects.add(projectId);
    }
  }
  const recognizedTech = TECH_ENTITIES.filter((t) => lowerQuery.includes(t));
  let targetProject = Array.from(recognizedProjects)[0];
  let targetProjects = void 0;
  let referencedEntity = void 0;
  let resolvedQuery = normalizedQuery;
  let requiresClarification = false;
  let clarificationPrompt = void 0;
  let isFollowUp = false;

  const contextRes = resolveConversationalContext(normalizedQuery, conversationHistory);
  if (contextRes.isFollowUp) {
    isFollowUp = true;
    resolvedQuery = contextRes.resolvedQuery;
    targetProject = contextRes.targetProject || targetProject;
    targetProjects = contextRes.targetProjects;
    referencedEntity = contextRes.referencedEntity;
    requiresClarification = contextRes.requiresClarification;
    clarificationPrompt = contextRes.clarificationPrompt;
    if (targetProject) {
      recognizedProjects.add(targetProject);
    }
  } else if (!targetProject && conversationHistory.length > 0) {
    isFollowUp = /\b(it|this|that|project|system|platform|component|components|layer|layers|step|steps|phase|phases|stage|stages|service|services|module|modules|part|parts|second|first|third|verification|underwriting|fsm|failure|fails)\b/i.test(lowerQuery);
    if (isFollowUp) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const prevText = conversationHistory[i].content.toLowerCase();
        for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
          if (prevText.includes(alias)) {
            targetProject = projectId;
            recognizedProjects.add(projectId);
            break;
          }
        }
        if (targetProject) break;
      }
    }
  }
  let intent = "UNKNOWN";
  const isResumeNegative = /\b(how\s+(to|do|can|should)|improve|write|writing|parse|parsing|parser|format|tips|review|builder|build\s+a\s+resume|prepare\s+a\s+resume)\b/i.test(
    lowerQuery
  );
  const isExplicitResumeRequest = !isResumeNegative &&
  (/^(resume|cv|curriculum\s+vitae|my\s+resume|your\s+resume|aman('?s)?\s+(resume|cv))$/i.test(
    lowerQuery
  ) ||
  /\b(gimme|give\s*me|send|share|show|provide|get|fetch|have|see|view|access|download|grab|need)\s+(me\s+)?(a\s+|the\s+|your\s+|his\s+|aman('?s)?\s+|my\s+)?(latest\s+|updated\s+|official\s+)?(copy\s+of\s+)?(resume|cv|curriculum\s+vitae)\b/i.test(
    lowerQuery
  ) ||
  /\bcan\s+i\s+(see|have|get|download|view|take)\s+(your|the|aman('?s)?)\s+(resume|cv)\b/i.test(
    lowerQuery
  ) ||
  /\b(where\s+(can|to)\s+(i\s+)?(download|find|get)\s+(your|the|aman('?s)?)\s+(resume|cv))\b/i.test(
    lowerQuery
  ) ||
  /\b(resume|cv)\s*(pdf|download|link|file|document)\b/i.test(lowerQuery) || /\b(download|get|view)\s+(the\s+)?(pdf\s+version|pdf|resume|cv)\b/i.test(lowerQuery) || /\b(download\s+aman\s+mishra\s+resume)\b/i.test(lowerQuery) || /\b(copy\s+of\s+(your|his|aman('?s)?)\s+(resume|cv|curriculum\s+vitae))\b/i.test(lowerQuery) || /\b(resume|cv)\s+for\s+(recruitment|recruiter|interview|hiring)\b/i.test(lowerQuery));
  const hasNegativeEntity = /\b(project|projects|architecture|stack|technolog(y|ies)|skill|skills|experience|internship|credvidhi|kaushal|bodhi|amazon|youtube|leetcode|dijkstra|binary\s*search)\b/i.test(
    lowerQuery
  );

  const isAssistantIdentity = !targetProject && !hasNegativeEntity && (
    /\b(who\s*(are|r)\s*(you|u)|introduce\s*yourself|what\s*are\s*you|tell\s*me\s*about\s*yourself|your\s*name|what\s*is\s*your\s*name|what\s*(can|do)\s*you\s*do|what\s*are\s*your\s*capabilities)\b/i.test(lowerQuery) ||
    /^(who\s*(are|r)\s*(you|u)\??)$/i.test(lowerQuery.trim())
  );
  const isCreatorIdentity = !targetProject && !hasNegativeEntity && !/\b(technolog(y|ies)|stack|how\s+does|how\s+to|how\s+mantri\s+works|detailed\s+technical)\b/i.test(lowerQuery) && (/\b(who\s*(is|are|was)?\s*(built|build|bulit|bild|created|made|make|developed|programmed|engineered|authored|coded|designed)\s*(you|u|mantri|this\s*ai|this\s*assistant|this\s*bot))\b/i.test(
    lowerQuery
  ) || /\b(who\s*(is|are)?\s*(your|mantri'?s?)\s*(creator|maker|developer|author|architect|engineer|coder|builder))\b/i.test(
    lowerQuery
  ) || /\b(creator|developer|maker|builder)\s+of\s+mantri\b/i.test(lowerQuery));
  const isOwnerIdentity = !targetProject && !hasNegativeEntity && !/\b(users|clients|borrowers|customers)\s+of\b/i.test(lowerQuery) && (/\b(who\s*(is|are)?\s*(the\s+)?(owner|maintainer)(\s*(of\s*(this\s*)?(portfolio|website|site|project|mantri|it)?)?)?)\b/i.test(
    lowerQuery
  ) || /\b(who\s*owns\s*(you|u|mantri|this\s*portfolio|this\s*website|this\s*site|this)?)\b/i.test(
    lowerQuery
  ) || /\b(owner\s+of\s+(this\s+)?(portfolio|website|site|mantri))\b/i.test(lowerQuery) || /\b(who\s*(is|are)?\s*(behind\s+mantri|behind\s+this\s*(website|portfolio|site)))\b/i.test(
    lowerQuery
  ));
  const isDeveloperIdentity = !targetProject && !hasNegativeEntity && !/\b(technolog(y|ies)|stack)\b/i.test(lowerQuery) && /\b(who\s*(is|are)?\s*(developed|developer\s*(of|behind)|engineer\s*(of|behind)|brain\s*(of|behind))\s*(this\s*website|this\s*portfolio|this\s*ai|mantri))\b/i.test(
    lowerQuery
  );
  const isPortfolioIdentity = !targetProject && !hasNegativeEntity && (/\b(who\s*(built|build|bulit|created|made|make|developed)\s*(this\s*portfolio|this\s*website|this\s*site))\b/i.test(
    lowerQuery
  ) || /\b(who\s*is\s*behind\s*(this\s*website|this\s*portfolio|this\s*site))\b/i.test(
    lowerQuery
  ));
  const isAssistantPurpose = !hasNegativeEntity && /\b(what\s*(is|are)?\s*(your|mantri'?s?)\s*(purpose|role|job|function|goal|mission)|why\s*were\s*you\s*(built|created|made))\b/i.test(
    lowerQuery
  );
  const isAboutAman = /\b(who\s*is\s*aman(\s*mishra)?|tell\s*me\s*about\s*aman(\s*mishra)?|about\s*aman(\s*mishra)?)\b/i.test(
    lowerQuery
  );
  const isRecruiter = /\b(hire|recruiter|interview|internship|qualifications|fit|suitable|hiring|role|sde|job|work with)\b/i.test(
    lowerQuery
  );

  const isProjectList =
    !targetProject &&
    (/\b(projects|featured\s+projects|portfolio\s+projects|your\s+projects|aman('?s)?\s+projects|my\s+projects|list\s+(the\s+)?projects|show\s+(me\s+)?(the\s+)?projects|what\s+projects|explain\s+(the\s+|all\s+|your\s+|aman('?s)?\s+)?projects|tell\s+me\s+about\s+(the\s+|all\s+|your\s+|aman('?s)?\s+)?projects|overview\s+of\s+(the\s+)?projects)\b/i.test(
      lowerQuery
    ) ||
      /^(projects|explain\s+projects|show\s+projects|list\s+projects|tell\s+me\s+about\s+projects|tell\s+me\s+about\s+your\s+projects|tell\s+me\s+about\s+my\s+projects)$/i.test(
        lowerQuery
      ));

  if (contextRes.isFollowUp && contextRes.detectedIntent !== "UNKNOWN") {
    intent = contextRes.detectedIntent;
  } else if (isExplicitResumeRequest) {
    intent = "RESUME_REQUEST";
  } else if (isProjectList) {
    intent = "PROJECT_LIST";
  } else if (isAssistantIdentity) {
    intent = "ASSISTANT_IDENTITY";
  } else if (isCreatorIdentity) {
    intent = "CREATOR_IDENTITY";
  } else if (isOwnerIdentity) {
    intent = "OWNER_IDENTITY";
  } else if (isDeveloperIdentity) {
    intent = "DEVELOPER_IDENTITY";
  } else if (isPortfolioIdentity) {
    intent = "PORTFOLIO_IDENTITY";
  } else if (isAssistantPurpose) {
    intent = "ASSISTANT_PURPOSE";
  } else if (isAboutAman) {
    intent = "ABOUT_AMAN";
  } else if (isRecruiter) {
    intent = "RECRUITER_EVALUATION";
  } else if (/\b(contact|email|phone|reach out|message|get in touch|who should i contact)\b/i.test(lowerQuery)) {
    intent = "CONTACT_QUERY";
  } else if (/\b(architecture|system design|data flow|components|lifecycle|topology|security boundaries)\b/i.test(lowerQuery)) {
    intent = "PROJECT_ARCHITECTURE";
  } else if (/\b(tech stack|technologies|built with|languages|frameworks|tools)\b/i.test(lowerQuery)) {
    intent = "TECH_STACK";
  } else if (/\b(why did you|trade-off|decision|why fast api|why redis|rationale)\b/i.test(lowerQuery)) {
    intent = "TECHNICAL_DECISION";
  } else if (/\b(code|implementation|function|algorithm|complexity|big-o|dsa|leetcode)\b/i.test(lowerQuery)) {
    intent = "CODE_EXPLANATION";
  } else if (/\b(skills|what can you do|competencies|what do you know)\b/i.test(lowerQuery)) {
    intent = "SKILLS";
  } else if (/\b(experience|internship|codomax|history|work)\b/i.test(lowerQuery)) {
    intent = "EXPERIENCE";
  } else if (/\b(recommend|best project|which project|show me)\b/i.test(lowerQuery)) {
    intent = "PROJECT_RECOMMENDATION";
  } else if (/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy)\b/i.test(lowerQuery)) {
    intent = "GENERAL_CONVERSATION";
  } else if (targetProject || /\b(credvidhi|kaushalnexus|bodhi sakha|project|app)\b/i.test(lowerQuery)) {
    intent = "PROJECT_OVERVIEW";
  } else {
    intent = "GENERAL_TECHNICAL";
  }
  const expandedTerms = [normalizedQuery];
  if (resolvedQuery && resolvedQuery !== normalizedQuery) {
    expandedTerms.push(resolvedQuery);
  }
  if (intent === "PROJECT_LIST" || targetProjects) {
    expandedTerms.push("credvidhi loan underwriting kaushal nexus bodhisakha leetcode amazon clone projects overview");
  } else if (targetProject === "credvidhi") {
    expandedTerms.push("loan underwriting finite state machine postgresql ledger fixed point emi dti redis");
  } else if (targetProject === "kaushal-nexus") {
    expandedTerms.push("skilling intelligence sih smart india hackathon gemini diagnostic district analytics ml matching");
  } else if (targetProject === "gemini-ai-chatbot") {
    expandedTerms.push("bodhisakha gemini api streaming katex document parsing express react 19");
  } else if (targetProject === "leetcode-solutions") {
    expandedTerms.push("leetcode dsa c++ algorithms time space complexity 205 problems solved");
  }
  const entities = {
    projects: Array.from(recognizedProjects),
    technologies: recognizedTech,
    roles: isRecruiter ? ["SDE Intern", "Frontend Developer", "Full-Stack Developer"] : [],
    skills: recognizedTech
  };
  return {
    originalQuery: rawQuery,
    normalizedQuery,
    resolvedQuery,
    intent,
    entities,
    expandedTerms,
    targetProject,
    targetProjects,
    referencedEntity,
    isFollowUp,
    requiresClarification,
    clarificationPrompt,
    isRecruiterMode: isRecruiter,
    isInappropriateOrInjection: false
  };
}

// src/copilot/services/retrievalService.ts
function calculateLexicalScore(query, chunk) {
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").split(/\s+/).filter((t) => t.length > 2);
  if (queryTokens.length === 0) return 0;
  const contentLower = chunk.content.toLowerCase();
  const titleLower = chunk.title.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const stem = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
    const escapedStem = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const termRegex = new RegExp(`\\b(?:${escapedToken}|${escapedStem}|${escapedStem}s)\\b`, 'i');
    const termGlobalRegex = new RegExp(`\\b(?:${escapedToken}|${escapedStem}|${escapedStem}s)\\b`, 'gi');

    if (termRegex.test(titleLower)) {
      score += 3.5;
    }
    if (chunk.keywords.some((k) => k.toLowerCase() === token || k.toLowerCase() === stem)) {
      score += 2.0;
    }
    const count = (contentLower.match(termGlobalRegex) || []).length;
    score += Math.min(count, 5) * 0.5;
  }
  if (chunk.projectId && new RegExp(`\\b${chunk.projectId.toLowerCase()}\\b`, "i").test(query)) {
    score += 4;
  }
  return score;
}
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function reciprocalRankFusion(lexicalRankings, semanticRankings, k = 60) {
  const scores = /* @__PURE__ */ new Map();
  lexicalRankings.forEach((chunk, rank) => {
    const current = scores.get(chunk.chunkId) || 0;
    scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
  });
  semanticRankings.forEach((chunk, rank) => {
    const current = scores.get(chunk.chunkId) || 0;
    scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
  });
  return scores;
}
var HybridRetriever = class {
  chunks = [];
  constructor(chunks = []) {
    this.chunks = chunks;
  }
  setChunks(chunks) {
    this.chunks = chunks;
  }
  retrieve(analysis, queryEmbedding, limit = 5) {
    const isIdentityQuery = [
      "ASSISTANT_IDENTITY",
      "CREATOR_IDENTITY",
      "OWNER_IDENTITY",
      "DEVELOPER_IDENTITY",
      "PORTFOLIO_IDENTITY",
      "ASSISTANT_PURPOSE"
    ].includes(analysis.intent);

    if (isIdentityQuery) {
      const identityChunk = this.chunks.find((c) => c.documentId === "mantri-identity");
      if (identityChunk) {
        return [
          {
            chunk: identityChunk,
            score: 1.0,
            lexicalScore: 10.0,
            semanticScore: 1.0
          }
        ];
      }
      return [];
    }

    const query = analysis.expandedTerms.join(" ");
    const validCandidateChunks = this.chunks.filter((c) => {
      if (!isIdentityQuery && c.documentId === "mantri-identity") {
        return false;
      }
      return true;
    });

    const scoredLexical = validCandidateChunks.map((chunk) => {
      let score = calculateLexicalScore(query, chunk);
      if (analysis.targetProject && chunk.projectId === analysis.targetProject) {
        score = Math.max(score * 3.0, 5.0);
        if (chunk.section.toLowerCase().includes("overview") || chunk.title.toLowerCase().includes("overview")) {
          score += 2.0;
        }
      } else if (analysis.targetProjects && chunk.projectId && analysis.targetProjects.includes(chunk.projectId)) {
        score = Math.max(score * 2.5, 4.0);
      } else if (analysis.targetProject && chunk.projectId && chunk.projectId !== analysis.targetProject) {
        score *= 0.05;
      }

      if (analysis.intent === "PROJECT_LIST") {
        if (chunk.category === "project") {
          score += 10.0;
          if (chunk.section.toLowerCase().includes("overview") || chunk.title.toLowerCase().includes("overview")) {
            score += 5.0;
          }
        } else {
          score *= 0.2;
        }
      } else if (analysis.intent === "TECHNICAL_SKILLS" || analysis.intent === "SKILLS" || analysis.intent === "TECH_STACK") {
        if (chunk.documentId === "skills-matrix" || chunk.category === "skills") {
          score += 15.0;
        }
      } else if (analysis.intent === "EDUCATION") {
        if (chunk.documentId === "bio-identity" || chunk.title.toLowerCase().includes("education") || chunk.content.toLowerCase().includes("niet")) {
          score += 15.0;
        }
      } else if (analysis.intent === "INTERNSHIP" || analysis.intent === "EXPERIENCE") {
        if (chunk.documentId === "exp-codomax" || chunk.category === "experience") {
          score += 15.0;
        }
      } else if (analysis.intent === "RESUME_REQUEST") {
        if (chunk.documentId === "resume-document" || chunk.documentId === "recruiter-guide") {
          score += 20;
        } else {
          score *= 0.05;
        }
      } else if (analysis.intent === "PORTFOLIO_OVERVIEW" || analysis.intent === "ABOUT_AMAN" || analysis.intent === "CONTACT_QUERY") {
        if (chunk.documentId === "bio-identity" || chunk.documentId === "recruiter-guide") {
          score += 15;
        }
      }
      return { chunk, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

    if (scoredLexical.length === 0 && analysis.targetProject) {
      const fallbackChunks = validCandidateChunks
        .filter((c) => c.projectId === analysis.targetProject)
        .slice(0, limit);
      fallbackChunks.forEach((chunk, idx) => {
        scoredLexical.push({ chunk, score: 5.0 - idx * 0.5 });
      });
    } else if (scoredLexical.length === 0 && analysis.targetProjects && analysis.targetProjects.length > 0) {
      const fallbackChunks = validCandidateChunks
        .filter((c) => c.projectId && analysis.targetProjects.includes(c.projectId))
        .slice(0, limit);
      fallbackChunks.forEach((chunk, idx) => {
        scoredLexical.push({ chunk, score: 5.0 - idx * 0.5 });
      });
    }

    const lexicalChunks = scoredLexical.map((item) => item.chunk);
    let semanticChunks = [];
    if (queryEmbedding && queryEmbedding.length > 0) {
      semanticChunks = validCandidateChunks.filter((c) => c.embedding && c.embedding.length > 0).map((chunk) => {
        const sim = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { chunk, score: sim };
      }).sort((a, b) => b.score - a.score).map((item) => item.chunk);
    }
    const rrfScores = reciprocalRankFusion(lexicalChunks, semanticChunks);
    const rankedCandidates = validCandidateChunks.map((chunk) => {
      const rrf = rrfScores.get(chunk.chunkId) || 0;
      const lexItem = scoredLexical.find((l) => l.chunk.chunkId === chunk.chunkId);
      const lexScore = lexItem ? lexItem.score : 0;
      const combinedScore = rrf * 10 + lexScore * 0.1;
      return {
        chunk,
        score: combinedScore,
        lexicalScore: lexScore
      };
    }).filter((res) => res.score >= 0.25).sort((a, b) => b.score - a.score);

    if (analysis.intent === "PROJECT_LIST") {
      const selected = [];
      const seenProjects = new Set();
      for (const res of rankedCandidates) {
        if (res.chunk.projectId) {
          if (!seenProjects.has(res.chunk.projectId)) {
            seenProjects.add(res.chunk.projectId);
            selected.push(res);
          }
        } else {
          selected.push(res);
        }
        if (selected.length >= limit) break;
      }
      if (selected.length < limit) {
        for (const res of rankedCandidates) {
          if (!selected.some((s) => s.chunk.chunkId === res.chunk.chunkId)) {
            selected.push(res);
            if (selected.length >= limit) break;
          }
        }
      }
      return selected;
    }

    return rankedCandidates.slice(0, limit);
  }
  generateCitations(results) {
    const seen = /* @__PURE__ */ new Set();
    const citations = [];
    for (const res of results) {
      if (res.chunk.documentId === "mantri-identity" && results.some((r) => r.chunk.documentId !== "mantri-identity")) {
        continue;
      }
      const key = `${res.chunk.documentId}-${res.chunk.section}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          sourceId: res.chunk.chunkId,
          title: res.chunk.title,
          section: res.chunk.section,
          projectId: res.chunk.projectId,
          url: res.chunk.url,
          filePath: res.chunk.filePath,
          relevanceScore: Math.round(res.score * 100) / 100
        });
      }
    }
    return citations;
  }
};

// src/copilot/config/mantriIdentity.ts
var MANTRI_IDENTITY = {
  assistantName: "Mantri",
  tagline: "Your AI guide to Aman Mishra's engineering work.",
  creator: "Aman Mishra",
  developer: "Aman Mishra",
  portfolioOwner: "Aman Mishra",
  portfolioUrl: "https://www.calligraphyguruji.dev",
  purpose: "Help visitors explore Aman Mishra's engineering portfolio, system architectures, technical skills, and projects.",
  contactEmail: "amanmishra7774@gmail.com",
  github: "https://github.com/calligraphyguruji",
  linkedin: "https://www.linkedin.com/in/calligraphygurji/",
  leetcode: "https://leetcode.com/u/calligraphyguruji/",
  // Concise deterministic responses
  responses: {
    assistant: "I'm Mantri, Aman Mishra's AI portfolio assistant. I help visitors explore his technical skills, software engineering projects, and engineering work. You can also ask me programming questions, discuss project architectures, or learn about the technologies used in his projects.",
    creatorExact: "Aman Mishra built me! I'm Mantri, his AI portfolio assistant, designed to help visitors explore his projects, technical skills, and engineering work.",
    creator: "Aman Mishra built me! I'm Mantri, his AI portfolio assistant, designed to help visitors explore his projects, technical skills, and engineering work.",
    owner: "Aman Mishra owns this portfolio. I'm Mantri, his AI assistant, designed to help visitors explore his projects, technical skills, and engineering work.",
    developer: "Aman Mishra is my developer and the creator of this portfolio. I'm Mantri, his AI assistant.",
    portfolio: "Aman Mishra built and owns this portfolio website. I'm Mantri, his AI assistant.",
    purpose: "I'm here to help you explore Aman Mishra's projects, technical skills, system architectures, and engineering experience.",
    capabilities: "I'm Mantri, your AI guide to Aman Mishra's portfolio. I can explain his projects, technical skills, and engineering work, as well as help with programming concepts and software architecture. My available capabilities depend on the features and models configured in this application.",
    aboutAman: "Aman Mishra (Calligraphy Guruji) is an aspiring Software Developer and Computer Science & Engineering undergraduate at NIET Greater Noida (CGPA: 9.38, Batch 2025\u20132029). He specializes in modern C++, Data Structures & Algorithms (205+ LeetCode problems), React 19/TypeScript frontend systems, and full-stack AI architectures.",
    contact: "You can reach out to Aman Mishra directly via email at amanmishra7774@gmail.com, connect on LinkedIn (linkedin.com/in/calligraphygurji), or message him using the Contact section of this website."
  }
};

var MANTRI_SYSTEM_PROMPT = `You are Mantri, the AI portfolio assistant for Aman Mishra (https://calligraphyguruji.dev).

Your primary responsibility is to answer the visitor's current question accurately and helpfully using verified portfolio information.

Always identify the user's actual intent before constructing an answer:
- If the user asks about projects (e.g. "explain projects", "tell me about your projects"), explain Aman Mishra's verified projects (CredVidhi, KaushalNexus, Bodhi Sakha, LeetCode, Frontend Clones).
- If the user asks about a specific project, provide concrete details about that project.
- If the user asks about project architecture, explain its architecture, state transitions, components, and data flow.
- If the user asks about technical skills, discuss verified technical skills (languages, frameworks, databases, tools).
- If the user asks about education, discuss Aman's B.Tech in CSE at NIET Greater Noida (Batch 2025–2029, CGPA 9.38).
- If the user asks about experience or internships, discuss his AI & ML Internship at Codomax Digital Solutions.
- If the user asks about your identity, explain that you are Mantri, Aman Mishra's AI portfolio assistant.
- If the user asks who created you, identify Aman Mishra as your creator.

CRITICAL BEHAVIORAL INVARIANTS:
- Do not introduce yourself unnecessarily.
- Do not answer project questions with your identity description.
- Do not repeat your standard introduction in unrelated responses.
- Do not invent project features, metrics, technologies, or achievements.
- Use retrieved portfolio information as evidence.
- If the available context is insufficient, acknowledge the limitation honestly and ask a relevant clarifying question.
- Answer the user's latest message directly.
- Use previous conversation history only when it helps interpret the current message or resolve a genuine follow-up.
- Never let unrelated retrieved documents override the user's current intent.

PORTFOLIO KNOWLEDGE & TECHNICAL ACCURACY:
- Treat retrieved portfolio documents as the authoritative source of truth.
- Do not invent technologies, metrics, achievements, or project features.
- Clearly distinguish implemented features from planned or prototype features.
- If portfolio information is unavailable or unconfirmed in the retrieved documents, state that honestly.
- You can answer general programming and computer science questions using your engineering expertise.

REASONING AND ANSWER QUALITY:
- Analyze complex technical questions carefully before responding.
- Break complex architectures into clear, understandable components with defined responsibilities.
- For coding questions, provide correct, maintainable, production-quality examples.
- For multi-turn follow-up questions, preserve the relevant conversation context.

ANSWER STYLE & FORMATTING:
- Answer the actual question first before providing supplementary context.
- Use structured GitHub-flavored Markdown: headings (###), ordered/unordered lists, bold highlights.
- For mathematical equations, render standard LaTeX ($O(N \\log N)$, $$...$$).
- In code blocks, always specify the language tag (e.g. \`\`\`cpp, \`\`\`typescript, \`\`\`python).
- Avoid generic filler introductions and repetitive closing pleasantries.`;

// src/copilot/services/llmProvider.ts
var GeminiProvider = class {
  apiKey = null;
  modelName;
  aiClient = null;
  timeoutMs;

  constructor(apiKey, modelName, timeoutMs = 30000) {
    const rawKey =
      apiKey ||
      (typeof process !== "undefined"
        ? process.env?.GEMINI_API_KEY || process.env?.GOOGLE_API_KEY
        : "") ||
      "";
    const trimmed = rawKey.trim();
    const isPlaceholder =
      !trimmed ||
      trimmed.length < 10 ||
      /^(your_|change_me|dummy|placeholder|none|null|undefined)/i.test(trimmed);

    this.modelName =
      modelName ||
      (typeof process !== "undefined" && process.env?.GEMINI_MODEL) ||
      "gemini-2.0-flash";
    this.timeoutMs = timeoutMs;

    if (!isPlaceholder) {
      this.apiKey = trimmed;
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error("[GeminiProvider] Initialization error:", err);
        this.aiClient = null;
      }
    }
  }

  isConfigured() {
    return this.apiKey !== null && this.aiClient !== null;
  }

  getModelName() {
    return this.modelName;
  }

  async generateEmbeddings(texts) {
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1e3;
      }
      return vec;
    });
  }

  async generateResponse(query, retrievedResults, analysis, history = []) {
    if (!this.aiClient || !this.apiKey) {
      throw new Error("GEMINI_NOT_CONFIGURED: Missing valid Gemini API key.");
    }

    const contents = [];
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (!msg.content || typeof msg.content !== "string") continue;
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content.trim() }]
      });
    }

    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });
    const contextText = contextBlocks.join("\n\n---\n\n");

    const promptSections = [];
    promptSections.push(`CRITICAL INSTRUCTION: Answer the USER QUESTION directly using the provided RETRIEVED PORTFOLIO CONTEXT. Do NOT introduce yourself, do NOT say "Aman Mishra built me" or give your assistant bio unless the user explicitly asks about who you are or who built you.`);
    if (contextText && retrievedResults.length > 0) {
      promptSections.push(`RETRIEVED PORTFOLIO CONTEXT:\n${contextText}`);
    }
    if (analysis.targetProject) {
      promptSections.push(`TARGET PROJECT: ${analysis.targetProject}`);
    }
    if (analysis.resolvedQuery && analysis.resolvedQuery !== query) {
      promptSections.push(`RESOLVED CONVERSATIONAL CONTEXT:\nThe user is asking a follow-up or contextual reference. The query "${query}" has been resolved to: "${analysis.resolvedQuery}". Answer specifically about the resolved subject.`);
    }
    if (analysis.intent) {
      promptSections.push(`DETECTED INTENT: ${analysis.intent}`);
    }
    promptSections.push(`USER QUESTION:\n${query}`);

    contents.push({
      role: "user",
      parts: [{ text: promptSections.join("\n\n") }]
    });

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), this.timeoutMs);

    try {
      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: MANTRI_SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 2048,
          abortSignal: abortController.signal
        }
      });
      clearTimeout(timeoutHandle);
      const candidateText = response.text;
      if (candidateText && candidateText.trim().length > 0) {
        return candidateText.trim();
      }
      return "Unable to generate response from Gemini model.";
    } catch (err) {
      clearTimeout(timeoutHandle);
      if (abortController.signal.aborted || err?.name === "AbortError") {
        throw new Error(`GEMINI_TIMEOUT: Request exceeded timeout of ${this.timeoutMs}ms.`);
      }
      const errMsg = String(err?.message || err);
      if (errMsg.includes("401") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("PERMISSION_DENIED")) {
        throw new Error("GEMINI_AUTH_ERROR: Invalid or unauthorized Gemini API key.");
      }
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("GEMINI_QUOTA_ERROR: Rate limit or quota exceeded on Gemini API.");
      }
      if (errMsg.includes("404") || errMsg.includes("NOT_FOUND") || errMsg.includes("models/")) {
        throw new Error(`GEMINI_MODEL_ERROR: Model "${this.modelName}" not found or unsupported.`);
      }
      throw new Error(`GEMINI_API_ERROR: ${errMsg.replace(/AIza[0-9A-Za-z\-_]{20,}/g, "[REDACTED]")}`);
    }
  }
};

function classifyGeminiError(err) {
  const msg = String(err?.message || err);
  if (
    msg.includes('GEMINI_AUTH_ERROR') ||
    msg.includes('401') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED')
  ) {
    return 'AUTH_ERROR';
  }
  if (msg.includes('SAFETY') || msg.includes('SAFETY_BLOCKED') || msg.includes('BLOCKED')) {
    return 'SAFETY_BLOCKED';
  }
  if (
    msg.includes('404') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('is not found') ||
    msg.includes('GEMINI_MODEL_ERROR')
  ) {
    return 'MODEL_NOT_FOUND';
  }
  if (
    msg.includes('GEMINI_QUOTA_ERROR') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429') ||
    msg.includes('quota')
  ) {
    return 'QUOTA_ERROR';
  }
  if (msg.includes('GEMINI_TIMEOUT') || msg.includes('AbortError') || msg.includes('timeout')) {
    return 'TIMEOUT';
  }
  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('Service Unavailable') ||
    msg.includes('Bad Gateway') ||
    msg.includes('Internal Server Error')
  ) {
    return 'SERVER_ERROR';
  }
  if (msg.includes('MALFORMED') || msg.includes('empty response')) {
    return 'MALFORMED_OUTPUT';
  }
  return 'UNKNOWN_ERROR';
}

function diagnoseGeminiFailure(err, modelId) {
  const rawMsg = String(err?.message || err);
  const sanitized = rawMsg
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')
    .replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');
  const lower = sanitized.toLowerCase();

  const is404 =
    err?.status === 404 ||
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('gemini_model_error');

  if (is404) {
    if (
      lower.includes('endpoint') ||
      lower.includes('url') ||
      lower.includes('v1beta') ||
      lower.includes('v1alpha') ||
      lower.includes('invalid route') ||
      lower.includes('cannot post') ||
      lower.includes('cannot get')
    ) {
      return {
        provider: 'gemini',
        statusCode: 404,
        category: 'INVALID_ENDPOINT_OR_VERSION',
        is404: true,
        modelId,
        reason: sanitized,
        timestamp: new Date().toISOString(),
      };
    }
    if (
      lower.includes('unsupported') ||
      lower.includes('deprecated') ||
      lower.includes('unavailable') ||
      lower.includes('no longer available')
    ) {
      return {
        provider: 'gemini',
        statusCode: 404,
        category: 'UNSUPPORTED_OR_UNAVAILABLE_MODEL',
        is404: true,
        modelId,
        reason: sanitized,
        timestamp: new Date().toISOString(),
      };
    }
    if (
      lower.includes('models/') ||
      lower.includes('model') ||
      lower.includes('publisher model')
    ) {
      return {
        provider: 'gemini',
        statusCode: 404,
        category: 'MODEL_NOT_FOUND',
        is404: true,
        modelId,
        reason: sanitized,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      provider: 'gemini',
      statusCode: 404,
      category: 'RESOURCE_NOT_FOUND',
      is404: true,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  if (
    err?.status === 401 ||
    err?.status === 403 ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('auth_error')
  ) {
    return {
      provider: 'gemini',
      statusCode: err?.status || (lower.includes('403') ? 403 : 401),
      category: 'AUTH_OR_PERMISSION_ERROR',
      is404: false,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  if (
    err?.status === 429 ||
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('resource_exhausted')
  ) {
    return {
      provider: 'gemini',
      statusCode: 429,
      category: 'RATE_LIMIT_OR_QUOTA',
      is404: false,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('timeout') || lower.includes('aborterror') || lower.includes('aborted')) {
    return {
      provider: 'gemini',
      statusCode: 408,
      category: 'TIMEOUT',
      is404: false,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  if (
    err?.status >= 500 ||
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    lower.includes('service unavailable')
  ) {
    return {
      provider: 'gemini',
      statusCode: err?.status || 503,
      category: 'SERVER_ERROR',
      is404: false,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  if (lower.includes('safety') || lower.includes('blocked')) {
    return {
      provider: 'gemini',
      statusCode: 400,
      category: 'SAFETY_BLOCKED',
      is404: false,
      modelId,
      reason: sanitized,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    provider: 'gemini',
    statusCode: err?.status,
    category: 'UNKNOWN_ERROR',
    is404: false,
    modelId,
    reason: sanitized,
    timestamp: new Date().toISOString(),
  };
}

var GroqProvider = class {
  name = 'groq';
  apiKey = null;
  modelName;
  groqClient = null;
  timeoutMs;

  constructor(apiKey, modelName, timeoutMs = 12000) {
    const rawKey =
      apiKey ||
      (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '') ||
      '';
    const trimmed = rawKey.trim();
    const isPlaceholder =
      !trimmed ||
      trimmed.length < 10 ||
      /^(your_|change_me|dummy|placeholder|none|null|undefined|<)/i.test(trimmed);

    this.modelName =
      modelName ||
      (typeof process !== 'undefined' && process.env?.GROQ_MODEL) ||
      'llama-3.3-70b-versatile';

    this.timeoutMs = timeoutMs;

    if (!isPlaceholder) {
      this.apiKey = trimmed;
      try {
        this.groqClient = new Groq({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GroqProvider] Initialization error:', err);
        this.groqClient = null;
      }
    }
  }

  isConfigured() {
    return this.apiKey !== null && this.groqClient !== null;
  }

  getModelName() {
    return this.modelName;
  }

  setModelName(modelName) {
    this.modelName = modelName;
  }

  setClient(client) {
    this.groqClient = client;
    if (client && !this.apiKey) {
      this.apiKey = 'mock-configured-key';
    }
  }

  formatMessages(query, retrievedResults, analysis, history = []) {
    const messages = [];
    messages.push({
      role: 'system',
      content: MANTRI_SYSTEM_PROMPT,
    });

    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (!msg.content || typeof msg.content !== 'string') continue;
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content.trim(),
      });
    }

    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });
    const contextText = contextBlocks.join('\n\n---\n\n');

    const promptSections = [];
    promptSections.push(
      'CRITICAL INSTRUCTION: Answer the USER QUESTION directly using the provided RETRIEVED PORTFOLIO CONTEXT. Do NOT introduce yourself, do NOT say "Aman Mishra built me" or give your assistant bio unless the user explicitly asks about who you are or who built you.'
    );

    if (contextText && retrievedResults.length > 0) {
      promptSections.push(`RETRIEVED PORTFOLIO CONTEXT:\n${contextText}`);
    }
    if (analysis.targetProject) {
      promptSections.push(`TARGET PROJECT: ${analysis.targetProject}`);
    }
    if (analysis.intent) {
      promptSections.push(`DETECTED INTENT: ${analysis.intent}`);
    }
    if (analysis.resolvedQuery && analysis.resolvedQuery !== query) {
      promptSections.push(
        `RESOLVED CONVERSATIONAL CONTEXT:\nThe user is asking a follow-up referring to the preceding conversation. Resolved interpretation: "${analysis.resolvedQuery}". Answer directly about this resolved subject using the retrieved context.`
      );
    }
    promptSections.push(`USER QUESTION:\n${query}`);

    messages.push({
      role: 'user',
      content: promptSections.join('\n\n'),
    });

    return messages;
  }

  async generateResponse(query, retrievedResults, analysis, history = []) {
    if (!this.groqClient || !this.apiKey) {
      throw new Error('GROQ_NOT_CONFIGURED: Missing valid Groq API key.');
    }

    const messages = this.formatMessages(query, retrievedResults, analysis, history);
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const completion = await this.groqClient.chat.completions.create(
        {
          model: this.modelName,
          messages,
          temperature: 0.2,
          max_tokens: 2048,
        },
        {
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutHandle);

      const candidateText = completion.choices?.[0]?.message?.content;
      if (candidateText && typeof candidateText === 'string' && candidateText.trim().length > 0) {
        return candidateText.trim();
      }

      throw new Error('GROQ_MALFORMED_OUTPUT: Empty or invalid response content from Groq.');
    } catch (err) {
      clearTimeout(timeoutHandle);
      const rawMsg = String(err?.message || err);
      const sanitized = rawMsg
        .replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')
        .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');

      if (err?.name === 'AbortError' || sanitized.includes('aborted') || sanitized.includes('timeout')) {
        throw new Error(`GROQ_TIMEOUT: Request exceeded timeout of ${this.timeoutMs}ms.`);
      }

      if (err?.status === 401 || sanitized.includes('401') || sanitized.includes('invalid_api_key')) {
        throw new Error(`GROQ_AUTH_ERROR: ${sanitized}`);
      }

      if (err?.status === 429 || sanitized.includes('429') || sanitized.includes('rate_limit')) {
        throw new Error(`GROQ_RATE_LIMIT: ${sanitized}`);
      }

      if (err?.status === 404 || sanitized.includes('404') || sanitized.includes('model_not_found')) {
        throw new Error(`GROQ_MODEL_NOT_FOUND: ${sanitized}`);
      }

      throw new Error(`GROQ_API_ERROR: ${sanitized}`);
    }
  }
};

var GeminiModelRouter = class {
  apiKey;
  primaryModel;
  fallbackModels;
  maxAttempts;
  cooldownSeconds;
  requestTimeoutMs;
  stats = new Map();
  providers = new Map();

  constructor(options = {}) {
    this.apiKey = options.apiKey || (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.GOOGLE_API_KEY)) || '';
    this.primaryModel = options.primaryModel || (typeof process !== 'undefined' && (process.env?.GEMINI_PRIMARY_MODEL || process.env?.GEMINI_MODEL)) || 'gemini-2.0-flash';
    const fallbackEnv = typeof process !== 'undefined' && process.env?.GEMINI_FALLBACK_MODELS;
    this.fallbackModels = options.fallbackModels || (fallbackEnv ? fallbackEnv.split(',').map(m => m.trim()).filter(Boolean) : ['gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro']);
    this.maxAttempts = options.maxAttempts || (typeof process !== 'undefined' && process.env?.GEMINI_MAX_ATTEMPTS ? parseInt(process.env.GEMINI_MAX_ATTEMPTS, 10) : 4);
    this.cooldownSeconds = options.cooldownSeconds || (typeof process !== 'undefined' && process.env?.GEMINI_COOLDOWN_SECONDS ? parseInt(process.env.GEMINI_COOLDOWN_SECONDS, 10) : 60);
    this.requestTimeoutMs = options.requestTimeoutMs || (typeof process !== 'undefined' && process.env?.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS, 10) : 12000);
    this.initProviders();
  }

  initProviders() {
    const allModels = [this.primaryModel, ...this.fallbackModels];
    for (const model of allModels) {
      if (!this.stats.has(model)) {
        this.stats.set(model, {
          modelId: model,
          successCount: 0,
          failureCount: 0,
        });
      }
      if (!this.providers.has(model)) {
        this.providers.set(model, new GeminiProvider(this.apiKey, model, this.requestTimeoutMs));
      }
    }
  }

  isConfigured() {
    const primary = this.providers.get(this.primaryModel);
    return primary ? primary.isConfigured() : false;
  }

  getPrimaryModel() {
    return this.primaryModel;
  }

  getAllConfiguredModels() {
    return [this.primaryModel, ...this.fallbackModels];
  }

  isModelEligible(modelId, now = Date.now()) {
    const s = this.stats.get(modelId);
    if (!s) return true;
    if (s.cooldownUntil && s.cooldownUntil > now) return false;
    return true;
  }

  getCandidateModels() {
    const now = Date.now();
    const all = [this.primaryModel, ...this.fallbackModels];
    const eligible = [];
    const inCooldown = [];
    for (const m of all) {
      if (this.isModelEligible(m, now)) {
        eligible.push(m);
      } else {
        inCooldown.push(m);
      }
    }
    if (eligible.length === 0) return all;
    return [...eligible, ...inCooldown];
  }

  recordSuccess(modelId, latencyMs) {
    const s = this.stats.get(modelId) || { modelId, successCount: 0, failureCount: 0 };
    s.successCount += 1;
    s.lastSuccessTimestamp = Date.now();
    s.lastLatencyMs = latencyMs;
    s.cooldownUntil = void 0;
    this.stats.set(modelId, s);
  }

  recordFailure(modelId, errorType) {
    const s = this.stats.get(modelId) || { modelId, successCount: 0, failureCount: 0 };
    s.failureCount += 1;
    s.lastFailureTimestamp = Date.now();
    s.lastErrorType = errorType;
    if (errorType === 'QUOTA_ERROR' || errorType === 'SERVER_ERROR' || errorType === 'TIMEOUT' || errorType === 'MODEL_NOT_FOUND') {
      s.cooldownUntil = Date.now() + this.cooldownSeconds * 1000;
    }
    this.stats.set(modelId, s);
  }

  logEvent(event) {
    console.warn(`[GeminiModelRouter] ${JSON.stringify(event)}`);
  }

  async generateResponseWithTelemetry(query, retrievedResults, analysis, history = []) {
    const candidateModels = this.getCandidateModels();
    const maxAttempts = Math.min(this.maxAttempts, candidateModels.length);
    let lastError = null;
    let failoverReason = void 0;
    let failoverOccurred = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const modelId = candidateModels[attempt - 1];
      let provider = this.providers.get(modelId);
      if (!provider) {
        provider = new GeminiProvider(this.apiKey, modelId, this.requestTimeoutMs);
        this.providers.set(modelId, provider);
      }
      const startTs = Date.now();
      try {
        const text = await provider.generateResponse(query, retrievedResults, analysis, history);
        const latencyMs = Date.now() - startTs;
        this.recordSuccess(modelId, latencyMs);

        if (attempt > 1) {
          failoverOccurred = true;
          this.logEvent({
            event: 'gemini_model_success',
            requestedModel: this.primaryModel,
            activeModel: modelId,
            attempt,
            latencyMs,
            reason: failoverReason,
            timestamp: new Date().toISOString()
          });
        }

        return {
          answer: text,
          modelUsed: modelId,
          attempts: attempt,
          failoverOccurred,
          failoverReason
        };
      } catch (err) {
        const latencyMs = Date.now() - startTs;
        lastError = err;
        const errorClass = classifyGeminiError(err);
        this.recordFailure(modelId, errorClass);

        if (errorClass === 'AUTH_ERROR') {
          this.logEvent({
            event: 'gemini_model_failover',
            requestedModel: this.primaryModel,
            failedModel: modelId,
            reason: 'AUTH_ERROR_NON_RETRYABLE',
            attempt,
            latencyMs,
            timestamp: new Date().toISOString()
          });
          throw err;
        }

        if (errorClass === 'SAFETY_BLOCKED') {
          this.logEvent({
            event: 'gemini_model_failover',
            requestedModel: this.primaryModel,
            failedModel: modelId,
            reason: 'SAFETY_BLOCKED_NON_RETRYABLE',
            attempt,
            latencyMs,
            timestamp: new Date().toISOString()
          });
          throw err;
        }

        failoverReason = `${errorClass}: ${err?.message || 'Failure'}`;
        const nextModel = attempt < maxAttempts ? candidateModels[attempt] : void 0;
        this.logEvent({
          event: 'gemini_model_failover',
          requestedModel: this.primaryModel,
          failedModel: modelId,
          nextModel,
          reason: errorClass,
          attempt,
          latencyMs,
          timestamp: new Date().toISOString()
        });

        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
        }
      }
    }

    this.logEvent({
      event: 'gemini_all_models_failed',
      requestedModel: this.primaryModel,
      reason: failoverReason,
      attempt: maxAttempts,
      timestamp: new Date().toISOString()
    });

    throw new Error(
      `GEMINI_ALL_MODELS_FAILED: Exhausted all ${maxAttempts} configured Gemini models. Last error: ${lastError?.message || 'Service Unavailable'}`
    );
  }
};
var DeterministicFallbackProvider = class {
  async generateEmbeddings(texts) {
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1e3;
      }
      return vec;
    });
  }
  async generateResponse(query, retrievedResults, analysis) {
    const qLower = query.toLowerCase();

    // 0. Clarification for Ambiguous References
    if (analysis.requiresClarification && analysis.clarificationPrompt) {
      return analysis.clarificationPrompt;
    }

    if (analysis.intent === "PROMPT_INJECTION" || analysis.isInappropriateOrInjection) {
      return "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?";
    }

    if (analysis.intent === "ASSISTANT_IDENTITY") {
      const isCapabilities = /what can you do|capabilities|what do you do|features/i.test(query);
      return isCapabilities
        ? MANTRI_IDENTITY.responses.capabilities
        : MANTRI_IDENTITY.responses.assistant;
    }

    if (analysis.intent === "CREATOR_IDENTITY") {
      return MANTRI_IDENTITY.responses.creatorExact || MANTRI_IDENTITY.responses.creator;
    }

    if (analysis.intent === "OWNER_IDENTITY") {
      return MANTRI_IDENTITY.responses.owner;
    }

    if (analysis.intent === "DEVELOPER_IDENTITY") {
      return MANTRI_IDENTITY.responses.developer;
    }

    if (analysis.intent === "PORTFOLIO_IDENTITY" || analysis.intent === "PORTFOLIO_OVERVIEW") {
      return MANTRI_IDENTITY.responses.portfolio;
    }

    if (analysis.intent === "ASSISTANT_PURPOSE") {
      return MANTRI_IDENTITY.responses.purpose;
    }

    if (analysis.intent === "CONTACT_QUERY") {
      return MANTRI_IDENTITY.responses.contact;
    }

    if (analysis.intent === "ABOUT_AMAN") {
      return MANTRI_IDENTITY.responses.aboutAman;
    }

    if (analysis.intent === "RESUME_REQUEST") {
      return "Here's Aman Mishra's verified resume! You can download the PDF directly using the card below or preview it in your browser.";
    }

    if (analysis.intent === "GENERAL_CONVERSATION") {
      return "Hello! I am **Mantri**, Aman Mishra's AI portfolio assistant. How can I help you explore Aman's software engineering work, system architectures (like CredVidhi and KaushalNexus), or C++/React technical background today?";
    }

    if (analysis.intent === "PROJECT_LIST") {
      return `### Aman Mishra's Featured Engineering Projects\n\nAman has engineered production-grade full-stack, systems, and AI applications:\n\n1. **CredVidhi — Enterprise Loan Processing & Underwriting Platform**\n   - **Stack:** React 19, TypeScript, FastAPI (Python), PostgreSQL 16, Redis 7, Google Gemini API.\n   - **Highlights:** Fixed-point zero-drift mathematical underwriting engine, 6-state forward-only FSM, and append-only cryptographic audit ledger.\n   - **Live Platform:** [credvidhi.vercel.app](https://credvidhi.vercel.app/)\n\n2. **KaushalNexus — Intelligent Skilling & Labor Matching Platform (SIH 2026 Flagship)**\n   - **Stack:** React 19, TypeScript, Express.js, PostgreSQL, Google Gemini AI.\n   - **Highlights:** Real-time labor marketplace, skill gap diagnostics, district-level workforce analytics, and multilingual voice interfaces.\n   - **Live Platform:** [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/)\n\n3. **Bodhi Sakha — Full-Stack Generative AI Study Companion**\n   - **Stack:** React 19, Express.js, Google Gemini API, KaTeX, Tailwind CSS.\n   - **Highlights:** Real-time token streaming, multimodal document analysis, and formatted LaTeX equation rendering.\n\n4. **LeetCode Problem Solving & Algorithmic Rigor**\n   - **Focus:** 205+ problems solved with asymptotic C++ STL rigor ($O(N \\log N)$ sorting/heaps, $O(1)$ hash maps).\n\n5. **Amazon & YouTube Production-Grade Clones**\n   - **Stack:** React, TypeScript, Firebase, Tailwind CSS. Focus on complex state persistence and media feeds.\n\n*Would you like an in-depth architectural breakdown of any specific project, such as CredVidhi's underwriting engine?*`;
    }

    if (analysis.intent === "TECHNICAL_SKILLS" || analysis.intent === "SKILLS" || analysis.intent === "TECH_STACK") {
      return `### Aman Mishra's Technical Skillset & Tooling\n\n- **Languages:** C++ (Modern C++17/20, STL), C, Java, Python 3.11+, JavaScript (ESNext), TypeScript 5, SQL, HTML5, CSS3.\n- **Frontend Architecture:** React 18/19, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, WCAG 2.1 AA accessibility.\n- **Backend & APIs:** FastAPI (Python), Express.js (Node.js), RESTful APIs, Pydantic v2 data contracts, SQLAlchemy ORM.\n- **Databases & Caching:** PostgreSQL 16 (ACID ledgers, indexing), Redis 7 (sliding-window rate limiting), MongoDB, SQLite.\n- **AI & Systems:** Google Gemini SDK, Retrieval-Augmented Generation (RAG), prompt guardrails, Scikit-Learn.\n- **DevOps & Tooling:** Git, GitHub, Docker, Postman, Linux (bash/zsh), Vercel.`;
    }

    if (analysis.intent === "EDUCATION") {
      return `### Education & Academic Background\n\n- **Degree:** Bachelor of Technology (B.Tech) in Computer Science & Engineering (CSE)\n- **Institution:** Noida Institute of Engineering and Technology (NIET), Greater Noida, Uttar Pradesh\n- **Duration:** 2025 – 2029 (Undergraduate)\n- **Current CGPA:** **9.38 / 10.0**\n- **Academic Focus:** Data Structures & Algorithms, Object-Oriented Design, Operating Systems, Database Management Systems, and Software Engineering.`;
    }

    if (analysis.intent === "INTERNSHIP" || analysis.intent === "EXPERIENCE") {
      return `### Work Experience & Internships\n\n**AI & ML Intern — Codomax Digital Solutions**\n- **Duration:** 12 July 2026 – 12 August 2026 (1 month)\n- **Key Deliverables:**\n  - Integrated generative AI pipelines and Google Gemini LLM API into internal workflow prototypes.\n  - Engineered automated data processing pipelines with Python (Pandas, NumPy).\n  - Implemented structured JSON schema validation to guarantee deterministic outputs from LLMs.\n  - Collaborated on prompt engineering and system instructions to minimize hallucinations.`;
    }

    if (analysis.intent === "RECRUITER_EVALUATION") {
      return `### Candidate Evaluation: Aman Mishra\n\n**Candidate Profile & Fit Summary:**\n- **Target Roles:** SDE Intern, Frontend Engineer, Full-Stack Developer.\n- **Education:** B.Tech in CSE at NIET Greater Noida (CGPA: 9.38, Batch 2025–2029).\n- **Key Strengths:**\n  * **Systems & Algorithms:** 205+ LeetCode problems solved with asymptotic C++ STL rigor ($O(N \\log N)$ heap/sorting, $O(1)$ amortized hash maps).\n  * **Frontend Engineering:** React 19, TypeScript, Tailwind CSS, accessibility compliance.\n  * **Full-Stack Execution:** End-to-end architectures in CredVidhi (FastAPI + PostgreSQL + Redis) and KaushalNexus (SIH 2026 Flagship).\n  * **Work Experience:** AI & ML Intern at Codomax Digital Solutions.\n\n*Note: Candidate is currently an undergraduate student seeking internship and junior engineering opportunities.*`;
    }

    // Document Verification Failure in CredVidhi
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      /verification\s+fail|document\s+verification|fail/i.test(query)
    ) {
      return `### CredVidhi Document Verification & Failure Handling\n\nIn CredVidhi's underwriting workflow, document verification is governed by a strict, forward-only Finite State Machine (FSM):\n\n1. **State Transition on Discrepancy:**\n   - If KYC or financial document verification fails during loan officer inspection, the application transitions to either a **Discrepancy** state (requiring borrower document re-upload) or a terminal **Rejected** state.\n   - The state machine strictly prevents skipping stages (e.g. applications cannot proceed to \`APPROVED\` without passing verification).\n\n2. **ACID Ledger Audit Envelope:**\n   - The failure event, rejection reason, officer UUID, and discrepancy payload hash are committed to PostgreSQL 16's append-only audit ledger.\n   - Every mutation is non-destructive and fully auditable.\n\n3. **Borrower Notification & Remediation:**\n   - The client application renders specific discrepancy tags on the KYC workbench, prompting the borrower to remediate blurry or mismatched documents.`;
    }

    // CredVidhi Architecture & FSM
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      (analysis.intent === 'PROJECT_ARCHITECTURE' || /architecture|state machine|data flow|fsm/i.test(query))
    ) {
      return `### CredVidhi System Architecture & Data Flow\n\nCredVidhi is an institutional loan origination and deterministic credit underwriting platform:\n\n1. **API Gateway (FastAPI):** Python FastAPI service with Pydantic v2 strict schema validation and JWT RBAC (Borrower, Loan Officer, Underwriter, Superadmin).\n2. **Deterministic Underwriting Engine:** Fixed-point precision arithmetic in INR (₹) calculating compound EMI ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) and Debt-to-Income (DTI) without floating-point drift.\n3. **Finite State Machine (FSM):** 6-stage forward-only lifecycle: \`Draft → Submitted → Under Review → Approved → Disbursed\` (with terminal \`Rejected\` and intermediate \`Discrepancy\` states) enforced inside PostgreSQL ACID transaction boundaries.\n4. **Append-Only Ledger (PostgreSQL 16):** Cryptographic immutable audit table capturing \`timestamp\`, \`user_uuid\`, \`old_state\`, \`new_state\`, \`action\`, and payload hashes.\n5. **Caching & Rate Limiting (Redis 7):** Sliding-window rate limits (100 req/min per IP) and session token bucket management.\n6. **Gemini AI Role:** Domain-isolated borrower document guidance and FAQ support with an offline circuit-breaker fallback.`;
    }

    // CredVidhi Component Drill-Down (Multi-turn follow-up)
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      (/second\s+component|component\s+2|underwriting\s+engine/i.test(query) ||
        (analysis.intent === 'FOLLOW_UP' && /second/i.test(query)))
    ) {
      return `### CredVidhi: Deterministic Underwriting Engine (Component 2)\n\nThe **Deterministic Underwriting Engine** is the core credit evaluation component of CredVidhi:\n\n1. **Fixed-Point Precision Math:**\n   - Evaluates Debt-to-Income (DTI) and monthly compound installments ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) using integer-scaled arithmetic (paisa/INR) rather than standard IEEE-754 floats to eliminate fractional rounding drift.\n2. **Rule-Based Eligibility Tiers:**\n   - Evaluates monthly income, existing debt commitments, and credit scores against institutional risk matrices.\n3. **FSM Enforcement:**\n   - Feeds scoring verdicts directly into the 6-state forward-only Finite State Machine, ensuring unverified or high-risk applications never enter \`APPROVED\` status.`;
    }

    // CredVidhi Technology Stack
    if (analysis.targetProject === "credvidhi" && /technolog|tech|stack|use/i.test(query)) {
      return `### CredVidhi Technology Stack\n\nCredVidhi is engineered using the following production-grade stack:\n\n- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, and accessible UI patterns.\n- **Backend Gateway:** Python FastAPI with asynchronous endpoints and strict Pydantic v2 data validation.\n- **Database:** PostgreSQL 16 with an append-only cryptographic ledger for ACID state transitions.\n- **In-Memory Cache & Rate Limiting:** Redis 7 for sliding-window token bucket rate limiting and session management.\n- **AI & Underwriting:** Google Gemini API for guided document processing, alongside fixed-point INR mathematical underwriting formulas.`;
    }

    // 5b. CredVidhi General Overview & Selection Follow-Up
    if (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) {
      const isIntroFollowUp = /\b(anyone|any\s*one|either|one)\s+of\s+them\b/i.test(query);
      const prefix = isIntroFollowUp
        ? "I'll explain **CredVidhi**, Aman Mishra's flagship fintech underwriting platform from the projects mentioned (let me know if you would prefer KaushalNexus or Bodhi Sakha instead):\n\n"
        : "";
      return `${prefix}### CredVidhi — Enterprise Loan Processing & Deterministic Underwriting Platform\n\n**CredVidhi** is an institutional digital lending and credit underwriting platform built for retail lending, NBFCs, and banks:\n\n1. **Deterministic Underwriting Engine:** Zero-drift fixed-point arithmetic in INR (₹) calculating compound EMI ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) and Debt-to-Income (DTI) without floating-point rounding errors.\n2. **6-Stage Finite State Machine:** Non-reversible lifecycle: \`Draft → Submitted → Under Review → Approved → Disbursed\` (with terminal \`Rejected\` and intermediate \`Discrepancy\` states) enforced inside PostgreSQL ACID transaction boundaries.\n3. **KYC Verification Workbench:** Side-by-side visual document inspection interface for loan officers with discrepancy triage.\n4. **Append-Only Ledger (PostgreSQL 16):** Cryptographic immutable audit table tracking every state change, actor ID, and underwriting decision.\n5. **High-Throughput Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Python FastAPI, PostgreSQL 16, Redis 7, and Google Gemini AI.\n\n*Live Platform: [credvidhi.vercel.app](https://credvidhi.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/CredVidhi)*`;
    }

    // 5c. KaushalNexus Detailed Explanation
    if (analysis.targetProject === 'kaushal-nexus' || /kaushalnexus|kaushal/i.test(query)) {
      return `### KaushalNexus — Employment & Skilling Intelligence Platform\n\n**KaushalNexus** is Aman Mishra's Smart India Hackathon (SIH) 2026 flagship platform built for Problem Statement 135 (Youth Employability & Skilling Intelligence):\n\n1. **Longitudinal Learner Tracking:** Tracks student progression across modular vocational skill milestones and coursework completions.\n2. **AI Skill Gap Diagnostics:** Uses the Google Gemini API to analyze candidate competencies against dynamic employer skill vectors and generate concrete intervention roadmaps.\n3. **District Analytics Dashboard:** Real-time administrative metrics tracking regional employment indicators, demand spikes, and vocational training throughput.\n4. **ML Opportunity Matching:** Matches learner technical competency vectors with verified internships and job opportunities.\n5. **Tech Stack:** React 19, TypeScript, Python FastAPI asynchronous microservices, PostgreSQL 16, Redis 7 caching, and Google Gemini AI.\n\n*Live Platform: [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/Kaushal-Nexus)*`;
    }

    // 5d. Bodhi Sakha Detailed Explanation
    if (analysis.targetProject === 'gemini-ai-chatbot' || /bodhi\s*sakha|bodhi/i.test(query)) {
      return `### Bodhi Sakha (बोधिसखा) — Full-Stack Conversational AI Assistant\n\n**Bodhi Sakha** is a production-grade conversational AI assistant engineered by Aman Mishra:\n\n1. **Real-Time Streaming Dialogue:** Low-latency token-by-token response streaming using Server-Sent Events (SSE) and Google Gemini SDK.\n2. **Deep Thinking Reasoning Mode:** Dedicated analytical reasoning mode with step-by-step problem deconstruction.\n3. **Serverless Document Ingestion:** Extracts and grounds context from uploaded PDF, DOCX, and TXT files using serverless document parsers.\n4. **KaTeX Math & Markdown Rendering:** Full LaTeX mathematical equation formatting alongside Markdown.\n5. **Multi-User Session Persistence:** Session tracking and conversation history in PostgreSQL.\n\n*Live Platform: [bodhi-sakha-phi.vercel.app](https://bodhi-sakha-phi.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/bodhi-sakha)*`;
    }

    // 5e. LeetCode Problem Solving Detailed Explanation
    if (analysis.targetProject === 'leetcode-solutions' || /leetcode/i.test(query)) {
      return `### LeetCode Problem Solving & Algorithmic Foundations\n\nAman Mishra has solved **205+ algorithmic problems on LeetCode** implemented predominantly in **Modern C++ (C++17/20)**:\n\n- **Algorithmic Domains:** Tree/Graph Traversals (DFS, BFS, Dijkstra's), Dynamic Programming (1D/2D memoization), Monotonic Stacks, Two Pointers, and Binary Search.\n- **Engineering Discipline:** Strict asymptotic Big-O runtime and space bounds, utilizing C++ STL cache locality (\`std::vector\`, \`std::priority_queue\`, \`std::unordered_map\`) for minimal memory allocation overhead.\n\n*LeetCode Profile: [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/) | Repository: [GitHub](https://github.com/calligraphyguruji/LeetCode-Questions)*`;
    }

    // 5f. Frontend Architecture Clones Detailed Explanation
    if (analysis.targetProject === 'amazon-clone' || /amazon.*clone/i.test(query)) {
      return `### Frontend Architecture Clones — Amazon & YouTube\n\nAman Mishra engineered production-grade web clones to master core browser fundamentals, state synchronization, and DOM performance without third-party frameworks:\n\n1. **Amazon E-Commerce Clone:** Multi-page client architecture with product catalog generation, dynamic cart quantity counters, checkout review, and package delivery status tracking in vanilla JavaScript (ES6+), HTML5, and modular CSS Grid/Flexbox.\n2. **YouTube Web Clone:** High-fidelity layout engineering replicating YouTube's sidebar navigation, responsive video grid auto-fit columns, and video playback views.\n\n*Live: [Amazon Clone on Vercel](https://myecommerce-project-clone.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/amazon-clone)*`;
    }

    // Dijkstra's Shortest Path Algorithm
    if (/dijkstra/i.test(qLower)) {
      return `### Dijkstra's Shortest Path Algorithm\n\n**Dijkstra's Algorithm** finds the shortest path from a single source vertex to all other vertices in a weighted directed/undirected graph with **non-negative edge weights**.\n\n#### Complexity:\n- **Time Complexity:** $\\mathcal{O}((V + E) \\log V)$ using a min-priority queue (binary heap).\n- **Space Complexity:** $\\mathcal{O}(V + E)$ for adjacency list and distance array.\n\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <queue>\n#include <limits>\n\nusing namespace std; \n\ntypedef pair<int, int> pii; // {distance, vertex}\n\nvector<int> dijkstra(int n, const vector<vector<pii>>& adj, int src) {\n    vector<int> dist(n, numeric_limits<int>::max());\n    priority_queue<pii, vector<pii>, greater<pii>> pq;\n\n    dist[src] = 0;\n    pq.push({0, src});\n\n    while (!pq.empty()) {\n        auto [d, u] = pq.top();\n        pq.pop();\n\n        if (d > dist[u]) continue;\n\n        for (const auto& [v, weight] : adj[u]) {\n            if (dist[u] + weight < dist[v]) {\n                dist[v] = dist[u] + weight;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}\n\`\`\``;
    }

    // Direct resolution for general technical / computer science questions
    if (analysis.intent === "TECHNICAL_QUERY" || /what is rag|retrieval-augmented generation/i.test(query)) {
      if (/rag|retrieval[-\s]augmented/i.test(query)) {
        return `### What is RAG (Retrieval-Augmented Generation)?\n\n**Retrieval-Augmented Generation (RAG)** is an AI architecture that enhances Large Language Models (LLMs) by retrieving authoritative, domain-specific documents from an external knowledge base before generating a response.\n\n#### How RAG Works:\n1. **Ingestion & Indexing:** Documents are split into semantic chunks and embedded into high-dimensional vectors stored in a vector database.\n2. **Retrieval:** When a user asks a question, the system computes the query's embedding and performs similarity search (e.g., Cosine Similarity, HNSW) to retrieve the most relevant knowledge chunks.\n3. **Augmentation:** The retrieved context chunks are inserted into the LLM system prompt alongside strict grounding instructions.\n4. **Generation:** The model produces an accurate, verifiable answer strictly citing the retrieved sources, preventing hallucinations.\n\n*In this portfolio, Mantri uses a local hybrid RAG pipeline combining lexical BM25-style keyword matching, vector similarity, and Reciprocal Rank Fusion (RRF).*`;
      }

      if (/vector (database|store|db)/i.test(query)) {
        return `### What is a Vector Database?\n\nA **Vector Database** is a specialized data storage system designed to index, store, and query high-dimensional vector embeddings generated by machine learning models.\n\n- **Core Mechanism:** Unlike relational databases that match exact scalar values, vector databases find semantic similarity using distance metrics (Cosine Similarity, Euclidean distance, Dot Product) and approximate nearest neighbor (ANN) indexing algorithms such as HNSW (Hierarchical Navigable Small World).\n- **Use Cases:** Semantic search, Retrieval-Augmented Generation (RAG), recommendation systems, and multimodal similarity matching.`;
      }

      if (/binary search/i.test(query)) {
        return `### Binary Search Algorithm\n\n**Binary Search** is an efficient divide-and-conquer search algorithm that finds the position of a target value within a **sorted array** in logarithmic time: $\\mathcal{O}(\\log N)$.\n\n#### Complexity:\n- **Time Complexity:** $\\mathcal{O}(\\log N)$ worst and average case, $\\mathcal{O}(1)$ best case.\n- **Space Complexity:** $\\mathcal{O}(1)$ iterative, $\\mathcal{O}(\\log N)$ recursive.\n\n\`\`\`cpp\nint binarySearch(const std::vector<int>& arr, int target) {\n    int low = 0, high = static_cast<int>(arr.size()) - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\`\`\``;
      }

      if (/process (vs|and|versus) thread/i.test(query)) {
        return `### Process vs. Thread\n\n| Attribute | Process | Thread |\n| :--- | :--- | :--- |\n| **Definition** | An independent executing program in memory | The smallest unit of CPU execution within a process |\n| **Address Space** | Has its own isolated virtual memory address space | Shares the address space, code, and data with peer threads |\n| **Creation Overhead** | High (fork/exec, page tables allocated) | Low (lightweight, shares process resources) |\n| **Communication** | Inter-Process Communication (IPC: pipes, sockets, shared memory) | Direct memory access (requires synchronization like mutexes/locks) |\n| **Fault Isolation** | High (a crashing process doesn't directly crash others) | Low (an unhandled exception in one thread can terminate the whole process) |`;
      }
    }

    if (retrievedResults.length === 0) {
      return `I couldn't locate specific documentation matching that request in Aman Mishra's verified portfolio. You can ask about his flagship projects (**CredVidhi**, **KaushalNexus**, **Bodhi Sakha**), technical skills (modern C++, React 19, FastAPI, PostgreSQL), or download his resume.`;
    }

    const nonIdentityChunks = retrievedResults.filter((r) => r.chunk.documentId !== 'mantri-identity');
    const topChunk = (nonIdentityChunks.length > 0 ? nonIdentityChunks[0] : retrievedResults[0]).chunk;

    return `Based on Aman Mishra's verified portfolio documentation:\n\n${topChunk.content.replace(/^\[.*?\]\n/, "")}\n\n*For further details, explore the dedicated case study at ${topChunk.url}.*`;
  }
};

// src/copilot/config/resumeConfig.ts
var RESUME_CONFIG = {
  filename: "Aman_Mishra_Resume.pdf",
  downloadUrl: "/Aman_Mishra_Resume.pdf",
  fallbackFilename: "resume.pdf",
  fallbackUrl: "/resume.pdf",
  title: "Aman Mishra \u2014 Resume",
  subtitle: "Software Development | Full-Stack | AI/ML",
  fileType: "PDF Document",
  fileSize: "63 KB",
  lastUpdated: "2026-10-14",
  description: "Verified ATS-friendly resume detailing C++ systems, React 19/TypeScript architecture, DSA, and full-stack projects."
};

// src/copilot/services/copilotOrchestrator.ts
var CopilotOrchestrator = class {
  chunks = [];
  retriever;
  geminiRouter;
  groqProvider;
  fallbackProvider;
  isGeminiActive = false;
  startTime = Date.now();
  constructor() {
    this.retriever = new HybridRetriever();
    this.initializeKnowledgeBase();
    this.geminiRouter = new GeminiModelRouter();
    this.isGeminiActive = this.geminiRouter.isConfigured();
    this.groqProvider = new GroqProvider();
    this.fallbackProvider = new DeterministicFallbackProvider();
  }
  initializeKnowledgeBase() {
    const allChunks = [];
    for (const doc of VERIFIED_KNOWLEDGE_DOCUMENTS) {
      const docChunks = chunkKnowledgeDocument(doc);
      allChunks.push(...docChunks);
    }
    this.chunks = allChunks;
    this.retriever.setChunks(this.chunks);
  }
  getHealth() {
    return {
      status: "healthy",
      version: "1.0.0",
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1e3),
      llmConfigured: this.isGeminiActive,
      primaryModel: this.geminiRouter.getPrimaryModel(),
      configuredModels: this.geminiRouter.getAllConfiguredModels(),
      groqConfigured: this.groqProvider ? this.groqProvider.isConfigured() : false,
      groqModel: this.groqProvider ? this.groqProvider.getModelName() : undefined,
      indexedChunks: this.chunks.length,
      features: {
        hybridRetrieval: true,
        recruiterMode: true,
        streaming: false,
        antiInjection: true,
        multiModelFailover: true,
        groqFallback: true
      }
    };
  }
  async handleChat(request) {
    const startTs = Date.now();
    const lastUserMessage = request.messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
    const nlpAnalysis = analyzeQuery(
      lastUserMessage,
      request.messages.slice(0, -1)
    );
    if (nlpAnalysis.isInappropriateOrInjection) {
      return {
        answer: "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?",
        intent: "PROMPT_INJECTION",
        citations: [],
        metadata: {
          model: "security-guard",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 0
        }
      };
    }
    if (nlpAnalysis.intent === "ASSISTANT_IDENTITY") {
      const isCapabilities = /what can you do|capabilities|what do you do|features/i.test(lastUserMessage);
      const answerText = isCapabilities
        ? MANTRI_IDENTITY.responses.capabilities
        : MANTRI_IDENTITY.responses.assistant;
      return {
        answer: answerText,
        intent: "ASSISTANT_IDENTITY",
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    if (nlpAnalysis.intent === "CREATOR_IDENTITY") {
      return {
        answer: MANTRI_IDENTITY.responses.creatorExact || MANTRI_IDENTITY.responses.creator,
        intent: "CREATOR_IDENTITY",
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    if (nlpAnalysis.intent === "OWNER_IDENTITY") {
      return {
        answer: MANTRI_IDENTITY.responses.owner,
        intent: "OWNER_IDENTITY",
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    if (nlpAnalysis.intent === "DEVELOPER_IDENTITY") {
      return {
        answer: MANTRI_IDENTITY.responses.developer,
        intent: "DEVELOPER_IDENTITY",
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    if (nlpAnalysis.intent === "PORTFOLIO_IDENTITY" || nlpAnalysis.intent === "PORTFOLIO_OVERVIEW") {
      return {
        answer: MANTRI_IDENTITY.responses.portfolio,
        intent: nlpAnalysis.intent,
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    if (nlpAnalysis.intent === "ASSISTANT_PURPOSE") {
      return {
        answer: MANTRI_IDENTITY.responses.purpose,
        intent: "ASSISTANT_PURPOSE",
        citations: [
          {
            sourceId: "mantri-identity-1",
            title: "Mantri - AI Portfolio Assistant Identity & Creator",
            section: "Identity",
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1
          }
        ],
        metadata: {
          model: "deterministic-identity",
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1
        }
      };
    }
    const retrievalStart = Date.now();
    const retrievedResults = this.retriever.retrieve(nlpAnalysis, void 0, 4);
    const retrievalLatency = Date.now() - retrievalStart;
    const citations = this.retriever.generateCitations(retrievedResults);
    let usedModel = "deterministic-fallback";
    let providerError = null;
    let answer = "";
    let attempts = 1;
    let failoverOccurred = false;
    let failoverReason = void 0;
    const diagnostics = [];

    if (this.isGeminiActive && process.env.AI_PROVIDER !== 'groq') {
      try {
        const routerRes = await this.geminiRouter.generateResponseWithTelemetry(
          lastUserMessage,
          retrievedResults,
          nlpAnalysis,
          request.messages
        );
        answer = routerRes.answer;
        usedModel = "gemini:" + routerRes.modelUsed;
        attempts = routerRes.attempts;
        failoverOccurred = routerRes.failoverOccurred;
        failoverReason = routerRes.failoverReason;
      } catch (err) {
        providerError = err?.message || String(err);
        const diag = diagnoseGeminiFailure(err, this.geminiRouter.getPrimaryModel());
        diagnostics.push(diag);
        failoverOccurred = true;
        failoverReason = `${diag.category}: ${diag.reason}`;
        console.warn("[CopilotOrchestrator] Gemini router failed:", diag.category, diag.reason);

        // Invariant: Do not circumvent safety blocks by failing over to alternative LLM providers
        if (diag.category === 'SAFETY_BLOCKED') {
          return {
            answer: "I am unable to fulfill this request as the content triggered safety and responsible AI restrictions.",
            intent: nlpAnalysis.intent,
            targetProject: nlpAnalysis.targetProject,
            citations: [],
            metadata: {
              model: "gemini:" + this.geminiRouter.getPrimaryModel(),
              provider: "gemini",
              requestedModel: this.geminiRouter.getPrimaryModel(),
              attempts: 1,
              failoverOccurred: false,
              providerError: 'SAFETY_BLOCKED',
              diagnostics: [diag],
              retrievalLatencyMs: retrievalLatency,
              totalLatencyMs: Date.now() - startTs,
              retrievedCount: retrievedResults.length
            }
          };
        }
      }
    }

    if (!answer && this.groqProvider && this.groqProvider.isConfigured()) {
      try {
        const previousHistory = request.messages.slice(0, -1);
        const groqRes = await this.groqProvider.generateResponse(
          lastUserMessage,
          retrievedResults,
          nlpAnalysis,
          previousHistory
        );
        if (groqRes && groqRes.trim().length > 0) {
          answer = groqRes.trim();
          usedModel = "groq:" + this.groqProvider.getModelName();
          failoverOccurred = true;
          failoverReason = failoverReason || 'GEMINI_FAILOVER_TO_GROQ';
        }
      } catch (groqErr) {
        const rawErrMsg = String(groqErr?.message || groqErr);
        const sanitizedErr = rawErrMsg
          .replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')
          .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');
        console.warn("[CopilotOrchestrator] Groq fallback failed, engaging deterministic fallback:", sanitizedErr);
      }
    }

    if (!answer) {
      usedModel = this.isGeminiActive ? "deterministic-fallback" : "deterministic-offline-engine";
      answer = await this.fallbackProvider.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis
      );
    }
    let recruiterAlignment = void 0;
    if (nlpAnalysis.isRecruiterMode) {
      recruiterAlignment = {
        suitableRoles: ["SDE Intern", "Frontend Developer", "Full-Stack Developer"],
        keyStrengths: [
          "205+ LeetCode problems solved with C++ STL asymptotic performance",
          "Production-grade React 19 / TypeScript / Vite frontend systems",
          "FastAPI & PostgreSQL backend architecture with immutable state transitions"
        ],
        suggestedProjects: ["CredVidhi", "KaushalNexus", "Bodhi Sakha"],
        caveats: ["Candidate is an undergraduate student (Batch 2025\u20132029) seeking internship/co-op positions."]
      };
    }
    let mermaidDiagram = void 0;
    if (nlpAnalysis.intent === "PROJECT_ARCHITECTURE" && nlpAnalysis.targetProject === "credvidhi") {
      mermaidDiagram = `graph TD
  Client[React 19 Client] -->|HTTPS / REST| Gateway[FastAPI Gateway]
  Gateway -->|Schema Validation| Pydantic[Pydantic v2 Contract]
  Gateway -->|Rate Limit Check| Redis[(Redis 7)]
  Gateway -->|ACID State Transition| FSM[Finite State Machine]
  FSM -->|Append-Only Audit| Postgres[(PostgreSQL 16 Ledger)]
  Gateway -->|Guarded FAQ| Gemini[Google Gemini AI]`;
    }
    let resumeCard = void 0;
    if (nlpAnalysis.intent === "RESUME_REQUEST") {
      resumeCard = {
        title: RESUME_CONFIG.title,
        subtitle: RESUME_CONFIG.subtitle,
        filename: RESUME_CONFIG.filename,
        downloadUrl: RESUME_CONFIG.downloadUrl,
        fileSize: RESUME_CONFIG.fileSize,
        isAvailable: true
      };
    }
    return {
      answer,
      intent: nlpAnalysis.intent,
      targetProject: nlpAnalysis.targetProject,
      citations,
      recruiterAlignment,
      mermaidDiagram,
      resumeCard,
      metadata: {
        model: usedModel,
        provider: usedModel.split(':')[0],
        requestedModel: this.geminiRouter.getPrimaryModel(),
        attempts,
        failoverOccurred,
        failoverReason,
        diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
        providerError: providerError ? providerError.split(':')[0] : undefined,
        retrievalLatencyMs: retrievalLatency,
        totalLatencyMs: Date.now() - startTs,
        retrievedCount: retrievedResults.length
      }
    };
  }
};
var copilotOrchestrator = new CopilotOrchestrator();

// api/copilot.server.ts
var rateLimitMap = /* @__PURE__ */ new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.expiresAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 5 * 60 * 1e3 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count += 1;
  return true;
}
async function handler(req, res) {
  const isAllowedOrigin = (origin) => !origin || origin.endsWith("calligraphyguruji.dev") || origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1");
  const incomingOrigin = req.headers?.origin || "";
  const corsOrigin = isAllowedOrigin(incomingOrigin) && incomingOrigin ? incomingOrigin : "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  try {
    if (req.method === "GET") {
      const health = copilotOrchestrator.getHealth();
      return res.status(200).json(health);
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const forwardedFor = req.headers?.["x-forwarded-for"];
    const clientIp = (typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "") || req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "127.0.0.1";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment before sending more queries."
      });
    }
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: "Invalid request: messages array is required." });
    }
    const lastMsg = body.messages[body.messages.length - 1];
    if (typeof lastMsg.content !== "string" || lastMsg.content.trim().length === 0) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }
    if (lastMsg.content.length > 800) {
      lastMsg.content = lastMsg.content.slice(0, 800);
    }

    // Proxy to self-hosted inference backend if configured
    const backendUrl = process.env.MANTRI_BACKEND_URL;
    if (backendUrl) {
      try {
        const proxyRes = await fetch(`${backendUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          return res.status(200).json(proxyData);
        }
      } catch (proxyErr) {
        console.warn('[Mantri Vercel Proxy] Remote backend unreachable, engaging fallback:', proxyErr);
      }
    }

    const response = await copilotOrchestrator.handleChat(body);
    return res.status(200).json(response);
  } catch (err) {
    console.error("[Mantri API Error]:", err);
    return res.status(500).json({
      error: err?.message || "Server error"
    });
  }
}
export {
  handler as default
};
