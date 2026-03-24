# ai-sync Launch Post — March 16, 2026

Use the sections below for your launch across X/Twitter, LinkedIn, Reddit, Dev.to, and Product Hunt.

---

## X/Twitter — Main Thread

### Tweet 1 (Hook)

Ever hit a rate limit mid-session and watched your AI agent grind to a halt — delaying your entire workflow? Or switched to a different model only to lose all the context, plans, and progress you'd built up?

Introducing **ai-sync** — an open-source, cross-platform synchronization layer for AI coding agents.

Switch between Claude Code, Codex, Cursor, Windsurf, Cline, Copilot, Aider, OpenCode, and Continue — without losing a single line of context.

No more starting over. No more lost plans. No more repeated work.

🧵👇

---

### Tweet 2 (The Problem)

2/ The problem is real:

Every AI coding tool keeps its own context. When you hit a rate limit, run out of context, or just want a second opinion — you switch tools and everything is gone.

The new agent doesn't know:
→ What was built
→ What's left
→ What decisions were made
→ Whether the last build was clean

---

### Tweet 3 (The Solution)
3/

ai-sync fixes this with a `.ai-sync/` directory — a tool-agnostic state protocol:

```
.ai-sync/
├── HANDOFF.md    — current state (THE key file)
├── PLAN.md       — implementation plan
├── PROGRESS.md   — task checklist with completion %
└── sessions/     — audit trail of every agent session
```

Plain Markdown + YAML. Any agent can read/write it. Zero lock-in.

---

### Tweet 4 (Key Features)

What makes it different:

→ **Conflict detection** — warns if another agent modified state during your session
→ **Auto-progress tracking** — checks off tasks when their deliverable files change
→ **Build-state awareness** — records clean/broken build status
→ **Session audit trail** — every agent session is logged with timestamps
→ **9 tool adapters** — one `init` creates configs for every supported tool

---

### Tweet 5 (How It Works)

The flow is dead simple:

1. `ai-sync init` → bootstraps `.ai-sync/` + adapter files
2. Work with any AI agent → it reads HANDOFF.md to know where things stand
3. Hit a rate limit? → `ai-sync handoff` saves state
4. Switch to a different tool → `ai-sync resume` loads full context
5. Repeat across any combination of tools

Claude Code → Codex → Cursor → Aider → back to Claude. Seamless.

---

### Tweet 6 (What Ships Today)

What ships today:

**Claude Code Plugin** — 8 slash commands with conflict detection, auto-progress, session hooks
**CLI** — `npx @oreolion/ai-sync init` works with ANY tool, no plugin needed
**MCP Server** — 6 structured tools for MCP-native integrations
**VS Code Extension** — sidebar status panel + one-click handoff
**GitHub Action** — auto-updates `.ai-sync/` on every PR
**Team Sync API** — Cloudflare Workers backend for multi-developer handoff
**Dashboard** — Next.js analytics for sync activity across projects

---

### Tweet 7 (Supported Tools)

9 AI coding tools supported at launch:

| Tool | Integration |
|------|-------------|
| @AnthropicAI Claude Code | Full plugin (commands, hooks, skill) |
| @OpenAI Codex CLI | AGENTS.md adapter |
| @cursor_ai | .cursorrules adapter |
| @cline Cline | .clinerules adapter |
| @windsurf_ai Windsurf | .windsurfrules adapter |
| @paulgauthier Aider | .aider.conf.yml adapter |
| @GitHubCopilot | copilot-instructions.md adapter |
| @continuedev Continue | .continuerules adapter |
| OpenCode | AGENTS.md adapter |

One init. All tools. Instant sync.

---

### Tweet 8 (Technical Details)

Under the hood:

→ HANDOFF.md uses YAML frontmatter (agent name, timestamp, status, phase, task, stop reason) + Markdown sections
→ PROGRESS.md is a standard checklist — any agent can parse `- [x]` and `- [ ]`
→ Conflict detection via git hash comparison
→ Auto-progress cross-references `git diff --name-only` against plan tasks
→ Git hooks auto-update state on every commit
→ MCP server uses `@modelcontextprotocol/sdk` with Zod-validated tools

