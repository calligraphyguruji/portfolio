import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { AI_CONFIG } from '../config/aiConfig.ts';

const require = createRequire(import.meta.url);

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  citations?: any[];
  timestamp: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

/**
 * High-performance conversation memory store using Node's native SQLite or in-memory fallback.
 * Strictly isolates sessions by unique conversationId.
 */
export class ConversationMemory {
  private db: any = null;
  private inMemoryStore: Map<string, { summary: ConversationSummary; messages: StoredMessage[] }> =
    new Map();

  constructor(dbPath = AI_CONFIG.chatHistoryDbPath) {
    this.initDatabase(dbPath);
  }

  private initDatabase(dbPath: string): void {
    // Only attempt node:sqlite if running in a Node.js runtime
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // Ensure parent directory exists
        const fullPath = path.resolve(dbPath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Dynamically require node:sqlite to avoid bundle failures in browser environments
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { DatabaseSync } = require('node:sqlite');
        this.db = new DatabaseSync(fullPath);

        this.db.exec(`
          CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at INTEGER,
            updated_at INTEGER
          );
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            intent TEXT,
            citations_json TEXT,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS idx_messages_conv_ts ON messages(conversation_id, timestamp);
        `);
        return;
      } catch (err) {
        console.warn('[ConversationMemory] Falling back to in-memory store:', err);
      }
    }
  }

  public createConversation(id: string, initialTitle = 'New Conversation'): ConversationSummary {
    const now = Date.now();
    const summary: ConversationSummary = {
      id,
      title: initialTitle,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    if (this.db) {
      const stmt = this.db.prepare(
        'INSERT OR IGNORE INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
      );
      stmt.run(id, initialTitle, now, now);
    } else {
      this.inMemoryStore.set(id, { summary, messages: [] });
    }

    return summary;
  }

  public appendMessage(
    conversationId: string,
    message: StoredMessage
  ): void {
    // Sanitize: never store obvious secrets or auth headers
    const sanitizedContent = message.content.replace(
      /(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|AIza[0-9A-Za-z\-_]{20,}|ghp_[a-zA-Z0-9]{36})/gi,
      '[REDACTED_SECRET]'
    );

    const now = Date.now();

    if (this.db) {
      // Ensure conversation exists
      this.createConversation(conversationId);

      const msgStmt = this.db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, intent, citations_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      msgStmt.run(
        message.id,
        conversationId,
        message.role,
        sanitizedContent,
        message.intent || null,
        message.citations ? JSON.stringify(message.citations) : null,
        message.timestamp || now
      );

      const updateStmt = this.db.prepare(
        'UPDATE conversations SET updated_at = ? WHERE id = ?'
      );
      updateStmt.run(now, conversationId);

      // Auto-update conversation title from first user query if still default
      if (message.role === 'user') {
        const titleStmt = this.db.prepare(
          'UPDATE conversations SET title = ? WHERE id = ? AND title = ?'
        );
        const snippet = sanitizedContent.slice(0, 32).trim() + (sanitizedContent.length > 32 ? '...' : '');
        titleStmt.run(snippet, conversationId, 'New Conversation');
      }
    } else {
      let entry = this.inMemoryStore.get(conversationId);
      if (!entry) {
        this.createConversation(conversationId);
        entry = this.inMemoryStore.get(conversationId)!;
      }
      entry.messages.push({
        ...message,
        content: sanitizedContent,
      });
      entry.summary.updatedAt = now;
      entry.summary.messageCount = entry.messages.length;
      if (message.role === 'user' && entry.summary.title === 'New Conversation') {
        entry.summary.title =
          sanitizedContent.slice(0, 32).trim() + (sanitizedContent.length > 32 ? '...' : '');
      }
    }
  }

  public getMessages(conversationId: string, limit = 50): StoredMessage[] {
    if (this.db) {
      const stmt = this.db.prepare(
        'SELECT id, role, content, intent, citations_json, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?'
      );
      const rows = stmt.all(conversationId, limit) as any[];
      return rows.map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        intent: r.intent || undefined,
        citations: r.citations_json ? JSON.parse(r.citations_json) : undefined,
        timestamp: r.timestamp,
      }));
    }

    const entry = this.inMemoryStore.get(conversationId);
    return entry ? entry.messages.slice(-limit) : [];
  }

  public listConversations(limit = 20): ConversationSummary[] {
    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT c.id, c.title, c.created_at as createdAt, c.updated_at as updatedAt, COUNT(m.id) as messageCount
        FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ?
      `);
      return stmt.all(limit) as ConversationSummary[];
    }

    return Array.from(this.inMemoryStore.values())
      .map((e) => ({
        ...e.summary,
        messageCount: e.messages.length,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  public deleteConversation(conversationId: string): boolean {
    if (this.db) {
      const delMsg = this.db.prepare('DELETE FROM messages WHERE conversation_id = ?');
      delMsg.run(conversationId);
      const delConv = this.db.prepare('DELETE FROM conversations WHERE id = ?');
      const res = delConv.run(conversationId);
      return res.changes > 0;
    }

    return this.inMemoryStore.delete(conversationId);
  }

  public clearAll(): void {
    if (this.db) {
      this.db.exec('DELETE FROM messages; DELETE FROM conversations;');
    }
    this.inMemoryStore.clear();
  }

  /**
   * Resolve pronouns and follow-up contextual references using recent conversation messages.
   * E.g. User asks "What database does it use?" following "Explain CredVidhi" -> Resolves target to "CredVidhi".
   */
  public resolveContextualTarget(conversationId: string): {
    targetProject?: string;
    recentTopic?: string;
  } {
    const recent = this.getMessages(conversationId, 6);
    if (recent.length === 0) return {};

    // Search backwards for the most recent mentioned project
    for (let i = recent.length - 1; i >= 0; i--) {
      const content = recent[i].content.toLowerCase();
      if (content.includes('credvidhi')) return { targetProject: 'credvidhi', recentTopic: 'CredVidhi' };
      if (content.includes('kaushalnexus')) return { targetProject: 'kaushalnexus', recentTopic: 'KaushalNexus' };
      if (content.includes('bodhi sakha') || content.includes('bodhisakha')) {
        return { targetProject: 'bodhisakha', recentTopic: 'Bodhi Sakha' };
      }
      if (content.includes('leetcode') || content.includes('dsa')) {
        return { targetProject: 'leetcode', recentTopic: 'LeetCode & DSA' };
      }
    }

    return {};
  }
}

export const conversationMemory = new ConversationMemory();
