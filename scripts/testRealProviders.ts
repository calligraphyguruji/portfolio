/**
 * Standalone Provider Health Verification Script
 * Validates real API connectivity for Google Gemini and Groq
 * without exposing keys in output or logs.
 *
 * Usage:
 *   npx tsx scripts/testRealProviders.ts
 */

import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

async function testGemini() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const trimmed = rawKey.trim();
  const isPlaceholder = !trimmed || trimmed.length < 10 || /^(your_|change_me|dummy|<)/i.test(trimmed);

  if (isPlaceholder) {
    console.log('[-] Gemini: SKIPPED (GEMINI_API_KEY not set or placeholder)');
    return;
  }

  const model = process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';
  console.log(`[*] Gemini: Testing model "${model}" with provided key...`);

  try {
    const ai = new GoogleGenAI({ apiKey: trimmed });
    const start = Date.now();
    const res = await ai.models.generateContent({
      model,
      contents: 'Respond with exactly: "GEMINI_OK"',
      config: { maxOutputTokens: 20 },
    });
    const duration = Date.now() - start;
    console.log(`[+] Gemini: SUCCESS in ${duration}ms. Output: "${res.text?.trim()}"`);
  } catch (err: any) {
    const sanitized = String(err?.message || err).replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');
    console.error(`[-] Gemini: FAILED. Error: ${sanitized}`);
  }
}

async function testGroq() {
  const rawKey = process.env.GROQ_API_KEY || '';
  const trimmed = rawKey.trim();
  const isPlaceholder = !trimmed || trimmed.length < 10 || /^(your_|change_me|dummy|<)/i.test(trimmed);

  if (isPlaceholder) {
    console.log('[-] Groq: SKIPPED (GROQ_API_KEY not set or placeholder)');
    return;
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  console.log(`[*] Groq: Testing model "${model}" with provided key...`);

  try {
    const groq = new Groq({ apiKey: trimmed });
    const start = Date.now();
    const res = await groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Respond with exactly: "GROQ_OK"' }],
      max_tokens: 20,
    });
    const duration = Date.now() - start;
    console.log(`[+] Groq: SUCCESS in ${duration}ms. Output: "${res.choices?.[0]?.message?.content?.trim()}"`);
  } catch (err: any) {
    const sanitized = String(err?.message || err).replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');
    console.error(`[-] Groq: FAILED. Error: ${sanitized}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('Mantri Live Provider Verification');
  console.log('====================================================');
  await testGemini();
  console.log('----------------------------------------------------');
  await testGroq();
  console.log('====================================================');
}

main().catch(console.error);
