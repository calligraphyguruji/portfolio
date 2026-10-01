import crypto from 'node:crypto';

export interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company_hp?: string;
  turnstileToken?: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
}

export interface ContactHandlerResult {
  status: number;
  data: ContactApiResponse;
}

// ============================================================================
// IN-MEMORY RATE LIMIT & DEDUPLICATION CACHE
// ============================================================================
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const duplicateHashes = new Map<string, number>();

const BURST_LIMIT_MS = 30 * 1000; // 30 seconds burst window
const HOURLY_LIMIT_MS = 60 * 60 * 1000; // 1 hour sliding window
const MAX_SUBMISSIONS_PER_HOUR = 3; // Max 3 submissions per IP / Email per hour
const DUP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes duplicate detection

/**
 * Periodically purge stale records to avoid memory retention
 */
const cleanupStaleRecords = () => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    const active = record.timestamps.filter((t) => now - t < HOURLY_LIMIT_MS);
    if (active.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, { timestamps: active });
    }
  }

  for (const [hash, expiresAt] of duplicateHashes.entries()) {
    if (now > expiresAt) {
      duplicateHashes.delete(hash);
    }
  }
};

/**
 * Check if the given identifier (IP or normalized email) violates rate limits.
 */
export const checkRateLimit = (
  identifier: string
): { allowed: boolean; retryAfterSeconds?: number } => {
  cleanupStaleRecords();
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.timestamps.length === 0) {
    return { allowed: true };
  }

  const activeTimestamps = record.timestamps.filter((t) => now - t < HOURLY_LIMIT_MS);

  // 1. Short burst protection (30 seconds)
  const lastSubmission = activeTimestamps[activeTimestamps.length - 1];
  if (lastSubmission && now - lastSubmission < BURST_LIMIT_MS) {
    const waitTime = Math.ceil((BURST_LIMIT_MS - (now - lastSubmission)) / 1000);
    return { allowed: false, retryAfterSeconds: waitTime };
  }

  // 2. Hourly volume limit (max 3 per hour)
  if (activeTimestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    const oldestInWindow = activeTimestamps[0];
    const waitTime = Math.ceil((HOURLY_LIMIT_MS - (now - oldestInWindow)) / 1000);
    return { allowed: false, retryAfterSeconds: waitTime };
  }

  return { allowed: true };
};

/**
 * Record a successful submission against the rate limiter.
 */
export const recordSubmission = (identifier: string): void => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter((t) => now - t < HOURLY_LIMIT_MS);
  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });
};

/**
 * Check and record duplicate message hashes.
 */
export const checkAndRecordDuplicate = (fingerprint: string): boolean => {
  cleanupStaleRecords();
  const now = Date.now();
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');

  const existing = duplicateHashes.get(hash);
  if (existing && now < existing) {
    return true; // Is duplicate
  }

  duplicateHashes.set(hash, now + DUP_EXPIRY_MS);
  return false;
};

// ============================================================================
// EMAIL SYNTAX VALIDATION
// ============================================================================

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const isValidEmailFormat = (email: string): boolean => {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length < 5 || trimmed.length > 100) return false;
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) return false;
  if (!EMAIL_REGEX.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

  return true;
};

// ============================================================================
// PROFESSIONAL MESSAGE QUALITY & CONTENT ABUSE EVALUATOR
// ============================================================================

export interface QualityValidationResult {
  passes: boolean;
  userMessage?: string;
  debugReason?: string;
}

/**
 * Evaluates message structure, tone, and intentional context.
 * Filters low-effort chat spam, keyboard smash, repetitive gibberish,
 * and WhatsApp-style demands while preserving legitimate conversational
 * inquiries (including Indian English and non-native phrasing).
 */
