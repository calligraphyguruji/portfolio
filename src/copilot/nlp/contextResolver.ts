import type { QueryIntent } from '../types.ts';

export interface ContextResolutionResult {
  originalQuery: string;
  resolvedQuery: string;
  detectedIntent: QueryIntent;
  referencedEntity?: string;
  targetProject?: string;
  targetProjects?: string[];
  isFollowUp: boolean;
  requiresClarification: boolean;
  clarificationPrompt?: string;
  confidence: number;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  title: string;
  keywords: string[];
  summary: string;
}

export const VERIFIED_PROJECT_REGISTRY: Record<string, ProjectMetadata> = {
  credvidhi: {
    id: 'credvidhi',
    name: 'CredVidhi',
    title: 'Enterprise Loan Processing & Deterministic Underwriting Platform',
    keywords: ['credvidhi', 'cred vidhi', 'loan', 'underwriting', 'fsm', 'lending'],
    summary:
      'Institutional digital lending and credit underwriting platform with zero-drift fixed-point arithmetic, 6-stage finite state machine, and PostgreSQL 16 append-only ledger.',
  },
  'kaushal-nexus': {
    id: 'kaushal-nexus',
    name: 'KaushalNexus',
    title: 'Employment & Skilling Intelligence Platform',
    keywords: ['kaushalnexus', 'kaushal-nexus', 'kaushal', 'nexus', 'sih', 'skilling'],
    summary:
      'Smart India Hackathon 2026 flagship skilling platform featuring longitudinal learner tracking, Google Gemini skill gap diagnostics, and district analytics.',
  },
  'gemini-ai-chatbot': {
    id: 'gemini-ai-chatbot',
    name: 'Bodhi Sakha (बोधिसखा)',
    title: 'Full-Stack Conversational AI Assistant',
    keywords: ['bodhi', 'sakha', 'bodhisakha', 'gemini-ai-chatbot', 'chatbot'],
    summary:
      'Full-stack AI assistant with real-time SSE streaming, KaTeX math parsing, serverless PDF/DOCX document parsing, and deep thinking reasoning mode.',
  },
  'leetcode-solutions': {
    id: 'leetcode-solutions',
    name: 'LeetCode Problem Solving & Algorithms',
    title: '205+ Algorithmic Solutions in Modern C++',
    keywords: ['leetcode', 'dsa', 'algorithms', 'c++ dsa', 'problem solving'],
    summary:
      '205+ LeetCode problems solved in Modern C++ (C++17/20) emphasizing cache locality, STL asymptotic efficiency, dynamic programming, and graph algorithms.',
  },
  'amazon-clone': {
    id: 'amazon-clone',
    name: 'Frontend Architecture Clones (Amazon & YouTube)',
    title: 'Multi-Page Responsive Web Architectures',
    keywords: ['amazon clone', 'youtube clone', 'clones', 'frontend clones', 'ecommerce'],
    summary:
      'E-commerce and video platform frontend architectures engineered in pure vanilla JavaScript (ES6+), HTML5, and modular CSS Grid/Flexbox without framework overhead.',
  },
};

/**
 * Extracts referenced projects from conversation history in order of appearance
 */
