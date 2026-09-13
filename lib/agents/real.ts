import { z } from 'zod';
import { getBrainProvider } from '@/lib/brain';
import { createGBrainProvider } from '@/lib/connectors/gbrain';
import { parseInboxConfigs, unreadCounts } from '@/lib/connectors/email';
import { recentMessages } from '@/lib/connectors/slack';
import { zernioStatus } from '@/lib/connectors/zernio';
import { arcadsStatus } from '@/lib/connectors/arcads';
import { wisprStatus } from '@/lib/connectors/wispr';
import { localStackStatus } from '@/lib/connectors/local-stack';
import { ROSTER } from '@/lib/roster';
import type { LlmToolSpec } from '@/lib/connectors/llm';
import type { AgentRunResult, RuntimeAgent } from '@/lib/agents/runtime';

/**
 * The real agent roster. `realAgents` derives one entry per roster id from
 * `ROSTER` (see lib/roster): name, description, and departmentId come from
 * there. A small set of agents get a real run() (and, for G-Brain, real
 * respond()/chatTools()) wired to a live connector; every other agent gets a
 * deterministic seeded run cycling through its roster-authored summaries.
 */

async function gmailRun(): Promise<AgentRunResult> {
  const inboxes = parseInboxConfigs(process.env);
  if (inboxes.length === 0) {
    return { ok: false, summary: 'No inboxes configured, set INBOX_1..4_HOST/_USER/_PASS in .env.local' };
  }
  const counts = await unreadCounts(process.env);
  const failed = counts.filter((c) => c.error);
  const total = counts.reduce((sum, c) => sum + c.unread, 0);
  return {
    ok: failed.length < counts.length,
    summary: counts
      .map((c) => `${c.inbox}: ${c.error ? `ERROR ${c.error.slice(0, 60)}` : `${c.unread} unread`}`)
      .join(' · ')
      .concat(` · total ${total} unread`),
    data: counts,
  };
}

async function slackRun(): Promise<AgentRunResult> {
  if (!process.env.SLACK_BOT_TOKEN) {
    return { ok: false, summary: 'Slack not configured, set SLACK_BOT_TOKEN in .env.local' };
  }
  const messages = await recentMessages(10);
  return {
    ok: true,
    summary: `${messages.length} recent messages across ${new Set(messages.map((m) => m.channel)).size} channels`,
    data: messages,
  };
}

async function zernioRun(): Promise<AgentRunResult> {
  const status = await zernioStatus();
  return { ok: status.state === 'connected', summary: status.detail, data: status.meta };
}

async function arcadsRun(): Promise<AgentRunResult> {
  const status = await arcadsStatus();
  return { ok: status.state === 'connected', summary: status.detail, data: status.meta };
}

async function conductorRun(): Promise<AgentRunResult> {
  const stack = await localStackStatus();
  return {
    ok: stack.state === 'connected',
    summary: `Instance hosts on this machine: ${stack.detail} · all agents bound to builtin runtime until the dedicated host lands`,
    data: stack.meta,
  };
}

async function stackMonitorRun(): Promise<AgentRunResult> {
  const [stack, wispr] = await Promise.all([localStackStatus(), wisprStatus()]);
  return {
    ok: stack.state === 'connected',
    summary: `${stack.detail} · Wispr: ${wispr.state === 'connected' ? wispr.detail : wispr.state}`,
    data: { stack: stack.meta, wispr: wispr.meta },
  };
}

async function gbrainRun(): Promise<AgentRunResult> {
  const overview = await createGBrainProvider().overview();
  const { store, doctor } = overview;
  const warnings = doctor.checks.filter((c) => c.status !== 'ok');
  const biggest = [...store.folders].sort((a, b) => b.files - a.files)[0];
  const inbox = store.folders.find((f) => f.name === 'inbox');

  const ideas: string[] = [];
  if (!doctor.connected) ideas.push('gbrain CLI unreachable, check the binary before trusting vector queries');
  if (doctor.connected && warnings.length > 0)
    ideas.push(`${warnings.length} doctor check(s) need attention (${warnings.map((w) => w.name).join(', ')})`);
  if (inbox && inbox.files > 3) ideas.push(`inbox/ holds ${inbox.files} unprocessed pages, file or archive them`);
  if (store.totalFiles < 50)
    ideas.push(`only ${store.totalFiles} pages on disk vs ~918 in Supabase, run \`gbrain export\` to restore locally`);
  if (ideas.length === 0) ideas.push('storage healthy, no action needed');

  return {
    ok: doctor.connected,
    summary: `${doctor.detail} · ${store.totalFiles} md pages (largest: ${biggest?.name ?? 'n/a'} ${biggest?.files ?? 0}) · ideas: ${ideas.join(' | ')}`,
    data: { overview, ideas },
  };
}

