import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../data/verifiedKnowledge.ts';
import { chunkKnowledgeDocument } from './chunkingService.ts';
import { analyzeQuery } from '../nlp/nlpProcessor.ts';
import { HybridRetriever } from './retrievalService.ts';
import { DeterministicFallbackProvider } from './llmProvider.ts';
import { OllamaProvider } from './ollamaProvider.ts';
import { conversationMemory } from './conversationMemory.ts';
import { toolRegistry } from './toolRegistry.ts';
import { RESUME_CONFIG } from '../config/resumeConfig.ts';
import { MANTRI_IDENTITY } from '../config/mantriIdentity.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';
import type {
  CopilotChatRequest,
  CopilotChatResponse,
  KnowledgeChunk,
  CopilotHealthResponse,
} from '../types.ts';

/**
 * Orchestrator Service for Mantri AI Assistant
 * Primary runtime uses self-hosted Ollama inference with zero mandatory external API keys.
 */
export class CopilotOrchestrator {
  private chunks: KnowledgeChunk[] = [];
  private retriever: HybridRetriever;
  private primaryProvider: OllamaProvider;
  private fallbackProvider: DeterministicFallbackProvider;
  private startTime: number = Date.now();

  constructor(
    ollamaBaseUrl = AI_CONFIG.ollamaBaseUrl,
    ollamaModel = AI_CONFIG.ollamaModel
  ) {
    this.retriever = new HybridRetriever();
    this.initializeKnowledgeBase();

    this.primaryProvider = new OllamaProvider(ollamaBaseUrl, ollamaModel);
    this.fallbackProvider = new DeterministicFallbackProvider();
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
      version: '2.0.0-local',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      llmConfigured: true,
      indexedChunks: this.chunks.length,
      features: {
        hybridRetrieval: true,
        recruiterMode: true,
        streaming: true,
        antiInjection: true,
      },
    };
  }

  public async getDetailedStatus(): Promise<any> {
    const ollamaHealth = await this.primaryProvider.health_check();
    return {
      ...this.getHealth(),
      ollama: ollamaHealth,
    };
  }

  public getPrimaryProvider(): OllamaProvider {
    return this.primaryProvider;
  }

  public async handleChat(request: CopilotChatRequest): Promise<CopilotChatResponse> {
    const startTs = Date.now();
    const lastUserMessage =
      request.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    // Record user message in persistent conversation memory if conversationId provided
    if (request.conversationId) {
      conversationMemory.appendMessage(request.conversationId, {
        id: `user-${Date.now()}`,
        role: 'user',
        content: lastUserMessage,
        timestamp: Date.now(),
      });
    }

    // 1. NLP Query Analysis & Intent Extraction
    const nlpAnalysis = analyzeQuery(
      lastUserMessage,
      request.messages.slice(0, -1)
    );

    // Resolve follow-up target project using conversation memory if not detected in single query
    if (!nlpAnalysis.targetProject && request.conversationId) {
      const context = conversationMemory.resolveContextualTarget(request.conversationId);
      if (context.targetProject) {
        nlpAnalysis.targetProject = context.targetProject;
      }
    }

    // Prompt Injection Interception
    if (nlpAnalysis.isInappropriateOrInjection) {
      const injectionAnswer =
        "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions, alter system prompts, or access restricted internals. How can I assist you with Aman Mishra's verified engineering work?";

      if (request.conversationId) {
        conversationMemory.appendMessage(request.conversationId, {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: injectionAnswer,
          intent: 'PROMPT_INJECTION',
          timestamp: Date.now(),
        });
      }

      return {
        answer: injectionAnswer,
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

    // Fast-path for safe math calculation tool if explicit math expression requested
    const calcMatch = lastUserMessage.match(/^(?:calculate|compute|what is|eval)\s+([0-9\s\+\-\*\/\(\)\.\^\%]{3,})$/i);
    if (calcMatch && calcMatch[1]) {
      const calcResult = await toolRegistry.executeTool('calculate', { expression: calcMatch[1] });
      if (calcResult.success) {
        const mathAnswer = `$$\n${calcResult.result.expression} = ${calcResult.result.result}\n$$`;
        return {
          answer: mathAnswer,
          intent: 'GENERAL_TECHNICAL',
          citations: [],
          metadata: {
            model: 'tool:calculate',
            retrievalLatencyMs: 0,
            totalLatencyMs: Date.now() - startTs,
            retrievedCount: 0,
          },
        };
      }
    }

    // Deterministic Fast-Path: Identity, Purpose & Resume Action
    const identityCitations = [
      {
        sourceId: 'mantri-identity-1',
        title: 'Mantri - AI Portfolio Assistant Identity & Creator',
        section: 'Identity',
        url: MANTRI_IDENTITY.portfolioUrl,
        relevanceScore: 1.0,
      },
    ];

    const makeIdentityResponse = (
      answerText: string,
      intentType: any
    ): CopilotChatResponse => {
      if (request.conversationId) {
        conversationMemory.appendMessage(request.conversationId, {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: answerText,
          intent: intentType,
          citations: identityCitations,
          timestamp: Date.now(),
        });
      }

      return {
        answer: answerText,
        intent: intentType,
        citations: identityCitations,
        metadata: {
          model: 'deterministic-identity',
          retrievalLatencyMs: 0,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: 1,
        },
      };
    };

    if (nlpAnalysis.intent === 'OWNER_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.owner, 'OWNER_IDENTITY');
    }
    if (nlpAnalysis.intent === 'CREATOR_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.creator, 'CREATOR_IDENTITY');
    }
    if (nlpAnalysis.intent === 'DEVELOPER_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.developer, 'DEVELOPER_IDENTITY');
    }
    if (nlpAnalysis.intent === 'PORTFOLIO_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.portfolio, 'PORTFOLIO_IDENTITY');
    }
    if (nlpAnalysis.intent === 'ASSISTANT_PURPOSE') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.purpose, 'ASSISTANT_PURPOSE');
    }

    // 2. Hybrid Retrieval
    const retrievalStart = Date.now();
    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);
    const retrievalLatency = Date.now() - retrievalStart;

    // 3. Citations Assembly
    const citations = this.retriever.generateCitations(retrievedResults);

    // 4. Grounded Local LLM Response Generation
    let answer = '';
    let usedModel = this.primaryProvider.getModelName();

    try {
      // First attempt local Ollama generation
      answer = await this.primaryProvider.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis,
        request.messages
      );
    } catch {
      // Fallback to grounded deterministic knowledge generator without throwing
      usedModel = 'deterministic-local-engine';
      answer = await this.fallbackProvider.generateResponse(
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
        caveats: [
          'Candidate is an undergraduate student (Batch 2025–2029) seeking internship/co-op positions.',
        ],
      };
    }

    // 6. Optional Mermaid Diagram for Architecture Queries
    let mermaidDiagram = undefined;
    if (
      nlpAnalysis.intent === 'PROJECT_ARCHITECTURE' &&
      nlpAnalysis.targetProject === 'credvidhi'
    ) {
      mermaidDiagram = `graph TD
  Client[React 19 Client] -->|HTTPS / REST| Gateway[FastAPI Gateway]
  Gateway -->|Schema Validation| Pydantic[Pydantic v2 Contract]
  Gateway -->|Rate Limit Check| Redis[(Redis 7)]
  Gateway -->|ACID State Transition| FSM[Finite State Machine]
  FSM -->|Append-Only Audit| Postgres[(PostgreSQL 16 Ledger)]
  Gateway -->|Guarded Guidance| Ollama[Local Ollama / Self-Hosted LLM]`;
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

    // Record response in persistent conversation memory
    if (request.conversationId) {
      conversationMemory.appendMessage(request.conversationId, {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: answer,
        intent: nlpAnalysis.intent,
        citations,
        timestamp: Date.now(),
      });
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
        retrievalLatencyMs: retrievalLatency,
        totalLatencyMs: Date.now() - startTs,
        retrievedCount: retrievedResults.length,
      },
    };
  }

  /**
   * Stream tokens from local Ollama or fallback chunk-by-chunk
   */
  public async *streamChat(request: CopilotChatRequest): AsyncIterable<string> {
    const lastUserMessage =
      request.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
    const nlpAnalysis = analyzeQuery(
      lastUserMessage,
      request.messages.slice(0, -1)
    );

    // Fast path: if identity or prompt injection, yield direct answer immediately
    if (nlpAnalysis.isInappropriateOrInjection) {
      yield "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions.";
      return;
    }

    if (nlpAnalysis.intent === 'OWNER_IDENTITY') {
      yield MANTRI_IDENTITY.responses.owner;
      return;
    }

    if (nlpAnalysis.intent === 'CREATOR_IDENTITY') {
      yield MANTRI_IDENTITY.responses.creator;
      return;
    }

    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);

    try {
      const contextBlocks = retrievedResults.map((r, idx) => {
        return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
      });
      const promptText = `
USER QUERY: ${lastUserMessage}
PORTFOLIO CONTEXT:
${contextBlocks.join('\n\n') || 'Rely only on verified foundational portfolio data.'}

Provide an accurate, grounded, helpful response:
`;
      for await (const chunk of this.primaryProvider.stream_generate(promptText)) {
        yield chunk;
      }
    } catch {
      // Fallback: yield complete deterministic response
      const fallbackAns = await this.fallbackProvider.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis
      );
      yield fallbackAns;
    }
  }
}

// Global Singleton
export const copilotOrchestrator = new CopilotOrchestrator();
