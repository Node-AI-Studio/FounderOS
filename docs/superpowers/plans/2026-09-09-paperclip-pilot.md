# Paperclip Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up upstream Paperclip on a private Hetzner box, run three Codex agents against this repo for two weeks, and produce a pass or fail verdict against the four criteria in the spec.

**Architecture:** One Hetzner CPX42 reachable only over Tailscale runs Paperclip (commit-pinned, systemd user service, embedded Postgres) as a dedicated `paperclip` Linux user. This repo is cloned on the box as a project workspace; agents execute in git worktrees and open pull requests that humans merge. Two agents run on the host Codex subscription, one on a per-agent API key with a hard USD 5 cap so the budget stop is observed. A throwaway second company proves isolation and export/import.

**Tech Stack:** Hetzner Cloud (`hcloud`), Ubuntu 26.04, Tailscale, Node 24 via NodeSource, pnpm 9, Paperclip CLI (`paperclipai`), Codex CLI, `gh`, `jq`. This repo stays on Node 20 and npm.

**Spec:** `docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md`

## Global Constraints

- Paperclip: Node 24.11+ and pnpm 9.15+. founderos: Node 20.x and npm. Never mix them.
- Paperclip installed from a commit-pinned GitHub ref, never `curl | bash`.
- Box reachable only over the tailnet. Hetzner firewall denies all inbound after Tailscale is up.
- Agents open PRs only. Humans merge. No agent pushes to `main`. Force-push is a hard stop.
- `npm test && npm run typecheck` green before any PR opens.
- Reviewer budget: USD 5 per calendar month, hard stop enabled.
- Concurrency: one run per agent (`maxConcurrentRuns: 1`). The spec's "2 at once" is approximated as three agents at one run each, because Paperclip has no instance-wide cap.
- No client credentials on the box. Secrets live in Paperclip's secret store, never in files on disk.
- Codex subscription login happens on the box. Never copy `~/.codex/auth.json` from a Mac.
- No em dashes in any file this plan creates. `grep -nP '\x{2014}' <file>` must return nothing (searching by code point so the character itself never appears in a file).
- Nothing in this plan writes to a third-party system other than GitHub (branches, PRs, branch protection).

## Deviation from spec, recorded here

`pullRequestPolicy` on a project is accepted by the API but nothing in `server/src/services` reads its keys. Paperclip cannot enforce "never merge" itself. The rail is therefore three things together: GitHub branch protection on `main` (Task 8), a fine-grained token that cannot bypass it, and the instruction files (Task 11). The pass criteria are unchanged.

## File Structure

Files this plan creates in this repo, all committed:

- `docs/superpowers/plans/2026-09-09-paperclip-pilot.md` (this file)
- `ops/paperclip/agents/console-engineer.md` (instruction file uploaded to that agent)
- `ops/paperclip/agents/test-engineer.md`
- `ops/paperclip/agents/reviewer.md`
- `ops/paperclip/pilot-backlog.md` (the first ten issues, as text, entered by CLI in Task 14)
- `docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md` (modified in Task 4 to record the pinned SHA, and in Task 18 to record the verdict)

Everything else lives on the box or in Paperclip's database. Nothing on the box is hand-edited config; every Paperclip object is created by a CLI command in this plan so it can be recreated.

---

### Task 1: Provision the box