---

### Tweet 9 (Who This Is For)

Who needs this:

→ Developers who use multiple AI tools daily
→ Teams where different members prefer different agents
→ Anyone who hits rate limits and loses context switching tools
→ Open source maintainers who want contributors using any AI tool to stay in sync
→ Enterprises standardizing on AI-assisted development across teams

---

### Tweet 10 (Call to Action)

Get started in 30 seconds:

```bash
# Any project, any tool
npx @oreolion/ai-sync init

# As a Claude Code plugin
claude plugin add Oreolion/ai-sync
```

GitHub: github.com/Oreolion/ai-sync
npm: npmjs.com/package/@oreolion/ai-sync

Star it. Try it. Break it. PRs welcome.

MIT licensed. Free forever.

cc @AnthropicAI @OpenAI @cursor_ai @windsurf_ai @cline @GitHubCopilot @continuedev @paulgauthier @vercel

---

## LinkedIn Post

### Title: Introducing ai-sync — Cross-Platform AI Agent Synchronization

Every AI coding tool has its own context system. Claude Code uses CLAUDE.md. Codex uses AGENTS.md. Cursor uses .cursorrules. Cline uses .clinerules. None of them share state.

When you switch between tools — whether because of rate limits, context window exhaustion, or simply wanting a different AI perspective — all context is lost. The new agent doesn't know what was built, what decisions were made, or what comes next.

Today, I'm open-sourcing **ai-sync**: a unified synchronization protocol that lets any AI coding agent hand off work to any other agent, seamlessly.

**How it works:**

A `.ai-sync/` directory at your project root contains four files — HANDOFF.md (current state), PLAN.md (implementation plan), PROGRESS.md (task completion tracking), and a sessions/ directory (audit trail). Any AI agent reads and writes to these same files using a standardized protocol.

Thin adapter files point each tool to `.ai-sync/`:
- Claude Code → CLAUDE.md
- Codex/OpenCode → AGENTS.md
- Cursor → .cursorrules
- Cline → .clinerules
- Windsurf → .windsurfrules
- Aider → .aider.conf.yml
- GitHub Copilot → .github/copilot-instructions.md
- Continue.dev → .continuerules

**What ships today:**

1. **Claude Code Plugin** — 8 slash commands with conflict detection, auto-progress tracking, and session hooks
2. **Standalone CLI** — `npx @oreolion/ai-sync init` works with any tool
3. **MCP Server** — Structured tool access for MCP-native integrations
4. **VS Code Extension** — Sidebar panel with real-time sync status
5. **GitHub Action** — Auto-updates sync state on every PR
6. **Team Sync API** — Cloudflare Workers backend for multi-developer handoff
7. **Analytics Dashboard** — Next.js dashboard for sync activity visualization

**Key differentiators:**

- Plan-aware: Tracks what needs to happen, not what was said
- Progress-tracking: Checklist-based completion, not session replay
- Build-state-aware: Records whether the last agent left a clean build
- File-change audit: Logs which files were modified, created, or deleted
- Tool-agnostic: Plain Markdown files — any agent can read/write them

**The numbers:**

- 9 AI coding tools supported
- 8 Claude Code commands
- 6 MCP tools
- 9 CLI commands
- 71 validation tests passing
- 107 files across 8 packages

This is MIT licensed and free forever. We believe the future of AI-assisted development is multi-agent, and the handoff layer should be open infrastructure, not a proprietary moat.

**Get started:**
```
npx @oreolion/ai-sync init
```

GitHub: github.com/Oreolion/ai-sync

I'd love feedback from anyone working across multiple AI coding tools. What's your biggest pain point when switching agents?

#OpenSource #AITools #DeveloperTools #AICoding #ClaudeCode #Cursor #Codex #Copilot #DevTools #MultiAgent #AIAgents #DeveloperProductivity

---

## Reddit Posts

### r/programming

**Flair:** Show & Tell (or whichever technical flair is available)

