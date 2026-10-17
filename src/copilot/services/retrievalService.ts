import type { KnowledgeChunk, RetrievalResult, CitationReference, NLPAnalysis } from '../types.ts';

/**
 * Computes BM25-inspired lexical matching score between query terms and chunk content
 */
export function calculateLexicalScore(query: string, chunk: KnowledgeChunk): number {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTokens.length === 0) return 0;

  const contentLower = chunk.content.toLowerCase();
  const titleLower = chunk.title.toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Stemming support for regular plurals (e.g. "projects" <-> "project")
    const stem = token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
    const escapedStem = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const termRegex = new RegExp(`\\b(?:${escapedToken}|${escapedStem}|${escapedStem}s)\\b`, 'i');
    const termGlobalRegex = new RegExp(`\\b(?:${escapedToken}|${escapedStem}|${escapedStem}s)\\b`, 'gi');

    // Match in title using strict word boundary
    if (termRegex.test(titleLower)) {
      score += 3.5;
    }
    // Match in keywords
    if (chunk.keywords.includes(token) || chunk.keywords.includes(stem)) {
      score += 2.0;
    }
    // Match in content safely escaping regex special characters
    const count = (contentLower.match(termGlobalRegex) || []).length;
    score += Math.min(count, 5) * 0.5;
  }

  // Exact project ID match boost using word boundary
  if (chunk.projectId) {
    const escapedProj = chunk.projectId.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedProj}\\b`, 'i').test(query.toLowerCase())) {
      score += 4.0;
    }
  }

  return score;
}

/**
 * Computes cosine similarity between two float vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from lexical BM25 and semantic embedding searches
 */
export function reciprocalRankFusion(
  lexicalRankings: KnowledgeChunk[],
  semanticRankings: KnowledgeChunk[],
  k: number = 60
): Map<string, number> {
  const scores = new Map<string, number>();

  lexicalRankings.forEach((chunk, rank) => {
    const current = scores.get(chunk.chunkId) || 0;
    scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
  });

  semanticRankings.forEach((chunk, rank) => {
    const current = scores.get(chunk.chunkId) || 0;
    scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
  });

  return scores;
}

/**
 * Hybrid Retriever
 */
export class HybridRetriever {
  private chunks: KnowledgeChunk[] = [];

  constructor(chunks: KnowledgeChunk[] = []) {
    this.chunks = chunks;
  }

  public setChunks(chunks: KnowledgeChunk[]): void {
    this.chunks = chunks;
  }

  public retrieve(
    analysis: NLPAnalysis,
    queryEmbedding?: number[],
    limit: number = 5
  ): RetrievalResult[] {
    // If query is an assistant or creator identity intent, never retrieve project chunks
    const isIdentityQuery = [
      'ASSISTANT_IDENTITY',
      'CREATOR_IDENTITY',
      'OWNER_IDENTITY',
      'DEVELOPER_IDENTITY',
      'PORTFOLIO_IDENTITY',
      'ASSISTANT_PURPOSE',
    ].includes(analysis.intent);

    if (isIdentityQuery) {
      const identityChunk = this.chunks.find((c) => c.documentId === 'mantri-identity');
      if (identityChunk) {
        return [
          {
            chunk: identityChunk,
            score: 1.0,
            lexicalScore: 10.0,
            semanticScore: 1.0,
          },
        ];
      }
      return [];
    }

    const query = analysis.expandedTerms.join(' ');

    // 1. Lexical Retrieval (Filter out mantri-identity for non-identity queries)
    const validCandidateChunks = this.chunks.filter((c) => {
      if (!isIdentityQuery && c.documentId === 'mantri-identity') {
        return false;
      }
      return true;
    });

    const scoredLexical = validCandidateChunks
      .map((chunk) => {
        let score = calculateLexicalScore(query, chunk);

        // Boost if matches targetProject detected by NLP
        if (analysis.targetProject && chunk.projectId === analysis.targetProject) {
          score *= 2.5;
        } else if (analysis.targetProject && chunk.projectId && chunk.projectId !== analysis.targetProject) {
          // Penalize different projects when targetProject is known
          score *= 0.05;
        }

        // Boost project overview chunks for PROJECT_LIST intent
        if (analysis.intent === 'PROJECT_LIST') {
          if (chunk.category === 'project') {
            score += 10.0;
            if (chunk.section.toLowerCase().includes('overview') || chunk.title.toLowerCase().includes('overview')) {
              score += 5.0;
            }
          } else {
            score *= 0.2;
          }
        } else if (analysis.intent === 'TECHNICAL_SKILLS') {
          if (chunk.documentId === 'skills-matrix' || chunk.category === 'skills') {
            score += 15.0;
          }
        } else if (analysis.intent === 'EDUCATION') {
          if (chunk.documentId === 'bio-identity' || chunk.title.toLowerCase().includes('education') || chunk.content.toLowerCase().includes('niet')) {
            score += 15.0;
          }
        } else if (analysis.intent === 'INTERNSHIP' || analysis.intent === 'EXPERIENCE') {
          if (chunk.documentId === 'exp-codomax' || chunk.category === 'experience') {
            score += 15.0;
          }
        } else if (analysis.intent === 'RESUME_REQUEST' || analysis.intent === 'RESUME') {
          if (chunk.documentId === 'resume-document' || chunk.documentId === 'recruiter-guide') {
            score += 20.0;
          } else {
            score *= 0.05;
          }
        } else if (analysis.intent === 'PORTFOLIO_OVERVIEW' || analysis.intent === 'ABOUT_AMAN' || analysis.intent === 'CONTACT_QUERY' || analysis.intent === 'CONTACT') {
          if (chunk.documentId === 'bio-identity' || chunk.documentId === 'recruiter-guide') {
            score += 15.0;
          }
        }

        return { chunk, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const lexicalChunks = scoredLexical.map((item) => item.chunk);

    // 2. Semantic Retrieval (if embedding is available)
    let semanticChunks: KnowledgeChunk[] = [];
    if (queryEmbedding && queryEmbedding.length > 0) {
      semanticChunks = validCandidateChunks
        .filter((c) => c.embedding && c.embedding.length > 0)
        .map((chunk) => {
          const sim = cosineSimilarity(queryEmbedding, chunk.embedding!);
          return { chunk, score: sim };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.chunk);
    }

    // 3. Fusion & Ranking
    const rrfScores = reciprocalRankFusion(lexicalChunks, semanticChunks);

    const rankedCandidates: RetrievalResult[] = validCandidateChunks
      .map((chunk) => {
        const rrf = rrfScores.get(chunk.chunkId) || 0;
        const lexItem = scoredLexical.find((l) => l.chunk.chunkId === chunk.chunkId);
        const lexScore = lexItem ? lexItem.score : 0;
        // Final score combines RRF with raw lexical signal
        const combinedScore = rrf * 10 + lexScore * 0.1;
        return {
          chunk,
          score: combinedScore,
          lexicalScore: lexScore,
        };
      })
      // Minimum relevance threshold prevents accidental low-signal noise
      .filter((res) => res.score >= 0.25)
      .sort((a, b) => b.score - a.score);

    // If PROJECT_LIST, diversify results across unique projectIds
    if (analysis.intent === 'PROJECT_LIST') {
      const selected: RetrievalResult[] = [];
      const seenProjects = new Set<string>();

      for (const res of rankedCandidates) {
        if (res.chunk.projectId) {
          if (!seenProjects.has(res.chunk.projectId)) {
            seenProjects.add(res.chunk.projectId);
            selected.push(res.chunk.projectId ? res : { ...res });
          }
        } else {
          selected.push(res);
        }
        if (selected.length >= limit) break;
      }

      // If fewer than limit, fill with remaining candidates
      if (selected.length < limit) {
        for (const res of rankedCandidates) {
          if (!selected.some((s) => s.chunk.chunkId === res.chunk.chunkId)) {
            selected.push(res);
            if (selected.length >= limit) break;
          }
        }
      }
      return selected;
    }

    return rankedCandidates.slice(0, limit);
  }

  public generateCitations(results: RetrievalResult[]): CitationReference[] {
    const seen = new Set<string>();
    const citations: CitationReference[] = [];

    for (const res of results) {
      // Never cite mantri-identity if result contains real project/content chunks
      if (res.chunk.documentId === 'mantri-identity' && results.some((r) => r.chunk.documentId !== 'mantri-identity')) {
        continue;
      }

      const key = `${res.chunk.documentId}-${res.chunk.section}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          sourceId: res.chunk.chunkId,
          title: res.chunk.title,
          section: res.chunk.section,
          projectId: res.chunk.projectId,
          url: res.chunk.url,
          filePath: res.chunk.filePath,
          relevanceScore: Math.round(res.score * 100) / 100,
        });
      }
    }

    return citations;
  }
}
