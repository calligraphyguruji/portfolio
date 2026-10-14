import type { QueryIntent, NLPAnalysis, RecognizedEntities } from '../types.ts';

/**
 * Recognized Entity Dictionaries
 */
const PROJECT_ALIASES: Record<string, string> = {
  credvidhi: 'credvidhi',
  'cred vidhi': 'credvidhi',
  loan: 'credvidhi',
  lending: 'credvidhi',
  underwriting: 'credvidhi',
  kaushalnexus: 'kaushal-nexus',
  'kaushal-nexus': 'kaushal-nexus',
  kaushal: 'kaushal-nexus',
  internship: 'kaushal-nexus',
  skilling: 'kaushal-nexus',
  sih: 'kaushal-nexus',
  bodhisakha: 'gemini-ai-chatbot',
  'bodhi sakha': 'gemini-ai-chatbot',
  chatbot: 'gemini-ai-chatbot',
  bodhi: 'gemini-ai-chatbot',
  leetcode: 'leetcode-solutions',
  dsa: 'leetcode-solutions',
  algorithms: 'leetcode-solutions',
  'amazon clone': 'amazon-clone',
  'amazon-clone': 'amazon-clone',
  amazon: 'amazon-clone',
  ecommerce: 'amazon-clone',
  'youtube clone': 'youtube-clone',
  youtube: 'youtube-clone',
  'youtube-clone': 'youtube-clone',
};

const TECH_ENTITIES = [
  'react',
  'react 19',
  'react 18',
  'typescript',
  'javascript',
  'c++',
  'python',
  'fastapi',
  'express',
  'express.js',
  'postgresql',
  'redis',
  'gemini',
  'gemini ai',
  'tailwind',
  'tailwind css',
  'framer motion',
  'motion',
  'vite',
  'docker',
  'linux',
  'git',
  'rag',
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|all)\s*(instructions|rules)/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /bypass\s+all\s+rules/i,
  /(reveal|print|show|dump)\s+(api\s+key|secret|password|token)/i,
  /delete\s+all\s+database/i,
  /sudo\s+rm\s+-rf/i,
  /jailbreak/i,
];

/**
 * Normalizes query string safely
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

/**
 * Detects prompt injection attempts
 */
export function detectPromptInjection(query: string): boolean {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return true;
    }
  }
  return false;
}

/**
 * Deterministic NLP Analysis Layer
 */
