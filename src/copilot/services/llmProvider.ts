import { GoogleGenAI } from '@google/genai';
import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import { MANTRI_IDENTITY, MANTRI_SYSTEM_PROMPT } from '../config/mantriIdentity.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history?: Array<{ role: string; content: string }>
  ): Promise<string>;
  generateEmbeddings?(texts: string[]): Promise<number[][]>;
  streamResponse?(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history?: Array<{ role: string; content: string }>
  ): AsyncIterable<string>;
}

export type LLMProvider = AIProvider;

/**
 * Official Google Gemini Provider
 * Powered by Google's official @google/genai SDK.
 */
export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private apiKey: string | null = null;
  private modelName: string;
  private aiClient: GoogleGenAI | null = null;
  private timeoutMs: number;

  constructor(
    apiKey?: string,
    modelName?: string,
    timeoutMs: number = AI_CONFIG.requestTimeoutMs
  ) {
    const rawKey =
      apiKey ||
      (typeof process !== 'undefined'
        ? process.env?.GEMINI_API_KEY || process.env?.GOOGLE_API_KEY
        : '') ||
      '';

    const trimmed = rawKey.trim();
    // Validate key is not an unconfigured template placeholder
    const isPlaceholder =
      !trimmed ||
      trimmed.length < 10 ||
      /^(your_|change_me|dummy|placeholder|none|null|undefined)/i.test(trimmed);

    this.modelName =
      modelName ||
      (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) ||
      'gemini-2.0-flash';

    this.timeoutMs = timeoutMs;

    if (!isPlaceholder) {
      this.apiKey = trimmed;
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GeminiProvider] Initialization error:', err);
        this.aiClient = null;
      }
    }
  }

  public isConfigured(): boolean {
    return this.apiKey !== null && this.aiClient !== null;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public getClient(): any {
    return this.aiClient;
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Helper to format conversation history & retrieved context into GoogleGenAI contents structure.
   */
  private formatContents(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Include recent multi-turn conversation history (bounded to last 8 turns)
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (!msg.content || typeof msg.content !== 'string') continue;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content.trim() }],
      });
    }

    // Assemble context blocks from RAG
    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });

    const contextText = contextBlocks.join('\n\n---\n\n');

    const promptSections: string[] = [];
    promptSections.push(`CRITICAL INSTRUCTION: Answer the USER QUESTION directly using the provided RETRIEVED PORTFOLIO CONTEXT. Do NOT introduce yourself, do NOT say "Aman Mishra built me" or give your assistant bio unless the user explicitly asks about who you are or who built you.`);
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
      promptSections.push(`RESOLVED CONVERSATIONAL CONTEXT:\nThe user is asking a follow-up referring to the preceding conversation. Resolved interpretation: "${analysis.resolvedQuery}". Answer directly about this resolved subject using the retrieved context.`);
    }
    promptSections.push(`USER QUESTION:\n${query}`);

    contents.push({
      role: 'user',
      parts: [{ text: promptSections.join('\n\n') }],
    });

    return contents;
  }

  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!this.aiClient || !this.apiKey) {
      throw new Error('GEMINI_NOT_CONFIGURED: Missing valid Gemini API key.');
    }

    const contents = this.formatContents(query, retrievedResults, analysis, history);

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: contents as any,
        config: {
          systemInstruction: MANTRI_SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 2048,
          abortSignal: abortController.signal,
        } as any,
      });

      clearTimeout(timeoutHandle);

      const candidateText = response.text;
      if (candidateText && candidateText.trim().length > 0) {
        return candidateText.trim();
      }

      return 'Mantri generated an empty response. Please retry your question.';
    } catch (err: any) {
      clearTimeout(timeoutHandle);

      if (abortController.signal.aborted || err?.name === 'AbortError') {
        throw new Error(`GEMINI_TIMEOUT: Request exceeded timeout of ${this.timeoutMs}ms.`);
      }

      const errMsg = String(err?.message || err);

      // Classify auth and permission errors first (e.g. 400 API key not valid, 401, 403, PERMISSION_DENIED)
      if (
        err?.status === 401 ||
        err?.status === 403 ||
        errMsg.includes('401') ||
        errMsg.includes('403') ||
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        errMsg.includes('PERMISSION_DENIED') ||
        (errMsg.includes('400') && errMsg.includes('API key'))
      ) {
        throw new Error('GEMINI_AUTH_ERROR: Invalid or unauthorized Gemini API key.');
      }
      if (
        err?.status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota')
      ) {
        throw new Error('GEMINI_QUOTA_ERROR: Rate limit or quota exceeded on Gemini API.');
      }
      if (
        err?.status === 404 ||
        errMsg.includes('404') ||
        errMsg.includes('NOT_FOUND') ||
        errMsg.includes('is not found')
      ) {
        throw new Error(`GEMINI_MODEL_ERROR: Model "${this.modelName}" not found or unsupported.`);
      }

      throw new Error(`GEMINI_API_ERROR: ${errMsg.replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')}`);
    }
  }

  public async *streamResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): AsyncIterable<string> {
    if (!this.aiClient || !this.apiKey) {
      throw new Error('GEMINI_NOT_CONFIGURED: Missing valid Gemini API key.');
    }

    const contents = this.formatContents(query, retrievedResults, analysis, history);

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const stream = await this.aiClient.models.generateContentStream({
        model: this.modelName,
        contents: contents as any,
        config: {
          systemInstruction: MANTRI_SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 2048,
          abortSignal: abortController.signal,
        } as any,
      });

      for await (const chunk of stream) {
        clearTimeout(timeoutHandle);
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const errMsg = String(err?.message || err).replace(/AIza[0-9A-Za-z\-_]{35}/g, '[REDACTED]');
      throw new Error(`GEMINI_STREAM_ERROR: ${errMsg}`);
    }
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Generate embeddings using zero-network deterministic vectors as baseline
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1000;
      }
      return vec;
    });
  }
}

