export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  readingTime: string;
  tags: string[];
  canonicalUrl?: string;
  content?: string;
}

/**
 * Static Technical Articles Data Store
 * Architecture prepared for upcoming technical articles:
 * - /blog/how-i-built-kaushalnexus
 * - /blog/react-fastapi-fullstack
 * - /blog/leetcode-binary-tree-patterns
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'how-i-built-kaushalnexus',
    title: 'Architecting KaushalNexus: Real-Time Skill Intelligence with FastAPI and Gemini AI',
    excerpt:
      'Engineering an end-to-end full-stack platform for Smart India Hackathon 2026: longitudinal student tracking, Bayesian skill gap modeling, and deterministic LLM inference pipelines.',
    publishDate: '2026-09-20',
    readingTime: '6 min read',
    tags: ['Full-Stack', 'FastAPI', 'React 19', 'Gemini AI', 'PostgreSQL'],
    content: `
### The Core Engineering Challenge
During Smart India Hackathon 2026 (Problem Statement 135), our team targeted youth employability data fragmentation across state vocational centers. Traditional evaluation metrics rely on periodic static exams that fail to identify specific competency deficits.

### High-Throughput Microservice Architecture
We structured the backend with asynchronous Python FastAPI microservices backed by PostgreSQL and Redis. Every candidate assessment interaction is processed through a Bayesian Knowledge Tracing (BKT) pipeline:
1. Candidate completes diagnostic questions mapped to National Occupational Standards (NOS).
2. The system computes posterior mastery probabilities across key sub-skills.
3. Competency gaps below the threshold automatically trigger adaptive bridge module recommendations.

### Deterministic Generative AI Pipelines
To generate custom learning roadmaps without hallucinated or unstructured responses, we integrated Google Gemini with strict JSON schema constraints. The API outputs validated, structured course timelines directly into our relational schema.
    `.trim(),
  },
  {
    slug: 'react-fastapi-fullstack',
    title: 'High-Concurrency Full-Stack Web Development with React 18+ and FastAPI',
    excerpt:
      'Practical patterns for uniting reactive TypeScript clients with asynchronous Python backends: connection pooling, JWT token rotation, and strict Pydantic validation.',
    publishDate: '2026-09-10',
    readingTime: '5 min read',
    tags: ['Architecture', 'FastAPI', 'React', 'TypeScript', 'Redis'],
    content: `
### Bridging Client Reactivity with Async Python
FastAPI provides native asynchronous ASGI throughput capable of rivaling Go and Node.js. When paired with React, the key to sub-100ms response times lies in connection pool optimization and non-blocking I/O.

### Architectural Invariants
- **Schema Validation**: Sharing OpenAPI specifications to generate typed client SDKs.
- **Resilient Auth**: Rotating JWT refresh tokens with Redis blacklist invalidation.
- **Cache Invalidation**: Strategically caching regional aggregation queries to shield PostgreSQL from repeated analytics hits.
    `.trim(),
  },
  {
    slug: 'leetcode-binary-tree-patterns',
    title: 'Mastering Binary Tree Patterns in Modern C++: Traversal, DFS & BFS Invariants',
    excerpt:
      'A structured breakdown of core non-linear algorithmic patterns in C++: monotonic stacks, tree recursions, and memory-conscious pointer manipulation.',
    publishDate: '2026-08-28',
    readingTime: '7 min read',
    tags: ['C++', 'Data Structures', 'Algorithms', 'LeetCode'],
    content: `
### Algorithmic Rigor in Modern C++
Over the course of solving 190+ algorithmic problems on LeetCode, recognizing the underlying structural invariant is far more valuable than memorizing specific implementations.

### Binary Tree Traversal Paradigms
1. **Depth-First Search (DFS)**: In-order, Pre-order, and Post-order recursive traversals with space complexity bounded by recursion stack depth $O(H)$.
2. **Breadth-First Search (BFS)**: Level-order traversals utilizing standard library queues (\`std::queue<TreeNode*>\`) for shortest-path operations.
3. **Morris Traversal**: Achieving $O(1)$ auxiliary space complexity by establishing temporary threaded binary tree links.
    `.trim(),
  },
];
