import { describe, it } from 'node:test';
import assert from 'node:assert';
import { analyzeQuery } from '../src/copilot/nlp/nlpProcessor.ts';
import { CopilotOrchestrator } from '../src/copilot/services/copilotOrchestrator.ts';
import { HybridRetriever } from '../src/copilot/services/retrievalService.ts';
import { chunkKnowledgeDocument } from '../src/copilot/services/chunkingService.ts';
import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../src/copilot/data/verifiedKnowledge.ts';

describe('Phase 8: Intent, RAG & Question Answering Regression Test Suite', () => {
  const orchestrator = new CopilotOrchestrator();
  const chunks = VERIFIED_KNOWLEDGE_DOCUMENTS.flatMap((d) => chunkKnowledgeDocument(d));
  const retriever = new HybridRetriever(chunks);

  // TEST 1: "explain projects"
  it('TEST 1: "explain projects" explains projects, never returns creator intro or mantri-identity citations', async () => {
    const analysis = analyzeQuery('explain projects');
    assert.strictEqual(analysis.intent, 'PROJECT_LIST');

    const results = retriever.retrieve(analysis, undefined, 4);
    assert.ok(results.length > 0);
    assert.ok(results.every((r) => r.chunk.documentId !== 'mantri-identity'));

    const citations = retriever.generateCitations(results);
    assert.ok(citations.every((c) => !c.sourceId.includes('mantri-identity')));

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'explain projects' }],
    });

    assert.strictEqual(res.intent, 'PROJECT_LIST');
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes('Aman Mishra built me'), false);
    assert.strictEqual(res.answer.includes('Assistant Name:'), false);
    assert.ok(res.citations.every((c) => !c.sourceId.includes('mantri-identity')));
  });

  // TEST 2: "what projects has aman built"
  it('TEST 2: "what projects has aman built" returns project overview without creator introduction', async () => {
    const analysis = analyzeQuery('what projects has aman built');
    assert.strictEqual(analysis.intent, 'PROJECT_LIST');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'what projects has aman built' }],
    });
    assert.strictEqual(res.intent, 'PROJECT_LIST');
    assert.ok(res.answer.toLowerCase().includes('credvidhi'));
    assert.strictEqual(res.answer.includes('Aman Mishra built me'), false);
  });

  // TEST 3: "who built you"
  it('TEST 3: "who built you" identifies Aman Mishra as creator', async () => {
    const analysis = analyzeQuery('who built you');
    assert.strictEqual(analysis.intent, 'CREATOR_IDENTITY');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'who built you' }],
    });
    assert.strictEqual(res.intent, 'CREATOR_IDENTITY');
    assert.ok(res.answer.includes('Aman Mishra built me'));
  });

  // TEST 4: "who are you"
  it('TEST 4: "who are you" explains assistant identity', async () => {
    const analysis = analyzeQuery('who are you');
    assert.strictEqual(analysis.intent, 'ASSISTANT_IDENTITY');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'who are you' }],
    });
    assert.strictEqual(res.intent, 'ASSISTANT_IDENTITY');
    assert.ok(res.answer.includes('Mantri'));
    assert.ok(res.answer.includes('Aman Mishra'));
  });

  // TEST 5: "explain CredVidhi"
  it('TEST 5: "explain CredVidhi" returns CredVidhi details and relevant citations', async () => {
    const analysis = analyzeQuery('explain CredVidhi');
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const results = retriever.retrieve(analysis, undefined, 4);
    assert.ok(results.some((r) => r.chunk.projectId === 'credvidhi'));
    assert.ok(results.every((r) => r.chunk.documentId !== 'mantri-identity'));

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'explain CredVidhi' }],
    });
    assert.strictEqual(res.targetProject, 'credvidhi');
    assert.ok(res.answer.toLowerCase().includes('underwriting') || res.answer.toLowerCase().includes('credvidhi'));
  });

  // TEST 6: "what is the architecture of CredVidhi"
  it('TEST 6: "what is the architecture of CredVidhi" returns architecture explanation and diagram', async () => {
    const analysis = analyzeQuery('what is the architecture of CredVidhi');
    assert.strictEqual(analysis.intent, 'PROJECT_ARCHITECTURE');
    assert.strictEqual(analysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'what is the architecture of CredVidhi' }],
    });
    assert.strictEqual(res.intent, 'PROJECT_ARCHITECTURE');
    assert.ok(res.mermaidDiagram !== undefined);
    assert.ok(res.answer.toLowerCase().includes('fastapi') || res.answer.toLowerCase().includes('fsm'));
  });

  // TEST 7: "what technologies does Aman know"
  it('TEST 7: "what technologies does Aman know" returns technical skills, not creator response', async () => {
    const analysis = analyzeQuery('what technologies does Aman know');
    assert.ok(analysis.intent === 'TECHNICAL_SKILLS' || analysis.intent === 'TECH_STACK');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'what technologies does Aman know' }],
    });
    assert.ok(res.answer.includes('C++') || res.answer.includes('React'));
    assert.strictEqual(res.answer.includes('Aman Mishra built me'), false);
  });

  // TEST 8: "tell me about his education"
  it('TEST 8: "tell me about his education" returns education details', async () => {
    const analysis = analyzeQuery('tell me about his education');
    assert.strictEqual(analysis.intent, 'EDUCATION');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'tell me about his education' }],
    });
    assert.ok(res.answer.toLowerCase().includes('niet'));
    assert.ok(res.answer.includes('9.38'));
  });

  // TEST 9: "tell me about his internship"
  it('TEST 9: "tell me about his internship" returns internship details', async () => {
    const analysis = analyzeQuery('tell me about his internship');
    assert.strictEqual(analysis.intent, 'INTERNSHIP');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'tell me about his internship' }],
    });
    assert.ok(res.answer.toLowerCase().includes('codomax'));
  });

  // TEST 10: "what is RAG"
  it('TEST 10: "what is RAG" explains RAG conceptually', async () => {
    const analysis = analyzeQuery('what is RAG');
    assert.ok(analysis.intent === 'TECHNICAL_QUERY' || analysis.intent === 'GENERAL_TECHNICAL_QUESTION');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'what is RAG' }],
    });
    assert.ok(res.answer.includes('Retrieval-Augmented Generation'));
    assert.strictEqual(res.answer.toLowerCase().includes('amazon clone'), false);
  });

  // TEST 11: "explain binary search"
  it('TEST 11: "explain binary search" explains binary search with complexity and code', async () => {
    const analysis = analyzeQuery('explain binary search');
    assert.ok(analysis.intent === 'TECHNICAL_QUERY' || analysis.intent === 'CODING_QUESTION');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'explain binary search' }],
    });
    assert.ok(res.answer.toLowerCase().includes('binary search'));
    assert.ok(res.answer.includes('O(log N)') || res.answer.includes('\\mathcal{O}(\\log N)'));
  });

  // TEST 12: "show me your resume"
  it('TEST 12: "show me your resume" delivers interactive resume card', async () => {
    const analysis = analyzeQuery('show me your resume');
    assert.ok(analysis.intent === 'RESUME_REQUEST' || analysis.intent === 'RESUME');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'show me your resume' }],
    });
    assert.ok(res.resumeCard !== undefined);
    assert.strictEqual(res.resumeCard?.filename, 'Aman_Mishra_Resume.pdf');
  });

  // TEST 13: "hello"
  it('TEST 13: "hello" returns conversational greeting without project dump or identity dump', async () => {
    const analysis = analyzeQuery('hello');
    assert.ok(analysis.intent === 'GENERAL_CONVERSATION' || analysis.intent === 'GREETING');

    const res = await orchestrator.handleChat({
      messages: [{ role: 'user', content: 'hello' }],
    });
    assert.ok(res.answer.includes('Mantri'));
    assert.strictEqual(res.answer.includes('Assistant Name:'), false);
  });

  // TEST 14: Multi-turn: "Tell me about CredVidhi" -> "Explain its second component"
  it('TEST 14: Multi-turn resolves follow-up to CredVidhi underwriting engine', async () => {
    const history = [
      { role: 'user', content: 'Tell me about CredVidhi' },
      { role: 'assistant', content: 'CredVidhi is an enterprise loan origination system.' },
    ];

    const followUpAnalysis = analyzeQuery('Explain its second component', history);
    assert.strictEqual(followUpAnalysis.targetProject, 'credvidhi');

    const res = await orchestrator.handleChat({
      messages: [
        ...history,
        { role: 'user', content: 'Explain its second component' },
      ],
    });
    assert.ok(res.answer.toLowerCase().includes('underwriting engine'));
  });
});
