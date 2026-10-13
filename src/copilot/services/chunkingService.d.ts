import type { KnowledgeDocument, KnowledgeChunk } from '../types.ts';
/**
 * Creates SHA-256 hash of text for content hashing & duplicate avoidance
 */
export declare function hashContent(content: string): string;
/**
 * Structure-aware chunking for Markdown and structured technical documentation
 */
export declare function chunkKnowledgeDocument(doc: KnowledgeDocument): KnowledgeChunk[];
