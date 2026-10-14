import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import { MANTRI_IDENTITY, MANTRI_SYSTEM_PROMPT } from '../config/mantriIdentity.ts';

export interface LLMProvider {
  generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history?: Array<{ role: string; content: string }>
  ): Promise<string>;

  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

/**
 * Native, Zero-Dependency Google Gemini Provider
 * Calls official Google Gemini REST API directly using global fetch without heavy SDK dependencies.
 */
export class GeminiProvider implements LLMProvider {
  private apiKey: string | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-2.5-flash') {
    this.modelName = modelName;
    if (apiKey && apiKey.trim().length > 0) {
      this.apiKey = apiKey.trim();
    }
  }

  public isConfigured(): boolean {
    return this.apiKey !== null;
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    try {
      const embeddings: number[][] = [];
      for (const text of texts) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
          }),
        });

        if (!res.ok) {
          throw new Error(`Gemini embedding failed with status ${res.status}`);
        }

        const data = await res.json();
        const values = data.embedding?.values;
        if (values && Array.isArray(values)) {
          embeddings.push(values);
        } else {
          embeddings.push(new Array(768).fill(0));
        }
      }
      return embeddings;
    } catch (err) {
      console.error('[GeminiProvider] Embedding error:', err);
      throw err;
    }
  }

  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    // Assemble Context
    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });

    const contextText = contextBlocks.join('\n\n---\n\n');

    const systemInstruction = `${MANTRI_SYSTEM_PROMPT}

RESUME & ACTION-AWARE DELIVERY RULES:
- When a visitor requests Aman Mishra's resume or CV (e.g. "gimme resume", "give me your resume", "download CV", "share resume"), the application executes a deterministic action that delivers the verified PDF and renders a dedicated interactive Resume Card.
- Do NOT search the knowledge base for literal phrases such as "gimme resume".
- Respond warmly and professionally, pointing the visitor to the interactive resume card below to download or view the PDF.
- Example response: "Here's Aman Mishra's verified resume! You can download the PDF directly using the card below or preview it in your browser."

FORMATTING STANDARDS:
- Format responses using rich GitHub-flavored markdown.
- For algorithmic complexities or mathematics, use standard LaTeX ($O(N \\log N)$, $\\Omega(1)$, $\\mathcal{O}(V + E)$ inline, or $$...$$ for standalone equations).
- Use structured Markdown headings (###), ordered/unordered lists, and clean Markdown tables where comparisons or tabular data add clarity.
- When providing code snippets, always specify the language identifier (e.g., \`\`\`cpp, \`\`\`typescript, \`\`\`python) and write idiomatic, clean code.
`;

    const promptText = `
USER QUERY: ${query}
DETECTED INTENT: ${analysis.intent}
TARGET PROJECT: ${analysis.targetProject || 'None specified'}

RETRIEVED PORTFOLIO CONTEXT:
${contextText || 'No specific sources matched. Rely only on verified foundational portfolio data.'}

CONVERSATION HISTORY:
${history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Provide an accurate, grounded, helpful response:
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error (HTTP ${response.status}): ${errorData}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return candidateText || 'Unable to generate response from Gemini model.';
    } catch (err: unknown) {
      console.error('[GeminiProvider] Completion generation error:', err);
      throw err;
    }
  }
}

/**
 * Deterministic Fallback Provider (for offline development, CI tests, and API outages)
 */
export class DeterministicFallbackProvider implements LLMProvider {
  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Deterministic pseudo-embedding based on character n-grams for consistent local testing
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
    analysis: NLPAnalysis
  ): Promise<string> {
    if (analysis.intent === 'PROMPT_INJECTION') {
      return "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?";
    }

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

    if (analysis.intent === 'RESUME_REQUEST') {
      return "Here's Aman Mishra's verified resume! You can download the PDF directly using the card below or preview it in your browser.";
    }

    if (analysis.intent === 'RECRUITER_EVALUATION') {
      return `### Candidate Evaluation: Aman Mishra\n\n**Candidate Profile & Fit Summary:**\n- **Target Roles:** SDE Intern, Frontend Engineer, Full-Stack Developer.\n- **Education:** B.Tech in CSE at NIET Greater Noida (CGPA: 9.38, Batch 2025–2029).\n- **Key Strengths:**\n  * **Systems & Algorithms:** 205+ LeetCode problems solved with asymptotic C++ STL rigor ($O(N \\log N)$ heap/sorting, $O(1)$ amortized hash maps).\n  * **Frontend Engineering:** React 19, TypeScript, Tailwind CSS, accessibility compliance.\n  * **Full-Stack Execution:** End-to-end architectures in CredVidhi (FastAPI + PostgreSQL + Redis) and KaushalNexus (SIH 2026 Flagship).\n  * **Work Experience:** AI & ML Intern at Codomax Digital Solutions.\n\n*Note: Candidate is currently an undergraduate student seeking internship and junior engineering opportunities.*`;
    }

    if (analysis.intent === 'PROJECT_ARCHITECTURE' && analysis.targetProject === 'credvidhi') {
      return `### CredVidhi System Architecture & Data Flow\n\nCredVidhi is an institutional loan origination and deterministic credit underwriting platform:\n\n1. **API Gateway:** Python FastAPI with Pydantic v2 strict schema validation and JWT RBAC.\n2. **Underwriting Engine:** Fixed-point precision arithmetic in INR (₹) computing zero-drift EMI ($EMI = P \\cdot r \\cdot \\frac{(1+r)^n}{(1+r)^n - 1}$) and Debt-to-Income (DTI).\n3. **State Machine:** 6-stage forward-only Finite State Machine (Draft → Submitted → Under Review → Approved → Disbursed) enforced inside PostgreSQL ACID transactions.\n4. **Audit Trail:** Append-only cryptographic ledger recording every state change and actor UUID.\n5. **Caching & Rate Limiting:** Redis 7 sliding-window rate limits and session token management.\n6. **Gemini AI Role:** Domain-isolated borrower document guidance and FAQ support with offline fallback.`;
    }

    // Direct resolution for CredVidhi follow-up / technology query
    if (analysis.targetProject === 'credvidhi' && /technolog|tech|stack|use/i.test(query)) {
      return `### CredVidhi Technology Stack\n\nCredVidhi is engineered using the following production-grade stack:\n\n- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, and accessible UI patterns.\n- **Backend Gateway:** Python FastAPI with asynchronous endpoints and strict Pydantic v2 data validation.\n- **Database:** PostgreSQL 16 with an append-only cryptographic ledger for ACID state transitions.\n- **In-Memory Cache & Rate Limiting:** Redis 7 for sliding-window token bucket rate limiting and session management.\n- **AI & Underwriting:** Google Gemini API / local inference for guided document processing, alongside fixed-point INR mathematical underwriting formulas.`;
    }

    // Direct resolution for Amazon clone project query
    if (
      (analysis.targetProject === 'amazon-clone' || /amazon\s+clone/i.test(query)) &&
      !analysis.targetProject?.includes('credvidhi')
    ) {
      return `### Frontend Architecture Clones — Amazon & YouTube Web Apps\n\n**Overview:**\nAman built production-grade frontend architectural clones of Amazon and YouTube to master complex component hierarchies, state management, and real-time interaction patterns.\n\n- **Live URL:** https://clone-7553f.web.app/\n- **GitHub Repository:** https://github.com/calligraphyguruji/Amazon-Clone\n- **Technology Stack:** React, JavaScript/TypeScript, CSS Flexbox/Grid, Firebase Hosting.\n- **Core Features:** Responsive e-commerce product feed, interactive cart state persistence, authentication flow simulation, and component layout optimization.`;
    }

    // Direct resolution for general technical / computer science questions
    if (analysis.intent === 'TECHNICAL_QUERY' || /what is rag|retrieval-augmented generation/i.test(query)) {
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
      return `I searched Aman Mishra's verified portfolio and project repositories, but did not find documentation regarding "${query}". \n\nAman specializes in modern C++, React 18/19, TypeScript, FastAPI, PostgreSQL, Redis, and AI integrations (CredVidhi, KaushalNexus, Bodhi Sakha). Feel free to ask about these specific projects!`;
    }

    const topChunk = retrievedResults[0].chunk;

    // Guard against raw metadata leakage if chunk is mantri-identity
    if (topChunk.documentId === 'mantri-identity') {
      return MANTRI_IDENTITY.responses.creator;
    }

    return `Based on Aman Mishra's verified portfolio documentation:\n\n${topChunk.content.replace(/^\[.*?\]\n/, '')}\n\n*For further details, explore the dedicated case study at ${topChunk.url}.*`;
  }
}