export function extractProjectsFromHistory(
  history: Array<{ role: string; content: string }> = []
): {
  mentionedProjects: string[];
  activeProject?: string;
  projectOccurrences: Array<{ projectId: string; index: number; name: string }>;
} {
  const mentionedProjects: string[] = [];
  const projectOccurrences: Array<{ projectId: string; index: number; name: string }> = [];

  if (!history || history.length === 0) {
    return { mentionedProjects, projectOccurrences };
  }

  // Focus primarily on the last assistant message
  const recentTurns = history.slice(-4);
  const lastAssistant = recentTurns.filter((m) => m.role === 'assistant').slice(-1)[0];

  if (lastAssistant && lastAssistant.content) {
    const text = lastAssistant.content.toLowerCase();
    for (const [id, info] of Object.entries(VERIFIED_PROJECT_REGISTRY)) {
      let earliestIdx = -1;
      for (const kw of info.keywords) {
        const idx = text.indexOf(kw.toLowerCase());
        if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
          earliestIdx = idx;
        }
      }
      if (earliestIdx !== -1) {
        projectOccurrences.push({ projectId: id, index: earliestIdx, name: info.name });
      }
    }

    projectOccurrences.sort((a, b) => a.index - b.index);
    for (const occ of projectOccurrences) {
      if (!mentionedProjects.includes(occ.projectId)) {
        mentionedProjects.push(occ.projectId);
      }
    }

    if (mentionedProjects.length > 0) {
      return {
        mentionedProjects,
        activeProject: mentionedProjects[0],
        projectOccurrences,
      };
    }
  }

  // Fallback: scan backwards across all recent turns
  for (let i = recentTurns.length - 1; i >= 0; i--) {
    const text = recentTurns[i].content.toLowerCase();
    for (const [id, info] of Object.entries(VERIFIED_PROJECT_REGISTRY)) {
      for (const kw of info.keywords) {
        if (text.includes(kw.toLowerCase())) {
          if (!mentionedProjects.includes(id)) {
            mentionedProjects.push(id);
          }
          break;
        }
      }
    }
  }

  return {
    mentionedProjects,
    activeProject: mentionedProjects[0],
    projectOccurrences,
  };
}

/**
 * Checks if query introduces an explicit new topic that should NOT inherit stale context
 */
export function isExplicitNewTopic(query: string): boolean {
  const q = query.toLowerCase().trim();

  // Explicit project mentions
  for (const info of Object.values(VERIFIED_PROJECT_REGISTRY)) {
    for (const kw of info.keywords) {
      if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(q)) {
        return true;
      }
    }
  }

  // Identity queries
  if (/\b(who\s*(are|r)\s*(you|u)|who\s*(built|created|made)\s*(you|mantri)|who\s*is\s*aman)\b/i.test(q)) {
    return true;
  }

  // Resume queries
  if (/\b(resume|cv|curriculum\s+vitae)\b/i.test(q) && !/\b(it|its|them|second|one)\b/i.test(q)) {
    return true;
  }

  // Education & academics
  if (/\b(education|college|degree|niet|university|cgpa|academics)\b/i.test(q)) {
    return true;
  }

  // Internship & Experience
  if (/\b(internship|experience|codomax)\b/i.test(q)) {
    return true;
  }

  // Standalone technical concepts
  if (/\b(binary\s+search|dijkstra|process\s*(vs|and)\s*thread|what\s+is\s+rag)\b/i.test(q)) {
    return true;
  }

  // Contact queries
  if (/\b(contact|email|phone|linkedin|github)\b/i.test(q) && !/\b(it|its|them)\b/i.test(q)) {
    return true;
  }

  return false;
}

/**
 * Resolves conversational context and follow-up intent from conversation history
 */