/**
 * Deterministic Fallback Provider
 * Grounded fallback for offline development, missing API key, CI environments, and API outages.
 */
export class DeterministicFallbackProvider implements AIProvider {
  public readonly name = 'deterministic-fallback';

  public isConfigured(): boolean {
    return true;
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1000;
      }
      return vec;
    });
  }

  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    _history?: Array<{ role: string; content: string }>
  ): Promise<string> {
    const qLower = query.toLowerCase();

    // 0. Clarification for Ambiguous References
    if (analysis.requiresClarification && analysis.clarificationPrompt) {
      return analysis.clarificationPrompt;
    }

    // 1. Security & Prompt Injection
    if (analysis.intent === 'PROMPT_INJECTION' || analysis.isInappropriateOrInjection) {
      return "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?";
    }

    // 2. Identity Queries
    if (analysis.intent === 'ASSISTANT_IDENTITY') {
      const isCapabilities = /what can you do|capabilities|what do you do|features/i.test(query);
      return isCapabilities
        ? MANTRI_IDENTITY.responses.capabilities
        : MANTRI_IDENTITY.responses.assistant;
    }

    if (analysis.intent === 'CREATOR_IDENTITY') {
      return MANTRI_IDENTITY.responses.creatorExact || MANTRI_IDENTITY.responses.creator;
    }

    if (analysis.intent === 'OWNER_IDENTITY') {
      return MANTRI_IDENTITY.responses.owner;
    }

    if (analysis.intent === 'DEVELOPER_IDENTITY') {
      return MANTRI_IDENTITY.responses.developer;
    }

    if (analysis.intent === 'PORTFOLIO_IDENTITY' || analysis.intent === 'PORTFOLIO_OVERVIEW') {
      return MANTRI_IDENTITY.responses.portfolio;
    }

    if (analysis.intent === 'ASSISTANT_PURPOSE') {
      return MANTRI_IDENTITY.responses.purpose;
    }

    if (analysis.intent === 'CONTACT_QUERY') {
      return MANTRI_IDENTITY.responses.contact;
    }

    if (analysis.intent === 'ABOUT_AMAN') {
      return MANTRI_IDENTITY.responses.aboutAman;
    }

    if (analysis.intent === 'RESUME_REQUEST' || analysis.intent === 'RESUME') {
      return "Here's Aman Mishra's verified resume! You can download the PDF directly using the card below or preview it in your browser.";
    }

    if (analysis.intent === 'GENERAL_CONVERSATION' || analysis.intent === 'GREETING') {
      return "Hello! I am **Mantri**, Aman Mishra's AI portfolio assistant. How can I help you explore Aman's software engineering work, system architectures (like CredVidhi and KaushalNexus), or C++/React technical background today?";
    }

    if (analysis.intent === 'PROJECT_LIST') {
      return `### Aman Mishra's Featured Engineering Projects

Aman has engineered production-grade full-stack, systems, and AI applications:

1. **CredVidhi — Enterprise Loan Processing & Underwriting Platform**
   - **Stack:** React 19, TypeScript, FastAPI (Python), PostgreSQL 16, Redis 7, Google Gemini API.
   - **Highlights:** Fixed-point zero-drift mathematical underwriting engine, 6-state forward-only FSM, and append-only cryptographic audit ledger.
   - **Live Platform:** [credvidhi.vercel.app](https://credvidhi.vercel.app/)

2. **KaushalNexus — Intelligent Skilling & Labor Matching Platform (SIH 2026 Flagship)**
   - **Stack:** React 19, TypeScript, Express.js, PostgreSQL, Google Gemini AI.
   - **Highlights:** Real-time labor marketplace, skill gap diagnostics, district-level workforce analytics, and multilingual voice interfaces.
   - **Live Platform:** [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/)

3. **Bodhi Sakha — Full-Stack Generative AI Study Companion**
   - **Stack:** React 19, Express.js, Google Gemini API, KaTeX, Tailwind CSS.
   - **Highlights:** Real-time token streaming, multimodal document analysis, and formatted LaTeX equation rendering.

4. **LeetCode Problem Solving & Algorithmic Rigor**
   - **Focus:** 205+ problems solved with asymptotic C++ STL rigor ($O(N \\log N)$ sorting/heaps, $O(1)$ hash maps).

5. **Amazon & YouTube Production-Grade Clones**
   - **Stack:** React, TypeScript, Firebase, Tailwind CSS. Focus on complex state persistence and media feeds.

*Would you like an in-depth architectural breakdown of any specific project, such as CredVidhi's underwriting engine?*`;
    }

    if (analysis.intent === 'TECHNICAL_SKILLS') {
      return `### Aman Mishra's Technical Skillset & Tooling

- **Languages:** C++ (Modern C++17/20, STL), C, Java, Python 3.11+, JavaScript (ESNext), TypeScript 5, SQL, HTML5, CSS3.
- **Frontend Architecture:** React 18/19, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, WCAG 2.1 AA accessibility.
- **Backend & APIs:** FastAPI (Python), Express.js (Node.js), RESTful APIs, Pydantic v2 data contracts, SQLAlchemy ORM.
- **Databases & Caching:** PostgreSQL 16 (ACID ledgers, indexing), Redis 7 (sliding-window rate limiting), MongoDB, SQLite.
- **AI & Systems:** Google Gemini SDK, Retrieval-Augmented Generation (RAG), prompt guardrails, Scikit-Learn.
- **DevOps & Tooling:** Git, GitHub, Docker, Postman, Linux (bash/zsh), Vercel.`;
    }

    if (analysis.intent === 'EDUCATION') {
      return `### Education & Academic Background

- **Degree:** Bachelor of Technology (B.Tech) in Computer Science & Engineering (CSE)
- **Institution:** Noida Institute of Engineering and Technology (NIET), Greater Noida, Uttar Pradesh
- **Duration:** 2025 – 2029 (Undergraduate)
- **Current CGPA:** **9.38 / 10.0**
- **Academic Focus:** Data Structures & Algorithms, Object-Oriented Design, Operating Systems, Database Management Systems, and Software Engineering.`;
    }

    if (analysis.intent === 'INTERNSHIP' || analysis.intent === 'EXPERIENCE') {
      return `### Work Experience & Internships

**AI & ML Intern — Codomax Digital Solutions**
- **Duration:** 12 July 2026 – 12 August 2026 (1 month)
- **Key Deliverables:**
  - Integrated generative AI pipelines and Google Gemini LLM API into internal workflow prototypes.
  - Engineered automated data processing pipelines with Python (Pandas, NumPy).
  - Implemented structured JSON schema validation to guarantee deterministic outputs from LLMs.
  - Collaborated on prompt engineering and system instructions to minimize hallucinations.`;
    }

    if (analysis.intent === 'RECRUITER_EVALUATION') {
      return `### Candidate Evaluation: Aman Mishra

**Candidate Profile & Fit Summary:**
- **Target Roles:** SDE Intern, Frontend Engineer, Full-Stack Developer.
- **Education:** B.Tech in CSE at NIET Greater Noida (CGPA: 9.38, Batch 2025–2029).
- **Key Strengths:**
  * **Systems & Algorithms:** 205+ LeetCode problems solved with asymptotic C++ STL rigor ($O(N \\log N)$ heap/sorting, $O(1)$ amortized hash maps).
  * **Frontend Engineering:** React 19, TypeScript, Tailwind CSS, accessibility compliance.
  * **Full-Stack Execution:** End-to-end architectures in CredVidhi (FastAPI + PostgreSQL + Redis) and KaushalNexus (SIH 2026 Flagship).
  * **Work Experience:** AI & ML Intern at Codomax Digital Solutions.

*Note: Candidate is currently an undergraduate student seeking internship and junior engineering opportunities.*`;
    }

    // 3. Document Verification Failure in CredVidhi
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      /verification\s+fail|document\s+verification|fail/i.test(query)
    ) {
      return `### CredVidhi Document Verification & Failure Handling

In CredVidhi's underwriting workflow, document verification is governed by a strict, forward-only Finite State Machine (FSM):

1. **State Transition on Discrepancy:**
   - If KYC or financial document verification fails during loan officer inspection, the application transitions to either a **Discrepancy** state (requiring borrower document re-upload) or a terminal **Rejected** state.
   - The state machine strictly prevents skipping stages (e.g. applications cannot proceed to \`APPROVED\` without passing verification).

2. **ACID Ledger Audit Envelope:**
   - The failure event, rejection reason, officer UUID, and discrepancy payload hash are committed to PostgreSQL 16's append-only audit ledger.
   - Every mutation is non-destructive and fully auditable.

3. **Borrower Notification & Remediation:**
   - The client application renders specific discrepancy tags on the KYC workbench, prompting the borrower to remediate blurry or mismatched documents.`;
    }

    // 4. CredVidhi Architecture & FSM
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      (analysis.intent === 'PROJECT_ARCHITECTURE' || /architecture|state machine|data flow|fsm/i.test(query))
    ) {
      return `### CredVidhi System Architecture & Data Flow

CredVidhi is an institutional loan origination and deterministic credit underwriting platform:

1. **API Gateway (FastAPI):** Python FastAPI service with Pydantic v2 strict schema validation and JWT RBAC (Borrower, Loan Officer, Underwriter, Superadmin).
2. **Deterministic Underwriting Engine:** Fixed-point precision arithmetic in INR (₹) calculating compound EMI ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) and Debt-to-Income (DTI) without floating-point drift.
3. **Finite State Machine (FSM):** 6-stage forward-only lifecycle: \`Draft → Submitted → Under Review → Approved → Disbursed\` (with terminal \`Rejected\` and intermediate \`Discrepancy\` states) enforced inside PostgreSQL ACID transaction boundaries.
4. **Append-Only Ledger (PostgreSQL 16):** Cryptographic immutable audit table capturing \`timestamp\`, \`user_uuid\`, \`old_state\`, \`new_state\`, \`action\`, and payload hashes.
5. **Caching & Rate Limiting (Redis 7):** Sliding-window rate limits (100 req/min per IP) and session token bucket management.
6. **Gemini AI Role:** Domain-isolated borrower document guidance and FAQ support with an offline circuit-breaker fallback.`;
    }

    // 4b. CredVidhi Component Drill-Down (Multi-turn follow-up)
    if (
      (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) &&
      (/second\s+component|component\s+2|underwriting\s+engine/i.test(query) ||
        (analysis.intent === 'FOLLOW_UP' && /second/i.test(query)))
    ) {
      return `### CredVidhi: Deterministic Underwriting Engine (Component 2)

The **Deterministic Underwriting Engine** is the core credit evaluation component of CredVidhi:

1. **Fixed-Point Precision Math:**
   - Evaluates Debt-to-Income (DTI) and monthly compound installments ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) using integer-scaled arithmetic (paisa/INR) rather than standard IEEE-754 floats to eliminate fractional rounding drift.
2. **Rule-Based Eligibility Tiers:**
   - Evaluates monthly income, existing debt commitments, and credit scores against institutional risk matrices.
3. **FSM Enforcement:**
   - Feeds scoring verdicts directly into the 6-state forward-only Finite State Machine, ensuring unverified or high-risk applications never enter \`APPROVED\` status.`;
    }

    // 5. CredVidhi Technology Stack
    if (analysis.targetProject === 'credvidhi' && /technolog|tech|stack|use/i.test(query)) {
      return `### CredVidhi Technology Stack

CredVidhi is engineered using the following production-grade stack:

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, and accessible UI patterns.
- **Backend Gateway:** Python FastAPI with asynchronous endpoints and strict Pydantic v2 data validation.
- **Database:** PostgreSQL 16 with an append-only cryptographic ledger for ACID state transitions.
- **In-Memory Cache & Rate Limiting:** Redis 7 for sliding-window token bucket rate limiting and session management.
- **AI & Underwriting:** Google Gemini API for guided document processing, alongside fixed-point INR mathematical underwriting formulas.`;
    }

    // 5b. CredVidhi General Overview & Selection Follow-Up
    if (analysis.targetProject === 'credvidhi' || /credvidhi/i.test(query)) {
      const isIntroFollowUp = /\b(anyone|any\s*one|either|one)\s+of\s+them\b/i.test(query);
      const prefix = isIntroFollowUp
        ? "I'll explain **CredVidhi**, Aman Mishra's flagship fintech underwriting platform from the projects mentioned (let me know if you would prefer KaushalNexus or Bodhi Sakha instead):\n\n"
        : "";
      return `${prefix}### CredVidhi — Enterprise Loan Processing & Deterministic Underwriting Platform

**CredVidhi** is an institutional digital lending and credit underwriting platform built for retail lending, NBFCs, and banks:

1. **Deterministic Underwriting Engine:** Zero-drift fixed-point arithmetic in INR (₹) calculating compound EMI ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) and Debt-to-Income (DTI) without floating-point rounding errors.
2. **6-Stage Finite State Machine:** Non-reversible lifecycle: \`Draft → Submitted → Under Review → Approved → Disbursed\` (with terminal \`Rejected\` and intermediate \`Discrepancy\` states) enforced inside PostgreSQL ACID transaction boundaries.
3. **KYC Verification Workbench:** Side-by-side visual document inspection interface for loan officers with discrepancy triage.
4. **Append-Only Ledger (PostgreSQL 16):** Cryptographic immutable audit table tracking every state change, actor ID, and underwriting decision.
5. **High-Throughput Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Python FastAPI, PostgreSQL 16, Redis 7, and Google Gemini AI.

*Live Platform: [credvidhi.vercel.app](https://credvidhi.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/CredVidhi)*`;
    }

    // 5c. KaushalNexus Detailed Explanation
    if (analysis.targetProject === 'kaushal-nexus' || /kaushalnexus|kaushal/i.test(query)) {
      return `### KaushalNexus — Employment & Skilling Intelligence Platform

**KaushalNexus** is Aman Mishra's Smart India Hackathon (SIH) 2026 flagship platform built for Problem Statement 135 (Youth Employability & Skilling Intelligence):

1. **Longitudinal Learner Tracking:** Tracks student progression across modular vocational skill milestones and coursework completions.
2. **AI Skill Gap Diagnostics:** Uses the Google Gemini API to analyze candidate competencies against dynamic employer skill vectors and generate concrete intervention roadmaps.
3. **District Analytics Dashboard:** Real-time administrative metrics tracking regional employment indicators, demand spikes, and vocational training throughput.
4. **ML Opportunity Matching:** Matches learner technical competency vectors with verified internships and job opportunities.
5. **Tech Stack:** React 19, TypeScript, Python FastAPI asynchronous microservices, PostgreSQL 16, Redis 7 caching, and Google Gemini AI.

*Live Platform: [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/Kaushal-Nexus)*`;
    }

    // 5d. Bodhi Sakha Detailed Explanation
    if (analysis.targetProject === 'gemini-ai-chatbot' || /bodhi\s*sakha|bodhi/i.test(query)) {
      return `### Bodhi Sakha (बोधिसखा) — Full-Stack Conversational AI Assistant

**Bodhi Sakha** is a production-grade conversational AI assistant engineered by Aman Mishra:

1. **Real-Time Streaming Dialogue:** Low-latency token-by-token response streaming using Server-Sent Events (SSE) and Google Gemini SDK.
2. **Deep Thinking Reasoning Mode:** Dedicated analytical reasoning mode with step-by-step problem deconstruction.
3. **Serverless Document Ingestion:** Extracts and grounds context from uploaded PDF, DOCX, and TXT files using serverless document parsers.
4. **KaTeX Math & Markdown Rendering:** Full LaTeX mathematical equation formatting alongside Markdown.
5. **Multi-User Session Persistence:** Session tracking and conversation history in PostgreSQL.

*Live Platform: [bodhi-sakha-phi.vercel.app](https://bodhi-sakha-phi.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/bodhi-sakha)*`;
    }

    // 5e. LeetCode Problem Solving Detailed Explanation
    if (analysis.targetProject === 'leetcode-solutions' || /leetcode/i.test(query)) {
      return `### LeetCode Problem Solving & Algorithmic Foundations

Aman Mishra has solved **205+ algorithmic problems on LeetCode** implemented predominantly in **Modern C++ (C++17/20)**:

- **Algorithmic Domains:** Tree/Graph Traversals (DFS, BFS, Dijkstra's), Dynamic Programming (1D/2D memoization), Monotonic Stacks, Two Pointers, and Binary Search.
- **Engineering Discipline:** Strict asymptotic Big-O runtime and space bounds, utilizing C++ STL cache locality (\`std::vector\`, \`std::priority_queue\`, \`std::unordered_map\`) for minimal memory allocation overhead.

*LeetCode Profile: [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/) | Repository: [GitHub](https://github.com/calligraphyguruji/LeetCode-Questions)*`;
    }

    // 5f. Frontend Architecture Clones Detailed Explanation
    if (analysis.targetProject === 'amazon-clone' || /amazon.*clone/i.test(query)) {
      return `### Frontend Architecture Clones — Amazon & YouTube

Aman Mishra engineered production-grade web clones to master core browser fundamentals, state synchronization, and DOM performance without third-party frameworks:

1. **Amazon E-Commerce Clone:** Multi-page client architecture with product catalog generation, dynamic cart quantity counters, checkout review, and package delivery status tracking in vanilla JavaScript (ES6+), HTML5, and modular CSS Grid/Flexbox.
2. **YouTube Web Clone:** High-fidelity layout engineering replicating YouTube's sidebar navigation, responsive video grid auto-fit columns, and video playback views.

*Live: [Amazon Clone on Vercel](https://myecommerce-project-clone.vercel.app/) | Source: [GitHub](https://github.com/calligraphyguruji/amazon-clone)*`;
    }

    // 6. General Computer Science & Algorithms (Dijkstra, Binary Search, RAG)
    if (/dijkstra/i.test(qLower)) {
      return `### Dijkstra's Shortest Path Algorithm

**Dijkstra's Algorithm** finds the shortest path from a single source vertex to all other vertices in a weighted directed/undirected graph with **non-negative edge weights**.

#### Complexity:
- **Time Complexity:** $\\mathcal{O}((V + E) \\log V)$ using a min-priority queue (binary heap).
- **Space Complexity:** $\\mathcal{O}(V + E)$ for adjacency list and distance array.

\`\`\`cpp
#include <iostream>
#include <vector>
#include <queue>
#include <limits>

using namespace std;

typedef pair<int, int> pii; // {distance, vertex}

vector<int> dijkstra(int n, const vector<vector<pii>>& adj, int src) {
    vector<int> dist(n, numeric_limits<int>::max());
    priority_queue<pii, vector<pii>, greater<pii>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (const auto& [v, weight] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
\`\`\``;
    }

    if (/what is rag|retrieval-augmented generation/i.test(qLower)) {
      return `### What is RAG (Retrieval-Augmented Generation)?

**Retrieval-Augmented Generation (RAG)** is an AI architecture that enhances Large Language Models (LLMs) by retrieving authoritative, domain-specific documents from an external knowledge base before generating a response.

#### How RAG Works:
1. **Ingestion & Indexing:** Documents are split into semantic chunks and embedded into high-dimensional vectors stored in a vector database.
2. **Retrieval:** When a user asks a question, the system computes the query's embedding and performs similarity search (e.g., Cosine Similarity, HNSW) to retrieve the most relevant knowledge chunks.
3. **Augmentation:** The retrieved context chunks are inserted into the LLM system prompt alongside strict grounding instructions.
4. **Generation:** The model produces an accurate, verifiable answer strictly citing the retrieved sources, preventing hallucinations.

*In this portfolio, Mantri uses a local hybrid RAG pipeline combining lexical BM25-style keyword matching, vector similarity, and Reciprocal Rank Fusion (RRF).*`;
    }

    if (/binary search/i.test(qLower)) {
      return `### Binary Search Algorithm

**Binary Search** is an efficient divide-and-conquer search algorithm that finds the position of a target value within a **sorted array** in logarithmic time: $\\mathcal{O}(\\log N)$.

#### Complexity:
- **Time Complexity:** $\\mathcal{O}(\\log N)$ worst and average case, $\\mathcal{O}(1)$ best case.
- **Space Complexity:** $\\mathcal{O}(1)$ iterative, $\\mathcal{O}(\\log N)$ recursive.

\`\`\`cpp
int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = static_cast<int>(arr.size()) - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
\`\`\``;
    }

    // 7. Grounded Retrieval Fallback
    if (retrievedResults.length === 0) {
      return `I couldn't locate specific documentation matching that request in Aman Mishra's verified portfolio. You can ask about his flagship projects (**CredVidhi**, **KaushalNexus**, **Bodhi Sakha**), technical skills (modern C++, React 19, FastAPI, PostgreSQL), or download his resume.`;
    }

    const nonIdentityChunks = retrievedResults.filter((r) => r.chunk.documentId !== 'mantri-identity');
    const topChunk = (nonIdentityChunks.length > 0 ? nonIdentityChunks[0] : retrievedResults[0]).chunk;

    return `Based on Aman Mishra's verified portfolio documentation:\n\n${topChunk.content.replace(/^\[.*?\]\n/, '')}\n\n*For further details, explore the dedicated case study at ${topChunk.url}.*`;
  }
}
