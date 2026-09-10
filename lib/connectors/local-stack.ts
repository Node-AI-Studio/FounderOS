import fs from 'node:fs';
import { execFile } from 'node:child_process';
import type { ConnectorStatus } from '@/lib/connectors/types';

/**
 * One connector for the local machine stack: running services (ports) and
 * installed daily-driver CLIs. Everything here is checked live.
 */

type Check = { name: string; up: boolean; detail: string };

function ping(url: string, timeoutMs = 1500): Promise<boolean> {
  return fetch(url, { signal: AbortSignal.timeout(timeoutMs) }).then(
    (r) => r.status > 0,
    () => false,
  );
}

function binExists(...candidates: string[]): string | null {
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      /* next */
    }
  }
  return null;
}

function tmuxSessions(): Promise<number> {
  return new Promise((resolve) => {
    execFile('tmux', ['list-sessions', '-F', '#{session_name}'], { timeout: 2000 }, (err, stdout) => {
      resolve(err ? 0 : stdout.split('\n').filter(Boolean).length);
    });
  });
}

const BREW = '/opt/homebrew/bin';

export async function localStackStatus(): Promise<ConnectorStatus> {
  const [commandCenter, ollama, tmuxCount] = await Promise.all([
    ping('http://localhost:4000'),
    ping('http://localhost:11434/api/tags'),
    tmuxSessions(),
  ]);

  // Only what this machine actually runs for Node AI. The previous owner's
  // video/voice tools (Remotion, OpenClaw, whisper, Higgsfield) were dropped
  // 2026-09-10 rather than reported as permanently "down".
  const checks: Check[] = [
    { name: 'command-center', up: commandCenter, detail: 'Command Center :4000' },
    { name: 'ollama', up: ollama, detail: 'local LLM :11434' },
    { name: 'tmux', up: tmuxCount > 0, detail: `${tmuxCount} sessions` },
    {
      name: 'ffmpeg',
      up: Boolean(binExists(`${BREW}/ffmpeg`, '/usr/local/bin/ffmpeg')),
      detail: 'media processing',
    },
    {
      name: 'gh',
      up: Boolean(binExists(`${BREW}/gh`, '/usr/local/bin/gh')),
      detail: 'GitHub CLI',
    },
  ];

  const up = checks.filter((c) => c.up);
  const downNames = checks.filter((c) => !c.up).map((c) => c.name);
  const meta: Record<string, string | number> = {};
  for (const check of checks) meta[check.name] = check.up ? `up · ${check.detail}` : 'down';

  return {
    id: 'local-stack',
    name: 'Local Stack',
    kind: 'local',
    state: up.length > 0 ? 'connected' : 'error',
    detail: `${up.length}/${checks.length} up — ${up.map((c) => c.name).join(', ')}${
      downNames.length ? ` · down: ${downNames.join(', ')}` : ''
    }`,
    meta,
  };
}
