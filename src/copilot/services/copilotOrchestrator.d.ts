import type { CopilotChatRequest, CopilotChatResponse, CopilotHealthResponse } from '../types.ts';
/**
 * Orchestrator Service for AI Portfolio Copilot
 */
export declare class CopilotOrchestrator {
    private chunks;
    private retriever;
    private llmProvider;
    private isGeminiActive;
    private startTime;
    constructor();
    private initializeKnowledgeBase;
    getHealth(): CopilotHealthResponse;
    handleChat(request: CopilotChatRequest): Promise<CopilotChatResponse>;
}
export declare const copilotOrchestrator: CopilotOrchestrator;