**Files:**
- Modify: `~/.ssh/config` (on Cristoforo's Mac, not in the repo)

**Interfaces:**
- Produces: SSH host alias `paperclip` reaching the box as root on its public IP. Replaced by the tailnet address in Task 2.

- [ ] **Step 1: Confirm hcloud is authenticated**

Run: `hcloud context list && hcloud server-type describe cpx42 -o columns=name,cores,memory,disk`
Expected: a context row, then `cpx42  8  16  320`

- [ ] **Step 2: Upload the SSH key if not present**

Run: `hcloud ssh-key list`
If no key: `hcloud ssh-key create --name cristoforo --public-key-from-file ~/.ssh/id_ed25519.pub`
Expected: key listed.

- [ ] **Step 3: Create a firewall that allows SSH only from your current IP**

```bash
MYIP=$(curl -4 -s https://ifconfig.me)
hcloud firewall create --name paperclip-pilot
hcloud firewall add-rule paperclip-pilot --direction in --protocol tcp --port 22 --source-ips "$MYIP/32" --description "ssh bootstrap"
```
Expected: `Firewall ... created`, rule added.

- [ ] **Step 4: Create the server**

```bash
source ops/paperclip/pilot.env
hcloud server create \
  --name "$HETZNER_SERVER_NAME" \
  --type "$HETZNER_SERVER_TYPE" \
  --image ubuntu-26.04 \
  --location "$HETZNER_LOCATION" \
  --ssh-key "$HETZNER_SSH_KEY_NAME" \
  --firewall paperclip-pilot
```
Expected: `Server ... created`, an IPv4 printed. `HETZNER_SERVER_TYPE` is set in `ops/paperclip/pilot.env` to match the Command Center box (`hcloud server list -o columns=name,type`). Rescale later with `hcloud server change-type` if runs die with exit 137.

- [ ] **Step 5: Add the SSH alias**

Append to `~/.ssh/config`:
```
Host paperclip
  HostName <IPv4 from step 4>
  User root
  IdentityFile ~/.ssh/id_ed25519
```

- [ ] **Step 6: Verify**

Run: `ssh paperclip 'nproc; free -g | head -2; df -h / | tail -1'`
Expected: `8`, about 15 GB total memory, about 300 GB disk.

---

### Task 2: Tailscale, then close the box to the internet

**Files:**
- Modify: `~/.ssh/config`

**Interfaces:**
- Produces: the box's tailnet IPv4 (call it `TSIP`), and SSH alias `paperclip` pointing at it. Every later task uses `TSIP`.

- [ ] **Step 1: Install and bring up Tailscale**

Run on the box:
```bash
ssh paperclip 'curl -fsSL https://tailscale.com/install.sh | sh && tailscale up --hostname paperclip --ssh'
```
Expected: an auth URL printed. Open it, approve the machine on your tailnet.

- [ ] **Step 2: Record the tailnet IP into the env file**

```bash
TS=$(ssh paperclip 'tailscale ip -4') && sed -i '' "s|^TSIP=.*|TSIP=$TS|" ops/paperclip/pilot.env && grep ^TSIP ops/paperclip/pilot.env
```
Expected: `TSIP=100.x.y.z`. Every later task that needs it runs `source ops/paperclip/pilot.env`.

- [ ] **Step 3: Repoint the SSH alias at the tailnet**

Edit `~/.ssh/config` so `HostName` is `TSIP`. Keep `User root` for now.

- [ ] **Step 4: Verify SSH over the tailnet works before closing the public port**

Run: `ssh paperclip 'hostname'`
Expected: `paperclip`

- [ ] **Step 5: Remove the public SSH rule**

```bash
hcloud firewall delete-rule paperclip-pilot --direction in --protocol tcp --port 22 --source-ips "$(curl -4 -s https://ifconfig.me)/32"
hcloud firewall describe paperclip-pilot -o columns=name,rules
```
Expected: no inbound rules remain. Hetzner firewalls deny inbound by default when no rule matches.

- [ ] **Step 6: Verify the public port is closed and the tailnet still works**

```bash
PUBIP=$(hcloud server ip paperclip-pilot)
nc -z -w 3 "$PUBIP" 22 && echo "OPEN (wrong)" || echo "closed (correct)"
ssh paperclip 'echo tailnet-ok'
```
Expected: `closed (correct)` then `tailnet-ok`.

---

### Task 3: System user, Node 24, pnpm, jq, gh, Codex CLI

**Interfaces:**
- Produces: Linux user `paperclip` with lingering enabled (so its systemd user service survives logout); `node` 24.x, `pnpm` 9.x, `jq`, `gh`, `codex` on PATH for that user.

- [ ] **Step 1: Create the service user with lingering**

```bash
ssh paperclip 'adduser --disabled-password --gecos "" paperclip && loginctl enable-linger paperclip && mkdir -p /home/paperclip/.ssh && cp /root/.ssh/authorized_keys /home/paperclip/.ssh/ && chown -R paperclip:paperclip /home/paperclip/.ssh && chmod 700 /home/paperclip/.ssh'
```
Expected: no errors.

- [ ] **Step 2: Switch the SSH alias to the service user**

Edit `~/.ssh/config`: `User paperclip`. From here every `ssh paperclip` lands as that user. Use `ssh paperclip sudo ...` only where a step says so; give the user passwordless sudo first:
```bash
ssh -o User=root paperclip 'echo "paperclip ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/paperclip && chmod 440 /etc/sudoers.d/paperclip'
```

- [ ] **Step 3: Install Node 24 from NodeSource, pnpm, jq, git, and the native build toolchain**

```bash
ssh paperclip 'curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt-get install -y nodejs jq git build-essential && sudo npm install -g pnpm@9 && node -v && pnpm -v && jq --version && git --version && gcc --version | head -1'
```
Expected: `v24.x.y` (must be 24.11 or newer), `9.x`, jq, git and gcc versions. `build-essential` is required: Paperclip's source build compiles native modules and fails with `Command failed: corepack pnpm ... run build` without `make` and `g++`. Found during execution on 2026-09-09.

- [ ] **Step 4: Install gh**

```bash
ssh paperclip 'sudo mkdir -p -m 755 /etc/apt/keyrings && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null && sudo apt-get update && sudo apt-get install -y gh && gh --version'
```
Expected: `gh version 2.x`

- [ ] **Step 5: Install the Codex CLI**

```bash
ssh paperclip 'sudo npm install -g @openai/codex && codex --version'
```
Expected: a version string.

- [ ] **Step 6: Git identity for agent commits**

```bash
ssh paperclip 'git config --global user.name "Node AI Agents" && git config --global user.email "agents@users.noreply.github.com" && git config --global --list | grep user'
```
Expected: both lines printed.

---

### Task 4: Install Paperclip commit-pinned and onboard on the tailnet

**Files:**
- Modify: `docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md` (record the SHA in the Infrastructure table)

**Interfaces:**
- Produces: Paperclip running as a systemd user service for `paperclip`, bound to `TSIP:3100`, in `authenticated/private` mode.

- [ ] **Step 1: Choose and record the commit**

On your Mac:
```bash
SHA=$(gh api repos/paperclipai/paperclip/commits/master --jq .sha) && sed -i '' "s|^PAPERCLIP_COMMIT=.*|PAPERCLIP_COMMIT=$SHA|" ops/paperclip/pilot.env && gh api "repos/paperclipai/paperclip/commits/$SHA" --jq '.sha + "  " + .commit.committer.date'
```
Expected: the SHA and its date. Edit the spec's Infrastructure table row `Install` to read: `Pinned to <sha> (<date>)`.

- [ ] **Step 2: Commit the spec change**

```bash
git add docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md
git commit -m "docs(spec): pin the Paperclip commit for the pilot"
```

- [ ] **Step 3: Install Paperclip at a pinned published version**

A source build (`--ref <sha>`) fails on this box with `cargo: not found`: `packages/paperclip-runner` builds a Rust daemon the pilot does not use. Install the published payload instead; it is equally immutable and ships that binary prebuilt.

```bash
VER=$(npm view paperclipai version) && sed -i '' "s|^PAPERCLIP_VERSION=.*|PAPERCLIP_VERSION=$VER|" ops/paperclip/pilot.env
source ops/paperclip/pilot.env
ssh paperclip "npx --registry https://registry.npmjs.org paperclipai install --version $PAPERCLIP_VERSION --yes && ~/.local/bin/paperclipai --version"
```
Expected: an install (no compile), then the version string. `--yes` is required in non-interactive shells; without it the installer stops at a consent prompt and exits 0, which looks like success if you only read the tail. If `~/.local/bin` is not on PATH, run `echo "export PATH=\$HOME/.local/bin:\$PATH" >> ~/.profile` and reconnect.

- [ ] **Step 4: Onboard in tailnet mode with the service**

```bash
ssh paperclip 'paperclipai onboard --yes --bind tailnet --install-service'
```
Expected: onboarding output ending with the service started. Note the port (default 3100).

- [ ] **Step 5: Verify the service and health endpoint**

```bash
source ops/paperclip/pilot.env
ssh paperclip 'paperclipai service status && paperclipai doctor'
curl -s "http://$TSIP:3100/api/health"
```
Expected: `active (running)`, doctor with no red lines, and a JSON health body from your Mac over the tailnet.

- [ ] **Step 6: Allow the MagicDNS hostname**

```bash
ssh paperclip 'paperclipai allowed-hostname paperclip'
```
Expected: hostname accepted. `http://paperclip:3100` now works from any tailnet device.

---

### Task 5: Claim the instance, create a board token, set the CLI context

**Interfaces:**
- Produces: Cristoforo as instance admin; a board API key in env var `PAPERCLIP_API_KEY` on the box for the `paperclip` user; a CLI context so later commands need no flags.

- [ ] **Step 1: Create the one-time first-admin invite**

At this version the first admin is bootstrapped with a CLI command, not a claim URL in the logs. Health reports `bootstrapStatus: bootstrap_pending` until it is used.

```bash
ssh paperclip 'export PATH=$HOME/.local/bin:$PATH; paperclipai auth bootstrap-ceo --base-url http://paperclip:3100 --expires-hours 24'
```
Expected: one invite URL on `http://paperclip:3100/...`. It expires in 24 hours and works once. `--force` mints a new one if the first is lost.

- [ ] **Step 2: Accept it**

Open the URL in a browser on the tailnet (MagicDNS resolves `paperclip` once the service was restarted after `allowed-hostname`). Create the admin user as Cristoforo. Then in the UI invite Niek as a board user. Verify with `curl -s http://paperclip:3100/api/health | jq .bootstrapStatus`, which must no longer say `bootstrap_pending`.

- [ ] **Step 3: Point the CLI at the tailnet address**

The server is bound to the tailnet IP only, not loopback, so the CLI's default `localhost:3100` cannot reach it even from the box itself.

```bash
ssh paperclip 'export PATH=$HOME/.local/bin:$PATH; paperclipai context set --api-base http://100.74.98.1:3100 && grep -q PAPERCLIP_API_URL ~/.profile || echo "export PAPERCLIP_API_URL=http://100.74.98.1:3100" >> ~/.profile'
```
Expected: `context show` prints the tailnet `apiBase`. A `company list` now fails with a company error, not a connection error.

- [ ] **Step 4: Authenticate the CLI as a board user (browser approval)**

Board access is a challenge flow, not a token you can mint blind. Start it in the background so it keeps polling while you approve:

```bash
ssh paperclip 'export PATH=$HOME/.local/bin:$PATH; nohup paperclipai auth login --no-browser --instance-admin > ~/auth-login.log 2>&1 & sleep 4; cat ~/auth-login.log'
```
Expected: an approval URL on `http://100.74.98.1:3100/...`. Open it in the browser where you are already logged in as admin and approve. The CLI then stores the credential and exits. Verify:
```bash
ssh paperclip 'export PATH=$HOME/.local/bin:$PATH; paperclipai auth whoami'
```
Expected: your admin identity.

- [ ] **Step 5 (optional): Create a long-lived board API key for scripts and store it**

The browser approval in step 4 already creates and stores a board key named `paperclipai cli (instance admin)` that every later CLI command uses. This step is only needed if you want a second key for external scripts. If you skip it, make sure `PAPERCLIP_API_KEY` is **not** set in `~/.profile`: an empty or wrong value there overrides the stored login and produces `Agent token did not verify`. The JSON field returned by `token board create --json` is `key`.

```bash
ssh paperclip 'export PATH=$HOME/.local/bin:$PATH; paperclipai token board create --name pilot-admin --json | jq -r .token | { read -r T; echo "export PAPERCLIP_API_KEY=$T" >> ~/.profile; }; chmod 600 ~/.profile; paperclipai context set --api-key-env-var-name PAPERCLIP_API_KEY && paperclipai context show'
```
The token goes straight from the API into `~/.profile` (mode 600) and is never printed. Expected: context shows the API base and the env var name, no plaintext.

- [ ] **Step 5: Verify authenticated CLI access**

```bash
ssh paperclip 'source ~/.profile && paperclipai company list --json'
```
Expected: `[]` or a list, not an auth error.

---

### Task 6: Create the `nodeai` company, goal, and project; enable isolated workspaces

**Interfaces:**
- Produces: `COMPANY_ID`, `GOAL_ID`, `PROJECT_ID` (GUIDs). Later tasks read them from `~/pilot.env` on the box.

- [ ] **Step 1: Find or create the company and capture its id**

If the admin went through Paperclip's first-run wizard even one step, a company already exists. Check first and reuse it rather than creating a duplicate:

```bash
ssh paperclip 'source ~/.profile && paperclipai company list --json | jq -c ".[] | {id, name}"'
```
If a company is listed, record its id: `echo "export COMPANY_ID=<id>" > ~/pilot.env`. Only if the list is empty:
```bash
ssh paperclip 'source ~/.profile && paperclipai company create --payload-json "{\"name\":\"Node AI\"}" --json | jq -r .id | sed "s/^/export COMPANY_ID=/" > ~/pilot.env'
```
Expected either way: `~/pilot.env` holds one `COMPANY_ID` line. `chmod 600 ~/pilot.env`.

- [ ] **Step 2: Make it the default company in the context**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai context set --company-id "$COMPANY_ID" && paperclipai company current'
```
Expected: `Node AI`.

- [ ] **Step 3: Enable isolated workspaces (experimental flag, default off)**

```bash
ssh paperclip 'source ~/.profile && paperclipai instance settings:experimental:update --payload-json "{\"enableIsolatedWorkspaces\":true}" && paperclipai instance settings:experimental --json | jq .enableIsolatedWorkspaces'
```
Expected: `true`.

- [ ] **Step 4: Create the goal**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai goal create --company-id "$COMPANY_ID" --title "FounderOS usable as Node AI console" --level company --status active --json | jq -r .id | sed "s/^/export GOAL_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export GOAL_ID=<guid>`

- [ ] **Step 5: Create the project linked to the goal**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai project create --company-id "$COMPANY_ID" --name "founderos" --goal-ids "$GOAL_ID" --json | jq -r .id | sed "s/^/export PROJECT_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export PROJECT_ID=<guid>`

- [ ] **Step 6: Verify**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai project get "$PROJECT_ID" --json | jq "{name, status, goalIds}"'
```
Expected: name `founderos`, the goal id present.

---

### Task 7: Clone the repo on the box, GitHub token as a secret, project workspace with worktree policy

**Interfaces:**
- Consumes: `COMPANY_ID`, `PROJECT_ID` from `~/pilot.env`.
- Produces: repo at `/home/paperclip/repos/founderos` on `main`; Paperclip secret `github-founderos` (id in `~/pilot.env` as `GH_SECRET_ID`); a project workspace; execution policy `isolated_workspace` + `git_worktree` with branch template `agent/{{issue.identifier}}`.

- [ ] **Step 1: Create a fine-grained GitHub token (you, in the browser)**

GitHub → Settings → Developer settings → Fine-grained tokens → Generate. Repository access: only `Node-AI-Studio/FounderOS`. Permissions: **Contents: Read and write**, **Pull requests: Read and write**, Metadata read (added automatically). Expiry: 30 days. Copy it once.

The trap, hit on 2026-09-09: a fine-grained token defaults every permission to "No access". If Contents is left at read, or not set, the token can read the repo but every `git push` fails with `Permission to ... denied` even for a plain branch, and it looks like an account problem when it is a token-scope problem. Verify the scope directly rather than trusting the UI:
```bash
ssh paperclip 'curl -s -I -H "Authorization: token $(gh auth token)" https://api.github.com/repos/Node-AI-Studio/FounderOS | grep -i x-accepted-github-permissions'
```
Expected to include `contents=write` and `pull_requests=write`. If it shows only `metadata=read`, edit the token's permissions on GitHub; the token value does not change, so nothing needs re-pushing.

- [ ] **Step 2: Store it as a Paperclip secret without it touching shell history**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && read -rs GH_PAT && export GH_PAT && paperclipai secrets create --company-id "$COMPANY_ID" --name github-founderos --value-env GH_PAT --json | jq -r .id | sed "s/^/export GH_SECRET_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env' < <(source ops/paperclip/pilot.env && printf '%s\n' "$GH_PAT")
```
The value is fed to `read` over the SSH channel's stdin from the local env file; it is never printed and never lands in a file on the box. Expected: `export GH_SECRET_ID=<guid>`.

- [ ] **Step 3: Verify the secret is listed with no value**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai secrets list --company-id "$COMPANY_ID"'
```
Expected: `github-founderos` listed, no value column.

- [ ] **Step 4: Authenticate gh and git on the box using the same token, then discard it from the shell**

```bash
ssh paperclip 'gh auth login --with-token && gh auth setup-git && gh auth status' < <(source ops/paperclip/pilot.env && printf '%s\n' "$GH_PAT")
```
Expected: `Logged in to github.com`.

- [ ] **Step 5: Clone the repo**

`Node-AI-Studio/FounderOS` is public, so the clone needs no token and can run before steps 1 to 4. The token is only needed to push branches and open PRs (agents do that; step 4's `gh auth setup-git` provides it).

```bash
ssh paperclip 'mkdir -p ~/repos && git clone https://github.com/Node-AI-Studio/FounderOS.git ~/repos/founderos && cd ~/repos/founderos && git switch main && git log --oneline -1'
```
Expected: the current `main` head.

- [ ] **Step 6: Install its dependencies once so worktrees can build fast**

```bash
ssh paperclip 'sudo npm install -g n && sudo n 20 && sudo n 24 && node -v && n which 20 && cd ~/repos/founderos && PATH="$(dirname $(n which 20)):$PATH" npm ci && PATH="$(dirname $(n which 20)):$PATH" npm test -- --run 2>&1 | tail -3'
```
Expected: `node -v` prints `v24.x` (`n` activates whatever it installs, so 24 is re-activated immediately after 20 is added), `n which 20` prints a path under `/usr/local/n/versions/node/20.*/bin/node`, `npm ci` completes, test summary shows all passing. The default `node` stays 24 for Paperclip; agents are told the Node 20 path in their instructions (Task 11).

- [ ] **Step 7: Register the project workspace**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai project-workspace create "$PROJECT_ID" --payload-json "{\"name\":\"founderos\",\"sourceType\":\"local_path\",\"cwd\":\"/home/paperclip/repos/founderos\",\"defaultRef\":\"main\"}" --json | jq "{id,name,cwd}"'
```
Expected: the workspace echoed back with the cwd.

- [ ] **Step 8: Set the execution workspace policy to git worktrees**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai project update "$PROJECT_ID" --execution-workspace-policy-json "{\"enabled\":true,\"defaultMode\":\"isolated_workspace\",\"allowIssueOverride\":false,\"workspaceStrategy\":{\"type\":\"git_worktree\",\"baseRef\":\"main\",\"branchTemplate\":\"agent/{{issue.identifier}}\",\"worktreeParentDir\":\"/home/paperclip/worktrees\"}}" && paperclipai project get "$PROJECT_ID" --json | jq .executionWorkspacePolicy'
```
Expected: the policy echoed with `type: git_worktree` and the branch template.

- [ ] **Step 9: Verify**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai project-workspace list "$PROJECT_ID" && git -C ~/repos/founderos status --short | wc -l'
```
Expected: one workspace, `0` (clean tree).

---

### Task 8: Branch protection on `main`

**Interfaces:**
- Produces: `main` on `Node-AI-Studio/FounderOS` requires a PR, forbids force-push and deletion. This is the enforcement for "PRs only".

- [ ] **Step 1: Apply protection**

On your Mac (your account has admin on the org repo):
```bash
gh api -X PUT repos/Node-AI-Studio/FounderOS/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```
Expected: JSON echo of the protection. `verify` is the job name in `.github/workflows/ci.yml`.

- [ ] **Step 2: Verify**

```bash
gh api repos/Node-AI-Studio/FounderOS/branches/main/protection --jq '{pr: .required_pull_request_reviews.required_approving_review_count, force: .allow_force_pushes.enabled, checks: .required_status_checks.contexts}'
```
Expected: `{"pr":1,"force":false,"checks":["verify"]}`

- [ ] **Step 3: Prove the agent token cannot push to main**

```bash
ssh paperclip 'cd ~/repos/founderos && git switch -c protection-probe && git commit --allow-empty -m "probe" -q && git push origin HEAD:main 2>&1 | tail -2; git switch main -q && git branch -D protection-probe -q'
```
Expected: `remote: error: GH006: Protected branch update failed`. The push is refused.

---

### Task 9: Codex subscription login on the box

**Interfaces:**
- Produces: `/home/paperclip/.codex/auth.json`, the host credential Paperclip symlinks into each subscription agent's managed home.

- [ ] **Step 1: Run the device-auth login**

```bash
ssh -t paperclip 'codex login --device-auth'
```
Expected: a URL and a short code printed. Open the URL on your phone or laptop, sign in with the ChatGPT account that has the Codex plan, enter the code.

- [ ] **Step 2: Verify, then enable the nightly trigger**

```bash
ssh paperclip 'test -s ~/.codex/auth.json && echo "auth.json present" && stat -c "%a %U" ~/.codex/auth.json && codex --version'
```
Expected: `auth.json present`, mode `600` owned by `paperclip`, a version. Now that agents can authenticate, enable the trigger created disabled in Task 13:
```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && T=$(paperclipai routine get "$ROUTINE_ID" --json | jq -r ".triggers[0].id") && paperclipai routine trigger:update "$T" --payload-json "{\"enabled\":true}" >/dev/null && paperclipai routine get "$ROUTINE_ID" --json | jq -c ".triggers | map({cronExpression, enabled})"'
```
Expected: `enabled: true`.

Order note: in execution, Task 12 (agents) and Task 13 (routine) were run before Tasks 7 steps 2 to 4, 9 and 10, because they do not need the secrets to exist. Agents were created without `adapterConfig.env`; the `GH_TOKEN` and `OPENAI_API_KEY` bindings are added afterwards with `agent update` (Task 12 step 9 below). Config edits apply on the next run.

- [ ] **Step 3: Do not do this on the Mac**

Nothing to run. The rule from the spec: the subscription's refresh tokens rotate and are single-use. Two machines sharing them invalidate each other. The box is the only place this account is logged in for Codex.

---

### Task 10: The reviewer's OpenAI API key as a secret

**Interfaces:**
- Produces: Paperclip secret `openai-reviewer`, id stored as `OPENAI_SECRET_ID` in `~/pilot.env`.

- [ ] **Step 1: Create an OpenAI API key (you)**

platform.openai.com → API keys → Create. Name it `paperclip-reviewer-pilot`. Set a project-level monthly limit of USD 10 there as well; Paperclip's cap is the one under test, OpenAI's is the backstop.

- [ ] **Step 2: Store it**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && read -rs K && export K && paperclipai secrets create --company-id "$COMPANY_ID" --name openai-reviewer --value-env K --json | jq -r .id | sed "s/^/export OPENAI_SECRET_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env' < <(source ops/paperclip/pilot.env && printf '%s\n' "$OPENAI_REVIEWER_KEY")
```
Fed from the local env file over stdin, never printed. Expected: `export OPENAI_SECRET_ID=<guid>`.

- [ ] **Step 3: Verify**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai secrets list --company-id "$COMPANY_ID" | grep -E "github-founderos|openai-reviewer"'
```
Expected: both names, no values.

---

### Task 11: Write the three instruction files

**Files:**
- Create: `ops/paperclip/agents/console-engineer.md`
- Create: `ops/paperclip/agents/test-engineer.md`
- Create: `ops/paperclip/agents/reviewer.md`

**Interfaces:**
- Produces: the exact text uploaded to each agent as its `AGENTS.md` in Task 12.

- [ ] **Step 1: Write `ops/paperclip/agents/console-engineer.md`**

```markdown
# console-engineer

You implement tickets on the FounderOS repository for Node AI. One ticket at a
time. You never merge and never push to main.

## Environment

- The repository is checked out for you in an isolated git worktree on a branch
  named `agent/<issue-identifier>`. Work only there.
- This repo needs Node 20 and npm. Run every npm command through the Node 20
  binary: `PATH="$(dirname $(n which 20)):$PATH" npm <command>`.
- Read `CLAUDE.md` and `AGENTS.md` in the repo root before touching code. The
  house style there applies, including: no em dashes anywhere, named exports,
  TypeScript strict, Zod at every boundary, tests in `tests/` one file per
  module using `FOUNDER_OS_DB=:memory:`.

## Your job, every ticket

1. Read the ticket. If it is ambiguous, set it to `blocked` with a comment that
   names Cristoforo and the exact question. Do not guess.
2. Write the failing test first in `tests/`. Run it and confirm it fails.
3. Make the smallest change that passes. Keep files under 400 lines.
4. Run `PATH="$(dirname $(n which 20)):$PATH" npm test` and
   `PATH="$(dirname $(n which 20)):$PATH" npm run typecheck`. Both green, or
   you are not done.
5. Commit with a conventional message: `feat:`, `fix:`, `refactor:`, `test:`,
   `chore:`. Stage explicit paths, never `git add -A`.
6. Open a pull request against `main` with the issue identifier in the title:
   `gh pr create --base main --title "<identifier>: <summary>" --body "<what and why>"`.
7. Record the PR URL on the ticket and set it to `in_review`.

## Hard rules

- Never merge. Never push to `main`. Never force-push. If a push is refused,
  stop and set the ticket to `blocked` naming Cristoforo.
- Never write secrets into the repo. Never edit `.env.local`.
- If any step fails twice in a row, stop and set the ticket to `blocked`
  naming Cristoforo with the exact error. Never fake a green run.
```

- [ ] **Step 2: Write `ops/paperclip/agents/test-engineer.md`**

```markdown
# test-engineer

You keep the FounderOS test suite green and add coverage for new work. You
never merge and never push to main.

## Environment

- The repository is checked out for you in an isolated git worktree on a branch
  named `agent/<issue-identifier>`. Work only there.
- This repo needs Node 20 and npm. Run every npm command through the Node 20
  binary: `PATH="$(dirname $(n which 20)):$PATH" npm <command>`.
- Read `CLAUDE.md` and `AGENTS.md` in the repo root first. No em dashes.

## Your job, every ticket

1. Read the ticket. For the nightly gate ticket, the failing output is
   attached. For other tickets, the description names the behaviour lacking
   a test.
2. Reproduce first. Run `PATH="$(dirname $(n which 20)):$PATH" npm test` and
   confirm you see the same failure before changing anything.
3. Decide whether the test or the code is wrong. Say which in the PR body,
   in one sentence.
4. Fix only that. Add a test for any behaviour that had none.
5. Run `PATH="$(dirname $(n which 20)):$PATH" npm test` and
   `PATH="$(dirname $(n which 20)):$PATH" npm run typecheck` until both are
   green.
6. Commit with a conventional message, explicit paths only.
7. Open a pull request against `main` with the issue identifier in the title.
   Record the PR URL on the ticket and set it to `in_review`.
8. If the nightly gate was already green when you looked, comment "green on
   <sha>" on the ticket and set it to `done`.

## Hard rules

- Never merge. Never push to `main`. Never force-push.
- Never delete a failing test to make the suite pass. Fix or flag.
- If any step fails twice in a row, stop and set the ticket to `blocked`
  naming Cristoforo with the exact error. Never fake a green run.
```

- [ ] **Step 3: Write `ops/paperclip/agents/reviewer.md`**

```markdown
# reviewer

You review open pull requests on the FounderOS repository against Node AI's
rules. You comment. You never merge, never approve on behalf of a human, and
never push.

## Environment

- You have `gh` authenticated for `Node-AI-Studio/FounderOS`.
- Read `CLAUDE.md` and `AGENTS.md` in the repo root first.

## Your job, every ticket

1. The ticket names a PR. Read the diff: `gh pr diff <number>`.
2. Check each of these and quote the rule when it is broken:
   - a test exists for the change and is in `tests/`
   - `npm test` and `npm run typecheck` are reported green in the PR body
   - no em dashes anywhere in the diff (search for the character)
   - no secrets, keys, tokens, or `.env` values
   - one logical change, one conventional commit type in the title
   - named exports, no default exports
   - files under 400 lines
3. Leave one line comment per violation with `gh pr comment <number> --body`.
4. Leave one summary comment ending with exactly one of:
   `VERDICT: looks good`, `VERDICT: changes requested`,
   `VERDICT: needs a human`.
5. Set the ticket to `in_review` with the verdict as the comment.

## Hard rules

- Never merge. Never approve. Never push.
- If `gh` is refused or the PR cannot be read, set the ticket to `blocked`
  naming Cristoforo. Never invent a review.
```

- [ ] **Step 4: Verify no em dashes and commit**

```bash
grep -nP '\x{2014}' ops/paperclip/agents/*.md && echo "EM DASH FOUND" || echo "clean"
git add ops/paperclip/agents/console-engineer.md ops/paperclip/agents/test-engineer.md ops/paperclip/agents/reviewer.md
git commit -m "chore(paperclip): instruction files for the three pilot agents"
```
Expected: `clean`, then a commit.

---

### Task 12: Create the three agents

**Interfaces:**
- Consumes: `COMPANY_ID`, `GH_SECRET_ID`, `OPENAI_SECRET_ID`, `PROJECT_ID` from `~/pilot.env`; the three files from Task 11 (copied to the box).
- Produces: `CONSOLE_ID`, `TEST_ID`, `REVIEWER_ID` in `~/pilot.env`.

- [ ] **Step 1: Copy the instruction files to the box**

```bash
scp ops/paperclip/agents/*.md paperclip:~/agents/ 2>/dev/null || (ssh paperclip 'mkdir -p ~/agents' && scp ops/paperclip/agents/*.md paperclip:~/agents/)
```

- [ ] **Step 2: Create console-engineer (subscription auth, root of the tree)**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai agent create --company-id "$COMPANY_ID" --payload-json "{
  \"name\":\"console-engineer\",
  \"title\":\"Console Engineer\",
  \"adapterType\":\"codex_local\",
  \"adapterConfig\":{
    \"cwd\":\"/home/paperclip/repos/founderos\",
    \"env\":{\"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"}},
    \"timeoutSec\":3600,
    \"graceSec\":60
  },
  \"runtimeConfig\":{\"heartbeat\":{\"enabled\":true,\"maxConcurrentRuns\":1}},
  \"budgetMonthlyCents\":0
}" --json | jq -r .id | sed "s/^/export CONSOLE_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export CONSOLE_ID=<guid>`. Budget 0 means no dollar cap; this agent runs on the subscription.

- [ ] **Step 3: Create test-engineer (subscription auth, reports to console-engineer)**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai agent create --company-id "$COMPANY_ID" --payload-json "{
  \"name\":\"test-engineer\",
  \"title\":\"Test Engineer\",
  \"reportsTo\":\"$CONSOLE_ID\",
  \"adapterType\":\"codex_local\",
  \"adapterConfig\":{
    \"cwd\":\"/home/paperclip/repos/founderos\",
    \"env\":{\"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"}},
    \"timeoutSec\":3600,
    \"graceSec\":60
  },
  \"runtimeConfig\":{\"heartbeat\":{\"enabled\":true,\"maxConcurrentRuns\":1}},
  \"budgetMonthlyCents\":0
}" --json | jq -r .id | sed "s/^/export TEST_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export TEST_ID=<guid>`

