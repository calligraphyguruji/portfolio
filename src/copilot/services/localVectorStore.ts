import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { KnowledgeChunk, KnowledgeDocument } from '../types.ts';
import { chunkKnowledgeDocument } from './chunkingService.ts';
import { cosineSimilarity } from './retrievalService.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface IndexedVectorRecord {
  chunk: KnowledgeChunk;
  embedding: number[];
  contentHash: string;
  indexedAt: number;
}

export interface VectorStoreStatus {
  totalChunks: number;
  totalDocuments: number;
  embeddingDimension: number;
  lastUpdated: number;
  storagePath: string;
}

/**
 * Persistent Local Vector Store
 * Computes and caches embeddings on disk with SHA-256 incremental indexing.
 */
export class LocalVectorStore {
  private records: Map<string, IndexedVectorRecord> = new Map();
  private filePath: string;

  constructor(filePath = AI_CONFIG.vectorDbPath) {
    this.filePath = path.resolve(filePath);
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.chunk?.chunkId && Array.isArray(item.embedding)) {
              this.records.set(item.chunk.chunkId, item);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[LocalVectorStore] Failed to load store from disk:', err);
    }
  }

  public saveToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(this.records.values());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[LocalVectorStore] Failed to save store to disk:', err);
    }
  }

  /**
   * Ingest documents with incremental hashing: only compute embeddings for new or changed chunks
   */
  public async indexDocuments(
    documents: KnowledgeDocument[],
    embeddingProvider?: { generateEmbeddings: (texts: string[]) => Promise<number[][]> }
  ): Promise<{ indexed: number; reused: number; total: number }> {
    let indexedCount = 0;
    let reusedCount = 0;

    const chunksToIndex: KnowledgeChunk[] = [];
    const hashes: string[] = [];

    for (const doc of documents) {
      const docChunks = chunkKnowledgeDocument(doc);
      for (const chunk of docChunks) {
        const hash = crypto.createHash('sha256').update(chunk.content).digest('hex');
        const existing = this.records.get(chunk.chunkId);

        if (existing && existing.contentHash === hash && existing.embedding.length > 0) {
          reusedCount++;
        } else {
          chunksToIndex.push(chunk);
          hashes.push(hash);
        }
      }
    }

    if (chunksToIndex.length > 0) {
      const texts = chunksToIndex.map((c) => `${c.title}: ${c.content}`);
      let embeddings: number[][] = [];

      if (embeddingProvider) {
        try {
          embeddings = await embeddingProvider.generateEmbeddings(texts);
        } catch {
          embeddings = this.generateFallbackEmbeddings(texts);
        }
      } else {
        embeddings = this.generateFallbackEmbeddings(texts);
      }

      for (let i = 0; i < chunksToIndex.length; i++) {
        const chunk = chunksToIndex[i];
        const embedding = embeddings[i] || new Array(64).fill(0);
        this.records.set(chunk.chunkId, {
          chunk,
          embedding,
          contentHash: hashes[i],
          indexedAt: Date.now(),
        });
        indexedCount++;
      }

      this.saveToDisk();
    }

    return {
      indexed: indexedCount,
      reused: reusedCount,
      total: this.records.size,
    };
  }

  private generateFallbackEmbeddings(texts: string[]): number[][] {
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1000;
      }
      return vec;
    });
  }

  public searchVector(
    queryEmbedding: number[],
    limit = 5,
    minSimilarity = 0.1
  ): Array<{ chunk: KnowledgeChunk; similarity: number }> {
    const results: Array<{ chunk: KnowledgeChunk; similarity: number }> = [];

    for (const record of this.records.values()) {
      const sim = cosineSimilarity(queryEmbedding, record.embedding);
      if (sim >= minSimilarity) {
        results.push({ chunk: record.chunk, similarity: sim });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  public getAllChunks(): KnowledgeChunk[] {
    return Array.from(this.records.values()).map((r) => r.chunk);
  }

  public getStatus(): VectorStoreStatus {
    const sampleRecord = this.records.values().next().value;
    const docIds = new Set<string>();
    for (const r of this.records.values()) {
      docIds.add(r.chunk.documentId);
    }

    return {
      totalChunks: this.records.size,
      totalDocuments: docIds.size,
      embeddingDimension: sampleRecord ? sampleRecord.embedding.length : 0,
      lastUpdated: sampleRecord ? sampleRecord.indexedAt : Date.now(),
      storagePath: this.filePath,
    };
  }

  public clear(): void {
    this.records.clear();
    if (fs.existsSync(this.filePath)) {
      try {
        fs.unlinkSync(this.filePath);
      } catch {}
    }
  }
}

export const localVectorStore = new LocalVectorStore();
