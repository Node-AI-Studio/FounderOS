/**
 * Per-agent chat orchestration. Loads the agent's rolling conversation, calls
 * the LLM connector with the agent's system prompt + its read-only tools, and
 * persists the user turn, any tool calls, and the assistant turn. Returns the
 * reply plus the full conversation. The LLM_PROVIDER=stub path keeps this
 * deterministic and offline for tests.
 */
import { randomUUID } from 'node:crypto';
import { chat as llmChat, type LlmMessage } from '@/lib/connectors/llm';
import type { FounderDb } from '@/lib/db';
import type { RuntimeAgent } from '@/lib/agents/runtime';
import type { AgentMessage, AgentRun } from '@/lib/schemas';
import { runCostUsd } from '@/lib/agent-costs';

export type ChatResult = { reply: string; messages: AgentMessage[]; run: AgentRun };

const SCREEN_CONTEXT_CAP = 4000;
const SUMMARY_CAP = 126;

const chatModel = (): string => process.env.LLM_MODEL ?? 'anthropic/claude-sonnet-5';

/**
 * Persist one model call as an agent run so the cost panel sees real usage.
 * Tokens stay null when the provider reported none (the stub); a run with no
 * usage is not a free run, it is an unpriced one.
 */
export function recordModelRun(
  db: FounderDb,
  agentId: string,
  summary: string,
  startedAt: string,
  usage: { inputTokens: number; outputTokens: number } | undefined,
): AgentRun {
  const model = chatModel();
  const run: AgentRun = {
    id: `chat-${randomUUID()}`,
    agentId,
    startedAt,
    finishedAt: new Date().toISOString(),
    ok: true,
    summary: summary.slice(0, SUMMARY_CAP),
    model,
    tokensIn: usage ? usage.inputTokens : null,
    tokensOut: usage ? usage.outputTokens : null,
    costUsd: usage ? runCostUsd(usage.inputTokens, usage.outputTokens, model) : null,
  };
  db.agentRuns.insert(run);
  return run;
}

export function systemPromptFor(agent: RuntimeAgent, screenContext?: string): string {
  const lines = [
    `You are ${agent.name}, an operator agent inside Founder OS.`,
    agent.description,
    'Answer concisely and use your tools to read live data when it helps.',
    'You are READ-ONLY: never claim to have sent, created, scheduled, or published anything — you can only look things up and report.',
  ];
  if (screenContext) {
    lines.push(
      `The operator is currently looking at this screen — use it as grounding when they say "this", "here", or ask about what they see:\n${screenContext.slice(0, SCREEN_CONTEXT_CAP)}`,
    );
  }
  return lines.join('\n');
}

export async function chatWithAgent(
  db: FounderDb,
  agents: RuntimeAgent[],
  agentId: string,
  message: string,
  opts: { screenContext?: string } = {},
): Promise<ChatResult> {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) throw new Error(`unknown agent: ${agentId}`);

  const now = () => new Date().toISOString();

  db.agentMessages.insert({ id: randomUUID(), agentId, role: 'user', content: message, toolCalls: [], createdAt: now() });

  // Full rolling history. Prior `tool` turns are kept in the record for the
  // activity feed, but the gateway provider drops them before calling the model
  // (a bare {role:'tool'} string isn't a valid v6 tool-result part) — so on
  // follow-up turns the model sees the assistant's prose, not raw tool output.
  // Fine for v1 read-only chat; revisit if multi-turn tool reasoning is needed.
  const history = db.agentMessages.byAgent(agentId);
  const llmMessages: LlmMessage[] = history.map((m) => ({ role: m.role, content: m.content }));
  const tools = agent.chatTools?.();

  const startedAt = now();
  const result = await llmChat({ system: systemPromptFor(agent, opts.screenContext), messages: llmMessages, tools });

  if (result.toolCalls.length) {
    db.agentMessages.insert({
      id: randomUUID(),
      agentId,
      role: 'tool',
      content: result.toolCalls.map((c) => `${c.name} → ${JSON.stringify(c.result)}`).join('\n'),
      toolCalls: result.toolCalls,
      createdAt: now(),
    });
  }

  db.agentMessages.insert({ id: randomUUID(), agentId, role: 'assistant', content: result.text, toolCalls: [], createdAt: now() });

  const run = recordModelRun(db, agentId, `chat: ${message}`, startedAt, result.usage);
  return { reply: result.text, messages: db.agentMessages.byAgent(agentId), run };
}
