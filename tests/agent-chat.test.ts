import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDb } from '@/lib/db';
import { chatWithAgent } from '@/lib/agents/chat';
import { realAgents } from '@/lib/agents/real';

const prevProvider = process.env.LLM_PROVIDER;
beforeAll(() => {
  process.env.LLM_PROVIDER = 'stub';
});
afterAll(() => {
  if (prevProvider === undefined) delete process.env.LLM_PROVIDER;
  else process.env.LLM_PROVIDER = prevProvider;
});

describe('chatWithAgent (stub provider)', () => {
  test('persists exactly a user + assistant turn and returns the stub reply', async () => {
    const db = openDb(':memory:');
    const res = await chatWithAgent(db, realAgents, 'data-agent', 'what is our revenue split?');
    expect(res.reply).toContain('what is our revenue split?'); // stub echoes
    const rows = db.agentMessages.byAgent('data-agent');
    expect(rows.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(rows[0].content).toBe('what is our revenue split?');
    expect(rows[1].content).toBe(res.reply);
    // every chat is a run; the stub reports no usage, so the row is unpriced (null, not 0)
    const runs = db.agentRuns.byAgent('data-agent');
    expect(runs).toHaveLength(1);
    expect(runs[0].ok).toBe(true);
    expect(runs[0].tokensIn).toBeNull();
    expect(runs[0].costUsd).toBeNull();
    expect(res.run.id).toBe(runs[0].id);
  });

  test('throws on an unknown agent', async () => {
    const db = openDb(':memory:');
    await expect(chatWithAgent(db, realAgents, 'nope', 'hi')).rejects.toThrow(/unknown agent/);
  });
});

describe('POST /api/agents/[id]/chat', () => {
  beforeAll(() => {
    process.env.FOUNDER_OS_DB = path.join(mkdtempSync(path.join(tmpdir(), 'founder-os-chat-')), 'test.db');
  });

  test('returns the reply and the conversation', async () => {
    const { POST } = await import('@/app/api/agents/[id]/chat/route');
    const res = await POST(
      new Request('http://localhost/api/agents/data-agent/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'hello agent' }),
      }),
      { params: { id: 'data-agent' } },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.reply).toBe('string');
    expect(body.reply.length).toBeGreaterThan(0);
    expect(body.messages.length).toBeGreaterThanOrEqual(2);
    expect(body.messages.at(-1).role).toBe('assistant');
  });

  test('404s for an unknown agent', async () => {
    const { POST } = await import('@/app/api/agents/[id]/chat/route');
    const res = await POST(
      new Request('http://localhost/api/agents/nope/chat', { method: 'POST', body: JSON.stringify({ message: 'hi' }) }),
      { params: { id: 'nope' } },
    );
    expect(res.status).toBe(404);
  });

  test('400s on an empty message', async () => {
    const { POST } = await import('@/app/api/agents/[id]/chat/route');
    const res = await POST(
      new Request('http://localhost/api/agents/data-agent/chat', { method: 'POST', body: JSON.stringify({ message: '  ' }) }),
      { params: { id: 'data-agent' } },
    );
    expect(res.status).toBe(400);
  });
});

describe('chatWithAgent records cost from gateway usage', () => {
  test('writes an agent_runs row with tokens and a non-null costUsd', async () => {
    vi.resetModules();
    vi.doMock('@/lib/connectors/llm', () => ({
      chat: async () => ({ text: 'priced reply', toolCalls: [], usage: { inputTokens: 1000, outputTokens: 500 } }),
    }));
    const { chatWithAgent: chatMocked } = await import('@/lib/agents/chat');
    const { realAgents: agents } = await import('@/lib/agents/real');
    const { openDb: open } = await import('@/lib/db');
    const db = open(':memory:');
    const res = await chatMocked(db, agents, 'data-agent', 'how many pages?');
    expect(res.run.agentId).toBe('data-agent');
    expect(res.run.tokensIn).toBe(1000);
    expect(res.run.tokensOut).toBe(500);
    expect(res.run.costUsd).toBeGreaterThan(0);
    expect(res.run.costUsd).toBeCloseTo(0.0105, 6); // 1000 in at $3/M + 500 out at $15/M on Sonnet
    const stored = db.agentRuns.byAgent('data-agent');
    expect(stored).toHaveLength(1);
    expect(stored[0].costUsd).toBe(res.run.costUsd);
    expect(stored[0].summary).toBe('chat: how many pages?');
    vi.doUnmock('@/lib/connectors/llm');
  });
});
