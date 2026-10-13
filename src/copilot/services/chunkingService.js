import crypto from 'node:crypto';
/**
 * Creates SHA-256 hash of text for content hashing & duplicate avoidance
 */
export function hashContent(content) {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
}
/**
 * Structure-aware chunking for Markdown and structured technical documentation
 */
export function chunkKnowledgeDocument(doc) {
    const chunks = [];
    const lines = doc.content.split('\n');
    let currentSection = 'Overview';
    let currentBuffer = [];
    const flushBuffer = () => {
        const rawText = currentBuffer.join('\n').trim();
        if (!rawText || rawText.length < 40)
            return;
        // Extract keywords for lexical search
        const words = rawText
            .toLowerCase()
            .replace(/[^a-z0-9+#.\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2);
        const keywords = Array.from(new Set(words)).slice(0, 40);
        const chunkContent = `[${doc.title} - ${currentSection}]\n${rawText}`;
        const chunkId = `${doc.id}-${chunks.length + 1}`;
        chunks.push({
            chunkId,
            documentId: doc.id,
            title: doc.title,
            section: currentSection,
            category: doc.category,
            projectId: doc.projectId,
            content: chunkContent,
            contentHash: hashContent(chunkContent),
            url: doc.url,
            filePath: doc.filePath,
            keywords,
            metadata: {
                ...doc.metadata,
                wordCount: words.length,
            },
        });
        currentBuffer = [];
    };
    for (const line of lines) {
        const trimmed = line.trim();
        // Detect section headers (Markdown #, ##, or numbered 1., 2.)
        if (/^(#{1,3}\s+|[0-9]+\.\s+[A-Z])/.test(trimmed)) {
            flushBuffer();
            currentSection = trimmed.replace(/^#+\s+/, '').slice(0, 80);
        }
        else {
            currentBuffer.push(line);
            // If buffer grows beyond ~900 characters without headers, flush on paragraph break
            if (currentBuffer.join('\n').length > 900 && trimmed === '') {
                flushBuffer();
            }
        }
    }
    flushBuffer();
    return chunks;
}