- [ ] **Step 4: Create reviewer (API-key auth, USD 5 hard cap)**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai agent create --company-id "$COMPANY_ID" --payload-json "{
  \"name\":\"reviewer\",
  \"title\":\"Reviewer\",
  \"reportsTo\":\"$CONSOLE_ID\",
  \"adapterType\":\"codex_local\",
  \"adapterConfig\":{
    \"cwd\":\"/home/paperclip/repos/founderos\",
    \"env\":{
      \"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"},
      \"OPENAI_API_KEY\":{\"type\":\"secret_ref\",\"secretId\":\"$OPENAI_SECRET_ID\"}
    },
    \"timeoutSec\":1200,
    \"graceSec\":30
  },
  \"runtimeConfig\":{\"heartbeat\":{\"enabled\":true,\"maxConcurrentRuns\":1}},
  \"budgetMonthlyCents\":500
}" --json | jq -r .id | sed "s/^/export REVIEWER_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export REVIEWER_ID=<guid>`. The per-agent `OPENAI_API_KEY` makes Paperclip write an API-key `auth.json` into this agent's managed Codex home instead of symlinking the subscription.

- [ ] **Step 5: Make the reviewer's cap an explicit hard-stop policy**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai budget agent:update "$REVIEWER_ID" --payload-json "{\"budgetMonthlyCents\":500}" && paperclipai budget overview --company-id "$COMPANY_ID" --json | jq -c ".. | objects | select(.scopeId? == \"$REVIEWER_ID\")"'
```
Expected: at least one object for the reviewer's scope containing `"amount":500` and `"hardStopEnabled":true`. The `..` walk is used because the overview's top-level key names are not documented; it finds the policy wherever it sits.