**Title:** Designing a file-based state protocol for cross-agent handoff between AI coding tools

Every AI coding tool invented its own context format: Claude Code reads `CLAUDE.md`, Codex reads `AGENTS.md`, Cursor reads `.cursorrules`, Cline reads `.clinerules`. These files are structurally different, serve similar purposes, and share nothing. When you switch tools mid-project, the new agent starts blind.

I wanted to solve this at the protocol level rather than building yet another tool-specific wrapper. Here's the technical breakdown of the design decisions behind ai-sync.

**The core problem: state representation**

What does an AI coding agent actually need to know when it picks up where another agent left off? After analyzing what makes handoffs fail, it comes down to five things: (1) what was completed, (2) what's in progress, (3) what's next, (4) which files were touched, and (5) whether the build is clean. Session transcripts and conversation history are noise — agents need structured state, not chat logs.

This led to the HANDOFF.md format: YAML frontmatter for machine-parseable fields (`last_agent`, `timestamp`, `status`, `current_phase`, `current_task`, `stop_reason`) followed by Markdown sections for the narrative parts (completed work, next steps, blockers, build status). YAML frontmatter is already a convention in static site generators and documentation tools, so every LLM has seen it millions of times in training data. That matters — the format needs to be something agents naturally produce well, not something you have to fight the model to output correctly.

**Why a directory protocol instead of a single file**

The initial design was a single `HANDOFF.md` with everything in it. This broke down quickly for two reasons:

1. **Separation of concerns.** The implementation plan rarely changes between handoffs, but the handoff state changes every time. Coupling them means agents rewrite the plan on every handoff, introducing drift. Splitting into `PLAN.md` (stable), `PROGRESS.md` (append-only checklist), and `HANDOFF.md` (volatile state) keeps each file's edit pattern clean.

2. **Conflict detection.** With a single file, you can't tell if another agent modified the plan vs. modified the handoff state. With separate files, you can diff just `HANDOFF.md` to detect concurrent modifications — comparing the git hash of the file at resume time vs. the hash recorded at the last read.

**The adapter pattern**

The trickiest design question: how do you make 9 tools with 9 different config formats all read from the same source of truth?

The answer is thin adapter files — 5-10 line pointer files in each tool's native format that say "go read `.ai-sync/`." For example, `.cursorrules` for Cursor contains instructions to read `.ai-sync/HANDOFF.md` on start and write to it on stop. `AGENTS.md` does the same for Codex and OpenCode. The adapter content is defined once in a template registry, and the CLI generates the right file for each tool.

This is explicitly *not* a format converter (tool A's format → tool B's format). That approach creates an N×N matrix of conversions. Instead, all tools converge on one canonical format and the adapters are just routing.

**Auto-progress tracking via git diff**

One feature that turned out to be more interesting than expected: when an agent runs `/handoff`, the system runs `git diff --name-only` against the last handoff timestamp, then cross-references the changed files against task descriptions in `PROGRESS.md`. If a task says "Create `src/auth.ts`" and `src/auth.ts` was modified, the task gets auto-checked. This catches about 70% of completions without the agent having to explicitly update the checklist — which they often forget to do.

**Conflict detection without a server**

Multi-agent conflict detection typically requires a central coordinator. We get it for free from git. On `/sync-resume`, the system records the git hash of `HANDOFF.md`. On `/handoff`, it compares the current hash against the recorded one. If they differ, another agent (or human) modified the file during the session, and the user gets a warning before overwriting. No server, no locks, no database — just git content hashes.

**MCP server: structured tool access**

For tools that support the Model Context Protocol (Cursor, Continue.dev, Claude Desktop), a file-based adapter is limiting. The MCP server exposes the same protocol as six Zod-validated tools (`sync_getHandoff`, `sync_getProgress`, `sync_getPlan`, `sync_updateProgress`, `sync_createHandoff`, `sync_getSessionHistory`) over stdio transport. The agent gets structured JSON back instead of parsing Markdown, which is more reliable for programmatic decisions like "what percentage of tasks are complete?"

