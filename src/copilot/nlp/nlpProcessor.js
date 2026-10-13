/**
 * Recognized Entity Dictionaries
 */
const PROJECT_ALIASES = {
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
    'amazon-clone': 'amazon-clone',
    amazon: 'amazon-clone',
    ecommerce: 'amazon-clone',
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
export function normalizeQuery(query) {
    return query
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'");
}
/**
 * Detects prompt injection attempts
 */
export function detectPromptInjection(query) {
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
export function analyzeQuery(rawQuery, conversationHistory = []) {
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
    // 2. Identify Entities
    const recognizedProjects = new Set();
    for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
        if (lowerQuery.includes(alias)) {
            recognizedProjects.add(projectId);
        }
    }
    const recognizedTech = TECH_ENTITIES.filter((t) => lowerQuery.includes(t));
    // Context-aware project resolution: resolve "it" or follow-ups from history
    let targetProject = Array.from(recognizedProjects)[0];
    if (!targetProject && conversationHistory.length > 0) {
        const isFollowUp = /\b(it|this|that|project|system|platform)\b/i.test(lowerQuery);
        if (isFollowUp) {
            for (let i = conversationHistory.length - 1; i >= 0; i--) {
                const prevText = conversationHistory[i].content.toLowerCase();
                for (const [alias, projectId] of Object.entries(PROJECT_ALIASES)) {
                    if (prevText.includes(alias)) {
                        targetProject = projectId;
                        recognizedProjects.add(projectId);
                        break;
                    }
                }
                if (targetProject)
                    break;
            }
        }
    }
    // 3. Classify Intent
    let intent = 'UNKNOWN';
    const isRecruiter = /\b(hire|recruiter|interview|internship|resume|qualifications|fit|suitable|hiring|role|sde|job|work with)\b/i.test(lowerQuery);
    if (isRecruiter) {
        intent = 'RECRUITER_EVALUATION';
    }
    else if (/\b(architecture|system design|data flow|components|lifecycle|topology|security boundaries)\b/i.test(lowerQuery)) {
        intent = 'PROJECT_ARCHITECTURE';
    }
    else if (/\b(tech stack|technologies|built with|languages|frameworks|tools)\b/i.test(lowerQuery)) {
        intent = 'TECH_STACK';
    }
    else if (/\b(why did you|trade-off|decision|why fast api|why redis|rationale)\b/i.test(lowerQuery)) {
        intent = 'TECHNICAL_DECISION';
    }
    else if (/\b(code|implementation|function|algorithm|complexity|big-o|dsa|leetcode)\b/i.test(lowerQuery)) {
        intent = 'CODE_EXPLANATION';
    }
    else if (/\b(skills|what can you do|competencies|what do you know)\b/i.test(lowerQuery)) {
        intent = 'SKILLS';
    }
    else if (/\b(experience|internship|codomax|history|work)\b/i.test(lowerQuery)) {
        intent = 'EXPERIENCE';
    }
    else if (/\b(recommend|best project|which project|show me)\b/i.test(lowerQuery)) {
        intent = 'PROJECT_RECOMMENDATION';
    }
    else if (targetProject || /\b(credvidhi|kaushalnexus|bodhi sakha|project|app)\b/i.test(lowerQuery)) {
        intent = 'PROJECT_OVERVIEW';
    }
    else {
        intent = 'GENERAL_TECHNICAL';
    }
    // 4. Query expansion terms for retrieval
    const expandedTerms = [normalizedQuery];
    if (targetProject === 'credvidhi') {
        expandedTerms.push('loan underwriting finite state machine postgresql ledger fixed point emi dti redis');
    }
    else if (targetProject === 'kaushal-nexus') {
        expandedTerms.push('skilling intelligence sih smart india hackathon gemini diagnostic district analytics ml matching');
    }
    else if (targetProject === 'gemini-ai-chatbot') {
        expandedTerms.push('bodhisakha gemini api streaming katex document parsing express react 19');
    }
    else if (targetProject === 'leetcode-solutions') {
        expandedTerms.push('leetcode dsa c++ algorithms time space complexity 205 problems solved');
    }
    const entities = {
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