- [ ] **Step 6: Upload each instruction file**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && \
  paperclipai agent instructions-file:put "$CONSOLE_ID" --path AGENTS.md --content-file ~/agents/console-engineer.md && \
  paperclipai agent instructions-file:put "$TEST_ID" --path AGENTS.md --content-file ~/agents/test-engineer.md && \
  paperclipai agent instructions-file:put "$REVIEWER_ID" --path AGENTS.md --content-file ~/agents/reviewer.md && \
  paperclipai agent instructions-file:get "$REVIEWER_ID" --path AGENTS.md | head -3'
```
Expected: the first three lines of the reviewer file echoed back.

- [ ] **Step 7: Install the GitHub PR skill and attach skills**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && \
  paperclipai skills install github-pr-workflow --company-id "$COMPANY_ID" && \
  paperclipai skills agent sync "$CONSOLE_ID" --skill paperclip --skill github-pr-workflow --mode add --company-id "$COMPANY_ID" && \
  paperclipai skills agent sync "$TEST_ID" --skill paperclip --skill github-pr-workflow --mode add --company-id "$COMPANY_ID" && \
  paperclipai skills agent sync "$REVIEWER_ID" --skill paperclip --skill github-pr-workflow --mode add --company-id "$COMPANY_ID" && \
  paperclipai skills agent list "$REVIEWER_ID" --company-id "$COMPANY_ID"'
```
Expected: `paperclip` and `github-pr-workflow` listed for the reviewer. If `github-pr-workflow` is not in this build's catalog, run `paperclipai skills search "pull request"` and use the slug it returns.

