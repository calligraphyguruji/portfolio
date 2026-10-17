import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GeminiModelRouter, classifyGeminiError } from '../src/copilot/services/geminiModelRouter.ts';
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

const mockRetrievalResults: RetrievalResult[] = [
  {
    chunk: {
      id: 'credvidhi-arch-1',
      documentId: 'credvidhi-core',
      title: 'CredVidhi Architecture',
      section: 'Architecture',
      content: 'CredVidhi uses FastAPI, PostgreSQL ACID ledger, and Redis.',
      tokenCount: 15,
      keywords: ['credvidhi', 'fastapi', 'postgresql'],
      contentHash: 'hash123',
      url: 'https://calligraphyguruji.dev/#/project/credvidhi',
    },
    lexicalScore: 0.9,
    vectorScore: 0.85,
    combinedScore: 0.88,
  },
];

describe('Gemini Multi-Model Router & Failover Test Suite', () => {
  // TEST 1: Primary success without fallback
  it('TEST 1: Primary model succeeds on first attempt without failover', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-primary-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite', 'gemini-1.5-flash'],
      maxAttempts: 3,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-primary-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => 'Primary model response on CredVidhi.';
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const res = await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(res.answer, 'Primary model response on CredVidhi.');
    assert.strictEqual(res.modelUsed, 'gemini-2.0-flash');
    assert.strictEqual(res.attempts, 1);
    assert.strictEqual(res.failoverOccurred, false);
    assert.strictEqual(res.failoverReason, undefined);
  });

  // TEST 2: Primary 503 -> Fallback 1 success
  it('TEST 2: Primary 503 server error triggers automated failover to Fallback 1', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite', 'gemini-1.5-flash'],
      maxAttempts: 3,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('503 Service Unavailable: High server load');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback1 = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback1.generateResponse = async () => 'Fallback 1 response on CredVidhi.';
    router.setProvider('gemini-2.0-flash-lite', mockFallback1);

    const res = await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(res.answer, 'Fallback 1 response on CredVidhi.');
    assert.strictEqual(res.modelUsed, 'gemini-2.0-flash-lite');
    assert.strictEqual(res.attempts, 2);
    assert.strictEqual(res.failoverOccurred, true);
    assert.ok(res.failoverReason?.includes('SERVER_ERROR'));
  });

  // TEST 3: Primary 429 quota -> Fallback 1 success
  it('TEST 3: Primary 429 quota exhaustion switches to Fallback 1', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('GEMINI_QUOTA_ERROR: 429 Resource has been exhausted (e.g. check quota)');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => 'Quota failover success from lite.';
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    const res = await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(res.modelUsed, 'gemini-2.0-flash-lite');
    assert.strictEqual(res.attempts, 2);
    assert.strictEqual(res.failoverOccurred, true);
    assert.ok(res.failoverReason?.includes('QUOTA_ERROR'));
  });

  // TEST 4: Primary timeout -> Fallback 1 success
  it('TEST 4: Primary timeout error aborts and advances to Fallback 1', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('GEMINI_TIMEOUT: Request exceeded timeout of 12000ms.');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => 'Timeout failover response.';
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    const res = await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(res.modelUsed, 'gemini-2.0-flash-lite');
    assert.strictEqual(res.attempts, 2);
    assert.strictEqual(res.failoverOccurred, true);
    assert.ok(res.failoverReason?.includes('TIMEOUT'));
  });

  // TEST 5: Invalid model (404) -> Skip to next model
  it('TEST 5: Invalid or unsupported model (404) advances to valid model', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-unsupported-model',
      fallbackModels: ['gemini-2.0-flash'],
      maxAttempts: 2,
    });

    const mockInvalid = new GeminiProvider('AIzaSyD-mock-key', 'gemini-unsupported-model');
    mockInvalid.generateResponse = async () => {
      throw new Error('GEMINI_MODEL_ERROR: models/gemini-unsupported-model is not found: 404');
    };
    router.setProvider('gemini-unsupported-model', mockInvalid);

    const mockValid = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockValid.generateResponse = async () => 'Valid model response.';
    router.setProvider('gemini-2.0-flash', mockValid);

    const res = await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(res.modelUsed, 'gemini-2.0-flash');
    assert.strictEqual(res.attempts, 2);
    assert.strictEqual(res.failoverOccurred, true);
    assert.ok(res.failoverReason?.includes('MODEL_NOT_FOUND'));
  });

  // TEST 6: Auth failure (401) -> Immediate abort without model hopping
  it('TEST 6: Auth failure (401) halts immediately without hopping through other models', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-invalid-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite', 'gemini-1.5-flash'],
      maxAttempts: 3,
    });

    let fallbackCalled = false;
    const mockPrimary = new GeminiProvider('AIzaSyD-invalid-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('GEMINI_AUTH_ERROR: 401 API_KEY_INVALID');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-invalid-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => {
      fallbackCalled = true;
      return 'Should never be called';
    };
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    await assert.rejects(
      async () => {
        await router.generateResponseWithTelemetry(
          'Explain CredVidhi architecture',
          mockRetrievalResults,
          mockAnalysis
        );
      },
      (err: any) => {
        assert.ok(err.message.includes('GEMINI_AUTH_ERROR') || err.message.includes('401'));
        return true;
      }
    );

    assert.strictEqual(fallbackCalled, false, 'Fallback must NOT be called on auth failure');
  });

  // TEST 7: All configured models fail -> Controlled failure
  it('TEST 7: All configured models fail leads to GEMINI_ALL_MODELS_FAILED', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('503 Service Unavailable');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => {
      throw new Error('500 Internal Server Error');
    };
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    await assert.rejects(
      async () => {
        await router.generateResponseWithTelemetry(
          'Explain CredVidhi architecture',
          mockRetrievalResults,
          mockAnalysis
        );
      },
      /GEMINI_ALL_MODELS_FAILED/
    );
  });

  // TEST 8: Fallback retains identical RAG context chunks
  it('TEST 8: Fallback model receives identical retrieved RAG context chunks', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    let receivedChunks: RetrievalResult[] = [];

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('503 Service Unavailable');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async (query, results) => {
      receivedChunks = results;
      return 'Grounded fallback output';
    };
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    await router.generateResponseWithTelemetry(
      'Explain CredVidhi architecture',
      mockRetrievalResults,
      mockAnalysis
    );

    assert.strictEqual(receivedChunks.length, 1);
    assert.strictEqual(receivedChunks[0].chunk.id, 'credvidhi-arch-1');
    assert.strictEqual(receivedChunks[0].chunk.title, 'CredVidhi Architecture');
  });

  // TEST 9: Model recovers after cooldown window expires
  it('TEST 9: Model is eligible again after cooldown window expires', () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      cooldownSeconds: 2,
    });

    // Record failure to enter cooldown
    (router as any).recordFailure('gemini-2.0-flash', 'SERVER_ERROR');
    assert.strictEqual(router.isModelEligible('gemini-2.0-flash', Date.now()), false);

    // After 3 seconds, model should recover
    const futureTime = Date.now() + 3000;
    assert.strictEqual(router.isModelEligible('gemini-2.0-flash', futureTime), true);
  });

  // TEST 10: Safety block stops immediately without failover
  it('TEST 10: Safety block halts immediately without cycling to fallback models', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    let fallbackCalled = false;
    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('SAFETY_BLOCKED: Candidate content violates safety guidelines');
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => {
      fallbackCalled = true;
      return 'Should not be called';
    };
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    await assert.rejects(
      async () => {
        await router.generateResponseWithTelemetry(
          'Unsafe request',
          mockRetrievalResults,
          mockAnalysis
        );
      },
      /SAFETY_BLOCKED/
    );

    assert.strictEqual(fallbackCalled, false, 'Safety blocks must never cycle models');
  });

  // TEST 11: Concurrent requests do not corrupt router state
  it('TEST 11: Concurrent requests execute safely without state corruption', async () => {
    const router = new GeminiModelRouter({
      apiKey: 'AIzaSyD-mock-key',
      primaryModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.0-flash-lite'],
      maxAttempts: 2,
    });

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    let callCount = 0;
    mockPrimary.generateResponse = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 10));
      return `Response #${callCount}`;
    };
    router.setProvider('gemini-2.0-flash', mockPrimary);

    const promises = Array.from({ length: 5 }, (_, i) =>
      router.generateResponseWithTelemetry(
        `Concurrent query ${i}`,
        mockRetrievalResults,
        mockAnalysis
      )
    );

    const results = await Promise.all(promises);
    assert.strictEqual(results.length, 5);
    for (const r of results) {
      assert.strictEqual(r.modelUsed, 'gemini-2.0-flash');
      assert.strictEqual(r.failoverOccurred, false);
    }
  });

  // TEST 12: Successful fallback response formatting in CopilotOrchestrator
  it('TEST 12: Orchestrator includes failover telemetry in response metadata', async () => {
    const orchestrator = new CopilotOrchestrator();

    const mockPrimary = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash');
    mockPrimary.generateResponse = async () => {
      throw new Error('503 Service Unavailable');
    };

    const mockFallback = new GeminiProvider('AIzaSyD-mock-key', 'gemini-2.0-flash-lite');
    mockFallback.generateResponse = async () => {
      return '### CredVidhi Architecture\n\nFastAPI and PostgreSQL ledger verified.';
    };

    const router = (orchestrator as any).geminiRouter as GeminiModelRouter;
    router.setProvider('gemini-2.0-flash', mockPrimary);
    router.setProvider('gemini-2.0-flash-lite', mockFallback);

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'Explain CredVidhi architecture in detail' }],
    });

    assert.ok(res.answer.includes('CredVidhi'));
    assert.strictEqual(res.metadata.model, 'gemini:gemini-2.0-flash-lite');
    assert.strictEqual(res.metadata.requestedModel, 'gemini-2.0-flash');
    assert.strictEqual(res.metadata.attempts, 2);
    assert.strictEqual(res.metadata.failoverOccurred, true);
    assert.ok(res.metadata.failoverReason?.includes('SERVER_ERROR'));
  });
});
