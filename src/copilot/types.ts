/**
 * AI Portfolio Copilot - Core Type Definitions & Schemas
 */

export type QueryIntent =
  | 'ASSISTANT_IDENTITY'
  | 'CREATOR_IDENTITY'
  | 'OWNER_IDENTITY'
  | 'DEVELOPER_IDENTITY'
  | 'PORTFOLIO_IDENTITY'
  | 'PORTFOLIO_OVERVIEW'
  | 'ASSISTANT_PURPOSE'
  | 'ABOUT_AMAN'
  | 'PROJECT_QUERY'
  | 'PROJECT_OVERVIEW'
  | 'PROJECT_ARCHITECTURE'
  | 'TECH_STACK'
  | 'CODE_EXPLANATION'
  | 'TECHNICAL_DECISION'
  | 'TECHNICAL_QUERY'
  | 'GENERAL_QUERY'
  | 'FOLLOW_UP'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'RESUME_REQUEST'
  | 'CONTACT_QUERY'
  | 'RECRUITER_EVALUATION'
  | 'PROJECT_RECOMMENDATION'
  | 'GENERAL_TECHNICAL'
  | 'GENERAL_CONVERSATION'
  | 'PROMPT_INJECTION'
  | 'UNKNOWN';

export interface RecognizedEntities {
  projects: string[];
  technologies: string[];
  roles: string[];
  skills: string[];
}

export interface NLPAnalysis {
  originalQuery: string;
  normalizedQuery: string;
  intent: QueryIntent;
  entities: RecognizedEntities;
  expandedTerms: string[];
  targetProject?: string;
  isRecruiterMode: boolean;
  isInappropriateOrInjection: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'project' | 'skills' | 'experience' | 'architecture' | 'decision' | 'recruiter' | 'dsa';
  projectId?: string;
  repository?: string;
  filePath?: string;
  url: string;
  content: string;
  metadata: {
    technologies?: string[];
    roleAlignment?: string[];
    status?: 'implemented' | 'partially_implemented' | 'planned';
    updatedAt: string;
  };
}

export interface KnowledgeChunk {
  chunkId: string;
  documentId: string;
  title: string;
  section: string;
  category: KnowledgeDocument['category'];
  projectId?: string;
  content: string;
  contentHash: string;
  url: string;
  filePath?: string;
  keywords: string[];
  embedding?: number[];
  metadata: Record<string, unknown>;
}

export interface CitationReference {
  sourceId: string;
  title: string;
  section: string;
  projectId?: string;
  url: string;
  filePath?: string;
  relevanceScore: number;
}

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  score: number;
  lexicalScore?: number;
  semanticScore?: number;
}

export interface ResumeCardData {
  title: string;
  subtitle: string;
  filename: string;
  downloadUrl: string;
  fileSize: string;
  isAvailable: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: QueryIntent;
  citations?: CitationReference[];
  recruiterAlignment?: {
    suitableRoles: string[];
    keyStrengths: string[];
    suggestedProjects: string[];
    caveats: string[];
  };
  mermaidDiagram?: string;
  resumeCard?: ResumeCardData;
  isStreaming?: boolean;
  isError?: boolean;
  metadata?: CopilotChatResponse['metadata'];
}

export interface CopilotChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  conversationId?: string;
  recruiterMode?: boolean;
  stream?: boolean;
}

export interface CopilotChatResponse {
  answer: string;
  intent: QueryIntent;
  targetProject?: string;
  citations: CitationReference[];
  recruiterAlignment?: {
    suitableRoles: string[];
    keyStrengths: string[];
    suggestedProjects: string[];
    caveats: string[];
  };
  mermaidDiagram?: string;
  resumeCard?: ResumeCardData;
  metadata: {
    model: string;
    requestedModel?: string;
    attempts?: number;
    failoverOccurred?: boolean;
    failoverReason?: string;
    retrievalLatencyMs: number;
    totalLatencyMs: number;
    retrievedCount: number;
    providerError?: string;
  };
}

export interface CopilotHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
  llmConfigured: boolean;
  indexedChunks: number;
  features: {
    hybridRetrieval: boolean;
    recruiterMode: boolean;
    streaming: boolean;
    antiInjection: boolean;
  };
}
