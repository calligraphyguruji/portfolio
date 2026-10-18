import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../data/verifiedKnowledge.ts';
import { chunkKnowledgeDocument } from './chunkingService.ts';
import { analyzeQuery } from '../nlp/nlpProcessor.ts';
import { HybridRetriever } from './retrievalService.ts';
import { GeminiProvider, DeterministicFallbackProvider } from './llmProvider.ts';
import { GeminiModelRouter } from './geminiModelRouter.ts';
import { GroqProvider } from './groqProvider.ts';
import { OllamaProvider } from './ollamaProvider.ts';
import { conversationMemory } from './conversationMemory.ts';
import { toolRegistry } from './toolRegistry.ts';
import { RESUME_CONFIG } from '../config/resumeConfig.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';
import { AdaptiveAIRouter } from './adaptiveAIRouter.ts';
import type {
  CopilotChatRequest,
  CopilotChatResponse,
  KnowledgeChunk,
  CopilotHealthResponse,
} from '../types.ts';

/**
 * Orchestrator Service for Mantri AI Assistant
 * Implements a hybrid AI pipeline combining deterministic guards, NLP intent classification,
 * BM25/RRF hybrid RAG retrieval, and dynamic model discovery, ranking, and resilient
 * multi-provider automatic failover across Google Gemini, Groq, and local Ollama.
 */