**What I'd do differently**

The biggest limitation is that adapters are essentially prompt instructions — they tell the agent what to do, but there's no enforcement. A poorly-instructed agent can ignore `.ai-sync/` entirely. The MCP server partially solves this by giving tools structured access, but for file-based adapters, you're trusting the agent to follow instructions. In practice, modern LLMs follow these instructions reliably about 95% of the time, but it's not 100%.

The protocol is also inherently single-writer — there's no merge strategy if two agents modify `PROGRESS.md` concurrently. The conflict detection catches this and warns, but doesn't resolve. For team scenarios, the remote sync backend (Cloudflare Workers + D1) adds proper sequencing, but the local protocol remains optimistic.

GitHub: github.com/Oreolion/ai-sync

Would be interested to hear how others have approached the multi-agent state coordination problem, especially if you've tried different serialization formats or coordination strategies.

---

### r/ClaudeAI

**Title:** Built a Claude Code plugin for seamless handoff between AI coding agents (ai-sync)

If you use Claude Code alongside other tools (Codex, Cursor, Aider), you've probably lost context when switching. I built ai-sync to fix this.

**What it does:**
- `/sync-init` bootstraps a `.ai-sync/` directory with handoff state files
- `/handoff` captures your current state with conflict detection + auto-progress
- `/sync-resume` loads full context when resuming from another agent
- `/sync-diff` shows what changed since last handoff
- `/sync-transfer` imports session context from other tools
- Plus adapter files for 9 tools

**Features:**
- Conflict detection (warns if another agent modified state)
- Auto-progress tracking (cross-references git changes against plan tasks)
- Session audit trail
- Git hooks for auto-save on commit

Install: `claude plugin add Oreolion/ai-sync`

Or without Claude Code: `npx @oreolion/ai-sync init`

GitHub: github.com/Oreolion/ai-sync

Happy to answer questions about the protocol design or take feature requests.

---

### r/cursor

**Title:** Open-source tool to sync context between Cursor and other AI coding agents

Built ai-sync — an open protocol so Cursor, Claude Code, Codex, Cline, Windsurf, Aider, Copilot, and Continue.dev can share state.

When you run `ai-sync init`, it creates a `.ai-sync/` directory with HANDOFF.md (current state), PROGRESS.md (tasks), and PLAN.md. It also generates a `.cursorrules` adapter that tells Cursor to read/write these files.

So when you switch from Claude Code to Cursor (or vice versa), the new tool knows exactly what was done, what's next, and whether the build is clean.

GitHub: github.com/Oreolion/ai-sync
Install: `npx @oreolion/ai-sync init`

---

## Dev.to Article

### Title: I Open-Sourced a Sync Layer for AI Coding Agents — Here's Why

### Tags: opensource, ai, devtools, productivity

Every AI coding tool keeps its own context: Claude Code has `CLAUDE.md`, Codex has `AGENTS.md`, Cursor has `.cursorrules`, Cline has `.clinerules`. When you switch tools — because of rate limits, context exhaustion, or wanting a different AI's perspective — all context is lost.

I built **ai-sync** to fix this.

#### The Protocol

A `.ai-sync/` directory at your project root with four files:

```
.ai-sync/
├── HANDOFF.md    — YAML frontmatter + markdown sections (THE key file)
├── PLAN.md       — implementation plan
├── PROGRESS.md   — checklist with completion tracking
└── sessions/     — timestamped session logs
```

Plus thin adapter files that point each tool to `.ai-sync/`:

| Tool | Adapter |
|------|---------|
| Claude Code | Plugin + CLAUDE.md |
| Codex | AGENTS.md |
| Cursor | .cursorrules |
| Cline | .clinerules |
| Windsurf | .windsurfrules |
| Aider | .aider.conf.yml |
| GitHub Copilot | .github/copilot-instructions.md |
| Continue.dev | .continuerules |
| OpenCode | AGENTS.md |

#### What Ships