- [ ] **Step 8: Verify the roster**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai agent list --company-id "$COMPANY_ID" --json | jq ".[] | {name, adapterType, budgetMonthlyCents, reportsTo}"'
```
Expected: three agents, `codex_local`, budgets `0, 0, 500`, two reporting to the console-engineer id.

- [ ] **Step 9: Bind the secrets (run after Tasks 7 and 10 exist)**

If the agents were created before the secrets, add the env bindings now. `agent update` merges `adapterConfig` unless `replaceAdapterConfig` is true.

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && \
  paperclipai agent update "$CONSOLE_ID"  --payload-json "{\"adapterConfig\":{\"env\":{\"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"}}}}" >/dev/null && \
  paperclipai agent update "$TEST_ID"     --payload-json "{\"adapterConfig\":{\"env\":{\"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"}}}}" >/dev/null && \
  paperclipai agent update "$REVIEWER_ID" --payload-json "{\"adapterConfig\":{\"env\":{\"GH_TOKEN\":{\"type\":\"secret_ref\",\"secretId\":\"$GH_SECRET_ID\"},\"OPENAI_API_KEY\":{\"type\":\"secret_ref\",\"secretId\":\"$OPENAI_SECRET_ID\"}}}}" >/dev/null && \
  paperclipai agent configuration "$REVIEWER_ID" --json | jq -c ".adapterConfig.env | keys"'
```
Expected: `["GH_TOKEN","OPENAI_API_KEY"]` for the reviewer. Secret values are never shown; only the binding type and id.

