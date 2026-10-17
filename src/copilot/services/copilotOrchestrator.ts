import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../data/verifiedKnowledge.ts';
import { chunkKnowledgeDocument } from './chunkingService.ts';
import { analyzeQuery } from '../nlp/nlpProcessor.ts';
import { HybridRetriever } from './retrievalService.ts';
import { GeminiProvider, DeterministicFallbackProvider } from './llmProvider.ts';
import { GeminiModelRouter } from './geminiModelRouter.ts';
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
  QueryIntent,
} from '../types.ts';

/**
 * Orchestrator Service for Mantri AI Assistant
 * Implements a hybrid AI pipeline combining deterministic guards, NLP intent classification,
 * BM25/RRF hybrid RAG retrieval, and generative reasoning via the official Google Gemini API
 * with multi-model automatic failover, local Ollama secondary inference, and grounded deterministic synthesis.
 */
export class CopilotOrchestrator {
  private chunks: KnowledgeChunk[] = [];
  private retriever: HybridRetriever;
  private geminiRouter: GeminiModelRouter;
  private _geminiProvider?: GeminiProvider;
  private ollamaProvider: OllamaProvider;
  private fallbackProvider: DeterministicFallbackProvider;
  private startTime: number = Date.now();

  public get geminiProvider(): GeminiProvider {
    return this.geminiRouter.getPrimaryProvider() || this._geminiProvider!;
  }

  public set geminiProvider(provider: GeminiProvider) {
    this._geminiProvider = provider;
    if (provider && this.geminiRouter) {
      this.geminiRouter.setProvider(this.geminiRouter.getPrimaryModel(), provider);
    }
  }