1. **Claude Code Plugin** — 8 commands with conflict detection, auto-progress, hooks
2. **CLI** — `npx @oreolion/ai-sync init` (works with any tool)
3. **MCP Server** — 6 Zod-validated tools via Model Context Protocol
4. **VS Code Extension** — sidebar status + one-click handoff
5. **GitHub Action** — auto-sync on PRs
6. **Team Sync API** — Cloudflare Workers + D1 for multi-developer handoff
7. **Dashboard** — Next.js analytics for sync activity

#### The Workflow

```
You're coding with Claude Code
  → hit rate limit
  → /handoff (saves state with conflict detection + auto-progress)
  → switch to Cursor
  → Cursor reads .cursorrules → reads .ai-sync/HANDOFF.md
  → picks up exactly where Claude left off
  → finish work
  → ai-sync handoff (saves state again)
  → tomorrow, resume with Codex
  → Codex reads AGENTS.md → reads .ai-sync/HANDOFF.md
  → continues seamlessly
```

#### Key Design Decisions

**Why Markdown?** Every AI agent can read Markdown. No special parser needed. No binary format. Git-friendly diffs.

**Why YAML frontmatter?** Structured metadata (agent name, timestamp, status, stop reason) that's easy to parse but still human-readable.

**Why a checklist for progress?** `- [x]` and `- [ ]` are universal. Any agent can parse them. Any human can read them. GitHub renders them as checkboxes.

**Why adapters instead of a single config?** Each tool has its own convention. Cursor reads `.cursorrules`, not `CLAUDE.md`. The adapters are thin pointers — 5-10 lines telling the tool "go read `.ai-sync/`."

#### Get Started

```bash
npx @oreolion/ai-sync init
```

Or as a Claude Code plugin:
```bash
claude plugin add Oreolion/ai-sync
```

**GitHub:** github.com/Oreolion/ai-sync
**npm:** npmjs.com/package/@oreolion/ai-sync
**License:** MIT

I'd love feedback, feature requests, and new adapter contributions. The protocol is designed to be extended — adding support for a new tool is usually a single adapter file.

---

## Product Hunt — Tagline & Description

**Tagline:** Cross-platform sync for AI coding agents — never lose context switching tools

**Description:**

ai-sync is the synchronization layer for AI coding agents. Switch between Claude Code, Codex, Cursor, Windsurf, Cline, Copilot, Aider, and more — without losing context.

A `.ai-sync/` directory at your project root stores handoff state, implementation plans, and task progress. Thin adapter files point each tool to this shared state. When you switch tools, the new agent knows exactly what was done, what's next, and whether the build is clean.

Ships as a Claude Code plugin (8 commands), standalone CLI, MCP server, VS Code extension, GitHub Action, team sync API, and analytics dashboard.

**Makers:** @oreolion
**Pricing:** Free / Open Source (MIT)
**Platforms:** CLI, VS Code, Claude Code, Any Terminal

---

## Tags for All Platforms

**Companies/Products to tag on X:**
- @AnthropicAI (Anthropic — makers of Claude)
- @claudeai (Claude)
- @OpenAI (OpenAI — makers of Codex)
- @OpenAIDevs (OpenAI developer relations)
- @cursor_ai (Cursor)
- @windsurf_ai (Windsurf)
- @cline (Cline)
- @GitHubCopilot (GitHub Copilot)
- @github (GitHub)
- @continuedev (Continue.dev)
- @paulgauthier (Aider creator)
- @vercel (Vercel — Next.js, skill marketplace)
- @SkillKitDev (SkillKit — if applicable)
- @modelcontextprotocol (MCP — if official account exists)
- @code (VS Code)

**Hashtags:**
#OpenSource #AIAgents #DeveloperTools #AICoding #ClaudeCode #CursorAI #Codex #MultiAgent #DevTools #AISync #HandoffProtocol #CodingAgents

---

## X/Twitter — Single Post (Plain Text, No Markdown)

Ever hit a rate limit mid-session and watched your AI agent grind to a halt? Or switched to a different model only to lose all the context, plans, and progress you'd built up?

