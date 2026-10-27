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
     │     • Primary: gemini-2.0-flash / gemini-flash-latest       │
     │     • Configurable Fallbacks: gemini-flash-lite-latest,     │
     │       gemini-1.5-flash, gemini-1.5-pro                      │
     │     • Centralized circuit breaker & cooldown window         │
     │  2. Secondary: Official Groq API Fallback Provider          │
     │     • Low-latency inference powered by `groq-sdk`           │
     │     • Dynamic discovery: llama-3.3-70b-versatile,           │
     │       llama-3.1-8b-instant, open-source models              │
     │     • Auto-triggered on Gemini 404, 401/403, 429, timeouts, │
     │       or 5xx upstream failures                              │
     │  3. Tertiary: Local Ollama Daemon (llama3.2:3b / mistral)   │
     │  4. Grounded Local Fallback: Deterministic Knowledge Engine │
     │     • Zero hallucination, BM25 + lexical chunk synthesis   │
     │     • Live widget badges: Gemini • Connected, Groq •        │
     │       Fallback active, or Knowledge Engine                  │
     │     • Zero raw stack traces or leaked API-key error strings │
     └─────────────────────────────────────────────────────────────┘
```

#### 🔑 Dynamic Multi-Provider AI Architecture (Gemini, Groq, Ollama)
Mantri features an intelligent, provider-independent model discovery and dynamic switching system:

1. **Minimal Configuration (API Keys Only):**
   - **No Hardcoded Priority:** Models and providers are discovered dynamically via official provider endpoints (`models.list()`). No `PRIMARY_MODEL`, `SECONDARY_MODEL`, or `FALLBACK_MODEL` environment variables are required.
   - **Google Gemini:** Set `GEMINI_API_KEY` to enable Gemini text-generation models dynamically.
   - **Groq Cloud:** Set `GROQ_API_KEY` to enable Groq models dynamically.
   - **Local Ollama:** Set `OLLAMA_BASE_URL` (optional, defaults to `http://localhost:11434`) for local zero-network inference.
2. **Environment Variables:** Add to your `.env` (or Vercel / server environment):
   ```bash
   # Provider API Keys — Keys alone enable the corresponding provider
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key

   # Optional local fallback endpoint
   OLLAMA_BASE_URL=http://localhost:11434
   ```
3. **Dynamic Model Discovery (`ModelDiscoveryService`):**
   - Discovers available models via provider APIs (`aiClient.models.list()`, `groq.models.list()`, `/api/tags`).
   - Filters out embedding-only, image, audio, and unsupported models.
   - Caches discovery results in-memory with a 15-minute TTL.
   - Automatically invalidates candidate models upon encountering HTTP 404 (Model Not Found), triggering immediate discovery refresh.
4. **Intelligent Dynamic Selection (`DynamicModelSelector` & `ModelHealthTracker`):**
   - Evaluates candidates dynamically using Laplace-smoothed reliability scoring: $\text{reliability} = \frac{S + 1}{S + F + 1}$.
   - Applies consecutive-failure penalties and dynamic latency bonuses.
   - Tracks error classifications: `AUTH_OR_PERMISSION_ERROR`, `MODEL_NOT_FOUND`, `RATE_LIMIT_OR_QUOTA`, `SERVER_ERROR`, `TIMEOUT`, `MALFORMED_OUTPUT`, and `SAFETY_BLOCKED`.
   - Enforces dynamic exponential backoff and respects HTTP `Retry-After` headers on 429 rate limits.
   - Prevents invalid API keys or offline providers from failing healthy providers.
5. **Adaptive Multi-Provider Failover (`AdaptiveAIRouter`):**
   - Cycles through discovered candidates up to a bounded retry limit (`maxAttempts = 4`).
   - If a Gemini model fails or is rate-limited, Mantri automatically fails over to other compatible models or Groq without dropping conversational history or RAG context.
   - Invariant: Safety blocks (`SAFETY_BLOCKED`) are never circumvented by switching providers.
   - Terminal State: If all providers fail or are unconfigured, returns an honest diagnostic error with `isError: true` without fabricating artificial responses.