---

### Task 13: The nightly routine

**Interfaces:**
- Consumes: `COMPANY_ID`, `PROJECT_ID`, `TEST_ID`.
- Produces: `ROUTINE_ID` in `~/pilot.env`, with a schedule trigger at 02:00 UTC.

- [ ] **Step 1: Create the routine**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai routine create --company-id "$COMPANY_ID" --payload-json "{
  \"title\":\"Nightly gate on main\",
  \"description\":\"Check out main fresh. Run npm test and npm run typecheck through Node 20 (PATH=\\\"\$(dirname \$(n which 20)):\$PATH\\\"). If both are green, comment green on <sha> and set this to done. If either is red, attach the full output as a comment and leave it todo for yourself to fix per your instructions.\",
  \"projectId\":\"$PROJECT_ID\",
  \"assigneeAgentId\":\"$TEST_ID\",
  \"priority\":\"medium\",
  \"status\":\"active\",
  \"concurrencyPolicy\":\"skip_if_active\",
  \"catchUpPolicy\":\"skip_missed\"
}" --json | jq -r .id | sed "s/^/export ROUTINE_ID=/" >> ~/pilot.env && tail -1 ~/pilot.env'
```
Expected: `export ROUTINE_ID=<guid>`

- [ ] **Step 2: Attach the schedule trigger, disabled**

Create it disabled so nothing fires before Codex is logged in (Task 9). Enable it in Task 9 step 2 once `auth.json` exists.

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai routine trigger:create "$ROUTINE_ID" --payload-json "{\"kind\":\"schedule\",\"cronExpression\":\"0 2 * * *\",\"timezone\":\"UTC\",\"enabled\":false,\"label\":\"nightly 02:00 UTC\"}" >/dev/null && paperclipai routine get "$ROUTINE_ID" --json | jq -c ".triggers | map({kind, cronExpression, enabled})"'
```
Expected: `[{"kind":"schedule","cronExpression":"0 2 * * *","enabled":false}]`. The `trigger:create` response itself is not a flat trigger object, so verify through `routine get`.

- [ ] **Step 3: Fire it once by hand and watch**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai routine run "$ROUTINE_ID" && sleep 20 && paperclipai routine runs "$ROUTINE_ID" --limit 1 --json | jq ".[0] | {status, issueId}"'
```
Expected: a run with an `issueId`. Then:
```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai issue list --company-id "$COMPANY_ID" --assignee-agent-id "$TEST_ID" --json | jq ".[] | {identifier, title, status}"'
```
Expected: one issue titled `Nightly gate on main`, status `todo` or `in_progress`.

- [ ] **Step 4: Wait for it to finish and read the result**

```bash
sleep 300
ssh paperclip 'source ~/.profile && source ~/pilot.env && ID=$(paperclipai issue list --company-id "$COMPANY_ID" --assignee-agent-id "$TEST_ID" --json | jq -r ".[0].id") && paperclipai issue get "$ID" --json | jq "{status}" && paperclipai issue comments "$ID" --limit 3'
```
Expected: status `done` and a comment containing `green on` and a SHA. If red, the agent left the output and the issue is `todo`; that is also a valid outcome for this step, it means the routine works.

---

### Task 14: Enter the first ten pilot issues

**Files:**
- Create: `ops/paperclip/pilot-backlog.md`

**Interfaces:**
- Produces: ten `todo` issues in the founderos project, assigned to console-engineer.

- [ ] **Step 1: Write the backlog file**

```markdown
# Pilot backlog

Ten small, independent tickets on FounderOS. Each is one PR. Written so an
agent with the repo and CLAUDE.md can do it without asking. Cristoforo
replaces these with the real customisation list before entering them.

1. Rename the app title from "FOUNDER OS" to "NODE AI OS" in the topbar and
   the unlock screen. Test: the rendered string appears in both components.
2. Add a `PAPERCLIP_URL` and `PAPERCLIP_API_KEY` pair to `.env.example` with a
   one-line comment each. No code change. Test: the example file parses with
   `parseEnvFile` in `tests/creds.test.ts`.
3. Add `lib/connectors/paperclip.ts` exporting `paperclipStatus()` that returns
   `not_configured` when `PAPERCLIP_URL` is unset, `error` when unreachable,
   `connected` on a 200 from `/api/health`. Test with a stubbed fetch.
4. Register `['paperclip', 'orchestration', paperclipStatus]` in the `CHECKS`
   array in `lib/connectors/index.ts`. Test: `allConnectorStatuses()` includes
   an entry with id `paperclip`.
