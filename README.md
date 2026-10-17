# Aman Mishra — Software Developer Portfolio

<p align="center">
  <a href="https://calligraphyguruji.dev/">
    <img src="https://img.shields.io/badge/🌐_Live_Portfolio-calligraphyguruji.dev-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Portfolio"/>
  </a>
  <a href="https://github.com/calligraphyguruji">
    <img src="https://img.shields.io/badge/GitHub-calligraphyguruji-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile"/>
  </a>
  <a href="https://www.linkedin.com/in/calligraphygurji/">
    <img src="https://img.shields.io/badge/LinkedIn-Aman_Mishra-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
  <a href="https://leetcode.com/u/calligraphyguruji/">
    <img src="https://img.shields.io/badge/LeetCode-150+_Solved-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="LeetCode"/>
  </a>
</p>

<p align="center">
  <b>🔗 Experience the Live Application:</b> <a href="https://calligraphyguruji.dev/"><b>https://calligraphyguruji.dev</b></a>
</p>

---

## 📌 Overview

A high-performance personal developer portfolio engineered with an editorial aesthetic, modern typography contrast, fluid dark/light theming, and an interactive case study architecture. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

### ✨ Standout Features
- **Editorial Single-Line Typography:** Bold headline with outlined stroke (`AMAN`) and filled typography (`MISHRA`) matching minimalist editorial systems.
- **Interactive Cursor Spotlight Color Reveal:** The centerpiece portrait remains grayscale by default and dynamically reveals vibrant natural color strictly within the circular cursor spotlight on hover.
- **Mantri (Self-Hosted Local AI Portfolio Assistant):** Production-grade technical assistant integrated natively into the portfolio, powered by self-hosted local inference (**Ollama** with zero mandatory external API keys), persistent SQLite memory (`node:sqlite`), controlled tool execution (safe calculator, project metadata, diagnostics), SHA-256 incremental vector caching, hybrid retrieval (BM25 + vector similarity via Reciprocal Rank Fusion), rich GitHub-flavored markdown with LaTeX math ($...$ / $$...$$ via KaTeX), syntax-highlighted code blocks with clipboard copy, generation controls (Stop generation, Retry query), deterministic identity & resume card delivery, prompt injection defenses, Recruiter Evaluation mode, and verified source citations.
- **Dedicated Project Case Study Routing:** Direct navigation to clean URLs (`/projects/<id>`) detailing the problem statement, engineered solution, system architecture, key metrics, and technology stack.
- **Zero-Dependency SPA Routing & Vercel Clean URLs:** Powered by native browser history APIs and Vercel edge rewrite/redirect configuration (`vercel.json`), providing direct URL access, refresh handling, and permanent 301 redirects without server-side 404 errors.
- **Production Technical SEO & Structured Data:** Full Google Search Console compliance with XML sitemap (`/sitemap.xml`), robots.txt, dynamic OpenGraph/Twitter meta tags, and schema.org JSON-LD structured data (`Person`, `WebSite`, `SoftwareSourceCode`).
- **Hardened Anti-Spam Contact Architecture:** Production-grade security pipeline defending against bot spam and EmailJS quota exhaustion via Cloudflare Turnstile, invisible honeypot traps, client/server sliding-window rate limiting, and serverless isolation (`/api/contact`).
- **Modern SVG Vector Branding:** High-resolution, zero-loss AM monogram SVG favicon with dark background harmony, full W3C web manifest integration, and crisp cross-browser scaling.
- **Live Analytics:** Integrated with `@vercel/analytics` for privacy-first performance monitoring.

---

## 🤖 Mantri — Context-Aware AI Engineering Assistant & Hybrid LLM Architecture

Mantri is the production-grade, context-aware AI engineering assistant integrated natively into the portfolio. Mantri is powered by the **official Google Gemini API (`@google/genai`)** with a robust hybrid fallback pipeline (Gemini → Local Ollama → Deterministic Grounded Knowledge Engine), persistent SQLite memory (`node:sqlite`), controlled tool execution, and verified RAG retrieval.