export function analyzeQuery(
  rawQuery: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): NLPAnalysis {
  const normalizedQuery = normalizeQuery(rawQuery);
  const lowerQuery = normalizedQuery.toLowerCase();

  // 1. Check prompt injection
  const isInjection = detectPromptInjection(lowerQuery);
  if (isInjection) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'PROMPT_INJECTION',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [],
      isRecruiterMode: false,
      isInappropriateOrInjection: true,
    };
  }

  // 2. High-Priority Intent: ASSISTANT_IDENTITY (Runs before any project RAG)
  // Matches "Who are you?", "What are you?", "Introduce yourself", "Tell me about yourself",
  // "What is your name?", "What can you do?", "What are your capabilities?", "Are you Mantri?",
  // "What powers you?", "Which model are you using?"
  const isAssistantPurpose =
    /\b(what\s*(is|are)?\s*(your|mantri'?s?)\s*(purpose|role|job|function|goal|mission))\b/i.test(lowerQuery) &&
    !/\b(aman|credvidhi|kaushal|bodhi|amazon|youtube|leetcode)\b/i.test(lowerQuery);

  if (isAssistantPurpose) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'ASSISTANT_PURPOSE',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [normalizedQuery],
      isRecruiterMode: false,
      isInappropriateOrInjection: false,
    };
  }

  const isAssistantIdentity =
    (/\b(who\s*(are|r)\s*(you|u))\b/i.test(lowerQuery) ||
      /\b(what\s*(are|r)\s*(you|u))\b/i.test(lowerQuery) ||
      /\b(introduce\s*(yourself|urself))\b/i.test(lowerQuery) ||
      /\b(tell\s*me\s*about\s*(yourself|urself))\b/i.test(lowerQuery) ||
      /\b(what\s*is\s*your\s*name)\b/i.test(lowerQuery) ||
      /\b(what\s*can\s*you\s*do|what\s*are\s*your\s*capabilities)\b/i.test(lowerQuery) ||
      /\b(are\s*you\s*mantri)\b/i.test(lowerQuery) ||
      /\b(what\s*(model|llm)?\s*powers\s*you|which\s*model\s*are\s*you\s*using)\b/i.test(lowerQuery)) &&
    !/\b(aman|credvidhi|kaushal|bodhi|amazon|youtube|leetcode)\b/i.test(lowerQuery);

  if (isAssistantIdentity) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'ASSISTANT_IDENTITY',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [normalizedQuery],
      isRecruiterMode: false,
      isInappropriateOrInjection: false,
    };
  }

  // 3. High-Priority Intent: CREATOR_IDENTITY
  // Matches "Who built you?", "Who created you?", "Who is your developer?", "Who owns you?", "Who made Mantri?"
  const isCreatorIdentity =
    !/\b(technolog(y|ies)|stack|how\s+does|how\s+to|how\s+mantri\s+works|detailed\s+technical)\b/i.test(lowerQuery) &&
    (/\b(who\s*(is|are|was)?\s*(built|build|bulit|bild|created|made|make|developed|programmed|engineered|authored|coded|designed)\s*(you|u|mantri|this\s*ai|this\s*assistant|this\s*bot))\b/i.test(lowerQuery) ||
      /\b(who\s*(is|are)?\s*(your|mantri'?s?)\s*(creator|maker|developer|author|architect|engineer|coder|builder))\b/i.test(lowerQuery) ||
      /\b(who\s*(is|are)?\s*(the\s+)?(creator|developer|maker|builder)\s+of\s+mantri)\b/i.test(lowerQuery) ||
      /\b(who\s*created\s*mantri)\b/i.test(lowerQuery) ||
      /\b(creator|developer|maker|builder)\s+of\s+mantri\b/i.test(lowerQuery)) &&
    !/\b(credvidhi|kaushal|bodhi|amazon|youtube)\b/i.test(lowerQuery);

  if (isCreatorIdentity) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'CREATOR_IDENTITY',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [normalizedQuery],
      isRecruiterMode: false,
      isInappropriateOrInjection: false,
    };
  }

  // 4. High-Priority Intent: PORTFOLIO_OVERVIEW / ABOUT_AMAN
  const isPortfolioOverview =
    /\b(who\s*is\s*aman(\s*mishra)?|tell\s*me\s*about\s*aman(\s*mishra)?|about\s*aman(\s*mishra)?|introduce\s*the\s*portfolio\s*owner|what\s*does\s*aman\s*do|what\s*is\s*his\s*technical\s*background)\b/i.test(
      lowerQuery
    );

  if (isPortfolioOverview) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'PORTFOLIO_OVERVIEW',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [normalizedQuery],
      isRecruiterMode: false,
      isInappropriateOrInjection: false,
    };
  }

  // 5. High-Priority Intent: RESUME & CV REQUEST
  const isResumeNegative =
    /\b(how\s+(to|do|can|should)|improve|write|writing|parse|parsing|parser|format|tips|review|builder|build\s+a\s+resume|prepare\s+a\s+resume)\b/i.test(
      lowerQuery
    );

  const isExplicitResumeRequest =
    !isResumeNegative &&
    (
      /^(resume|cv|curriculum\s+vitae|my\s+resume|your\s+resume|aman('?s)?\s+(resume|cv))$/i.test(lowerQuery) ||
      /\b(gimme|give\s*me|send|share|show|provide|get|fetch|have|see|view|access|download|grab|need)\s+(me\s+)?(a\s+|the\s+|your\s+|his\s+|aman('?s)?\s+|my\s+)?(latest\s+|updated\s+|official\s+)?(copy\s+of\s+)?(resume|cv|curriculum\s+vitae)\b/i.test(lowerQuery) ||
      /\bcan\s+i\s+(see|have|get|download|view|take)\s+(your|the|aman('?s)?)\s+(resume|cv)\b/i.test(lowerQuery) ||
      /\b(where\s+(can|to)\s+(i\s+)?(download|find|get)\s+(your|the|aman('?s)?)\s+(resume|cv))\b/i.test(lowerQuery) ||
      /\b(resume|cv)\s*(pdf|download|link|file|document)\b/i.test(lowerQuery) ||
      /\b(download|get|view)\s+(the\s+)?(pdf\s+version|pdf|resume|cv)\b/i.test(lowerQuery) ||
      /\b(download\s+aman\s+mishra\s+resume)\b/i.test(lowerQuery) ||
      /\b(copy\s+of\s+(your|his|aman('?s)?)\s+(resume|cv|curriculum\s+vitae))\b/i.test(lowerQuery) ||
      /\b(resume|cv)\s+for\s+(recruitment|recruiter|interview|hiring)\b/i.test(lowerQuery)
    );

  if (isExplicitResumeRequest) {
    return {
      originalQuery: rawQuery,
      normalizedQuery,
      intent: 'RESUME_REQUEST',
      entities: { projects: [], technologies: [], roles: [], skills: [] },
      expandedTerms: [normalizedQuery],
      isRecruiterMode: false,
      isInappropriateOrInjection: false,
    };
  }

  // 6. Identify Project Entities
  const recognizedProjects = new Set<string>();
  for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
    // Exact word boundary match for project aliases (avoids substring false positives)
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedAlias}\\b`, 'i').test(lowerQuery)) {
      recognizedProjects.add(projectId);
    }
  }

  const recognizedTech = TECH_ENTITIES.filter((t) => {
    const escapedTech = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedTech}\\b`, 'i').test(lowerQuery);
  });

  // Context-aware follow-up resolution from conversation history
  let targetProject = Array.from(recognizedProjects)[0];
  let isFollowUp = false;

  if (!targetProject && conversationHistory.length > 0) {
    isFollowUp =
      /\b(it|this|that|project|system|platform|app|clone)\b/i.test(lowerQuery) ||
      /\b(what\s*technologies\s*does\s*it\s*use|what\s*tech\s*stack\s*does\s*it\s*use|what\s*database\s*does\s*it\s*use|what\s*about\s*its\s*backend|how\s*does\s*it\s*work)\b/i.test(
        lowerQuery
      );

    if (isFollowUp) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const prevText = conversationHistory[i].content.toLowerCase();
        for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
          const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp(`\\b${escapedAlias}\\b`, 'i').test(prevText)) {
            targetProject = projectId;
            recognizedProjects.add(projectId);
            break;
          }
        }
        if (targetProject) break;
      }
    }
  }

  // 7. Classify Remaining Intents
  let intent: QueryIntent = 'UNKNOWN';

  const isOwnerIdentity =
    !targetProject &&
    !/\b(users|clients|borrowers|customers)\s+of\b/i.test(lowerQuery) &&
    (/\b(who\s*(is|are)?\s*(the\s+)?(owner|maintainer)(\s*(of\s*(this\s*)?(portfolio|website|site|project|mantri|it)?)?)?)\b/i.test(lowerQuery) ||
      /\b(who\s*owns\s*(you|u|mantri|this\s*portfolio|this\s*website|this\s*site|this)?)\b/i.test(lowerQuery) ||
      /\b(owner\s+of\s+(this\s+)?(portfolio|website|site|mantri))\b/i.test(lowerQuery) ||
      /\b(who\s*(is|are)?\s*(behind\s+mantri|behind\s+this\s*(website|portfolio|site)))\b/i.test(lowerQuery));

  const isDeveloperIdentity =
    !targetProject &&
    !/\b(technolog(y|ies)|stack)\b/i.test(lowerQuery) &&
    /\b(who\s*(is|are)?\s*(developed|developer\s*(of|behind)|engineer\s*(of|behind)|brain\s*(of|behind))\s*(this\s*website|this\s*portfolio|this\s*ai|mantri))\b/i.test(
      lowerQuery
    );

  const isPortfolioIdentity =
    !targetProject &&
    (/\b(who\s*(built|build|bulit|created|made|make|developed)\s*(this\s*portfolio|this\s*website|this\s*site))\b/i.test(lowerQuery) ||
      /\b(who\s*is\s*behind\s*(this\s*website|this\s*portfolio|this\s*site))\b/i.test(lowerQuery));

  const isRecruiter =
    /\b(hire|recruiter|interview|internship|qualifications|fit|suitable|hiring|role|sde|job|work with)\b/i.test(
      lowerQuery
    );

  const isTechnicalQuery =
    /\b(what\s*is\s*rag|explain\s*rag|what\s*is\s*a\s*vector\s*database|binary\s*search\s*in\s*c\+\+|difference\s*between\s*(a\s*)?process\s*and\s*(a\s*)?thread|mutex\s*in\s*c\+\+|time\s*complexity|space\s*complexity)\b/i.test(
      lowerQuery
    );

  if (isOwnerIdentity) {
    intent = 'OWNER_IDENTITY';
  } else if (isDeveloperIdentity) {
    intent = 'DEVELOPER_IDENTITY';
  } else if (isPortfolioIdentity) {
    intent = 'PORTFOLIO_IDENTITY';
  } else if (isRecruiter) {
    intent = 'RECRUITER_EVALUATION';
  } else if (isTechnicalQuery) {
    intent = 'TECHNICAL_QUERY';
  } else if (isFollowUp && targetProject) {
    intent = 'FOLLOW_UP';
  } else if (/\b(contact|email|phone|reach out|message|get in touch|who should i contact)\b/i.test(lowerQuery)) {
    intent = 'CONTACT_QUERY';
  } else if (/\b(architecture|system design|data flow|components|lifecycle|topology|security boundaries)\b/i.test(lowerQuery)) {
    intent = 'PROJECT_ARCHITECTURE';
  } else if (/\b(tech stack|technologies|built with|languages|frameworks|tools)\b/i.test(lowerQuery)) {
    intent = 'TECH_STACK';
  } else if (/\b(why did you|trade-off|decision|why fast api|why redis|rationale)\b/i.test(lowerQuery)) {
    intent = 'TECHNICAL_DECISION';
  } else if (/\b(code|implementation|function|algorithm|complexity|big-o|dsa|leetcode)\b/i.test(lowerQuery)) {
    intent = 'CODE_EXPLANATION';
  } else if (/\b(skills|competencies|what do you know)\b/i.test(lowerQuery)) {
    intent = 'SKILLS';
  } else if (/\b(experience|internship|codomax|history|work)\b/i.test(lowerQuery)) {
    intent = 'EXPERIENCE';
  } else if (/\b(recommend|best project|which project|show me)\b/i.test(lowerQuery)) {
    intent = 'PROJECT_RECOMMENDATION';
  } else if (/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy)\b/i.test(lowerQuery)) {
    intent = 'GENERAL_CONVERSATION';
  } else if (targetProject || /\b(credvidhi|kaushalnexus|bodhi sakha|amazon clone|youtube clone|project|app)\b/i.test(lowerQuery)) {
    intent = 'PROJECT_OVERVIEW';
  } else {
    intent = 'GENERAL_TECHNICAL';
  }

  // 8. Query expansion terms for retrieval
  const expandedTerms: string[] = [normalizedQuery];
  if (targetProject === 'credvidhi') {
    expandedTerms.push('loan underwriting finite state machine postgresql ledger fixed point emi dti redis');
  } else if (targetProject === 'kaushal-nexus') {
    expandedTerms.push('skilling intelligence sih smart india hackathon gemini diagnostic district analytics ml matching');
  } else if (targetProject === 'gemini-ai-chatbot') {
    expandedTerms.push('bodhisakha gemini api streaming katex document parsing express react 19');
  } else if (targetProject === 'leetcode-solutions') {
    expandedTerms.push('leetcode dsa c++ algorithms time space complexity 205 problems solved');
  } else if (targetProject === 'amazon-clone') {
    expandedTerms.push('amazon clone ecommerce web app react firebase stripe authentication cart checkout');
  } else if (targetProject === 'youtube-clone') {
    expandedTerms.push('youtube clone video streaming rapidapi material ui react search player');
  }

  const entities: RecognizedEntities = {
    projects: Array.from(recognizedProjects),
    technologies: recognizedTech,
    roles: isRecruiter ? ['SDE Intern', 'Frontend Developer', 'Full-Stack Developer'] : [],
    skills: recognizedTech,
  };

  return {
    originalQuery: rawQuery,
    normalizedQuery,
    intent,
    entities,
    expandedTerms,
    targetProject,
    isRecruiterMode: isRecruiter,
    isInappropriateOrInjection: false,
  };
}
