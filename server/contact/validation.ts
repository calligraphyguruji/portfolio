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