### 🧠 Complete Capabilities & Technical Invariants
1. **Adaptive AI Router (`AdaptiveAIRouter`):** Unified multi-provider engine integrating dynamic discovery, latency and health tracking, streaming support, and bounded retries across Gemini, Groq, and Ollama.
2. **Dynamic Model Discovery (`ModelDiscoveryService`):** Provider adapters discovering text-generation models with TTL caching and automated 404 cache invalidation.
3. **Model Health Tracker (`ModelHealthTracker`):** Real-time error categorization, consecutive failure penalties, and cooldown management (handling 429 Retry-After, 5xx server backoff).
4. **Persistent Conversation Memory (`conversationMemory`):** Embedded SQLite database (`node:sqlite`) with WAL mode tracking multi-turn conversation threads, message timestamps, automated PII/key redaction, and contextual follow-up pronoun resolution (`"it"`, `"the second component"`).
5. **Controlled Tool Registry (`toolRegistry`):** Sandboxed tool execution platform featuring an AST-based mathematical calculation parser (zero `eval()` / script injection risk), IST datetime resolver, and project metadata inspector.
6. **Hybrid RAG Pipeline (`HybridRetriever`):** Combines exact word-boundary lexical matching with cosine vector embeddings using Reciprocal Rank Fusion ($RRF = \sum \frac{1}{k + rank}$) to synthesize verified citations without hallucination.
7. **Incremental SHA-256 Vector Cache (`localVectorStore`):** Document chunks are fingerprinted with SHA-256 hashes so unchanged documents reuse existing embeddings instantly on boot.
8. **Strict Identity & Anti-Leakage Invariant:** High-priority NLP classification intercepts identity queries ("Who are you?", "Who built you?", "What can you do?") and returns verified author identity (**Aman Mishra**) without hallucinating model creators or leaking unrelated project URLs.
9. **Question-Driven Intent Routing & RAG Relevance Isolation:** Dedicated intent detection (`PROJECT_LIST`, `PROJECT_ARCHITECTURE`, `TECHNICAL_SKILLS`, `EDUCATION`, `INTERNSHIP`, `CODING_QUESTION`, `TECHNICAL_QUERY`) with plural stemming regex matching. Non-identity queries (e.g., `"explain projects"`, `"what technologies does Aman know"`) strictly isolate and answer the question without regurgitating creator intros, and filter out `mantri-identity` from retrieval and citations.
10. **Production UI Craft:** Complete KaTeX mathematical typesetting for algorithmic asymptotic notations ($\mathcal{O}((V + E) \log V)$), syntax-highlighted code blocks with 1-click clipboard copy, streaming response generation, Stop generation, and Retry buttons.
11. **Conversational Follow-Up & Contextual Query Rewriting (`contextResolver`):** Multi-turn conversational reasoning engine resolving distributive references (`"explain anyone of them"`, `"pick one"`), collective references (`"explain all of them"`), ordinals (`"the second one"`), subcomponent drill-downs (`"explain its second component"`, `"what about its backend?"`), and elaborations (`"tell me more"`). Resolves pronouns and references against verified project history (`CredVidhi`, `KaushalNexus`, `Bodhi Sakha`), injects contextual prompt framing, guarantees fallback chunk retrieval, and provides graceful clarification prompts for ambiguous context.

---

## 🛡️ Contact Form Hardening & Anti-Spam Architecture

The contact form is architected for secure, direct email delivery with multi-provider resilience (Resend primary, EmailJS fallback), Cloudflare Turnstile bot verification, honeypot traps, and sliding-window rate limiting.

`Visitor submission → Honeypot trap check → Cloudflare Turnstile siteverify → Content quality filter → Sliding-window rate limit & deduplication → Resend API (EmailJS fallback) → Direct delivery to Aman's inbox with visitor Reply-To`

Key security and resilience features:
- **Cloudflare Turnstile Server Verification:** Every submission validates the CAPTCHA token against Cloudflare's Siteverify API (`/turnstile/v0/siteverify`), rejecting invalid, expired, or replayed tokens.
- **Multi-Provider Failover:** Dispatches through Resend REST API with verified sender and visitor `reply_to`. Automatically falls back to EmailJS if configured.
- **Professional Quality Evaluator:** Rejects chat spam, keyboard smash, repetitive floods, and promotional text using semantic heuristics while accepting legitimate inquiries.
- **Rate Limiting & Deduplication:** Sliding-window rate limits (max 5 per IP/hr, max 3 per email/hr, 30s burst guard) and 15-minute SHA-256 duplicate message suppression.
- **Optional Database Persistence:** Neon PostgreSQL integration records accepted submissions and rate events if `DATABASE_URL` is configured, while gracefully falling back to in-memory protection if the database is offline.

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
# Configure contact verification per docs/contact-verification.md; preserve existing Turnstile values

# 4. Run automated test suite (196 tests across 25 suites covering dynamic switching, serverless pipeline, RAG, and security)
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