export class CopilotOrchestrator {
  private chunks: KnowledgeChunk[] = [];
  private retriever: HybridRetriever;
  public adaptiveRouter: AdaptiveAIRouter;
  private geminiRouter: GeminiModelRouter;
  private _geminiProvider?: GeminiProvider;
  private _groqProvider: GroqProvider;
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
      this.adaptiveRouter.setCustomGeminiRouter(this.geminiRouter);
    }
  }

  public get groqProvider(): GroqProvider {
    return this._groqProvider;
  }

  public set groqProvider(provider: GroqProvider) {
    this._groqProvider = provider;
    this.adaptiveRouter.setCustomGroqProvider(provider);
  }


  constructor(
    geminiApiKey = AI_CONFIG.geminiApiKey,
    geminiModel = AI_CONFIG.geminiPrimaryModel,
    ollamaBaseUrl = AI_CONFIG.ollamaBaseUrl,
    ollamaModel = AI_CONFIG.ollamaModel,
    groqApiKey = AI_CONFIG.groqApiKey,
    groqModel = AI_CONFIG.groqModel
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
    this._groqProvider = new GroqProvider(groqApiKey, groqModel, AI_CONFIG.requestTimeoutMs);
    this.ollamaProvider = new OllamaProvider(ollamaBaseUrl, ollamaModel);
    this.fallbackProvider = new DeterministicFallbackProvider();

    this.adaptiveRouter = new AdaptiveAIRouter();
    this.adaptiveRouter.setCustomGeminiRouter(this.geminiRouter);
    this.adaptiveRouter.setCustomGroqProvider(this._groqProvider);
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
    const configuredProviders = this.adaptiveRouter.getDiscoveryService().getConfiguredProviders();
    const isGeminiConfigured = configuredProviders.includes('gemini') || this.geminiRouter.isConfigured();
    const isGroqConfigured = configuredProviders.includes('groq') || (this.groqProvider?.isConfigured() ?? false);
    const llmConfigured = isGeminiConfigured || isGroqConfigured;
    const primaryProvider: 'gemini' | 'groq' | 'none' = isGeminiConfigured
      ? 'gemini'
      : isGroqConfigured
      ? 'groq'
      : 'none';

    return {
      status: llmConfigured ? 'healthy' : 'degraded',
      version: '3.1.1-active-model-failover',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      llmConfigured,
      indexedChunks: this.chunks.length,
      primaryProvider,
      availableProviders: [
        ...(isGeminiConfigured ? ['gemini'] : []),
        ...(isGroqConfigured ? ['groq'] : []),
      ],
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
      groq: {
        configured: this.groqProvider.isConfigured(),
        model: this.groqProvider.getModelName(),
      },
      ollama: ollamaHealth,
    };
  }

  public getGeminiRouter(): GeminiModelRouter {
    return this.geminiRouter;
  }

  public setGeminiRouter(router: GeminiModelRouter): void {
    this.geminiRouter = router;
    this.adaptiveRouter.setCustomGeminiRouter(router);
  }

  public getGeminiProvider(): GeminiProvider {
    return this.geminiProvider;
  }

  public getGroqProvider(): GroqProvider {
    return this.groqProvider;
  }

  public setGroqProvider(provider: GroqProvider): void {
    this._groqProvider = provider;
    this.adaptiveRouter.setCustomGroqProvider(provider);
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

    // 4. Action Card attachments (Resume PDF card)
    let resumeCard = undefined;
    if (nlpAnalysis.intent === 'RESUME_REQUEST' || nlpAnalysis.intent === 'RESUME') {
      resumeCard = {
        title: RESUME_CONFIG.title,
        subtitle: RESUME_CONFIG.subtitle,
        filename: RESUME_CONFIG.filename,
        downloadUrl: RESUME_CONFIG.downloadUrl,
        fileSize: RESUME_CONFIG.fileSize,
        isAvailable: RESUME_CONFIG.isAvailable,
      };
    }

    // 5. Hybrid Retrieval from Portfolio Knowledge Base
    const retrievalStart = Date.now();
    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);
    const retrievalLatency = Date.now() - retrievalStart;

    // 6. Citations Assembly
    const citations = this.retriever.generateCitations(retrievedResults);

    // 7. Dynamic AI Generation with Intelligent Model Selection & Multi-Provider Failover
    const adaptiveRes = await this.adaptiveRouter.generateResponse(
      lastUserMessage,
      retrievedResults,
      nlpAnalysis,
      request.messages
    );

    let answer = adaptiveRes.answer;
    let usedModel = adaptiveRes.modelUsed;
    let attempts = adaptiveRes.attempts;
    let failoverOccurred = adaptiveRes.failoverOccurred;
    let failoverReason = adaptiveRes.failoverReason;
    const providerDiagnostics = adaptiveRes.diagnostics;
    let isError = Boolean(adaptiveRes.isError);

    // Invariant: Do not circumvent safety blocks by failing over to alternative LLM providers
    if (
      adaptiveRes.providerError === 'SAFETY_BLOCKED' ||
      (providerDiagnostics[0] && providerDiagnostics[0].category === 'SAFETY_BLOCKED')
    ) {
      return {
        answer: "I am unable to fulfill this request as the content triggered safety and responsible AI restrictions.",
        intent: nlpAnalysis.intent,
        targetProject: nlpAnalysis.targetProject,
        citations: [],
        metadata: {
          model: usedModel,
          provider: adaptiveRes.provider,
          requestedModel: this.geminiRouter.getPrimaryModel(),
          attempts: 1,
          failoverOccurred: false,
          providerError: 'SAFETY_BLOCKED',
          diagnostics: providerDiagnostics,
          retrievalLatencyMs: retrievalLatency,
          totalLatencyMs: Date.now() - startTs,
          retrievedCount: retrievedResults.length,
        },
      };
    }

    if (!answer || isError) {
      if (resumeCard) {
        answer = "Here is Aman Mishra's verified resume card. You can view or download his official ATS-friendly PDF directly below.";
        isError = false;
      }
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
      isError: isError || undefined,
      metadata: {
        model: usedModel,
        provider: usedModel === 'unavailable' ? 'none' : usedModel.split(':')[0],
        requestedModel: this.geminiRouter.getPrimaryModel(),
        attempts,
        failoverOccurred,
        failoverReason,
        retrievalLatencyMs: retrievalLatency,
        totalLatencyMs: Date.now() - startTs,
        retrievedCount: retrievedResults.length,
        providerError: adaptiveRes.providerError || (failoverReason ? failoverReason.split(':')[0] : undefined),
        diagnostics: providerDiagnostics.length > 0 ? providerDiagnostics : undefined,
      },
    };
  }

  /**
   * Stream tokens from Gemini, Groq, local Ollama, or fallback chunk-by-chunk
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

    const retrievedResults = this.retriever.retrieve(nlpAnalysis, undefined, 4);

    let streamedAny = false;
    try {
      for await (const chunk of this.adaptiveRouter.streamChat(
        lastUserMessage,
        retrievedResults,
        nlpAnalysis,
        request.messages
      )) {
        streamedAny = true;
        yield chunk;
      }
      if (streamedAny) return;
    } catch (streamErr) {
      console.warn('[CopilotOrchestrator] Adaptive streaming failed:', streamErr);
    }

    // Terminal error when no provider is available
    yield "Mantri's AI reasoning services are temporarily unavailable. Neither Google Gemini nor Groq could be reached, or valid API credentials were not configured on the server.";
  }
}

// Global Singleton
export const copilotOrchestrator = new CopilotOrchestrator();
