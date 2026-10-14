import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../data/verifiedKnowledge.ts';
import { chunkKnowledgeDocument } from './chunkingService.ts';
import { analyzeQuery } from '../nlp/nlpProcessor.ts';
import { HybridRetriever } from './retrievalService.ts';
import type { LLMProvider } from './llmProvider.ts';
import { GeminiProvider, DeterministicFallbackProvider } from './llmProvider.ts';
import { RESUME_CONFIG } from '../config/resumeConfig.ts';
import { MANTRI_IDENTITY } from '../config/mantriIdentity.ts';
import type {
  CopilotChatRequest,
  CopilotChatResponse,
  KnowledgeChunk,
  CopilotHealthResponse,
} from '../types.ts';

/**
 * Orchestrator Service for AI Portfolio Copilot
 */
export class CopilotOrchestrator {
  private chunks: KnowledgeChunk[] = [];
  private retriever: HybridRetriever;
  private llmProvider: LLMProvider;
  private isGeminiActive = false;
  private startTime: number = Date.now();

  constructor() {
    this.retriever = new HybridRetriever();
    this.initializeKnowledgeBase();

    // Check Gemini API Key
    const apiKey =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GOOGLE_API_KEY) ||
      '';

    const modelName =
      (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) || 'gemini-2.5-flash';