async function gbrainRespond(message: string): Promise<AgentRunResult> {
  const results = await getBrainProvider().search(message);
  if (results.length === 0) {
    return { ok: false, summary: `Nothing in G-Brain matches "${message.slice(0, 80)}"` };
  }
  return {
    ok: true,
    summary: results
      .slice(0, 3)
      .map((r) => `${r.title}: ${r.snippet.slice(0, 100)}`)
      .join(' · '),
    data: results,
  };
}

function gbrainChatTools(): LlmToolSpec[] {
  return [
    {
      name: 'searchGBrain',
      description:
        'Search the G-Brain knowledge base (brain-store markdown + vector store) and return the top matching notes. Read-only.',
      parameters: z.object({ query: z.string().describe('what to look up in the knowledge base') }),
      execute: async (args) => {
        const query = typeof args.query === 'string' ? args.query : '';
        const results = await getBrainProvider().search(query);
        return results.slice(0, 5);
      },
    },
  ];
}

async function markdownAuditRun(): Promise<AgentRunResult> {
  const { store } = await createGBrainProvider().overview();
  if (store.totalFiles === 0) {
    return { ok: false, summary: `brain-store empty or unreadable at ${store.path}` };
  }
  const root = store.folders.find((f) => f.name === '(root)');
  return {
    ok: true,
    summary: `${store.totalFiles} pages across ${store.folders.length} folders${root ? ` · ${root.files} stray at root` : ''} · ${store.folders.map((f) => `${f.name}:${f.files}`).join(' ')}`,
    data: store,
  };
}

async function vectorAuditRun(): Promise<AgentRunResult> {
  const { doctor } = await createGBrainProvider().overview();
  const warn = doctor.checks.filter((c) => c.status !== 'ok');
  return {
    ok: doctor.connected,
    summary: doctor.connected
      ? `health ${doctor.healthScore ?? '?'}/100 · ${doctor.checks.length} checks, ${warn.length} warning(s)${warn.length ? `: ${warn.map((w) => w.name).join(', ')}` : ''}`
      : `doctor offline, ${doctor.detail}`,
    data: doctor,
  };
}

async function brainAuditorRun(): Promise<AgentRunResult> {
  const md = await markdownAuditRun();
  const vec = await vectorAuditRun();
  return { ok: md.ok && vec.ok, summary: `${md.summary} · ${vec.summary}`, data: { markdown: md.data, vector: vec.data } };
}

async function teamFeedRun(): Promise<AgentRunResult> {
  const [mail, slack] = await Promise.all([gmailRun(), slackRun()]);
  return { ok: mail.ok || slack.ok, summary: `${mail.summary} · ${slack.summary}`, data: { mail: mail.data, slack: slack.data } };
}

/** Deterministic run for agents whose connector is not wired on this demo. */
const seededRun = (id: string, name: string, summaries: string[]) => async (): Promise<AgentRunResult> => {
  const day = Math.floor(Date.now() / 86_400_000);
  const summary = summaries[day % summaries.length] ?? `${name} completed a run.`;
  return { ok: true, summary, data: { seeded: true, agent: id } };
};

/** Real run() and chat bindings by roster id; everything else is seeded. */
const REAL: Record<string, Partial<Pick<RuntimeAgent, 'run' | 'respond' | 'chatTools'>>> = {
  conductor: { run: conductorRun },
  'knowledge-agent': { run: gbrainRun, respond: gbrainRespond, chatTools: gbrainChatTools },
  'data-agent': { run: gbrainRun, respond: gbrainRespond, chatTools: gbrainChatTools },
  'brain-auditor': { run: brainAuditorRun },
  'connector-monitor': { run: stackMonitorRun },
  publisher: { run: zernioRun },
  'video-producer': { run: arcadsRun },
  'team-feed': { run: teamFeedRun },
};

export const realAgents: RuntimeAgent[] = ROSTER.map((e) => ({
  id: e.id,
  name: e.name,
  description: e.description,
  departmentId: e.departmentId,
  run: REAL[e.id]?.run ?? seededRun(e.id, e.name, e.runSummaries),
  ...(REAL[e.id]?.respond ? { respond: REAL[e.id]!.respond } : {}),
  ...(REAL[e.id]?.chatTools ? { chatTools: REAL[e.id]!.chatTools } : {}),
}));
