import { describe, it } from 'node:test';
import assert from 'node:assert';
import handler from '../api/copilot.js';
import { AdaptiveAIRouter } from '../src/copilot/services/adaptiveAIRouter.ts';
import { CopilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';

// Helper to simulate Vercel serverless request
async function callServerless(body: any, method = 'POST'): Promise<{ status: number; data: any; headers: Record<string, string> }> {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let responseData: any = null;

  const mockReq = {
    method,
    headers: { origin: 'https://calligraphyguruji.dev' },
    body,
  };

  const mockRes = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v;
    },
    status(c: number) {
      statusCode = c;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
    end() {
      return this;
    },
  };

  await handler(mockReq, mockRes);
  return { status: statusCode, data: responseData, headers };
}

describe('Mantri Full-Pipeline Regression & Vercel Serverless Suite', () => {
  // Scenario 1: "Hi Mantri"
  it('Scenario 1: "Hi Mantri" processes cleanly without ReferenceError', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Hi Mantri' }],
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.answer);
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 2: "Who built you?"
  it('Scenario 2: "Who built you?" routes correctly without ReferenceError', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Who built you?' }],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.intent, 'CREATOR_IDENTITY');
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 3: "Who are you?"
  it('Scenario 3: "Who are you?" routes to ASSISTANT_IDENTITY cleanly', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Who are you?' }],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.intent, 'ASSISTANT_IDENTITY');
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 4: "Explain CredVidhi system architecture, finite state machine, and data flow."
  it('Scenario 4: "Explain CredVidhi system architecture, finite state machine, and data flow." does not throw resumeCard error', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Explain CredVidhi system architecture, finite state machine, and data flow.' }],
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.answer);
    assert.strictEqual(res.data.resumeCard, undefined);
    assert.ok(!JSON.stringify(res.data).includes('Cannot access'));
  });

  // Scenario 5: "Explain KaushalNexus."
  it('Scenario 5: "Explain KaushalNexus." retrieves project context without crashing', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Explain KaushalNexus.' }],
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.answer);
    assert.strictEqual(res.data.targetProject, 'kaushal-nexus');
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 6: "What technologies does Aman use?"
  it('Scenario 6: "What technologies does Aman use?" resolves technical skills without ReferenceError', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'What technologies does Aman use?' }],
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.answer);
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 7: A normal question that should NOT produce a resume card
  it('Scenario 7: Normal technical question does NOT produce a resume card', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'What is the time complexity of quicksort in the worst case?' }],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.resumeCard, undefined);
  });

  // Scenario 8: A request that SHOULD produce a resume card
  it('Scenario 8: Explicit resume request produces ATS-friendly ResumeCard object', async () => {
    const res = await callServerless({
      messages: [{ role: 'user', content: 'Can I see Aman Mishra resume?' }],
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.resumeCard, 'Must include resumeCard object');
    assert.strictEqual(res.data.resumeCard.filename, 'Aman_Mishra_Resume.pdf');
    assert.strictEqual(res.data.resumeCard.downloadUrl, '/Aman_Mishra_Resume.pdf');
    assert.strictEqual(res.data.resumeCard.isAvailable, true);
  });

  // Scenario 9: An empty message
  it('Scenario 9: Empty message is rejected with HTTP 400', async () => {
    const res1 = await callServerless({ messages: [] });
    assert.strictEqual(res1.status, 400);

    const res2 = await callServerless({ messages: [{ role: 'user', content: '   ' }] });
    assert.strictEqual(res2.status, 400);
  });

  // Scenario 10: A Gemini HTTP 404 response triggers failover
  it('Scenario 10: Gemini HTTP 404 response fails over to Groq without crashing', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-nonexistent-404', {
      generateResponse: async () => {
        const err: any = new Error('models/gemini-nonexistent-404 is not found');
        err.status = 404;
        throw err;
      },
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => 'Response generated via Groq fallback after Gemini 404.',
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-nonexistent-404', displayName: 'Gemini 404', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq Llama', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('Test question', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.provider, 'groq');
    assert.strictEqual(result.failoverOccurred, true);
    assert.ok(result.answer.includes('Groq fallback'));
  });

  // Scenario 11: A provider rate-limit response (429) triggers exponential backoff and failover
  it('Scenario 11: Rate-limit (429) on primary provider fails over to alternate provider', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        const err: any = new Error('RESOURCE_EXHAUSTED: Rate limit exceeded');
        err.status = 429;
        throw err;
      },
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => 'Response from Groq following 429 rate limit.',
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('Rate limit test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.provider, 'groq');
    assert.strictEqual(result.failoverOccurred, true);
  });

  // Scenario 12: A network failure
  it('Scenario 12: Network failure (ECONNRESET/FETCH_ERROR) fails over cleanly', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        throw new Error('fetch failed: ECONNRESET');
      },
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => 'Groq handled request following network disconnect.',
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('Network test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.provider, 'groq');
  });

  // Scenario 13: Gemini failure followed by successful Groq fallback
  it('Scenario 13: Gemini 500 error followed by successful Groq fallback', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        const err: any = new Error('Internal Server Error 500');
        err.status = 500;
        throw err;
      },
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => 'Groq recovered smoothly.',
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('500 test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.provider, 'groq');
    assert.strictEqual(result.isError, undefined);
  });

  // Scenario 14: Both providers failing returns honest error without ReferenceError
  it('Scenario 14: Both providers failing returns honest isError without ReferenceError', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        throw new Error('Gemini outage 503');
      },
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => {
        throw new Error('Groq outage 503');
      },
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('Total outage test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.isError, true);
    assert.strictEqual(result.modelUsed, 'unavailable');
    assert.ok(result.answer.includes('unable to complete an online reasoning pass'));
  });

  // Scenario 15: Retry after an unsuccessful request
  it('Scenario 15: Retry after failure succeeds on recovery', async () => {
    let shouldFail = true;
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('Temporary 503');
        }
        return 'Recovered answer on retry!';
      },
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const firstTry = await mockRouter.generateResponse('Retry test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(firstTry.isError, true);

    // Simulated backoff window elapses upon user retry
    mockRouter.getHealthTracker().reset();
    const retry = await mockRouter.generateResponse('Retry test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(retry.isError, undefined);
    assert.strictEqual(retry.answer, 'Recovered answer on retry!');
  });

  // Scenario 16: Two consecutive successful messages
  it('Scenario 16: Two consecutive successful messages preserve consistency', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async (_q, _r, _a, history) => `Answer for prompt ${(history || []).length}`,
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const r1 = await mockRouter.generateResponse('First question', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(r1.isError, undefined);

    const r2 = await mockRouter.generateResponse('Second question', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(r2.isError, undefined);
  });

  // Scenario 17: Successful response followed by failed response and another success
  it('Scenario 17: Sequence of Success -> Failure -> Success behaves stably', async () => {
    let callCount = 0;
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        callCount++;
        if (callCount === 2) throw new Error('Intermittent spike');
        return `Success call ${callCount}`;
      },
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const step1 = await mockRouter.generateResponse('Query 1', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(step1.isError, undefined);

    const step2 = await mockRouter.generateResponse('Query 2', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(step2.isError, true);

    // Cooldown elapsed on subsequent query
    mockRouter.getHealthTracker().reset();
    const step3 = await mockRouter.generateResponse('Query 3', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(step3.isError, undefined);
    assert.strictEqual(step3.answer, 'Success call 3');
  });

  // Scenario 18: Malformed or unexpected provider response data
  it('Scenario 18: Malformed or empty text from provider fails over safely without exception', async () => {
    const mockRouter = new AdaptiveAIRouter();
    mockRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => '    ', // Whitespace only triggers MALFORMED_OUTPUT
    });
    mockRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => 'Valid fallback text',
    });
    mockRouter.discoverAllModels = async () => [
      { provider: 'gemini', id: 'gemini-2.0-flash', displayName: 'Gemini', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
      { provider: 'groq', id: 'llama-3.3-70b-versatile', displayName: 'Groq', capabilities: { textGeneration: true, streaming: true, toolCalling: true }, discoveredAt: Date.now() },
    ];

    const result = await mockRouter.generateResponse('Malformed test', [], { intent: 'TECHNICAL_QUERY' } as any);
    assert.strictEqual(result.provider, 'groq');
    assert.strictEqual(result.answer, 'Valid fallback text');
  });

  // Scenario 19: Full Orchestrator fallback to Local Knowledge Engine during LLM outage
  it('Scenario 19: Total LLM outage engages local knowledge engine gracefully without returning API key error', async () => {
    const orchestrator = new CopilotOrchestrator();
    // Simulate total LLM outage on both Gemini and Groq
    orchestrator.adaptiveRouter.setProvider('gemini', 'gemini-2.0-flash', {
      generateResponse: async () => {
        throw new Error('Gemini network timeout');
      },
    });
    orchestrator.adaptiveRouter.setProvider('groq', 'llama-3.3-70b-versatile', {
      generateResponse: async () => {
        throw new Error('Groq rate limited 429');
      },
    });
    orchestrator.adaptiveRouter.discoverAllModels = async () => [];

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'What is CredVidhi?' }],
    });

    // Invariant: Never return API key or configuration error to user
    assert.strictEqual(res.isError, undefined);
    assert.ok(!res.answer.includes('GEMINI_API_KEY'));
    assert.ok(!res.answer.includes('GROQ_API_KEY'));
    assert.ok(!res.answer.includes('unable to reach my configured AI reasoning providers'));
    assert.ok(res.answer.includes('CredVidhi'));
    assert.strictEqual(res.metadata.model, 'knowledge-engine:grounded-composer');
  });
});

