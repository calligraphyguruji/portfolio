import { VERIFIED_KNOWLEDGE_DOCUMENTS } from '../data/verifiedKnowledge.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  permissionLevel: 'public' | 'admin';
  timeoutMs: number;
  execute: (args: Record<string, any>, context?: { isAdmin?: boolean }) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public listTools(isAdmin = false): Array<Omit<ToolDefinition, 'execute'>> {
    return Array.from(this.tools.values())
      .filter((t) => (isAdmin ? true : t.permissionLevel === 'public'))
      .map(({ name, description, parameters, permissionLevel, timeoutMs }) => ({
        name,
        description,
        parameters,
        permissionLevel,
        timeoutMs,
      }));
  }

  public async executeTool(
    name: string,
    args: Record<string, any>,
    context: { isAdmin?: boolean } = {}
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool "${name}" not found.` };
    }

    if (tool.permissionLevel === 'admin' && !context.isAdmin) {
      return { success: false, error: `Access denied: Tool "${name}" requires administrative privileges.` };
    }

    try {
      // Enforce timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timed out after ${tool.timeoutMs}ms`)), tool.timeoutMs)
      );

      const result = await Promise.race([tool.execute(args, context), timeoutPromise]);
      return { success: true, result };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Tool execution error' };
    }
  }

  private registerDefaultTools(): void {
    // 1. Safe Calculator Tool (Zero eval, AST-safe)
    this.register({
      name: 'calculate',
      description: 'Safely evaluate standard mathematical expressions (e.g. EMI, loan ratios, percentages, arithmetic).',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The math expression to evaluate, e.g. "500000 * 0.08 / 12" or "205 / 3000 * 100".',
          },
        },
        required: ['expression'],
      },
      permissionLevel: 'public',
      timeoutMs: 1500,
      execute: async (args) => {
        const expr = String(args.expression || '').trim();
        if (!/^[0-9\s\+\-\*\/\(\)\.\^\%]+$/.test(expr)) {
          throw new Error('Invalid mathematical expression. Only standard arithmetic tokens are permitted.');
        }

        // Pure AST tokenizer and recursive-descent evaluator (zero eval, zero new Function)
        const tokens = expr.match(/\d+(?:\.\d+)?|[+\-*/%^()]/g);
        if (!tokens || tokens.length === 0) throw new Error('Empty expression');

        let pos = 0;

        const parsePrimary = (): number => {
          const token = tokens[pos++];
          if (!token) throw new Error('Unexpected end of expression');
          if (token === '(') {
            const val = parseExpression();
            if (tokens[pos++] !== ')') throw new Error("Expected ')'");
            return val;
          }
          if (token === '-') return -parsePrimary();
          if (token === '+') return parsePrimary();
          const num = Number(token);
          if (isNaN(num)) throw new Error(`Unexpected token: ${token}`);
          return num;
        };

        const parsePower = (): number => {
          let val = parsePrimary();
          while (tokens[pos] === '^') {
            pos++;
            val = Math.pow(val, parsePower());
          }
          return val;
        };

        const parseTerm = (): number => {
          let val = parsePower();
          while (tokens[pos] === '*' || tokens[pos] === '/' || tokens[pos] === '%') {
            const op = tokens[pos++];
            const next = parsePower();
            if (op === '*') val *= next;
            else if (op === '/') {
              if (next === 0) throw new Error('Division by zero');
              val /= next;
            } else if (op === '%') {
              val %= next;
            }
          }
          return val;
        };

        const parseExpression = (): number => {
          let val = parseTerm();
          while (tokens[pos] === '+' || tokens[pos] === '-') {
            const op = tokens[pos++];
            const next = parseTerm();
            if (op === '+') val += next;
            else if (op === '-') val -= next;
          }
          return val;
        };

        const value = parseExpression();
        if (pos < tokens.length) {
          throw new Error(`Unexpected token: ${tokens[pos]}`);
        }
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
          throw new Error('Calculation resulted in NaN or infinity.');
        }
        return { expression: expr, result: Number(value.toFixed(4)) };
      },
    });

    // 2. Date and Time Tool
    this.register({
      name: 'get_datetime',
      description: 'Get current system time, UTC, and IST (Indian Standard Time) with day of week.',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'Optional timezone identifier, e.g. "Asia/Kolkata" or "UTC".',
          },
        },
      },
      permissionLevel: 'public',
      timeoutMs: 1000,
      execute: async (_args) => {
        const now = new Date();
        const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const utcString = now.toUTCString();
        return {
          iso: now.toISOString(),
          utc: utcString,
          ist: istString,
          timestamp: now.getTime(),
          dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        };
      },
    });

    // 3. Portfolio Knowledge Search
    this.register({
      name: 'portfolio_search',
      description: 'Search Aman Mishra verified portfolio documents and project knowledge base.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Topic or keywords to search across portfolio documents.',
          },
        },
        required: ['query'],
      },
      permissionLevel: 'public',
      timeoutMs: 3000,
      execute: async (args) => {
        const query = String(args.query || '').toLowerCase();
        const matches: Array<{ id: string; title: string; snippet: string }> = [];

        for (const doc of VERIFIED_KNOWLEDGE_DOCUMENTS) {
          if (doc.title.toLowerCase().includes(query) || doc.content.toLowerCase().includes(query)) {
            matches.push({
              id: doc.id,
              title: doc.title,
              snippet: doc.content.slice(0, 300) + '...',
            });
          }
        }
        return { query, matchCount: matches.length, matches: matches.slice(0, 5) };
      },
    });

    // 4. Project Repository & Tech Stack Metadata
    this.register({
      name: 'get_project_metadata',
      description: 'Retrieve verified technical specifications and metadata for Aman Mishra projects.',
      parameters: {
        type: 'object',
        properties: {
          projectKey: {
            type: 'string',
            description: 'Project identifier: "credvidhi", "kaushalnexus", "bodhisakha", or "portfolio".',
            enum: ['credvidhi', 'kaushalnexus', 'bodhisakha', 'portfolio'],
          },
        },
        required: ['projectKey'],
      },
      permissionLevel: 'public',
      timeoutMs: 1000,
      execute: async (args) => {
        const key = String(args.projectKey || '').toLowerCase();
        const projects: Record<string, any> = {
          credvidhi: {
            name: 'CredVidhi',
            category: 'FinTech Credit Underwriting & Loan Origination',
            stack: ['Python FastAPI', 'PostgreSQL 16', 'Redis 7', 'Pydantic v2', 'React 19', 'Docker'],
            features: [
              '6-stage forward-only Finite State Machine',
              'Cryptographic append-only audit ledger',
              'Fixed-point INR arithmetic for zero-drift EMI calculations',
              'Sub-second deterministic underwriting checks',
            ],
            githubUrl: 'https://github.com/calligraphyguruji/CredVidhi',
          },
          kaushalnexus: {
            name: 'KaushalNexus',
            category: 'Smart India Hackathon (SIH 2026) Skill Platform',
            stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
            features: [
              'Competency mapping engine',
              'Role-based assessment matrices',
              'Verified certification validation pipeline',
            ],
            githubUrl: 'https://github.com/calligraphyguruji/KaushalNexus',
          },
          bodhisakha: {
            name: 'Bodhi Sakha',
            category: 'Mental Health & Student Wellbeing Platform',
            stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
            features: ['Private self-guided reflection modules', 'Calm aesthetic UI', 'Accessibility compliant'],
            githubUrl: 'https://github.com/calligraphyguruji/Bodhi-Sakha',
          },
          portfolio: {
            name: 'Aman Mishra Portfolio',
            url: 'https://www.calligraphyguruji.dev',
            stack: ['React 18/19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Ollama Local Engine'],
            features: ['Mantri Local AI Assistant', 'LaTeX Mathematics Rendering', 'WCAG 2.2 AA Accessibility'],
          },
        };

        if (!projects[key]) {
          throw new Error(`Project "${key}" not found. Available: credvidhi, kaushalnexus, bodhisakha, portfolio.`);
        }
        return projects[key];
      },
    });

    // 5. System Diagnostics (Admin-Only)
    this.register({
      name: 'system_diagnostics',
      description: 'System health, memory metrics, and runtime parameters (Admin-only).',
      parameters: {
        type: 'object',
        properties: {},
      },
      permissionLevel: 'admin',
      timeoutMs: 2000,
      execute: async () => {
        const mem = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : null;
        return {
          nodeVersion: typeof process !== 'undefined' ? process.version : 'browser',
          platform: typeof process !== 'undefined' ? process.platform : 'browser',
          uptimeSeconds: typeof process !== 'undefined' && process.uptime ? Math.floor(process.uptime()) : 0,
          memoryMb: mem
            ? {
                heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
                heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
                rss: Math.round(mem.rss / 1024 / 1024),
              }
            : null,
          ollamaConfig: {
            baseUrl: AI_CONFIG.ollamaBaseUrl,
            model: AI_CONFIG.ollamaModel,
            embeddingModel: AI_CONFIG.embeddingModel,
          },
        };
      },
    });
  }
}

export const toolRegistry = new ToolRegistry();