You're not alone. This happens to millions of developers every day — and until now, nobody built the infrastructure to fix it.

I built ai-sync — an open-source sync layer that lets AI coding agents hand off work to each other seamlessly.

Switch between Claude Code, Codex, Cursor, Windsurf, Cline, Copilot, Aider, OpenCode, and Continue without losing a single line of context.

Here's the dirty secret of AI-assisted coding in 2026: every tool invented its own context format. Claude Code reads CLAUDE.md. Codex reads AGENTS.md. Cursor reads .cursorrules. Cline reads .clinerules. Nine tools, nine formats, zero interoperability. When you switch, the new agent starts completely blind — doesn't know what was built, what's left, what decisions were made, or whether the build even compiles.

ai-sync fixes this at the protocol level.

How it works:

A .ai-sync/ directory in your project with four files:
- HANDOFF.md — current state with YAML frontmatter (agent, timestamp, status, phase, task, stop reason)
- PLAN.md — the implementation plan (stable, rarely changes)
- PROGRESS.md — task checklist any agent can parse
- sessions/ — audit trail of every agent session

Then thin adapter files (5-10 lines each) point each tool to .ai-sync/ in its native format. One canonical state, nine tools reading it.

The workflow:
1. ai-sync init — bootstraps everything + generates all adapter files
2. Work with any agent — it reads HANDOFF.md to know the full picture
3. Hit a rate limit or want to switch? — ai-sync handoff saves everything
4. Open a different tool — ai-sync resume loads full context
5. The new agent continues exactly where the last one stopped

Claude Code to Cursor to Codex to Aider and back. No re-explaining. No lost progress. No repeated work.

What makes this different from session exporters and context dumpers:

- It's plan-aware — tracks what needs to happen, not what was said
- Conflict detection — warns if another agent modified state while you were working (using git hash comparison, no server needed)
- Auto-progress tracking — cross-references git diff against your task list and auto-checks completed items
- Build-state awareness — records whether the last agent left a clean or broken build
- File-change audit — logs exactly which files were modified, created, or deleted

What ships today (7 packages):

1. Claude Code Plugin — 8 slash commands (/sync-init, /handoff, /sync-resume, /sync-diff, /sync-status, /sync-adapter, /sync-transfer, /sync-hooks) with conflict detection, auto-progress, and session hooks
2. Standalone CLI — npx @oreolion/ai-sync init (works with ANY tool, no plugin needed)
3. MCP Server — 6 Zod-validated tools for Model Context Protocol integrations
4. VS Code Extension — sidebar panel with real-time sync status and one-click handoff
5. GitHub Action — auto-updates .ai-sync/ on every PR with progress comments
6. Team Sync API — Cloudflare Workers + D1 backend for multi-developer handoff
7. Analytics Dashboard — Next.js app showing sync activity, timelines, and completion rates

9 tools supported at launch:
Claude Code, Codex CLI, Cursor, Cline, Windsurf, Aider, GitHub Copilot, Continue.dev, OpenCode

The entire protocol is plain Markdown + YAML. No proprietary format. No vendor lock-in. Any agent that can read text can participate. And because YAML frontmatter is all over the internet's training data, LLMs produce it reliably without special prompting.

I built this because I was personally spending 10-15 minutes re-explaining context every time I switched tools. Multiply that across a team of developers switching multiple times a day, and you're looking at hours of wasted productivity per week — on a problem that shouldn't exist.

The future of AI-assisted development is multi-agent. The handoff layer should be open infrastructure, not a proprietary feature.

Get started in 30 seconds:
npx @oreolion/ai-sync init

Or as a Claude Code plugin:
claude plugin add Oreolion/ai-sync

GitHub: github.com/Oreolion/ai-sync
npm: npmjs.com/package/@oreolion/ai-sync

MIT licensed. Free forever. PRs welcome.

If you've ever lost context switching between AI tools, give it a try and let me know what breaks. The protocol is designed to be extended — adding support for a new tool is usually a single adapter file.

cc @AnthropicAI @OpenAI @cursor_ai @windsurf_ai @cline @GitHubCopilot @continuedev @paulgauthier @vercel