    if (apiKey) {
      this.llmProvider = new GeminiProvider(apiKey, modelName);
      this.isGeminiActive = true;
    } else {
      this.llmProvider = new DeterministicFallbackProvider();
      this.isGeminiActive = false;
    }
  }

  private initializeKnowledgeBase(): void {
    const allChunks: KnowledgeChunk[] = [];
    for (const doc of VERIFIED_KNOWLEDGE_DOCUMENTS) {
      const docChunks = chunkKnowledgeDocument(doc);
      allChunks.push(...docChunks);
    }
    this.chunks = allChunks;
    this.retriever.setChunks(this.chunks);
  }

  public getHealth(): CopilotHealthResponse {
    return {
      status: 'healthy',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      llmConfigured: this.isGeminiActive,
      indexedChunks: this.chunks.length,
      features: {
        hybridRetrieval: true,
        recruiterMode: true,
        streaming: false,
        antiInjection: true,
      },
    };
  }

  public async handleChat(request: CopilotChatRequest): Promise<CopilotChatResponse> {
    const startTs = Date.now();
    const lastUserMessage = request.messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0]?.content || '';

    // 1. NLP Query Analysis & Intent Extraction
    const nlpAnalysis = analyzeQuery(
      lastUserMessage,
      request.messages.slice(0, -1)
    );

    // Prompt Injection Interception
    if (nlpAnalysis.isInappropriateOrInjection) {
      return {
        answer:
          "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?",
        intent: 'PROMPT_INJECTION',
        citations: [],
        metadata: {
          model: 'security-guard',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 0,
        },
      };
    }

    // Deterministic Fast-Path: Identity, Purpose & Resume Action
    // Bypasses unnecessary RAG document dumps and returns concise, verified identity responses
    if (nlpAnalysis.intent === 'OWNER_IDENTITY') {
      return {
        answer: MANTRI_IDENTITY.responses.owner,
        intent: 'OWNER_IDENTITY',
        citations: [
          {
            sourceId: 'mantri-identity-1',
            title: 'Mantri - AI Portfolio Assistant Identity & Creator',
            section: 'Identity',
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1.0,
          },
        ],
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    }

    if (nlpAnalysis.intent === 'CREATOR_IDENTITY') {
      return {
        answer: MANTRI_IDENTITY.responses.creator,
        intent: 'CREATOR_IDENTITY',
        citations: [
          {
            sourceId: 'mantri-identity-1',
            title: 'Mantri - AI Portfolio Assistant Identity & Creator',
            section: 'Identity',
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1.0,
          },
        ],
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    }

    if (nlpAnalysis.intent === 'DEVELOPER_IDENTITY') {
      return {
        answer: MANTRI_IDENTITY.responses.developer,
        intent: 'DEVELOPER_IDENTITY',
        citations: [
          {
            sourceId: 'mantri-identity-1',
            title: 'Mantri - AI Portfolio Assistant Identity & Creator',
            section: 'Identity',
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1.0,
          },
        ],
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    }

    if (nlpAnalysis.intent === 'PORTFOLIO_IDENTITY') {
      return {
        answer: MANTRI_IDENTITY.responses.portfolio,
        intent: 'PORTFOLIO_IDENTITY',
        citations: [
          {
            sourceId: 'mantri-identity-1',
            title: 'Mantri - AI Portfolio Assistant Identity & Creator',
            section: 'Identity',
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1.0,
          },
        ],
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    }

    if (nlpAnalysis.intent === 'ASSISTANT_PURPOSE') {
      return {
        answer: MANTRI_IDENTITY.responses.purpose,
        intent: 'ASSISTANT_PURPOSE',
        citations: [
          {
            sourceId: 'mantri-identity-1',
            title: 'Mantri - AI Portfolio Assistant Identity & Creator',
            section: 'Identity',
            url: MANTRI_IDENTITY.portfolioUrl,
            relevanceScore: 1.0,
          },
        ],
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    }

    // 2. Hybrid Retrieval
    const retrievalStart = Date.now();
    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);
    const retrievalLatency = Date.now() - retrievalStart;

    // 3. Citations Assembly
    const citations = this.retriever.generateCitations(retrievedResults);

    // 4. Grounded LLM Response Generation
    let answer = '';
    try {
      answer = await this.llmProvider.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis,
        request.messages
      );
    } catch (err) {
      console.warn('[CopilotOrchestrator] Primary LLM failed, using deterministic fallback:', err);
      const fallback = new DeterministicFallbackProvider();
      answer = await fallback.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis
      );
    }

    // 5. Recruiter Mode Structured Metadata
    let recruiterAlignment = undefined;
    if (nlpAnalysis.isRecruiterMode) {
      recruiterAlignment = {
        suitableRoles: ['SDE Intern', 'Frontend Developer', 'Full-Stack Developer'],
        keyStrengths: [
          '205+ LeetCode problems solved with C++ STL asymptotic performance',
          'Production-grade React 19 / TypeScript / Vite frontend systems',
          'FastAPI & PostgreSQL backend architecture with immutable state transitions',
        ],
        suggestedProjects: ['CredVidhi', 'KaushalNexus', 'Bodhi Sakha'],
        caveats: ['Candidate is an undergraduate student (Batch 2025–2029) seeking internship/co-op positions.'],
      };
    }

    // 6. Optional Mermaid Diagram for Architecture Queries
    let mermaidDiagram = undefined;
    if (nlpAnalysis.intent === 'PROJECT_ARCHITECTURE' && nlpAnalysis.targetProject === 'credvidhi') {
      mermaidDiagram = `graph TD
  Client[React 19 Client] -->|HTTPS / REST| Gateway[FastAPI Gateway]
  Gateway -->|Schema Validation| Pydantic[Pydantic v2 Contract]
  Gateway -->|Rate Limit Check| Redis[(Redis 7)]
  Gateway -->|ACID State Transition| FSM[Finite State Machine]
  FSM -->|Append-Only Audit| Postgres[(PostgreSQL 16 Ledger)]
  Gateway -->|Guarded FAQ| Gemini[Google Gemini AI]`;
    }

    // 7. Structured Resume Card Action
    let resumeCard = undefined;
    if (nlpAnalysis.intent === 'RESUME_REQUEST') {
      resumeCard = {
        title: RESUME_CONFIG.title,
        subtitle: RESUME_CONFIG.subtitle,
        filename: RESUME_CONFIG.filename,
        downloadUrl: RESUME_CONFIG.downloadUrl,
        fileSize: RESUME_CONFIG.fileSize,
        isAvailable: true,
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
        model: this.isGeminiActive ? 'gemini-2.5-flash' : 'deterministic-fallback',
        retrievalLatencyMs: retrievalLatency,
        totalLatencyMs: Date.now() - startTs,
        retrievedCount: retrievedResults.length,
      },
    };
  }
}

// Global Singleton
export const copilotOrchestrator = new CopilotOrchestrator();