export function resolveConversationalContext(
  rawQuery: string,
  history: Array<{ role: string; content: string }> = []
): ContextResolutionResult {
  const normalized = rawQuery.trim().replace(/\s+/g, ' ');
  const qLower = normalized.toLowerCase();

  // If explicit new topic, do not force follow-up resolution
  if (isExplicitNewTopic(qLower)) {
    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: 'UNKNOWN',
      isFollowUp: false,
      requiresClarification: false,
      confidence: 1.0,
    };
  }

  const { mentionedProjects, activeProject } = extractProjectsFromHistory(history);

  // 1. Distributive / Selection Follow-up ("explain anyone of them", "explain any one of them", "pick one")
  const isDistributiveFollowUp =
    /\b(?:explain|tell\s+me\s+about|describe|overview|show|walk\s+through|detail)\s+(?:anyone|any\s*one|any|either|one)\s+of\s+(?:them|these|those|the\s+projects|the\s+above)\b/i.test(
      qLower
    ) ||
    /^(?:explain|tell\s+me\s+about|describe|pick)\s+(?:anyone|any\s*one|one|either)(\s+of\s+them)?$/i.test(
      qLower
    ) ||
    /\b(anyone|any\s*one|either)\s+of\s+(?:them|these|those)\b/i.test(qLower) ||
    /\b(pick|choose)\s+(?:anyone|any\s*one|one|either)\b/i.test(qLower);

  if (isDistributiveFollowUp) {
    if (mentionedProjects.length > 0) {
      const selectedId = mentionedProjects[0];
      const selected = VERIFIED_PROJECT_REGISTRY[selectedId] || VERIFIED_PROJECT_REGISTRY['credvidhi'];
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name} (${selected.title}), its architecture, features, and implementation`,
        detectedIntent: 'PROJECT_DETAILS',
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95,
      };
    }

    // No projects mentioned in context -> Ask clarification
    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: 'FOLLOW_UP',
      isFollowUp: true,
      requiresClarification: true,
      clarificationPrompt:
        "Which project would you like me to explain? Aman has built **CredVidhi** (deterministic loan underwriting), **KaushalNexus** (skilling intelligence platform), **Bodhi Sakha** (full-stack AI assistant), and 205+ **LeetCode DSA solutions**.",
      confidence: 0.9,
    };
  }

  // 2. Collective / Universal Follow-up ("explain all of them", "tell me about all of them", "explain each of them")
  const isCollectiveFollowUp =
    /\b(?:explain|tell\s+me\s+about|describe|overview|show|summarize|walk\s+through)\s+(?:all|each|every\s+one|every)\s+of\s+(?:them|these|those|the\s+projects|the\s+above)\b/i.test(
      qLower
    ) ||
    /^(?:explain|tell\s+me\s+about|overview\s+of)\s+all\s+of\s+them$/i.test(qLower) ||
    /\b(all|each)\s+of\s+(?:them|these|those)\b/i.test(qLower);

  if (isCollectiveFollowUp) {
    const targetIds =
      mentionedProjects.length > 0
        ? mentionedProjects
        : ['credvidhi', 'kaushal-nexus', 'gemini-ai-chatbot', 'leetcode-solutions'];
    const projectNames = targetIds
      .map((id) => VERIFIED_PROJECT_REGISTRY[id]?.name || id)
      .join(', ');

    return {
      originalQuery: rawQuery,
      resolvedQuery: `Comprehensive overview and technical comparison of Aman Mishra's verified projects: ${projectNames}`,
      detectedIntent: 'PROJECT_LIST',
      targetProject: targetIds[0],
      targetProjects: targetIds,
      referencedEntity: 'projects-collection',
      isFollowUp: true,
      requiresClarification: false,
      confidence: 0.95,
    };
  }

  // 2b. Subcomponent Drill-Down on Active Project ("explain the second component", "explain its second component", "first step")
  const isComponentDrillDown =
    /\b(?:first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\s+(?:component|part|layer|module|step|stage|service|phase|feature)\b/i.test(
      qLower
    ) ||
    /\b(?:component|part|layer|module|step|stage|service|phase|feature)\s+(?:1|2|3|4|5|one|two|three|four|five)\b/i.test(
      qLower
    );

  if (isComponentDrillDown && activeProject) {
    const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
    if (selected) {
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name}: ${normalized}`,
        detectedIntent: 'FOLLOW_UP',
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95,
      };
    }
  }

  // 3. Ordinal Follow-up ("explain the second one", "the 2nd one", "what about the first one", "explain the last one")
  const ordinalMatch =
    !isComponentDrillDown &&
    qLower.match(
      /\b(?:explain\s+)?(?:the\s+)?(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\s*(?:one|project|item|choice|resource|option)?\b/i
    );

  if (ordinalMatch && ordinalMatch[1]) {
    const ordStr = ordinalMatch[1].toLowerCase();
    let index = -1;
    if (ordStr === 'first' || ordStr === '1st') index = 0;
    else if (ordStr === 'second' || ordStr === '2nd') index = 1;
    else if (ordStr === 'third' || ordStr === '3rd') index = 2;
    else if (ordStr === 'fourth' || ordStr === '4th') index = 3;
    else if (ordStr === 'fifth' || ordStr === '5th') index = 4;
    else if (ordStr === 'last') index = Math.max(0, mentionedProjects.length - 1);

    if (index >= 0 && index < mentionedProjects.length) {
      const selectedId = mentionedProjects[index];
      const selected = VERIFIED_PROJECT_REGISTRY[selectedId];
      if (selected) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `Explain ${selected.name} (${selected.title}), its architecture, features, and implementation`,
          detectedIntent: 'PROJECT_DETAILS',
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95,
        };
      }
    }

    if (mentionedProjects.length > 0) {
      return {
        originalQuery: rawQuery,
        resolvedQuery: normalized,
        detectedIntent: 'FOLLOW_UP',
        isFollowUp: true,
        requiresClarification: true,
        clarificationPrompt: `The previous list contained ${mentionedProjects.length} items (${mentionedProjects
          .map((id) => VERIFIED_PROJECT_REGISTRY[id]?.name || id)
          .join(', ')}). Which specific project would you like to explore?`,
        confidence: 0.85,
      };
    }
  }

  // 4. Pronominal & Aspect Follow-up ("what about its backend?", "what database does it use?", "explain that architecture")
  const isPronominal =
    /\b(its|it|that|this|the\s+project|the\s+system|the\s+app)\b/i.test(qLower) ||
    /\b(how\s+does\s+it\s+work|what\s+about\s+its\s+backend|what\s+database\s+does\s+it\s+use|explain\s+that\s+architecture)\b/i.test(
      qLower
    );

  if (isPronominal && activeProject) {
    const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
    if (selected) {
      const isArchitectureAspect =
        /\b(backend|database|architecture|fsm|finite\s+state\s+machine|ledger|security|infrastructure|fastapi|postgresql|redis)\b/i.test(
          qLower
        );
      const isTechStackAspect =
        /\b(technologies|tech\s+stack|tools|languages|frameworks|built\s+with)\b/i.test(qLower);

      if (isArchitectureAspect) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `Explain the backend architecture, database, state machine, and data flow of ${selected.name}`,
          detectedIntent: 'PROJECT_ARCHITECTURE',
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95,
        };
      }

      if (isTechStackAspect) {
        return {
          originalQuery: rawQuery,
          resolvedQuery: `What technologies and tech stack does ${selected.name} use?`,
          detectedIntent: 'TECH_STACK',
          targetProject: selected.id,
          referencedEntity: selected.id,
          isFollowUp: true,
          requiresClarification: false,
          confidence: 0.95,
        };
      }

      return {
        originalQuery: rawQuery,
        resolvedQuery: `Explain ${selected.name}: ${normalized}`,
        detectedIntent: 'PROJECT_DETAILS',
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.9,
      };
    }
  }

  // 5. Elaboration Follow-up ("tell me more", "more details", "elaborate", "continue", "go deeper")
  const isElaboration =
    /^(tell\s+me\s+more|more\s+details|elaborate|continue|go\s+deeper|what\s+else|tell\s+me\s+further)[\s!.,?]*$/i.test(
      qLower
    );

  if (isElaboration) {
    if (activeProject) {
      const selected = VERIFIED_PROJECT_REGISTRY[activeProject];
      return {
        originalQuery: rawQuery,
        resolvedQuery: `Provide in-depth technical details, architecture decisions, and implementation highlights for ${selected.name}`,
        detectedIntent: 'PROJECT_DETAILS',
        targetProject: selected.id,
        referencedEntity: selected.id,
        isFollowUp: true,
        requiresClarification: false,
        confidence: 0.95,
      };
    }

    return {
      originalQuery: rawQuery,
      resolvedQuery: normalized,
      detectedIntent: 'FOLLOW_UP',
      isFollowUp: true,
      requiresClarification: true,
      clarificationPrompt:
        "What specific topic or project would you like more details on? I can explain CredVidhi, KaushalNexus, Bodhi Sakha, or Aman's LeetCode algorithms.",
      confidence: 0.85,
    };
  }

  // Default: not an explicit follow-up requiring rewriting
  return {
    originalQuery: rawQuery,
    resolvedQuery: normalized,
    detectedIntent: 'UNKNOWN',
    isFollowUp: false,
    requiresClarification: false,
    confidence: 0.5,
  };
}