```
                     ┌─────────────────────────────────────────────────────────────┐
                     │               React 19 / TypeScript UI Widget               │
                     │  • KaTeX LaTeX Math ($ / $$)     • Code Block Syntax Copy   │
                     │  • Token Streaming SSE / NDJSON  • Stop / Retry Generation  │
                     │  • Interactive Resume Card       • Strict Identity Display  │
                     └──────────────────────────────┬──────────────────────────────┘
                                                    │
                                                    ▼
                     ┌─────────────────────────────────────────────────────────────┐
                     │       Mantri Orchestrator & Multi-Stage NLP Pipeline         │
                     │  • Prompt Injection Firewall     • High-Priority Identity   │
                     │  • Pronoun Follow-up Resolution  • Safe Tool Dispatcher     │
                     └──────────────┬──────────────────────────────┬───────────────┘
                                    │                              │
                    ┌───────────────┴───────────────┐              │
                    ▼                               ▼              ▼
     ┌────────────────────────────┐  ┌────────────────────────────┐┌────────────────────────────┐
     │    Hybrid RAG Engine       │  │ Persistent SQLite Memory   ││ Controlled Tool Registry   │
     │ • BM25-style Lexical Match │  │ • node:sqlite DB storage   ││ • Recursive AST Calculator │
     │ • Dense Vector Similarity  │  │ • Multi-turn session logs  ││ • IST / UTC DateTime Tool  │
     │ • Reciprocal Rank Fusion   │  │ • PII & Secret Redaction   ││ • Project Metadata Lookup  │
     │ • SHA-256 Chunk Hash Cache │  │ • Contextual Entity Recall ││ • Health & Engine Diags    │
     └──────────────┬─────────────┘  └────────────────────────────┘└────────────────────────────┘
                    │
                    ▼
     ┌─────────────────────────────────────────────────────────────┐
     │              4-Tier Adaptive Inference Pipeline             │
     │  1. Primary: Multi-Model Google Gemini Router               │
     │     • Primary: gemini-2.5-flash (fast, multi-turn reasoning)│
     │     • Configurable Fallbacks: gemini-2.5-flash-lite,        │
     │       gemini-2.5-pro, gemini-3.8-flash                      │
     │     • Centralized circuit breaker & cooldown window         │
     │  2. Secondary: Official Groq API Fallback Provider          │
     │     • Low-latency inference powered by `groq-sdk`           │
     │     • Flagship: llama-3.3-70b-versatile (128k context)      │
     │     • Fast failover: llama-3.1-8b-instant                   │
     │     • Auto-triggered on Gemini 404, 401/403, 429, timeouts, │
     │       or 5xx upstream failures                              │
     │  3. Tertiary: Local Ollama Daemon (llama3.2:3b / mistral)   │
     │  4. Quaternary: Deterministic Grounded Knowledge Engine     │
     │     • Zero crashes, zero external network dependency        │
     └─────────────────────────────────────────────────────────────┘
```

### 🔑 Google Gemini & Groq Multi-Provider Configuration
Mantri utilizes official `@google/genai` and `groq-sdk` packages on the server/serverless layer with automated multi-model failover, error diagnosis, and circuit breaker protection:

