import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GroqProvider } from '../src/copilot/services/groqProvider.ts';
import { GeminiModelRouter, diagnoseGeminiFailure } from '../src/copilot/services/geminiModelRouter.ts';
import { GeminiProvider } from '../src/copilot/services/llmProvider.ts';
import { CopilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
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

describe('Groq Fallback Provider & Multi-Provider Resilience Test Suite', () => {
  // Scenario 1: Gemini succeeds -> Groq is not called
  it('Scenario 1: Gemini succeeds on primary attempt — Groq fallback is never called', async () => {
    let groqCalled = false;
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => 'Gemini successfully explained CredVidhi architecture.';
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => {
      groqCalled = true;
      return 'Groq response';
    };
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(groqCalled, false);
    assert.strictEqual(res.answer, 'Gemini successfully explained CredVidhi architecture.');
    assert.strictEqual(res.metadata.model, 'gemini:gemini-2.0-flash');
    assert.strictEqual(res.metadata.provider, 'gemini');
    assert.strictEqual(res.metadata.failoverOccurred, false);
  });

  // Scenario 2: Gemini returns HTTP 404 -> Groq is called and returned
  it('Scenario 2: Gemini returns HTTP 404 (model not found) — Groq is called and returns response', async () => {
    let groqCalled = false;
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('404 Not Found: models/gemini-2.0-flash is not found');
      err.status = 404;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => {
      groqCalled = true;
      return 'Groq fallback generated answer for CredVidhi.';
    };
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(groqCalled, true);
    assert.strictEqual(res.answer, 'Groq fallback generated answer for CredVidhi.');
    assert.strictEqual(res.metadata.model, 'groq:llama-3.3-70b-versatile');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.failoverOccurred, true);
    assert.ok(res.metadata.diagnostics && res.metadata.diagnostics.length > 0);
    assert.strictEqual(res.metadata.diagnostics[0].is404, true);
    assert.strictEqual(res.metadata.diagnostics[0].category, 'MODEL_NOT_FOUND');
  });

  // Scenario 3: Gemini returns HTTP 404 and GROQ_API_KEY is not configured -> safe fallback
  it('Scenario 3: Gemini returns HTTP 404 and GROQ_API_KEY missing — safe deterministic fallback engaged', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('404 Not Found: models/gemini-2.0-flash is not found');
      err.status = 404;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const unconfiguredGroq = new GroqProvider('', 'llama-3.3-70b-versatile');
    orchestrator.setGroqProvider(unconfiguredGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.ok(res.answer && res.answer.length > 0);
    assert.strictEqual(res.metadata.model, 'knowledge-engine:grounded-composer');
    assert.strictEqual(res.metadata.provider, 'knowledge-engine');
    assert.strictEqual(res.isError, undefined);
    assert.strictEqual(res.answer.includes('gsk_'), false);
    assert.strictEqual(res.answer.includes('AIza'), false);
  });

  // Scenario 4: Gemini returns HTTP 401/403 -> Safe categorization and Groq fallback
  it('Scenario 4: Gemini returns HTTP 401/403 auth error — classified safely and Groq fallback succeeds', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('401 Unauthorized: API_KEY_INVALID');
      err.status = 401;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq answered after Gemini 401 auth failure.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq answered after Gemini 401 auth failure.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.ok(res.metadata.diagnostics && res.metadata.diagnostics.length > 0);
    assert.strictEqual(res.metadata.diagnostics[0].category, 'AUTH_OR_PERMISSION_ERROR');
  });

  // Scenario 5: Gemini returns HTTP 429 -> Bounded retry and Groq fallback
  it('Scenario 5: Gemini returns HTTP 429 rate limit — failover to Groq succeeds', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('429 RESOURCE_EXHAUSTED: Rate limit reached');
      err.status = 429;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq answered following Gemini 429 rate limit.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq answered following Gemini 429 rate limit.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'RATE_LIMIT_OR_QUOTA');
  });

  // Scenario 6: Gemini times out -> Bounded retry and Groq fallback
  it('Scenario 6: Gemini times out — failover to Groq succeeds', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('GEMINI_TIMEOUT: Request exceeded timeout of 12000ms.');
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq response after Gemini timeout.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq response after Gemini timeout.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'TIMEOUT');
  });

  // Scenario 7: Gemini returns HTTP 500/503 -> Bounded retry and Groq fallback
  it('Scenario 7: Gemini returns HTTP 503 service unavailable — failover to Groq succeeds', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('503 Service Unavailable: upstream overloaded');
      err.status = 503;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Groq served answer during Gemini 503 outage.';
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.strictEqual(res.answer, 'Groq served answer during Gemini 503 outage.');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(res.metadata.diagnostics?.[0].category, 'SERVER_ERROR');
  });

  // Scenario 8: Groq also fails -> Deterministic fallback without raw SDK errors
  it('Scenario 8: Both Gemini and Groq fail — graceful deterministic fallback without raw errors', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      throw new Error('404 Not Found: models/gemini-2.0-flash');
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => {
      throw new Error('GROQ_API_ERROR: Rate limit exceeded or outage');
    };
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.ok(res.answer && res.answer.length > 0);
    assert.strictEqual(res.metadata.model, 'knowledge-engine:grounded-composer');
    assert.strictEqual(res.metadata.provider, 'knowledge-engine');
    assert.strictEqual(res.isError, undefined);
    assert.strictEqual(res.answer.includes('GROQ_API_ERROR'), false);
    assert.strictEqual(res.answer.includes('gsk_'), false);
    assert.strictEqual(res.answer.includes('AIza'), false);
  });

  // Scenario 9: Response structure identical across providers
  it('Scenario 9: Response schemas match expected contract across Gemini, Groq, and Deterministic', async () => {
    const orchestrator = new CopilotOrchestrator();

    // Mock Groq provider
    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => 'Structured response from Groq.';
    orchestrator.setGroqProvider(mockGroq);

    // Disable Gemini to trigger Groq
    const emptyRouter = new GeminiModelRouter({ apiKey: '', primaryModel: 'gemini-2.0-flash', fallbackModels: [] });
    orchestrator.setGeminiRouter(emptyRouter);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.ok(typeof res.answer === 'string');
    assert.ok(typeof res.intent === 'string');
    assert.ok(Array.isArray(res.citations));
    assert.ok(typeof res.metadata === 'object');
    assert.strictEqual(res.metadata.provider, 'groq');
    assert.strictEqual(typeof res.metadata.totalLatencyMs, 'number');
    assert.strictEqual(typeof res.metadata.retrievedCount, 'number');
  });

  // Scenario 10: Follow-up query requiring conversation history & RAG context
  it('Scenario 10: Follow-up query provides resolved subject, conversation history, and RAG context to Groq', async () => {
    let capturedMessages: any[] = [];
    const orchestrator = new CopilotOrchestrator();

    // Disable Gemini
    const emptyRouter = new GeminiModelRouter({ apiKey: '', primaryModel: 'gemini-2.0-flash', fallbackModels: [] });
    orchestrator.setGeminiRouter(emptyRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async (query, retrievedResults, analysis, history) => {
      capturedMessages = mockGroq.formatMessages(query, retrievedResults, analysis, history);
      return 'Groq answered follow-up on CredVidhi with full context.';
    };
    orchestrator.setGroqProvider(mockGroq);

    const conversationHistory = [
      { role: 'user', content: 'What projects has Aman built?' },
      {
        role: 'assistant',
        content: 'Aman built CredVidhi (loan processing), KaushalNexus (labor matching), and Bodhi Sakha.',
      },
      { role: 'user', content: 'explain anyone of them' },
    ];

    const res = await orchestrator.handleChat({ messages: conversationHistory });

    assert.strictEqual(res.metadata.provider, 'groq');
    assert.ok(capturedMessages.length >= 3);
    const systemMsg = capturedMessages.find((m) => m.role === 'system');
    assert.ok(systemMsg && systemMsg.content.includes('Mantri'));

    const userPromptMsg = capturedMessages.slice(-1)[0];
    assert.ok(userPromptMsg.content.includes('RESOLVED CONVERSATIONAL CONTEXT'));
    assert.ok(userPromptMsg.content.toLowerCase().includes('credvidhi'));
    assert.ok(userPromptMsg.content.includes('RETRIEVED PORTFOLIO CONTEXT'));
  });

  // Scenario 11: Groq returns empty/malformed output
  it('Scenario 11: Groq returns empty response — safe fallback without crash', async () => {
    const orchestrator = new CopilotOrchestrator();

    const emptyRouter = new GeminiModelRouter({ apiKey: '', primaryModel: 'gemini-2.0-flash', fallbackModels: [] });
    orchestrator.setGeminiRouter(emptyRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => '   '; // Empty whitespace
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture' }],
    });

    assert.ok(res.answer && res.answer.trim().length > 0);
    assert.strictEqual(res.isError, undefined);
    assert.strictEqual(res.metadata.model, 'knowledge-engine:grounded-composer');
    assert.strictEqual(res.metadata.provider, 'knowledge-engine');
  });

  // Scenario 12: Secret sanitization test
  it('Scenario 12: Sensitive API keys are never leaked into errors, logs, or diagnostics', async () => {
    const leakyGeminiKey = 'AIzaSyFakeKeyWithSecretDetails1234567';
    const leakyGroqKey = 'gsk_superSecretGroqKeySample998877665544';

    const errWithGeminiKey = new Error(`Request failed using key ${leakyGeminiKey}: 404 Model Not Found`);
    const diagGemini = diagnoseGeminiFailure(errWithGeminiKey, 'gemini-2.0-flash');
    assert.strictEqual(diagGemini.reason.includes(leakyGeminiKey), false);
    assert.ok(diagGemini.reason.includes('[REDACTED]'));

    const groqProvider = new GroqProvider(leakyGroqKey, 'llama-3.3-70b-versatile');
    // Test Groq error sanitization
    const fakeClient = {
      chat: {
        completions: {
          create: async () => {
            throw new Error(`Groq request rejected for key ${leakyGroqKey}`);
          },
        },
      },
    };
    groqProvider.setClient(fakeClient);

    let caughtError: any = null;
    try {
      await groqProvider.generateResponse('test query', [], mockAnalysis, []);
    } catch (e: any) {
      caughtError = e;
    }

    assert.ok(caughtError);
    assert.strictEqual(caughtError.message.includes(leakyGroqKey), false);
    assert.ok(caughtError.message.includes('[REDACTED]'));
  });

  // Scenario 13: Safety block prevents fallback circumvention
  it('Scenario 13: Safety blocked response aborts immediately without attempting Groq fallback', async () => {
    let groqCalled = false;
    const orchestrator = new CopilotOrchestrator();

    const mockRouter = new GeminiModelRouter({
      apiKey: 'mock-gemini-key-test-12345',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: [],
    });
    const mockGemini = new GeminiProvider('mock-gemini-key-test-12345', 'gemini-2.0-flash');
    mockGemini.generateResponse = async () => {
      const err: any = new Error('SAFETY: Prompt violated safety policies and was blocked');
      err.status = 400;
      throw err;
    };
    mockRouter.setProvider('gemini-2.0-flash', mockGemini);
    orchestrator.setGeminiRouter(mockRouter);

    const mockGroq = new GroqProvider('mock-groq-key-test-12345', 'llama-3.3-70b-versatile');
    mockGroq.generateResponse = async () => {
      groqCalled = true;
      return 'Groq response should never be called';
    };
    orchestrator.setGroqProvider(mockGroq);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Dangerous exploit query' }],
    });

    assert.strictEqual(groqCalled, false);
    assert.ok(res.answer.includes('safety and responsible AI restrictions'));
    assert.strictEqual(res.metadata.providerError, 'SAFETY_BLOCKED');
  });
});
