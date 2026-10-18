import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AdaptiveAIRouter, classifyProviderError, sanitizeSecretString } from '../src/copilot/services/adaptiveAIRouter.ts';
import { ModelHealthTracker, DynamicModelSelector } from '../src/copilot/services/dynamicModelSelector.ts';
import { ModelDiscoveryService, type DiscoveredModel } from '../src/copilot/services/modelDiscovery.ts';
import { CopilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
import { GeminiModelRouter } from '../src/copilot/services/geminiModelRouter.ts';
import { GeminiProvider } from '../src/copilot/services/llmProvider.ts';
import { GroqProvider } from '../src/copilot/services/groqProvider.ts';
import type { RetrievalResult, NLPAnalysis } from '../src/copilot/types.ts';

const mockAnalysis: NLPAnalysis = {
  originalQuery: 'Explain CredVidhi architecture',
  normalizedQuery: 'explain credvidhi architecture',
  intent: 'PROJECT_ARCHITECTURE',
  entities: {
    projects: ['credvidhi'],
    technologies: ['FastAPI', 'PostgreSQL'],
    roles: [],
    skills: [],
  },
  expandedTerms: ['credvidhi', 'architecture'],
  targetProject: 'credvidhi',
  isRecruiterMode: false,
  isInappropriateOrInjection: false,
};

const mockRetrievalResults: RetrievalResult[] = [
  {
    chunk: {
      id: 'credvidhi-core',
      documentId: 'credvidhi-spec',
      title: 'CredVidhi Core',
      section: 'Architecture',
      content: 'CredVidhi uses FastAPI, PostgreSQL 16 ACID ledger, and Redis 7.',
      tokenCount: 15,
      keywords: ['credvidhi', 'fastapi'],
      contentHash: 'hash-abc',
      url: 'https://calligraphyguruji.dev/#/project/credvidhi',
    },
    lexicalScore: 0.9,
    vectorScore: 0.85,
    combinedScore: 0.88,
  },
];

describe('Mantri Intelligent Dynamic AI Model Switching & Failover Test Suite', () => {
  // Scenario 1: Discovered model succeeds on first attempt
  it('Scenario 1: Discovered model succeeds on first attempt without failover', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-12345',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-12345', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => 'Gemini 2.5 Flash dynamically answered query.';
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Gemini 2.5 Flash dynamically answered query.');
    assert.strictEqual(res.metadata.model, 'gemini:gemini-2.5-flash');
    assert.strictEqual(res.metadata.provider, 'gemini');
    assert.strictEqual(res.metadata.failoverOccurred, false);
    assert.strictEqual(res.metadata.attempts, 1);
  });

  // Scenario 2: 404 triggers cache invalidation and failover to next eligible model
  it('Scenario 2: HTTP 404 model not found invalidates candidate and fails over cleanly', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-12345',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: ['gemini-2.5-flash-lite'],
    });

    const mockPrimary = new GeminiProvider('mock-gemini-key-12345', 'gemini-2.5-flash');
    mockPrimary.generateResponse = async () => {
      const err: any = new Error('404 Not Found: models/gemini-2.5-flash is deleted or deprecated');
      err.status = 404;
      throw err;
    };
    const mockFallback = new GeminiProvider('mock-gemini-key-12345', 'gemini-2.5-flash-lite');
    mockFallback.generateResponse = async () => 'Recovered answer from gemini-2.5-flash-lite.';

    mockRouter.setProvider('gemini-2.5-flash', mockPrimary);
    mockRouter.setProvider('gemini-2.5-flash-lite', mockFallback);
    orchestrator.setGeminiRouter(mockRouter);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Recovered answer from gemini-2.5-flash-lite.');
    assert.strictEqual(res.metadata.model, 'gemini:gemini-2.5-flash-lite');
    assert.strictEqual(res.metadata.failoverOccurred, true);
    assert.ok(res.metadata.diagnostics && res.metadata.diagnostics.length > 0);
    assert.strictEqual(res.metadata.diagnostics[0].is404, true);
    assert.strictEqual(res.metadata.diagnostics[0].category, 'MODEL_NOT_FOUND');
  });

  // Scenario 3: 429 quota/rate-limit applies cooldown and switches provider
  it('Scenario 3: HTTP 429 rate limit triggers dynamic cooldown and switches provider', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-12345',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-12345', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('429 RESOURCE_EXHAUSTED: Rate limit reached');
      err.status = 429;
      err.headers = { get: (header: string) => (header === 'retry-after' ? '30' : null) };
      throw err;
    };
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq answered after Gemini 429 rate limit.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq answered after Gemini 429 rate limit.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.failoverOccurred, true);
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'RATE_LIMIT_OR_QUOTA');
  });

  // Scenario 4: Gemini unavailable -> Groq succeeds
  it('Scenario 4: Gemini unavailable -> Groq succeeds automatically', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-12345',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-12345', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('503 Service Unavailable: Gemini overloaded');
      err.status = 503;
      throw err;
    };
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq answered while Gemini was down.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq answered while Gemini was down.');
    assert.strictEqual(res.metadata.model, 'groq:llama-3.3-70b-versatile');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.failoverOccurred, true);
  });

  // Scenario 5: Groq unavailable -> another provider succeeds
  it('Scenario 5: Groq fails -> failover to alternate candidate succeeds', async () => {
    const router = new AdaptiveAIRouter();
    let secondCandidateCalled = false;

    router.setProvider('gemini', 'gemini-2.5-flash', {
      generateResponse: async () => {
        throw new Error('500 Internal Server Error');
      },
    });
    router.setProvider('gemini', 'gemini-2.5-flash-lite', {
      generateResponse: async () => {
        secondCandidateCalled = true;
        return 'Answer from alternate candidate.';
      },
    });

    const mockModels: DiscoveredModel[] = [
      {
        provider: 'gemini',
        id: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        capabilities: { textGeneration: true, streaming: true },
        discoveredAt: Date.now(),
      },
      {
        provider: 'gemini',
        id: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Lite',
        capabilities: { textGeneration: true, streaming: true },
        discoveredAt: Date.now(),
      },
    ];
    router.discoverAllModels = async () => mockModels;

    const res = await router.generateResponse('test query', mockRetrievalResults, mockAnalysis);
    assert.strictEqual(secondCandidateCalled, true);
    assert.strictEqual(res.answer, 'Answer from alternate candidate.');
    assert.strictEqual(res.failoverOccurred, true);
  });

  // Scenario 6: Invalid key disables provider without failing other providers
  it('Scenario 6: 401/403 invalid key disables that provider without failing other providers', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-invalid-gemini-key',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-invalid-gemini-key', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('403 Forbidden: API key not valid');
      err.status = 403;
      throw err;
    };
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-valid-groq-key', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq succeeded despite Gemini key being invalid.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq succeeded despite Gemini key being invalid.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'AUTH_OR_PERMISSION_ERROR');
  });

  // Scenario 7: No keys configured -> honest error with isError: true
  it('Scenario 7: No API keys configured -> honest error with isError: true without crashing', async () => {
    const router = new AdaptiveAIRouter();
    router.discoverAllModels = async () => [];

    const res = await router.generateResponse('test query', mockRetrievalResults, mockAnalysis);
    assert.strictEqual(res.isError, true);
    assert.strictEqual(res.modelUsed, 'unavailable');
    assert.ok(res.answer.includes('unable to reach my reasoning models'));
  });

  // Scenario 8: No compatible models -> honest error
  it('Scenario 8: No text-generation compatible models found -> honest error message', async () => {
    const router = new AdaptiveAIRouter();
    router.discoverAllModels = async () => [
      {
        provider: 'gemini',
        id: 'text-embedding-004',
        displayName: 'Embedding Model',
        capabilities: { textGeneration: false, streaming: false },
        discoveredAt: Date.now(),
      },
    ];

    const res = await router.generateResponse('test query', mockRetrievalResults, mockAnalysis);
    assert.strictEqual(res.isError, true);
    assert.strictEqual(res.modelUsed, 'unavailable');
  });

  // Scenario 9: Timeouts -> failover
  it('Scenario 9: Network timeout triggers error classification and failover', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('ETIMEDOUT: Connection timed out after 15000ms');
      err.code = 'ETIMEDOUT';
      throw err;
    };
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq succeeded after Gemini timed out.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq succeeded after Gemini timed out.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'TIMEOUT');
  });

  // Scenario 10: Empty/malformed output -> recovery with next candidate
  it('Scenario 10: Model returning empty whitespace is classified as MALFORMED_OUTPUT and triggers failover', async () => {
    const router = new AdaptiveAIRouter();
    router.setProvider('gemini', 'model-1', {
      generateResponse: async () => '   \n  ',
    });
    router.setProvider('gemini', 'model-2', {
      generateResponse: async () => 'Valid answer from model-2.',
    });

    router.discoverAllModels = async () => [
      {
        provider: 'gemini',
        id: 'model-1',
        displayName: 'Model 1',
        capabilities: { textGeneration: true, streaming: true },
        discoveredAt: Date.now(),
      },
      {
        provider: 'gemini',
        id: 'model-2',
        displayName: 'Model 2',
        capabilities: { textGeneration: true, streaming: true },
        discoveredAt: Date.now(),
      },
    ];

    const res = await router.generateResponse('test query', mockRetrievalResults, mockAnalysis);
    assert.strictEqual(res.answer, 'Valid answer from model-2.');
    assert.strictEqual(res.modelUsed, 'gemini:model-2');
    assert.strictEqual(res.diagnostics?.[0].category, 'MALFORMED_OUTPUT');
  });

  // Scenario 11: Cache refresh on 404
  it('Scenario 11: Discovery service invalidates model on 404', () => {
    const discovery = new ModelDiscoveryService();
    discovery.invalidateModel('gemini', 'gemini-nonexistent-model');
    const status = discovery.getStatus();
    assert.strictEqual(status.invalidModelsCount, 1);
  });

  // Scenario 12: Newly discovered model picked after refresh
  it('Scenario 12: Dynamically discovered candidate is selected when available', async () => {
    const tracker = new ModelHealthTracker();
    const selector = new DynamicModelSelector(tracker);

    const models: DiscoveredModel[] = [
      {
        provider: 'gemini',
        id: 'gemini-future-v3',
        displayName: 'Gemini Future 3.0',
        capabilities: { textGeneration: true, streaming: true },
        discoveredAt: Date.now(),
      },
    ];

    const ranked = selector.rankCandidates(models);
    assert.strictEqual(ranked.length, 1);
    assert.strictEqual(ranked[0].id, 'gemini-future-v3');
  });

  // Scenario 13: Retry limit stops loops at maxAttempts
  it('Scenario 13: Retry budget strictly enforced at maxAttempts without infinite loop', async () => {
    const router = new AdaptiveAIRouter({ maxAttempts: 3 });
    let attemptsCount = 0;

    router.setProvider('gemini', 'flaky-1', {
      generateResponse: async () => {
        attemptsCount++;
        throw new Error('500 Server Error');
      },
    });
    router.setProvider('gemini', 'flaky-2', {
      generateResponse: async () => {
        attemptsCount++;
        throw new Error('500 Server Error');
      },
    });
    router.setProvider('gemini', 'flaky-3', {
      generateResponse: async () => {
        attemptsCount++;
        throw new Error('500 Server Error');
      },
    });
    router.setProvider('gemini', 'flaky-4', {
      generateResponse: async () => {
        attemptsCount++;
        return 'Never called because budget is 3';
      },
    });

    router.discoverAllModels = async () => [
      { provider: 'gemini', id: 'flaky-1', displayName: '1', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
      { provider: 'gemini', id: 'flaky-2', displayName: '2', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
      { provider: 'gemini', id: 'flaky-3', displayName: '3', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
      { provider: 'gemini', id: 'flaky-4', displayName: '4', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
    ];

    const res = await router.generateResponse('test', mockRetrievalResults, mockAnalysis);
    assert.strictEqual(attemptsCount, 3);
    assert.strictEqual(res.isError, true);
  });

  // Scenario 14: Cooldown prevents calling unhealthy candidates
  it('Scenario 14: Active cooldown filters out candidate until expiry', () => {
    const tracker = new ModelHealthTracker(60);
    tracker.recordFailure('groq', 'llama-model', 'RATE_LIMIT_OR_QUOTA');

    const isEligibleNow = tracker.isEligible('groq', 'llama-model');
    assert.strictEqual(isEligibleNow, false);

    const isEligibleFuture = tracker.isEligible('groq', 'llama-model', Date.now() + 120 * 1000);
    assert.strictEqual(isEligibleFuture, true);
  });

  // Scenario 15: Conversation history & RAG context survive failover
  it('Scenario 15: Conversation history and RAG context passed intact to failover provider', async () => {
    const router = new AdaptiveAIRouter();
    let receivedHistory: any = null;
    let receivedResults: any = null;

    router.setProvider('gemini', 'model-fail', {
      generateResponse: async () => {
        throw new Error('503 Service Unavailable');
      },
    });
    router.setProvider('groq', 'model-success', {
      generateResponse: async (_q: any, r: any, _a: any, h: any) => {
        receivedResults = r;
        receivedHistory = h;
        return 'Success with full context.';
      },
    });

    router.discoverAllModels = async () => [
      { provider: 'gemini', id: 'model-fail', displayName: 'Fail', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'model-success', displayName: 'Success', capabilities: { textGeneration: true }, discoveredAt: Date.now() },
    ];

    const testHistory = [
      { role: 'user', content: 'What is CredVidhi?' },
      { role: 'assistant', content: 'CredVidhi is a lending platform.' },
    ];

    await router.generateResponse('Explain architecture', mockRetrievalResults, mockAnalysis, testHistory);

    assert.ok(receivedResults && receivedResults.length === 1);
    assert.strictEqual(receivedResults[0].chunk.documentId, 'credvidhi-spec');
    assert.ok(receivedHistory && receivedHistory.length === 2);
    assert.strictEqual(receivedHistory[0].content, 'What is CredVidhi?');
  });

  // Scenario 16: Frontend contract maintained (CopilotChatResponse)
  it('Scenario 16: Response matches expected CopilotChatResponse frontend contract schema', async () => {
    const orchestrator = new CopilotOrchestrator();
    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-key',
      primaryModel: 'gemini-2.5-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-key', 'gemini-2.5-flash');
    mockGemini.generateResponse = async () => 'Verified answer.';
    mockRouter.setProvider('gemini-2.5-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(typeof res.answer, 'string');
    assert.strictEqual(typeof res.intent, 'string');
    assert.ok(Array.isArray(res.citations));
    assert.strictEqual(typeof res.metadata, 'object');
    assert.strictEqual(typeof res.metadata.model, 'string');
    assert.strictEqual(typeof res.metadata.provider, 'string');
    assert.strictEqual(typeof res.metadata.attempts, 'number');
    assert.strictEqual(typeof res.metadata.failoverOccurred, 'boolean');
    assert.strictEqual(typeof res.metadata.totalLatencyMs, 'number');
  });

  // Scenario 17: Secrets sanitized from logs and diagnostics
  it('Scenario 17: Secrets and API keys are strictly sanitized from diagnostics and messages', () => {
    const dirtyError = 'Authentication error for key AIzaSyD34908fak3k3y_98327429384723984 with secret gsk_98324792384792384792384729384';
    const clean = sanitizeSecretString(dirtyError);

    assert.strictEqual(clean.includes('AIzaSyD34908fak3k3y'), false);
    assert.strictEqual(clean.includes('gsk_98324792384792384792384729384'), false);
    assert.ok(clean.includes('[REDACTED_GEMINI_KEY]'));
    assert.ok(clean.includes('[REDACTED_GROQ_KEY]'));

    const classified = classifyProviderError(new Error(dirtyError));
    assert.strictEqual(classified.reason.includes('AIzaSy'), false);
    assert.strictEqual(classified.reason.includes('gsk_'), false);
  });
});