1. **Obtain API Keys:**
   - **Google Gemini:** Get a key from [Google AI Studio](https://aistudio.google.com/).
   - **Groq:** Get a key from [Groq Console](https://console.groq.com/).
2. **Environment Variables:** Add to your `.env` (or Vercel / server environment):
   ```bash
   # Primary: Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_PRIMARY_MODEL=gemini-2.5-flash
   GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.5-pro,gemini-3.8-flash
   GEMINI_MAX_ATTEMPTS=4
   GEMINI_COOLDOWN_SECONDS=60
   REQUEST_TIMEOUT_MS=12000
   AI_PROVIDER=gemini

   # Fallback: Official Groq API
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   GROQ_FALLBACK_MODELS=llama-3.1-8b-instant
   GROQ_MAX_ATTEMPTS=2
   GROQ_COOLDOWN_SECONDS=60
   ```
3. **Security Invariant:** `GEMINI_API_KEY` and `GROQ_API_KEY` are read strictly on the server/serverless layer (`api/copilot.js` and `server/index.ts`). They are never prefixed with `VITE_`, logged, exposed in error diagnostics, or sent to the client.
4. **Automated Multi-Provider Failover Rules:**
   - **Gemini Model Failover:** Recoverable errors (429 Quota, 500/503 Server, Timeouts, 404 Model Not Found) place the failing model in cooldown (`GEMINI_COOLDOWN_SECONDS`) and cycle through configured Gemini fallbacks (`gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-3.8-flash`).
   - **Groq Provider Failover:** If all Gemini models fail, return HTTP 404 (model or endpoint not found), 401/403, 429 rate limit, or timeout, Mantri automatically invokes `GroqProvider` (`llama-3.3-70b-versatile`) with formatted RAG context, multi-turn history, and resolved entity references.
   - **Grounded Engine Fallback:** If Groq is unconfigured or encounters an API error, Mantri safely drops to the deterministic grounded knowledge engine without throwing raw SDK errors.

### 🧠 Complete Capabilities & Technical Invariants
1. **Multi-Model Gemini Router (`GeminiModelRouter`):** Centralized health tracking, latency telemetry, automatic multi-model failover (`gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.5-pro` → `gemini-3.8-flash`), and circuit breaker cooldowns.
2. **Official Groq Fallback Provider (`GroqProvider`):** Production-grade fallback leveraging `groq-sdk` with streaming and non-streaming support, prompt structuring with strict identity boundaries, resolved query injection, and API key redaction.
3. **Persistent Conversation Memory (`conversationMemory`):** Embedded SQLite database (`node:sqlite`) with WAL mode tracking multi-turn conversation threads, message timestamps, automated PII/key redaction, and contextual follow-up pronoun resolution (`"it"`, `"the second component"`).
4. **Controlled Tool Registry (`toolRegistry`):** Sandboxed tool execution platform featuring an AST-based mathematical calculation parser (zero `eval()` / script injection risk), IST datetime resolver, and project metadata inspector.
5. **Hybrid RAG Pipeline (`HybridRetriever`):** Combines exact word-boundary lexical matching with cosine vector embeddings using Reciprocal Rank Fusion ($RRF = \sum \frac{1}{k + rank}$) to synthesize verified citations without hallucination.
6. **Incremental SHA-256 Vector Cache (`localVectorStore`):** Document chunks are fingerprinted with SHA-256 hashes so unchanged documents reuse existing embeddings instantly on boot.
7. **Strict Identity & Anti-Leakage Invariant:** High-priority NLP classification intercepts identity queries ("Who are you?", "Who built you?", "What can you do?") and returns verified author identity (**Aman Mishra**) without hallucinating model creators or leaking unrelated project URLs.
8. **Question-Driven Intent Routing & RAG Relevance Isolation:** Dedicated intent detection (`PROJECT_LIST`, `PROJECT_ARCHITECTURE`, `TECHNICAL_SKILLS`, `EDUCATION`, `INTERNSHIP`, `CODING_QUESTION`, `TECHNICAL_QUERY`) with plural stemming regex matching. Non-identity queries (e.g., `"explain projects"`, `"what technologies does Aman know"`) strictly isolate and answer the question without regurgitating creator intros, and filter out `mantri-identity` from retrieval and citations.
9. **Production UI Craft:** Complete KaTeX mathematical typesetting for algorithmic asymptotic notations ($\mathcal{O}((V + E) \log V)$), syntax-highlighted code blocks with 1-click clipboard copy, streaming response generation, Stop generation, and Retry buttons.
10. **Conversational Follow-Up & Contextual Query Rewriting (`contextResolver`):** Multi-turn conversational reasoning engine resolving distributive references (`"explain anyone of them"`, `"pick one"`), collective references (`"explain all of them"`), ordinals (`"the second one"`), subcomponent drill-downs (`"explain its second component"`, `"what about its backend?"`), and elaborations (`"tell me more"`). Resolves pronouns and references against verified project history (`CredVidhi`, `KaushalNexus`, `Bodhi Sakha`), injects contextual prompt framing to Gemini and Groq, guarantees fallback chunk retrieval, and provides graceful clarification prompts for ambiguous context.

---

## 🛡️ Contact Form Hardening & Anti-Spam Architecture

To safeguard the free EmailJS sending quota (200 emails/month) against automated bot spam and malicious submission floods, the contact flow is decoupled from client-side direct EmailJS calls and routed through a hardened serverless pipeline:

```
[ Visitor / Client Form ]
         ↓
1. Client Honeypot Check (Silently drops bots if hidden trap field is populated)
         ↓
2. Client Cooldown (60s timer in localStorage to prevent rapid accidental clicks)
         ↓
3. Client Syntax Validation (Catches typos & malformed emails before network dispatch)
         ↓
[ POST /api/contact ] (Vercel Serverless Function)
         ↓
4. Server Honeypot Verification (Silently returns HTTP 200 without calling EmailJS)
         ↓
5. Server Input & Syntax Validation (Length limits & RFC compliance)
         ↓
6. Cloudflare Turnstile Cryptographic Bot Verification (Server-side siteverify)
         ↓
7. Multi-Factor Rate Limiting (Max 3/hour per IP, Max 3/hour per Email, 30s burst check)
         ↓
8. Duplicate Fingerprint Check (Detects identical resubmissions within 15 minutes)
         ↓
9. Professional Message Quality Filter (Blocks casual chat/slang spam, keyboard smash, repetitive words)
         ↓
10. ONLY THEN: EmailJS REST API Dispatch (Isolated server credentials)
         ↓
[ Aman's Inbox ]
```

### Security & Quality Guarantees:
- **Zero Exposed EmailJS Credentials:** `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `EMAILJS_PRIVATE_KEY` remain strictly server-side in Vercel environment variables.
- **Quota Shielding:** A request NEVER reaches EmailJS until honeypot, syntax, Turnstile bot verification, rate limits, duplicate checks, and message quality filters have ALL succeeded.
- **Stealth Honeypot:** Bots filling invisible fields receive a simulated HTTP 200, believing they succeeded, while 0 emails and 0 quota are consumed.
- **Professional Message Quality Scoring:** Rejects low-effort WhatsApp-style chat spam ("hi bro", "work hai bhai", "urgent work pls dm", "send me ur number"), keyboard smash ("asdfghjkl"), character floods ("aaaaaa"), excessive emojis ("🔥🔥🔥🔥🔥"), and all-caps shouting, while warmly accepting genuine Indian English and international inquiries ("Hello Aman, I came across your portfolio and wanted to discuss an internship opportunity").

---

## 🛠️ Core Tech Stack & Tools

| Domain | Technologies |
| :--- | :--- |
| **Programming Languages** | `C++`, `C`, `Java`, `Python`, `JavaScript (ES6+)` |
| **Frontend Frameworks & UI** | `React 18`, `Vite`, `Redux`, `Tailwind CSS`, `HTML5`, `CSS3` |
| **Backend & REST APIs** | `FastAPI`, `Node.js`, `Express.js`, `SQLAlchemy`, `RESTful APIs` |
| **Databases & In-Memory** | `PostgreSQL`, `MongoDB`, `Redis`, `MySQL`, `SQLite` |
| **AI / ML & Local LLM** | `Ollama (llama3.2:3b)`, `Hybrid RAG (BM25 + Cosine RRF)`, `node:sqlite Memory`, `KaTeX Math`, `Google Gemini AI` |
| **DevOps & Platforms** | `Docker`, `Git`, `GitHub`, `Postman`, `Linux`, `Vercel` |

---

## 📂 Featured Projects & Case Studies

Each project includes interactive case study documentation accessible directly by clicking the project preview cards on the live portfolio:

### 1. 💼 [KaushalNexus](https://calligraphyguruji.dev/#/project/kaushal-nexus) — Employment & Skilling Outcomes Platform
* **Badge:** `SIH 2026 FLAGSHIP`
* **Overview:** A national-scale skilling intelligence platform engineered for Smart India Hackathon 2026 (Problem Statement 135). Features longitudinal learner tracking, AI skill gap diagnostics via Google Gemini, district analytics, and ML job matching.
* **Architecture Experience:** Features an interactive Archify-powered multi-view architecture experience with SVG diagrams, component trust boundary inspection, Bayesian Knowledge Tracing (BKT) engine pipeline trace, and multi-signal matching sequence.
* **Tech Stack:** `React 19`, `FastAPI`, `PostgreSQL`, `Redis`, `Gemini AI`, `Tailwind CSS`, `TypeScript`
* **Live App:** [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/Kaushal-Nexus](https://github.com/calligraphyguruji/Kaushal-Nexus)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/kaushal-nexus)

### 2. 💳 [CredVidhi](https://calligraphyguruji.dev/#/project/credvidhi) — Enterprise Loan Processing & Deterministic Underwriting Platform
* **Badge:** `LIVE ON VERCEL`
* **Overview:** An institutional digital loan processing and deterministic credit underwriting platform featuring automated KYC verification, mathematical DTI calculations, a 6-stage finite state machine, and immutable audit compliance.
* **Architecture Experience:** Features an interactive Archify-powered multi-view architecture experience with SVG diagrams, component trust boundary inspection, ACID transaction sequence trace, and forward-only FSM matrix analysis.
* **Tech Stack:** `React 19`, `TypeScript`, `FastAPI`, `Python 3.11`, `PostgreSQL 16`, `Redis 7`, `Tailwind CSS`, `Framer Motion`, `Google Gemini`
* **Live App:** [credvidhi.vercel.app](https://credvidhi.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/CredVidhi](https://github.com/calligraphyguruji/CredVidhi)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/credvidhi)

### 3. 🛒 [Amazon E-Commerce Clone](https://calligraphyguruji.dev/#/project/amazon-clone) — Multi-Page Architecture
* **Badge:** `LIVE ON VERCEL`
* **Overview:** A multi-page responsive e-commerce application inspired by Amazon, implementing dynamic catalog rendering, live cart state updates, checkout summary, order history, and package tracking in pure vanilla JavaScript and modular CSS.
* **Tech Stack:** `JavaScript (ES6+)`, `HTML5`, `CSS3 Grid & Flexbox`, `DOM APIs`, `Vercel`
* **Live Demo:** [myecommerce-project-clone.vercel.app](https://myecommerce-project-clone.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/amazon-clone](https://github.com/calligraphyguruji/amazon-clone)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/amazon-clone)

### 4. 🤖 [Gemini AI Chatbot](https://calligraphyguruji.dev/#/project/gemini-ai-chatbot) — Production Conversational AI Assistant
* **Badge:** `LIVE ON VERCEL`
* **Overview:** A full-stack, production-grade conversational AI assistant powered by Google Gemini API, featuring ultra-low-latency streaming responses, multi-format document analysis (PDF, DOCX, TXT), deep thinking reasoning mode, persistent multi-user chat sessions, and an accessible mobile-first interface.
* **Architecture Experience:** Features an interactive Archify-powered multi-view architecture experience with SVG diagrams, serverless Express streaming router trace, in-memory STEM RAG grounding, and model fallback cascade lifecycle.
* **Tech Stack:** `React 19`, `JavaScript (ES6+)`, `Google Gemini API`, `Express.js`, `Vite`, `PostgreSQL`, `KaTeX / Markdown`, `Vercel`
* **Live Demo:** [bodhi-sakha-phi.vercel.app](https://bodhi-sakha-phi.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/bodhi-sakha](https://github.com/calligraphyguruji/bodhi-sakha)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/gemini-ai-chatbot)

### 5. 🧩 [LeetCode Problem Solutions](https://calligraphyguruji.dev/#/project/leetcode-solutions) — 150+ C++ Solutions
* **Badge:** `150+ PROBLEMS SOLVED`
* **Overview:** A structured repository of 150+ optimized algorithmic solutions across core Data Structures & Algorithms (Trees, Graphs, DP, Linked Lists, Heaps) with Big-O time and space complexity breakdowns.
* **Tech Stack:** `C++`, `STL`, `Data Structures`, `Algorithms`, `Competitive Programming`
* **LeetCode Profile:** [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/)
* **Repository:** [github.com/calligraphyguruji/LeetCode-Questions](https://github.com/calligraphyguruji/LeetCode-Questions)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/leetcode-solutions)

### 6. 📺 [YouTube Web Clone](https://calligraphyguruji.dev/#/project/youtube-clone) — High-Fidelity UI
* **Badge:** `RESPONSIVE UI`
* **Overview:** A modern video streaming web application recreating YouTube's core interface patterns: category pill navigation, fluid video listing grid, responsive playback view, and channel metadata sidebar.
* **Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Responsive Grid`
* **Repository:** [github.com/calligraphyguruji/YouTube-Clone](https://github.com/calligraphyguruji/YouTube-Clone)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/youtube-clone)

---

## 💻 Local Development Setup

Clone the repository and run locally:

```bash
# 1. Clone repository
git clone https://github.com/calligraphyguruji/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
cp .env.example .env
# Set VITE_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, and EMAILJS_* credentials

# 4. Run automated test suite (82 tests across security, RAG, Ollama, identity routing, and architecture)
npm test

# 5. Start Mantri self-hosted AI engine backend
npm run server

# 6. Start local Vite frontend (in a separate terminal)
npm run dev

# 7. Create production build
npm run build

# 8. Preview production build locally
npm run preview
```

---

## 📬 Contact & Connect

- **Live Website:** [calligraphyguruji.dev](https://calligraphyguruji.dev/)
- **Email:** [amanmishra7774@gmail.com](mailto:amanmishra7774@gmail.com)
- **LinkedIn:** [linkedin.com/in/calligraphygurji](https://www.linkedin.com/in/calligraphygurji/)
- **GitHub:** [github.com/calligraphyguruji](https://github.com/calligraphyguruji)
- **LeetCode:** [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/)

---

## 📄 License

MIT License © [Aman Mishra](https://github.com/calligraphyguruji)