export const validateMessageQuality = (
  name: string,
  subject: string,
  message: string
): QualityValidationResult => {
  const genericRejection = {
    passes: false,
    userMessage: 'Please provide a clear and professional message describing your inquiry.',
  };

  const trimmedMessage = message.trim();
  const fullText = `${name} ${subject} ${message}`.toLowerCase();

  // 1. Character repetition flood (e.g. aaaaaaa, hhhhhhh, !!!!!!!, ???????, ignoring spaces and markdown dividers)
  if (/([^\s\-_=*#])\1{4,}/.test(trimmedMessage)) {
    return { ...genericRejection, debugReason: 'character-repetition-flood' };
  }

  // 2. Excessive punctuation (> 5 exclamation/question marks and high ratio)
  const punctuationCount = (trimmedMessage.match(/[!?]/g) || []).length;
  if (punctuationCount > 5 && punctuationCount / trimmedMessage.length > 0.15) {
    return { ...genericRejection, debugReason: 'excessive-punctuation' };
  }

  // 3. Excessive Emojis or Emoji-only content
  const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = trimmedMessage.match(emojiRegex) || [];
  const textWithoutEmojis = trimmedMessage.replace(emojiRegex, '').trim();

  if (emojis.length > 0) {
    // If emoji-only or virtually no text
    if (textWithoutEmojis.length < 5) {
      return { ...genericRejection, debugReason: 'emoji-only' };
    }
    // More than 4 emojis or emojis taking up over 20% of characters
    if (emojis.length > 4 || emojis.length / trimmedMessage.length > 0.2) {
      return { ...genericRejection, debugReason: 'excessive-emojis' };
    }
  }

  // 4. Excessive ALL CAPS (shouting spam, e.g. "HELLO BRO CALL ME FAST")
  const lettersOnly = trimmedMessage.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length >= 15) {
    const uppercaseCount = (trimmedMessage.match(/[A-Z]/g) || []).length;
    if (uppercaseCount / lettersOnly.length > 0.7) {
      return { ...genericRejection, debugReason: 'excessive-all-caps' };
    }
  }

  // 5. Keyboard smash / consonant clusters (e.g. "asdfghjkl", "qwrtpsdfg", "zxcvbnm")
  // 6 or more consecutive consonants within an alphabetic token
  if (/\b[a-zA-Z]*[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}[a-zA-Z]*\b/.test(trimmedMessage)) {
    return { ...genericRejection, debugReason: 'keyboard-smash' };
  }

  // 6. Tokenize words for length, vocabulary, and repetition
  const words = trimmedMessage
    .toLowerCase()
    .split(/[\s,.;:!?()"-]+/)
    .filter((w) => w.length > 0);

  // Require minimum 4 meaningful words (e.g. blocks "hi bro", "work hai bhai", "hey you")
  if (words.length < 4) {
    return { ...genericRejection, debugReason: 'insufficient-word-count' };
  }

  // Word repetition / loop check (e.g. "test test test test" or "hi hi hi hi")
  const uniqueWords = new Set(words);
  if (words.length >= 3 && uniqueWords.size <= 2) {
    return { ...genericRejection, debugReason: 'repetitive-word-loop' };
  }

  // 7. URL density check: > 3 URLs in a contact message is typical spam
  const urlCount = (fullText.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (urlCount > 3) {
    return { ...genericRejection, debugReason: 'excessive-urls' };
  }

  // 8. Unsolicited Commercial / Promotional spam keywords
  const spamKeywords = [
    /\b(buy\s+backlinks|guest\s+post\s+service|rank\s+on\s+google\s+page\s+1|seo\s+ranking\s+service)\b/i,
    /\b(crypto\s+doubler|free\s+crypto\s+airdrop|online\s+casino|slots\s+jackpot)\b/i,
    /\b(make\s+money\s+fast|earn\s+money\s+online|passive\s+income|telegram\s+pump|whatsapp\s+blast)\b/i,
    /\b(viagra|cialis)\b/i,
  ];

  for (const regex of spamKeywords) {
    if (regex.test(fullText)) {
      return { ...genericRejection, debugReason: 'promotional-spam' };
    }
  }

  // 9. COMBINED SCORING: Professional Intent vs Casual Chat / Slang Abatement
  // High-value professional intent signals
  const intentPatterns = [
    /\b(intern|internship|role|opportunity|opportunities|job|hiring|hire|interview|position|candidate|opening|recruit)\b/i,
    /\b(project|projects|collaboration|collaborate|work\s+together|contract|freelance|services|consulting)\b/i,
    /\b(software|developer|development|engineer|engineering|frontend|backend|fullstack|react|node|python|web|app)\b/i,
    /\b(portfolio|discuss|discussion|inquiry|inquiries|schedule|call|meeting|availability|available\s+for)\b/i,
    /\b(connect|introduce|reaching\s+out|interested\s+in|would\s+like\s+to|could\s+we|please\s+let\s+me\s+know|looking\s+forward)\b/i,
  ];

  const messageLower = trimmedMessage.toLowerCase();

  // Evaluate intent in the message body specifically (not just relying on subject line)
  let bodyPositiveScore = 0;
  for (const regex of intentPatterns) {
    if (regex.test(messageLower)) {
      bodyPositiveScore += 1;
    }
  }

  let positiveScore = 0;
  for (const regex of intentPatterns) {
    if (regex.test(fullText)) {
      positiveScore += 1;
    }
  }

  // Detect casual social chat / small talk (e.g. "hello what are you doing?", "how are you", "kya chal raha hai")
  const casualChatSmallTalkPatterns = [
    /\b(what\s+(are\s+you|r\s+u|are\s+u)\s+doing)\b/i,
    /\b(how\s+are\s+you|how\s+r\s+u|how\s+do\s+you\s+do)\b/i,
    /\b(kya\s+kar\s+rahe\s+ho|kya\s+chal\s+raha\s+hai|kya\s+haal\s+hai)\b/i,
    /\b(free\s+now|call\s+karo|bat\s+karo|baat\s+karo)\b/i,
    /\b(what's\s+up|wassup|wazzup)\b/i,
  ];

  for (const regex of casualChatSmallTalkPatterns) {
    if (regex.test(messageLower) && bodyPositiveScore === 0) {
      return { ...genericRejection, debugReason: 'casual-social-chat' };
    }
  }

  // Chat slang / low-effort abbreviations / demanding patterns
  const lowQualitySlangPatterns = [
    /\b(u)\b/i,
    /\b(ur)\b/i,
    /\b(bro|brah|bruh|broda)\b/i,
    /\b(bhai|bhaiya|yaar)\b/i,
    /\b(pls|plz)\b/i,
    /\b(thx|ty|tnx)\b/i,
    /\b(dm|dm\s+me|inbox\s+me)\b/i,
    /\b(asap)\b/i,
    /\b(call\s+me|send\s+number|send\s+me\s+ur\s+number|give\s+number|send\s+ur\s+number)\b/i,
    /\b(urgent\s+work|work\s+hai)\b/i,
    /\b(sup|wya|idk|hmu)\b/i,
  ];

  let negativeScore = 0;
  for (const regex of lowQualitySlangPatterns) {
    if (regex.test(trimmedMessage)) {
      negativeScore += 1;
    }
  }

  // Rule 9A: The message body itself must contain professional purpose
  // A professional subject line cannot excuse an empty or casual message body
  if (words.length < 20 && bodyPositiveScore === 0) {
    return { ...genericRejection, debugReason: 'body-lacks-professional-context' };
  }

  // Rule 9B: Chat slang dominance
  // When casual slang count is high and meets or exceeds professional signals
  // Catches: "hey bro are u available" or "hi bhai internship hai call me asap"
  if (negativeScore >= 2 && negativeScore >= bodyPositiveScore) {
    return { ...genericRejection, debugReason: 'chat-slang-dominance' };
  }

  // Rule 9C: Short message with casual abbreviations
  // Catches: "urgent work pls dm" or "send me ur number"
  if (negativeScore >= 1 && words.length <= 8 && bodyPositiveScore <= 1) {
    return { ...genericRejection, debugReason: 'casual-slang-short-message' };
  }

  return { passes: true };
};

// ============================================================================
// MAIN PIPELINE HANDLER
// ============================================================================

export async function handleContactSubmission(
  body: ContactRequestBody,
  clientIp: string,
  envOverrides?: Record<string, string | undefined>,
  incomingOrigin?: string
): Promise<ContactHandlerResult> {
  const env = envOverrides || process.env;

  // --------------------------------------------------------------------------
  // STEP 1: HONEYPOT CHECK
  // --------------------------------------------------------------------------
  // If the honeypot field is filled, silently succeed without calling EmailJS.
  // Bots receive HTTP 200 and believe they succeeded, but 0 quota is spent.
  if (body.company_hp && body.company_hp.trim() !== '') {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
      },
    };
  }

  // --------------------------------------------------------------------------
  // STEP 2: INPUT VALIDATION & SYNTAX CHECKS
  // --------------------------------------------------------------------------
  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();
  const turnstileToken = (body.turnstileToken || '').trim();

  if (!name || name.length < 2 || name.length > 100) {
    return {
      status: 400,
      data: { success: false, message: 'Please enter a valid name (2 to 100 characters).' },
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      status: 400,
      data: { success: false, message: 'Please enter a valid email address.' },
    };
  }

  if (subject.length > 150) {
    return {
      status: 400,
      data: { success: false, message: 'Subject must not exceed 150 characters.' },
    };
  }

  if (!message || message.length < 10 || message.length > 3000) {
    return {
      status: 400,
      data: {
        success: false,
        message: 'Please enter a valid message (10 to 3000 characters).',
      },
    };
  }

  // --------------------------------------------------------------------------
  // STEP 3: CLOUDFLARE TURNSTILE SERVER-SIDE VERIFICATION
  // --------------------------------------------------------------------------
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;

  if (turnstileSecret && turnstileSecret.trim() !== '') {
    if (!turnstileToken) {
      return {
        status: 400,
        data: {
          success: false,
          message: 'Security check required. Please complete verification.',
        },
      };
    }

    try {
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: clientIp,
          }),
        }
      );

      const verifyData = (await verifyRes.json()) as { success: boolean };
      if (!verifyData.success) {
        return {
          status: 400,
          data: {
            success: false,
            message: 'Security check failed. Please refresh and try again.',
          },
        };
      }
    } catch (err) {
      console.error('Turnstile verification request error:', err);
      return {
        status: 502,
        data: {
          success: false,
          message: 'Unable to verify security challenge. Please try again later.',
        },
      };
    }
  }

  // --------------------------------------------------------------------------
  // STEP 4: RATE LIMITING (IP & Email)
  // --------------------------------------------------------------------------
  const ipKey = `ip:${clientIp || '127.0.0.1'}`;
  const emailKey = `email:${email}`;

  const ipRateLimit = checkRateLimit(ipKey);
  if (!ipRateLimit.allowed) {
    return {
      status: 429,
      data: { success: false, message: 'Please wait before sending another message.' },
    };
  }

  const emailRateLimit = checkRateLimit(emailKey);
  if (!emailRateLimit.allowed) {
    return {
      status: 429,
      data: { success: false, message: 'Please wait before sending another message.' },
    };
  }

  // --------------------------------------------------------------------------
  // STEP 5: DUPLICATE DETECTION
  // --------------------------------------------------------------------------
  const duplicateFingerprint = `${clientIp}:${email}:${message.toLowerCase()}`;
  const isDuplicate = checkAndRecordDuplicate(duplicateFingerprint);
  if (isDuplicate) {
    return {
      status: 429,
      data: { success: false, message: 'Please wait before sending another message.' },
    };
  }

  // --------------------------------------------------------------------------
  // STEP 6: PROFESSIONAL MESSAGE QUALITY & ANTI-SPAM ANALYSIS
  // --------------------------------------------------------------------------
  const qualityEvaluation = validateMessageQuality(name, subject, message);
  if (!qualityEvaluation.passes) {
    return {
      status: 400,
      data: {
        success: false,
        message:
          qualityEvaluation.userMessage ||
          'Please provide a clear and professional message describing your inquiry.',
      },
    };
  }

  // --------------------------------------------------------------------------
  // STEP 7: EMAILJS REST API DISPATCH (ONLY REACHED IF ALL CHECKS PASS)
  // --------------------------------------------------------------------------
  const serviceId = env.EMAILJS_SERVICE_ID || env.VITE_EMAILJS_SERVICE_ID;
  const templateId = env.EMAILJS_TEMPLATE_ID || env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = env.EMAILJS_PUBLIC_KEY || env.VITE_EMAILJS_PUBLIC_KEY;
  const privateKey = env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS credentials missing from server environment.');
    return {
      status: 503,
      data: {
        success: false,
        message:
          'Email service is temporarily unavailable. Please configure EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in Vercel.',
      },
    };
  }

  // Detect unconfigured placeholder values
  if (
    serviceId.includes('your_') ||
    templateId.includes('your_') ||
    publicKey.includes('your_')
  ) {
    return {
      status: 503,
      data: {
        success: false,
        message:
          'Email service keys are still set to placeholders. Please add your real EmailJS keys to Vercel Environment Variables.',
      },
    };
  }

  try {
    const hasValidPrivateKey = Boolean(privateKey && !privateKey.includes('your_') && privateKey.trim() !== '');
    const emailJsBody = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      ...(hasValidPrivateKey ? { accessToken: privateKey } : {}),
      template_params: {
        name,
        from_name: name,
        email,
        from_email: email,
        reply_to: email,
        subject: subject || `Portfolio inquiry from ${name}`,
        message,
        to_name: 'Aman Mishra',
      },
    };

    const originHeader =
      incomingOrigin && (incomingOrigin.includes('calligraphyguruji.dev') || incomingOrigin.includes('localhost') || incomingOrigin.includes('vercel.app'))
        ? incomingOrigin
        : 'https://calligraphyguruji.dev';

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AmanMishra-Portfolio/1.0',
        'Origin': originHeader,
      },
      body: JSON.stringify(emailJsBody),
    });

    const emailResponseText = await emailResponse.text();

    if (emailResponse.ok || emailResponseText === 'OK') {
      // Record rate limit consumption only upon successful dispatch
      recordSubmission(ipKey);
      recordSubmission(emailKey);

      return {
        status: 200,
        data: {
          success: true,
          message: `Thank you, ${name}! Your message has been sent successfully. I will get back to you soon.`,
        },
      };
    }

    console.error('EmailJS dispatch failed:', emailResponse.status, emailResponseText);
    const cleanError = emailResponseText.trim().replace(/<[^>]*>?/gm, '');
    return {
      status: 502,
      data: {
        success: false,
        message: cleanError
          ? `Email delivery error: ${cleanError}`
          : 'Unable to deliver message right now. Please try again later or reach out via amanmishra7774@gmail.com.',
      },
    };
  } catch (err) {
    console.error('Unexpected error dispatching to EmailJS:', err);
    return {
      status: 502,
      data: {
        success: false,
        message:
          'An unexpected error occurred while delivering your email. Please contact directly via amanmishra7774@gmail.com.',
      },
    };
  }
}

