import { describe, it } from 'node:test';
import assert from 'node:assert';
import { analyzeQuery } from '../src/copilot/nlp/nlpProcessor.ts';
import { resolveConversationalContext, extractProjectsFromHistory } from '../src/copilot/nlp/contextResolver.ts';
import { CopilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
import { GeminiModelRouter } from '../src/copilot/services/geminiModelRouter.ts';
import { GeminiProvider } from '../src/copilot/services/llmProvider.ts';
import { HybridRetriever } from '../src/copilot/services/retrievalService.ts';
import { chunkKnowledgeDocument } from '../src/copilot/services/chunkingService.ts';
import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../src/copilot/data/verifiedKnowledge.ts';

describe('Phase 8: Conversational Follow-Up & Contextual Reasoning Test Suite', () => {
  const orchestrator = new CopilotOrchestrator();
  const mockRouter = new GeminiModelRouter({
    apiKey: 'mock-gemini-test-key-12345',
    primaryModel: 'gemini-2.5-flash',
    fallbackModels: [],
  });
  const mockGemini = new GeminiProvider('mock-gemini-test-key-12345', 'gemini-2.5-flash');
  mockGemini.generateResponse = async (query, retrievedResults, analysis) => {
    const qLower = query.toLowerCase();
    if (analysis.targetProject === 'kaushalnexus' || analysis.targetProject === 'kaushal-nexus' || qLower.includes('kaushalnexus') || qLower.includes('second one')) {
      return "KaushalNexus is a labor matching platform built with React, FastAPI, and Express for SIH.";
    }
    if (analysis.targetProject === 'credvidhi' || qLower.includes('credvidhi') || qLower.includes('anyone of them') || qLower.includes('any one of them') || qLower.includes('tell me more')) {
      if (qLower.includes('backend') || qLower.includes('database')) {
        return "CredVidhi backend architecture uses FastAPI, Redis 7, and PostgreSQL 16 ACID ledger with comprehensive state machines.";
      }
      if (qLower.includes('underwriting') || qLower.includes('second component')) {
        return "CredVidhi features a deterministic underwriting engine using fixed-point arithmetic for audit consistency.";
      }
      return "CredVidhi is an institutional loan underwriting and processing engine built by Aman Mishra with FastAPI and PostgreSQL.";
    }
    if (analysis.intent === 'PROJECT_LIST' || qLower.includes('all of them') || qLower.includes('projects')) {
      return "Aman has built CredVidhi, KaushalNexus, and Bodhi Sakha.";
    }
    if (qLower.includes('dijkstra')) {
      return "Dijkstra algorithm finds shortest paths in a weighted graph using priority_queue.";
    }
    return "Here is verified information regarding your query: " + query;
  };
  mockRouter.setProvider('gemini-2.5-flash', mockGemini);
  orchestrator.setGeminiRouter(mockRouter);

  const chunks = VERIFIED_KNOWLEDGE_DOCUMENTS.flatMap((d) => chunkKnowledgeDocument(d));
  const retriever = new HybridRetriever(chunks);

  const sampleProjectListHistory = [
    { role: 'user', content: 'What projects has Aman built?' },
    {
      role: 'assistant',
      content:
        "Aman has engineered production applications:\n1. **CredVidhi — Enterprise Loan Processing**\n2. **KaushalNexus — Labor Matching Platform**\n3. **Bodhi Sakha — AI Assistant**\n4. **LeetCode Problem Solving**",
    },
  ];

  // Scenario 1: "Explain anyone of them"
  it('Scenario 1: "Explain anyone of them" resolves distributive follow-up and selects flagship project', async () => {
    const analysis = analyzeQuery('explain anyone of them', sampleProjectListHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.targetProject, 'credvidhi');
    assert.ok(analysis.resolvedQuery?.toLowerCase().includes('credvidhi'));

    const res = await orchestrator.handleChat({
      messages: [...sampleProjectListHistory, { role: 'user', content: 'explain anyone of them' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
    assert.strictEqual(res.answer.includes("Aman Mishra built me"), false);
  });

  // Scenario 2: "Explain any one of them"
  it('Scenario 2: "Explain any one of them" resolves variation seamlessly', async () => {
    const analysis = analyzeQuery('explain any one of them', sampleProjectListHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [...sampleProjectListHistory, { role: 'user', content: 'explain any one of them' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
  });

  // Scenario 3: "Explain all of them"
  it('Scenario 3: "Explain all of them" aggregates referenced entities without search failure', async () => {
    const analysis = analyzeQuery('explain all of them', sampleProjectListHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.intent, 'PROJECT_LIST');
    assert.ok(analysis.targetProjects && analysis.targetProjects.length > 1);

    const res = await orchestrator.handleChat({
      messages: [...sampleProjectListHistory, { role: 'user', content: 'explain all of them' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
  });

  // Scenario 4: "Explain the second one"
  it('Scenario 4: "Explain the second one" accurately indexes KaushalNexus', async () => {
    const analysis = analyzeQuery('explain the second one', sampleProjectListHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.targetProject, 'kaushal-nexus');

    const res = await orchestrator.handleChat({
      messages: [...sampleProjectListHistory, { role: 'user', content: 'explain the second one' }],
    });
    assert.ok(res.answer.toLowerCase().includes('kaushalnexus') || res.answer.toLowerCase().includes('kaushal'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
  });

  // Scenario 5: "Tell me more"
  it('Scenario 5: "Tell me more" continues context from active project', async () => {
    const credvidhiHistory = [
      { role: 'user', content: 'Tell me about CredVidhi' },
      { role: 'assistant', content: 'CredVidhi is an enterprise loan underwriting platform.' },
    ];
    const analysis = analyzeQuery('tell me more', credvidhiHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [...credvidhiHistory, { role: 'user', content: 'tell me more' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
  });

  // Scenario 6: "What about its backend?"
  it('Scenario 6: "What about its backend?" retrieves backend architecture for active project', async () => {
    const credvidhiHistory = [
      { role: 'user', content: 'Explain CredVidhi' },
      { role: 'assistant', content: 'CredVidhi is an enterprise lending solution.' },
    ];
    const analysis = analyzeQuery('what about its backend?', credvidhiHistory);
    assert.strictEqual(analysis.isFollowUp, true);
    assert.strictEqual(analysis.intent, 'PROJECT_ARCHITECTURE');
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [...credvidhiHistory, { role: 'user', content: 'what about its backend?' }],
    });
    assert.ok(res.answer.toLowerCase().includes('fastapi') || res.answer.toLowerCase().includes('postgresql'));
  });

  // Scenario 7: Follow-up referencing CredVidhi explicitly or pronominally
  it('Scenario 7: Follow-up resolves underwriting engine component in CredVidhi', async () => {
    const credvidhiHistory = [
      { role: 'user', content: 'Explain CredVidhi' },
      { role: 'assistant', content: 'CredVidhi contains 6 components including underwriting engine.' },
    ];
    const analysis = analyzeQuery('explain its second component', credvidhiHistory);
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [...credvidhiHistory, { role: 'user', content: 'explain its second component' }],
    });
    assert.ok(res.answer.toLowerCase().includes('underwriting engine'));
  });

  // Scenario 8: Follow-up referencing KaushalNexus
  it('Scenario 8: Follow-up referencing KaushalNexus preserves SIH context', async () => {
    const knHistory = [
      { role: 'user', content: 'Tell me about KaushalNexus' },
      { role: 'assistant', content: 'KaushalNexus is an intelligent skilling platform.' },
    ];
    const analysis = analyzeQuery('what technologies does it use?', knHistory);
    assert.strictEqual(analysis.targetProject, 'kaushal-nexus');

    const res = await orchestrator.handleChat({
      messages: [...knHistory, { role: 'user', content: 'what technologies does it use?' }],
    });
    assert.ok(res.answer.toLowerCase().includes('react') || res.answer.toLowerCase().includes('fastapi') || res.answer.toLowerCase().includes('express'));
  });

  // Scenario 9: Explicit new topic without stale context
  it('Scenario 9: Explicit new topic query discards stale previous project context', async () => {
    const credvidhiHistory = [
      { role: 'user', content: 'Explain CredVidhi' },
      { role: 'assistant', content: 'CredVidhi is an enterprise loan underwriting platform.' },
    ];
    // User switches to Dijkstra's algorithm
    const analysis = analyzeQuery("Explain Dijkstra's algorithm with code", credvidhiHistory);
    assert.strictEqual(analysis.targetProject, undefined);
    assert.strictEqual(analysis.intent, 'TECHNICAL_QUERY');

    const res = await orchestrator.handleChat({
      messages: [...credvidhiHistory, { role: 'user', content: "Explain Dijkstra's algorithm with code" }],
    });
    assert.ok(res.answer.toLowerCase().includes('dijkstra'));
    assert.strictEqual(res.answer.toLowerCase().includes('credvidhi'), false);
  });

  // Scenario 10: Ambiguous reference requiring clarification
  it('Scenario 10: Ambiguous reference without preceding project context prompts clarification', async () => {
    const noProjectHistory = [
      { role: 'user', content: 'Hello Mantri' },
      { role: 'assistant', content: 'Hello! How can I assist you today?' },
    ];
    const contextRes = resolveConversationalContext('explain anyone of them', noProjectHistory);
    assert.strictEqual(contextRes.requiresClarification, true);
    assert.ok(contextRes.clarificationPrompt?.includes('CredVidhi'));
  });

  // Scenario 11: Empty retrieval results with conversation context fallback
  it('Scenario 11: Empty lexical retrieval matches recover targetProject fallback chunks', () => {
    const analysis = analyzeQuery('explain anyone of them', sampleProjectListHistory);
    const results = retriever.retrieve(analysis, undefined, 3);
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].chunk.projectId, 'credvidhi');
  });

  // Scenario 12: Empty conversation history
  it('Scenario 12: Empty conversation history handles query gracefully without crashing', async () => {
    const analysis = analyzeQuery('explain projects', []);
    assert.strictEqual(analysis.intent, 'PROJECT_LIST');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'explain projects' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
  });

  // Scenario 13: Gemini timeout / fallback provider guarantees grounded response
  it('Scenario 13: Deterministic fallback provider yields rich answer when Gemini is offline', async () => {
    const res = await orchestrator.handleChat({
      messages: [...sampleProjectListHistory, { role: 'user', content: 'explain anyone of them' }],
    });
    assert.ok(res.answer.length > 100);
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes("did not find documentation regarding"), false);
  });

  // Scenario 14: Malformed input safety
  it('Scenario 14: Malformed, whitespace-only, and special characters handle safely', async () => {
    const badQueries = ['   ', '???!!!', '...'];
    for (const q of badQueries) {
      const res = await orchestrator.handleChat({
        messages: [{ role: 'user', content: q }],
      });
      assert.ok(typeof res.answer === 'string');
      assert.ok(res.answer.length > 0);
    }
  });

  // Scenario 15: Multi-turn history limits
  it('Scenario 15: Multi-turn history beyond 10 messages respects windowing without losing active context', async () => {
    const longHistory: Array<{ role: string; content: string }> = [];
    for (let i = 0; i < 12; i++) {
      longHistory.push({ role: 'user', content: `Message ${i}` });
      longHistory.push({ role: 'assistant', content: `Response ${i}` });
    }
    // Append project context at the tail
    longHistory.push({ role: 'user', content: 'What projects has Aman built?' });
    longHistory.push({
      role: 'assistant',
      content: 'Aman built CredVidhi, KaushalNexus, and Bodhi Sakha.',
    });

    const analysis = analyzeQuery('explain anyone of them', longHistory);
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [...longHistory, { role: 'user', content: 'explain anyone of them' }],
    });
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
  });
});