5. Add the Paperclip tile to `lib/integrations-catalog.ts` under a new
   `Orchestration` category with `connectorId: 'paperclip'` and
   `envKeys: ['PAPERCLIP_URL','PAPERCLIP_API_KEY']`. Test: catalog test covers
   the new entry.
6. Gate seeding behind `FOUNDER_OS_DEMO_SEED`. `lib/data.ts` seeds only when it
   is `1`. Default off. Test: with the var unset, a fresh in-memory db has zero
   agents.
7. Add a visible `DEMO DATA` mark to `PageHeader` when `FOUNDER_OS_DEMO_SEED=1`.
   Test: renders the mark only when set.
8. Remove the `HERMES_DASH_URL` tab label "Hermes Workers" and rename it
   "Control plane". Env var name unchanged. Test: `tests/agents-tabs.test.ts`
   updated to the new label.
9. Make `describeCron` in `lib/cron.ts` return `every hour` for `0 * * * *`
   instead of `hourly at :00`. Test: one new case.
10. Add `tests/paperclip.test.ts` covering the three states of
    `paperclipStatus()` if ticket 3 did not already, else extend it with a
    timeout case.
```

- [ ] **Step 2: Commit it**

```bash
git add ops/paperclip/pilot-backlog.md
git commit -m "chore(paperclip): first ten pilot tickets"
```

- [ ] **Step 3: Enter the issues by CLI, in `backlog`, unassigned**

`issue create --help` on this build shows the flags the reference doc omits: `--assignee-agent-id`, `--project-id`, `--goal-id`, `--parent-id`. Create the issues in `backlog` with **no assignee**: `backlog` carries no pickup expectation, so the console-engineer's heartbeat cannot grab work before the supervised first run in Task 15. Task 15 moves one issue to `todo` and assigns it deliberately.

Parse the backlog file into JSON on the Mac, copy it over, and loop on the box. Two traps from execution: print nothing to stdout while writing the JSON file, and never run `ssh` inside a `while read` loop that reads from the same stdin (it consumes the loop's input). Use `ssh -n` and feed `paperclipai` with `</dev/null`.

```bash
python3 - <<'PY'
import re, json, sys
txt = open("ops/paperclip/pilot-backlog.md", encoding="utf-8").read()
body = txt.split("\n\n", 2)[-1]
items = re.split(r"\n(?=\d+\. )", body.strip())
out = []
for it in items:
    m = re.match(r"(\d+)\. (.*)", it, re.S)
    n, text = int(m.group(1)), re.sub(r"\s+", " ", m.group(2)).strip()
    title = re.split(r"\. ", text, maxsplit=1)[0][:90]
    out.append({"title": f"Pilot {n}: {title}", "description": text})
json.dump(out, open("/tmp/pilot-items.json", "w"))
print(len(out), "items", file=sys.stderr)
PY
scp -q /tmp/pilot-items.json paperclip:~/pilot-items.json
ssh -n paperclip 'source ~/.profile && source ~/pilot.env && jq -c ".[]" ~/pilot-items.json | while read -r row; do T=$(printf "%s" "$row" | jq -r .title); D=$(printf "%s" "$row" | jq -r .description); paperclipai issue create --company-id "$COMPANY_ID" --project-id "$PROJECT_ID" --goal-id "$GOAL_ID" --title "$T" --description "$D" --status backlog --priority medium --json </dev/null | jq -r .identifier; done; rm -f ~/pilot-items.json'
```
Expected: ten identifiers such as `NOD-3` to `NOD-12`.

- [ ] **Step 4: Verify**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai issue list --company-id "$COMPANY_ID" --status todo --assignee-agent-id "$CONSOLE_ID" --json | jq length'
```
Expected: `10`

---

### Task 15: First supervised run

**Interfaces:**
- Consumes: the ten issues; `CONSOLE_ID`.
- Produces: the first agent PR on GitHub, and confidence that the worktree and PR path work before leaving agents unattended.

- [ ] **Step 1: Wake console-engineer on ticket 1 and watch it live**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && FIRST=$(paperclipai issue list --company-id "$COMPANY_ID" --status todo --assignee-agent-id "$CONSOLE_ID" --json | jq -r ".[0].id") && echo "$FIRST" > ~/first-issue && paperclipai agent wake "$CONSOLE_ID" --company-id "$COMPANY_ID" --reason "pilot first run" --payload "{\"issueId\":\"$FIRST\"}"'
sleep 30
ssh paperclip 'source ~/.profile && paperclipai issue live-runs "$(cat ~/first-issue)"'
```
Expected: one live run. Then follow it (there is no follow mode; poll):
```bash
ssh paperclip 'source ~/.profile && RUN=$(paperclipai issue active-run "$(cat ~/first-issue)" --json | jq -r .id) && echo "$RUN" > ~/first-run && paperclipai run get "$RUN" --json | jq "{status, startedAt}"'
watch -n 60 "ssh paperclip 'source ~/.profile && paperclipai run get \$(cat ~/first-run) --json | jq .status && paperclipai run log \$(cat ~/first-run) --text | tail -20'"
```
Expected: status moves `running` → `succeeded` (or `failed` with a readable log). `paperclipai run events "$RUN"` shows the structured event stream if the text log is unclear.

- [ ] **Step 2: Confirm the worktree and branch exist**

```bash
ssh paperclip 'ls ~/worktrees && git -C ~/repos/founderos branch -r | grep agent/'
```
Expected: a worktree directory, and a remote branch `origin/agent/<identifier>`.

- [ ] **Step 3: Confirm the PR and the ticket state**

```bash
gh pr list --repo Node-AI-Studio/FounderOS --head "agent/*" --json number,title,headRefName
ssh paperclip 'source ~/.profile && paperclipai issue get "$(cat ~/first-issue)" --json | jq .status'
```
Expected: one PR whose title starts with the issue identifier; ticket status `in_review`.

- [ ] **Step 4: Review it yourself, merge or request changes**

Merge with `gh pr merge <number> --squash --delete-branch` if it is right. If not, comment and set the ticket back to `todo`; the agent will pick it up on its next heartbeat. This is the human gate the spec requires.

- [ ] **Step 5: Let the remaining nine run unattended**

Nothing to run. Heartbeats pick up `todo` issues. Check daily with:
```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai issue list --company-id "$COMPANY_ID" --json | jq "group_by(.status) | map({status: .[0].status, n: length})"'
```

---

### Task 16: Isolation and export/import test

**Interfaces:**
- Produces: evidence for pass criterion 4. A second company `pilot-iso` is created, populated, exported, re-imported as a third, inspected, and archived.

- [ ] **Step 1: Create `pilot-iso` with one agent, one secret, one issue**

```bash
ssh paperclip 'source ~/.profile && ISO=$(paperclipai company create --payload-json "{\"name\":\"pilot-iso\"}" --json | jq -r .id) && echo "export ISO_ID=$ISO" >> ~/pilot.env && \
  echo "fake-isolation-secret-value" | { read -r V; export V; paperclipai secrets create --company-id "$ISO" --name iso-canary --value-env V >/dev/null; } && \
  paperclipai agent create --company-id "$ISO" --payload-json "{\"name\":\"iso-agent\",\"adapterType\":\"codex_local\",\"adapterConfig\":{\"cwd\":\"/tmp\"}}" >/dev/null && \
  paperclipai issue create --company-id "$ISO" --title "ISO CANARY ISSUE" --status todo >/dev/null && \
  echo created'