/**
 * Universal Vercel Serverless Function & Node HTTP Handler
 */
export default async function handler(req: any, res?: any) {
  // CORS & Options Handling
  const incomingOrigin = req.headers?.origin || '';
  const isAllowedOrigin =
    !incomingOrigin ||
    incomingOrigin.endsWith('calligraphyguruji.dev') ||
    incomingOrigin.endsWith('.vercel.app') ||
    incomingOrigin.includes('localhost') ||
    incomingOrigin.includes('127.0.0.1');

  const origin = isAllowedOrigin && incomingOrigin ? incomingOrigin : 'https://calligraphyguruji.dev';
  const setCors = (headers: Record<string, string>) => {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  };

  if (req.method === 'OPTIONS') {
    if (res?.status) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }
    const headers: Record<string, string> = {};
    setCors(headers);
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    const errorData = { success: false, message: 'Method Not Allowed' };
    if (res?.status) {
      return res.status(405).json(errorData);
    }
    return new Response(JSON.stringify(errorData), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract client IP address
  const forwardedFor =
    req.headers?.['x-forwarded-for'] ||
    (typeof req.headers?.get === 'function' ? req.headers.get('x-forwarded-for') : null);
  const clientIp =
    (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Extract request body
  let body: ContactRequestBody = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else if (typeof req.json === 'function') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const result = await handleContactSubmission(body, clientIp, undefined, origin);

  if (res?.status) {
    return res.status(result.status).json(result.data);
  }

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  setCors(responseHeaders);

  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: responseHeaders,
  });
}