  constructor(
    geminiApiKey = AI_CONFIG.geminiApiKey,
    geminiModel = AI_CONFIG.geminiPrimaryModel,
    ollamaBaseUrl = AI_CONFIG.ollamaBaseUrl,
    ollamaModel = AI_CONFIG.ollamaModel
  ) {
    this.retriever = new HybridRetriever();
    this.initializeKnowledgeBase();

    this.geminiRouter = new GeminiModelRouter({
      apiKey: geminiApiKey,
      primaryModel: geminiModel,
      fallbackModels: AI_CONFIG.geminiFallbackModels,
      maxAttempts: AI_CONFIG.geminiMaxAttempts,
      cooldownSeconds: AI_CONFIG.geminiCooldownSeconds,
      requestTimeoutMs: AI_CONFIG.requestTimeoutMs,
    });
    this._geminiProvider = new GeminiProvider(geminiApiKey, geminiModel, AI_CONFIG.requestTimeoutMs);
    this.ollamaProvider = new OllamaProvider(ollamaBaseUrl, ollamaModel);
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
    const isGeminiConfigured = this.geminiRouter.isConfigured();
    return {
      status: 'healthy',
      version: '2.2.0-gemini-multi-model',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      llmConfigured: isGeminiConfigured,
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
    const ollamaHealth = await this.ollamaProvider.health_check();
    return {
      ...this.getHealth(),
      provider: AI_CONFIG.aiProvider,
      gemini: {
        configured: this.geminiRouter.isConfigured(),
        primaryModel: this.geminiRouter.getPrimaryModel(),
        candidateModels: this.geminiRouter.getCandidateModels(),
        modelStats: this.geminiRouter.getAllStats(),
      },
      ollama: ollamaHealth,
    };
  }

  public getGeminiRouter(): GeminiModelRouter {
    return this.geminiRouter;
  }

  public getGeminiProvider(): GeminiProvider {
    return this.geminiProvider;
  }

  public getPrimaryProvider(): OllamaProvider {
    return this.ollamaProvider;
  }

  public getFallbackProvider(): DeterministicFallbackProvider {
    return this.fallbackProvider;
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

    // 2. Prompt Injection Interception
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

    // 3. Fast-path for safe math calculation tool
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

    // 4. Deterministic Fast-Path: Identity, Purpose & Resume Action
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
      intentType: QueryIntent
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

    if (nlpAnalysis.intent === 'ASSISTANT_IDENTITY') {
      const isCapabilities = /what can you do|capabilities|what do you do|features/i.test(lastUserMessage);
      const answerText = isCapabilities
        ? MANTRI_IDENTITY.responses.capabilities
        : MANTRI_IDENTITY.responses.assistant;
      return makeIdentityResponse(answerText, 'ASSISTANT_IDENTITY');
    }
    if (nlpAnalysis.intent === 'CREATOR_IDENTITY') {
      return makeIdentityResponse(
        MANTRI_IDENTITY.responses.creatorExact || MANTRI_IDENTITY.responses.creator,
        'CREATOR_IDENTITY'
      );
    }
    if (nlpAnalysis.intent === 'OWNER_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.owner, 'OWNER_IDENTITY');
    }
    if (nlpAnalysis.intent === 'DEVELOPER_IDENTITY') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.developer, 'DEVELOPER_IDENTITY');
    }
    if (nlpAnalysis.intent === 'PORTFOLIO_IDENTITY' || nlpAnalysis.intent === 'PORTFOLIO_OVERVIEW') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.portfolio, nlpAnalysis.intent);
    }
    if (nlpAnalysis.intent === 'ASSISTANT_PURPOSE') {
      return makeIdentityResponse(MANTRI_IDENTITY.responses.purpose, 'ASSISTANT_PURPOSE');
    }

    // 5. Hybrid Retrieval from Portfolio Knowledge Base
    const retrievalStart = Date.now();
    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);
    const retrievalLatency = Date.now() - retrievalStart;

    // 6. Citations Assembly
    const citations = this.retriever.generateCitations(retrievedResults);

    // 7. Generative LLM Response Generation (Gemini Router -> Ollama -> Grounded Fallback)
    let answer = '';
    let usedModel = 'deterministic-fallback';
    let generationError: string | null = null;
    let attempts = 1;
    let failoverOccurred = false;
    let failoverReason: string | undefined = undefined;
    const isGeminiConfigured = this.geminiRouter.isConfigured() || this.geminiProvider?.isConfigured();

    if (isGeminiConfigured && AI_CONFIG.aiProvider !== 'ollama') {
      try {
        const routerRes = await this.geminiRouter.generateResponseWithTelemetry(
          lastUserMessage,
          retrievedResults,
          nlpAnalysis,
          request.messages
        );
        answer = routerRes.answer;
        usedModel = `gemini:${routerRes.modelUsed}`;
        attempts = routerRes.attempts;
        failoverOccurred = routerRes.failoverOccurred;
        failoverReason = routerRes.failoverReason;
      } catch (err: any) {
        generationError = err?.message || String(err);
        console.warn('[CopilotOrchestrator] Gemini router failed all models, evaluating secondary chain:', generationError);
      }
    }

    // Secondary attempt: Ollama if configured and primary failed or Ollama requested
    if (!answer && (AI_CONFIG.aiProvider === 'ollama' || generationError)) {
      try {
        answer = await this.ollamaProvider.generateResponse(
          lastUserMessage,
          retrievedResults,
          nlpAnalysis,
          request.messages
        );
        usedModel = `ollama:${this.ollamaProvider.getModelName()}`;
      } catch (ollamaErr) {
        console.warn('[CopilotOrchestrator] Ollama offline or failed:', ollamaErr);
      }
    }

    // Tertiary fallback: Grounded deterministic synthesis
    if (!answer) {
      usedModel = isGeminiConfigured
        ? 'deterministic-fallback'
        : 'deterministic-offline-engine';
      answer = await this.fallbackProvider.generateResponse(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis
      );
    }

    // 8. Recruiter Mode Structured Metadata
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

    // 9. Optional Mermaid Diagram for Architecture Queries
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
  Gateway -->|Guarded Guidance| Gemini[Google Gemini AI]`;
    }

    // 10. Structured Resume Card Action
    let resumeCard = undefined;
    if (nlpAnalysis.intent === 'RESUME_REQUEST' || nlpAnalysis.intent === 'RESUME') {
      resumeCard = {
        title: RESUME_CONFIG.title,
        subtitle: RESUME_CONFIG.subtitle,
        filename: RESUME_CONFIG.filename,
        downloadUrl: RESUME_CONFIG.downloadUrl,
        fileSize: RESUME_CONFIG.fileSize,
        isAvailable: true,
      };
    }

    // Record assistant response in persistent conversation memory
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
        requestedModel: this.geminiRouter.getPrimaryModel(),
        attempts,
        failoverOccurred,
        failoverReason,
        retrievalLatencyMs: retrievalLatency,
        totalLatencyMs: Date.now() - startTs,
        retrievedCount: retrievedResults.length,
        providerError: generationError ? generationError.split(':')[0] : undefined,
      },
    };
  }

  /**
   * Stream tokens from Gemini, local Ollama, or fallback chunk-by-chunk
   */
  public async *streamChat(request: CopilotChatRequest): AsyncIterable<string> {
    const lastUserMessage =
      request.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
    const nlpAnalysis = analyzeQuery(
      lastUserMessage,
      request.messages.slice(0, -1)
    );

    // Fast paths: prompt injection, identity, resume
    if (nlpAnalysis.isInappropriateOrInjection) {
      yield "I am Mantri, Aman Mishra's portfolio guide. I cannot fulfill requests that attempt to override my security instructions.";
      return;
    }

    if (nlpAnalysis.intent === 'ASSISTANT_IDENTITY') {
      const isCapabilities = /what can you do|capabilities|what do you do|features/i.test(lastUserMessage);
      yield isCapabilities ? MANTRI_IDENTITY.responses.capabilities : MANTRI_IDENTITY.responses.assistant;
      return;
    }

    if (nlpAnalysis.intent === 'CREATOR_IDENTITY') {
      yield MANTRI_IDENTITY.responses.creatorExact || MANTRI_IDENTITY.responses.creator;
      return;
    }

    if (nlpAnalysis.intent === 'OWNER_IDENTITY') {
      yield MANTRI_IDENTITY.responses.owner;
      return;
    }

    if (nlpAnalysis.intent === 'DEVELOPER_IDENTITY') {
      yield MANTRI_IDENTITY.responses.developer;
      return;
    }

    if (nlpAnalysis.intent === 'PORTFOLIO_IDENTITY' || nlpAnalysis.intent === 'PORTFOLIO_OVERVIEW') {
      yield MANTRI_IDENTITY.responses.portfolio;
      return;
    }

    if (nlpAnalysis.intent === 'ASSISTANT_PURPOSE') {
      yield MANTRI_IDENTITY.responses.purpose;
      return;
    }

    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);

    // Primary: stream from Gemini if configured
    if (this.geminiProvider.isConfigured() && AI_CONFIG.aiProvider !== 'ollama') {
      try {
        for await (const chunk of this.geminiProvider.streamResponse(
          lastUserMessage,
          retrievedResults,
          nlpAnalysis,
          request.messages
        )) {
          yield chunk;
        }
        return;
      } catch (err) {
        console.warn('[CopilotOrchestrator] Gemini streaming failed, engaging fallback stream:', err);
      }
    }

    // Secondary: stream from Ollama if configured
    if (AI_CONFIG.aiProvider === 'ollama') {
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
        for await (const chunk of this.ollamaProvider.stream_generate(promptText)) {
          yield chunk;
        }
        return;
      } catch {
        // Continue to fallback
      }
    }

    // Tertiary: deterministic fallback
    const fallbackAns = await this.fallbackProvider.generateResponse(
      lastUserMessage,
      retrievedResults,
      nlpAnalysis
    );
    yield fallbackAns;
  }
}

// Global Singleton
export const copilotOrchestrator = new CopilotOrchestrator();