```
Expected: `created`.

- [ ] **Step 2: Prove `nodeai` cannot see it**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai issue list --company-id "$COMPANY_ID" --match "ISO CANARY" --json | jq length && paperclipai secrets list --company-id "$COMPANY_ID" | grep -c iso-canary || true'
```
Expected: `0` and `0`.

- [ ] **Step 3: Export**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai company export "$ISO_ID" --out ~/iso-export --include company,agents,projects,issues,skills && ls ~/iso-export && grep -r "fake-isolation-secret-value" ~/iso-export && echo "SECRET LEAKED" || echo "secret scrubbed"'
```
Expected: files listed, then `secret scrubbed`.

- [ ] **Step 4: Import as a new company**

```bash
ssh paperclip 'source ~/.profile && paperclipai company import ~/iso-export --target new --new-company-name "pilot-iso-copy" --json | jq -r .id' 
```
Expected: a new GUID. Then:
```bash
ssh paperclip 'source ~/.profile && COPY=$(paperclipai company list --json | jq -r ".[] | select(.name==\"pilot-iso-copy\") | .id") && paperclipai agent list --company-id "$COPY" --json | jq ".[].name" && paperclipai issue list --company-id "$COPY" --json | jq ".[].title" && paperclipai secrets list --company-id "$COPY"'
```
Expected: `"iso-agent"`, `"ISO CANARY ISSUE"`, and either no secrets or a declared-but-empty `iso-canary` needing a value. The value must not have travelled.

- [ ] **Step 5: Archive both throwaway companies**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && COPY=$(paperclipai company list --json | jq -r ".[] | select(.name==\"pilot-iso-copy\") | .id") && paperclipai company archive "$ISO_ID" && paperclipai company archive "$COPY" && rm -rf ~/iso-export && paperclipai company list'
```
Expected: only `Node AI` active.

---

### Task 17: Budget hard-stop test

**Interfaces:**
- Produces: evidence for pass criterion 3, observed rather than assumed.

- [ ] **Step 1: Give the reviewer work**

Create one reviewer ticket per open agent PR:
```bash
for N in $(gh pr list --repo Node-AI-Studio/FounderOS --head "agent/*" --json number --jq '.[].number'); do
  ssh paperclip "source ~/.profile && source ~/pilot.env && paperclipai issue create --company-id \"\$COMPANY_ID\" --title \"Review PR #$N\" --description \"Review https://github.com/Node-AI-Studio/FounderOS/pull/$N per your instructions.\" --status todo --priority medium --json | jq -r .id | xargs -I{} paperclipai issue update {} --payload-json \"{\\\"assigneeAgentId\\\":\\\"\$REVIEWER_ID\\\",\\\"projectId\\\":\\\"\$PROJECT_ID\\\"}\""
done
```

- [ ] **Step 2: Watch spend climb**

Daily:
```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai cost by-agent --company-id "$COMPANY_ID" --json | jq -c ".. | objects | select(.agentId? == \"$REVIEWER_ID\")" && paperclipai budget overview --company-id "$COMPANY_ID" --json | jq -c ".. | objects | select(.scopeId? == \"$REVIEWER_ID\")"'
```
Expected: a cost object for the reviewer whose cents field rises toward 500 day over day, and the reviewer's policy object. No incident object yet.

- [ ] **Step 3: If it has not hit 500 cents by day 10, force it**

Lower the cap to just under what has been spent so the stop fires deterministically:
```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && SPENT=$(paperclipai cost by-agent --company-id "$COMPANY_ID" --json | jq ".[] | select(.agentId==\"$REVIEWER_ID\") | .billedCents") && paperclipai budget agent:update "$REVIEWER_ID" --payload-json "{\"budgetMonthlyCents\":$((SPENT>1?SPENT-1:1))}"'
```
Record in the spec that the cap was lowered to force the test.

- [ ] **Step 4: Verify the stop**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai agent get "$REVIEWER_ID" --json | jq .status && paperclipai budget overview --company-id "$COMPANY_ID" --json | jq -c ".. | objects | select(.scopeId? == \"$REVIEWER_ID\")" && paperclipai issue list --company-id "$COMPANY_ID" --assignee-agent-id "$REVIEWER_ID" --status todo,in_progress --json | jq length'
```
Expected: agent status `paused`; among the reviewer's scope objects, one that is an incident (it will carry a status such as `open` and a resolution field, distinct from the policy object); and `0` queued or in-progress reviewer issues (they were cancelled or released). All three, or criterion 3 fails. Copy the incident's `id` for the next step.

- [ ] **Step 5: Resolve the incident and restore the cap**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && paperclipai budget agent:update "$REVIEWER_ID" --payload-json "{\"budgetMonthlyCents\":500}" && paperclipai agent resume "$REVIEWER_ID" && paperclipai agent get "$REVIEWER_ID" --json | jq .status'
```
Expected: `active`. If the agent stays `paused` because the incident must be resolved first, resolve it in the UI (Budgets → incident → "raise budget and resume", amount 500) and re-run the `agent get`.

---

### Task 18: Two-week closeout

**Files:**
- Modify: `docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md` (append a `## Verdict` section)

**Interfaces:**
- Produces: a written pass or fail against each of the four criteria, committed, and a decision on the box.

- [ ] **Step 1: Collect the numbers on day 14**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && echo "--- service starts in the log ---" && paperclipai service logs | grep -ci "listening\|started" && echo "--- done issues ---" && paperclipai issue list --company-id "$COMPANY_ID" --status done --json | jq length && echo "--- merged agent PRs ---"'
gh pr list --repo Node-AI-Studio/FounderOS --state merged --head "agent/*" --json number | jq length
```
Record the three numbers.

- [ ] **Step 2: Check the fail criteria**

```bash
ssh paperclip 'source ~/.profile && source ~/pilot.env && echo "--- recovery actions needed ---" && for I in $(paperclipai issue list --company-id "$COMPANY_ID" --json | jq -r ".[].id"); do paperclipai issue recovery-actions "$I" --json 2>/dev/null | jq -c "select(length>0)"; done; echo "--- blocked ---" && paperclipai issue list --company-id "$COMPANY_ID" --status blocked --json | jq ".[] | {identifier,title}"'
```
Any orphaned run that needed a human, or any double-claim you observed during the fortnight, is a fail.

- [ ] **Step 3: Write the verdict into the spec**

Append to the spec:
```markdown
## Verdict (YYYY-MM-DD)

| Criterion | Result | Evidence |
|---|---|---|
| 1. No manual restarts | pass / fail | journalctl count: N |
| 2. Ten issues done via merged PRs | pass / fail | done: N, merged agent PRs: N |
| 3. Reviewer cap fired, queue cancelled | pass / fail | incident id, cap lowered: yes/no |
| 4. Isolation and export/import | pass / fail | Task 16 outcomes |

Fail criteria observed: none / list.

Decision: proceed to sub-project 2 / keep Command Center runtime.
Box: kept as control plane / deleted on YYYY-MM-DD.
```

- [ ] **Step 4: Commit and push**

```bash
git add docs/superpowers/specs/2026-09-09-paperclip-pilot-design.md
git commit -m "docs(spec): pilot verdict"
git push
```

- [ ] **Step 5: Act on the decision**

Pass: leave the box running, revoke the 30-day GitHub token and issue a new one, and open sub-project 2 (gate the seeds, split the data layer).

Fail: `hcloud server delete paperclip-pilot && hcloud firewall delete paperclip-pilot`, revoke the GitHub token, revoke the OpenAI key, remove the Tailscale machine. Then the feature-only cleanup of Command Center.