---

## WhatsApp Broadcast (Plain Text)

Ever hit a rate limit mid-session and watched your AI agent grind to a halt — delaying your entire workflow? Or switched to a different model only to lose all the context, plans, and progress you'd built up?

I built ai-sync to fix this.

ai-sync is an open-source synchronization layer for AI coding agents. It lets you switch between Claude Code, Codex, Cursor, Windsurf, Cline, Copilot, Aider, OpenCode, and Continue — without losing a single line of context.

THE PROBLEM

Every AI coding tool keeps its own context. Claude Code reads CLAUDE.md, Codex reads AGENTS.md, Cursor reads .cursorrules — and none of them share state. When you switch tools, the new agent doesn't know what was built, what's left, what decisions were made, or whether the last build was clean.

HOW IT WORKS

ai-sync creates a .ai-sync/ directory in your project with four files:

  HANDOFF.md — current state (the key file)
  PLAN.md — implementation plan
  PROGRESS.md — task checklist with completion tracking
  sessions/ — audit trail of every agent session

Plain Markdown and YAML. Any agent can read and write it. Zero lock-in.

Then thin adapter files point each tool to .ai-sync/ — so Cursor reads .cursorrules, Codex reads AGENTS.md, and they all converge on the same shared state.

The flow is simple:

1. Run ai-sync init to bootstrap .ai-sync/ and adapter files
2. Work with any AI agent — it reads HANDOFF.md to know where things stand
3. Hit a rate limit? Run ai-sync handoff to save state
4. Switch to a different tool — run ai-sync resume to load full context
5. Repeat across any combination of tools

Claude Code to Codex to Cursor to Aider to Opencode and back to Claude. Seamless.

KEY FEATURES

- Conflict detection — warns if another agent modified state during your session
- Auto-progress tracking — checks off tasks when their deliverable files change
- Build-state awareness — records whether the build is clean or broken
- Session audit trail — every agent session is logged with timestamps
- 9 tool adapters — one init creates configs for every supported tool

WHAT SHIPS TODAY

- Claude Code Plugin — 8 slash commands with conflict detection, auto-progress, and session hooks
- CLI — npx @oreolion/ai-sync init works with any tool, no plugin needed
- MCP Server — 6 structured tools for MCP-native integrations
- VS Code Extension — sidebar status panel and one-click handoff
- GitHub Action — auto-updates .ai-sync/ on every PR
- Team Sync API — Cloudflare Workers backend for multi-developer handoff
- Dashboard — Next.js analytics for sync activity across projects

9 TOOLS SUPPORTED AT LAUNCH

- Claude Code (Anthropic) — full plugin with commands, hooks, and skill
- Codex CLI (OpenAI) — AGENTS.md adapter
- Cursor — .cursorrules adapter
- Cline — .clinerules adapter
- Windsurf — .windsurfrules adapter
- Aider — .aider.conf.yml adapter
- GitHub Copilot — copilot-instructions.md adapter
- Continue.dev — .continuerules adapter
- OpenCode — AGENTS.md adapter

GET STARTED

Any project, any tool:
npx @oreolion/ai-sync init

As a Claude Code plugin:
claude plugin add Oreolion/ai-sync

GitHub: github.com/Oreolion/ai-sync
npm: npmjs.com/package/@oreolion/ai-sync

MIT licensed. Free forever. PRs welcome.

If you use multiple AI coding tools and have ever lost context switching between them, give it a try. Would love your feedback.

---

## X/Twitter — Update Post: v1.1 "Install It Everywhere" (March 24, 2026)

### Thread Version

#### Tweet 1 (Hook)

ai-sync just got a major clarity upgrade.

The #1 question since launch: "I ran npm install but nothing shows up in Claude Code — what gives?"

We completely rewrote the docs and onboarding. Here's the thing nobody told you about using multiple AI agents together:

There are TWO ways to use ai-sync. You probably need both.

#### Tweet 2 (The Two Paths)

2/ ai-sync ships as two separate things that work together:

CLI (terminal):
npm install -g @oreolion/ai-sync
ai-sync init
ai-sync handoff

Claude Code Plugin (slash commands):
claude plugin add Oreolion/ai-sync
/sync-init
/handoff
/sync-resume

The npm package gives you a terminal command. The plugin gives you slash commands inside Claude Code. They're separate installs.

#### Tweet 3 (Why Both)

3/ Why install both?

Use the CLI when working with Cursor, Codex, Aider, Cline, Windsurf — any tool. It runs from any terminal.

Use the plugin when working inside Claude Code. You get:
- /slash commands
- Auto-context loading on session start
- Save reminders when you stop
- Conflict detection built in

One for the terminal. One for Claude Code. Both write to the same .ai-sync/ directory.

#### Tweet 4 (The Workflow)

4/ Here's the actual workflow people are using:

Claude Code hits rate limit
/handoff (saves state)
Open Cursor
Cursor reads .cursorrules -> reads .ai-sync/HANDOFF.md
Cursor knows everything: what was done, what's next, build status
Work in Cursor
ai-sync handoff (from terminal)
Back to Claude Code
/sync-resume (loads full context)

No re-explaining. No lost progress. Zero friction.

#### Tweet 5 (What Changed)

5/ What's new in this update:

- README completely rewritten for clarity
- Clear "Quick Start (2 minutes)" section with 3 options
- Side-by-side CLI vs Plugin comparison table
- Real workflow examples with actual terminal commands
- npm README updated so the npm page finally makes sense
- Direct answer to "why doesn't npm install show up in Claude Code"

If you bounced off the docs before, try again. They're actually readable now.

#### Tweet 6 (CTA)

6/ Get started:

Terminal (any AI tool):
npm install -g @oreolion/ai-sync
cd your-project
ai-sync init

Claude Code (slash commands):
claude plugin add Oreolion/ai-sync

Best experience — install both:
npm install -g @oreolion/ai-sync
claude plugin add Oreolion/ai-sync

GitHub: github.com/Oreolion/ai-sync
npm: npmjs.com/package/@oreolion/ai-sync

MIT licensed. Free forever.

cc @AnthropicAI @cursor_ai @OpenAI @windsurf_ai @GitHubCopilot

---

### Single Post Version (Plain Text)

ai-sync just got a major docs rewrite.

The #1 question since launch: "I ran npm install -g @oreolion/ai-sync but I don't see any commands in Claude Code."

Here's the answer: ai-sync ships as two things that work together.

1. CLI (for any AI tool, runs in your terminal):
   npm install -g @oreolion/ai-sync
   ai-sync init / ai-sync handoff / ai-sync status

2. Claude Code Plugin (adds /slash commands inside Claude Code):
   claude plugin add Oreolion/ai-sync
   /sync-init / /handoff / /sync-resume

The npm package puts "ai-sync" in your PATH. Claude Code doesn't scan your global npm packages for plugins — that's a separate system.

Install both for the full experience.

The workflow:

Working in Claude Code -> /handoff -> switch to Cursor -> Cursor reads .ai-sync/HANDOFF.md automatically -> work in Cursor -> ai-sync handoff (terminal) -> back to Claude Code -> /sync-resume -> picks up exactly where Cursor left off.

What else changed:
- README rewritten from scratch with clear Quick Start guide
- Side-by-side comparison: CLI vs Plugin (what each does, when to use which)
- Real workflow examples with actual terminal sessions
- npm package README now explains everything on the npm page itself
- 9 AI tools supported: Claude Code, Cursor, Codex, Cline, Windsurf, Aider, Copilot, Continue.dev, OpenCode

If you tried ai-sync before and got confused by the setup — the docs are actually clear now. Give it another look.

npm install -g @oreolion/ai-sync
claude plugin add Oreolion/ai-sync

GitHub: github.com/Oreolion/ai-sync

MIT licensed. Free forever.

cc @AnthropicAI @cursor_ai @OpenAI @windsurf_ai @GitHubCopilot @continuedev @paulgauthier
