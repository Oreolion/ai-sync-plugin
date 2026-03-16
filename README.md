# ai-sync

**Cross-platform AI agent synchronization — seamless handoff between Claude Code, Codex, Cursor, Aider, and more.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Plugin: Claude Code](https://img.shields.io/badge/Plugin-Claude%20Code-blueviolet)](https://claude.ai/code)

---

## The Problem

Every AI coding tool has its own context system (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.clinerules`). None of them share state. When you switch tools:

- All context is lost
- The new agent doesn't know what was done
- Plans drift, work gets repeated, patterns break

## The Solution

A **tool-agnostic state directory** (`.ai-sync/`) at your project root. Any AI agent reads from and writes to the same files using a standardized protocol.

```
.ai-sync/
├── HANDOFF.md      # Current state — THE KEY FILE
├── PLAN.md         # Implementation plan
├── PROGRESS.md     # Task completion tracking
└── sessions/       # Session audit trail
```

Plus **thin adapter files** that point each tool to `.ai-sync/`:

| Adapter File | Tools |
|---|---|
| `AGENTS.md` | Codex, OpenCode, Continue.dev |
| `.cursorrules` | Cursor |
| `.clinerules` | Cline |
| `.windsurfrules` | Windsurf |
| `.aider.conf.yml` | Aider |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.continuerules` | Continue.dev |
| `CLAUDE.md` | Claude Code |

## Installation

### As a Claude Code Plugin

```bash
claude plugin add Oreolion/ai-sync
```

### For Development

```bash
git clone https://github.com/Oreolion/ai-sync.git
cd ai-sync
claude --plugin-dir .
```

### Manual Setup (Any Tool)

Create `.ai-sync/` in your project and populate the files following the protocol defined in [`skills/ai-sync-protocol/SKILL.md`](skills/ai-sync-protocol/SKILL.md).

## Commands

| Command | Description |
|---------|-------------|
| `/sync-init` | Bootstrap `.ai-sync/` in the current project with adapters for all supported tools |
| `/handoff` | Capture state before switching agents (with conflict detection + auto-progress update) |
| `/sync-status` | Show current progress, next steps, and session history |
| `/sync-resume` | Resume from last handoff — load full context, detect conflicts, and continue |
| `/sync-diff` | Show all changes (commits, uncommitted, untracked) since the last handoff |
| `/sync-adapter <tool>` | Generate an adapter file for a specific AI tool |
| `/sync-transfer` | Import session context from another tool via `continues` |
| `/sync-hooks install\|remove` | Install/remove git hooks for auto-save on commit |

## How It Works

### Starting Work (Any Agent)

1. Agent reads `.ai-sync/HANDOFF.md` — knows what happened, what's next
2. Agent reads `.ai-sync/PROGRESS.md` — knows what's done
3. Agent follows `.ai-sync/PLAN.md` — no deviation

### During Work

- Agent checks off completed tasks in `PROGRESS.md`
- Agent documents blockers immediately in `HANDOFF.md`

### Stopping Work (Any Agent)

1. Conflict detection — checks if another agent modified `HANDOFF.md` since last read
2. Auto-update — cross-references changed files against plan tasks to auto-check `PROGRESS.md`
3. Agent writes `HANDOFF.md` with completed work, specific next steps, and build status
4. Agent logs session in `sessions/`

### Switching Tools

```
Claude Code → hits rate limit → /handoff → switch to Codex → reads HANDOFF.md → continues
```

## Key Features

- **Conflict detection** — Warns if `HANDOFF.md` was modified by another agent during your session
- **Auto-progress tracking** — Automatically checks off tasks when their deliverable files are modified
- **Build-state awareness** — Records whether the last agent left a clean build
- **Session audit trail** — Every agent session is logged with timestamps and key decisions
- **Zero dependencies** — Pure Markdown + YAML protocol, works with any tool

## Protocol

The full protocol specification is in [`skills/ai-sync-protocol/SKILL.md`](skills/ai-sync-protocol/SKILL.md). Key rules:

1. **Follow the plan** — No unplanned features or refactors
2. **Don't repeat work** — Check `PROGRESS.md` first
3. **Be specific in handoffs** — Actionable next steps, not vague summaries
4. **Run verification** — Build and typecheck before stopping
5. **Document decisions** — The next agent has zero context

## Plugin Structure

```
ai-sync-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   ├── sync-init.md             # /sync-init
│   ├── handoff.md               # /handoff
│   ├── sync-status.md           # /sync-status
│   ├── sync-resume.md           # /sync-resume
│   ├── sync-diff.md             # /sync-diff
│   ├── sync-adapter.md          # /sync-adapter
│   ├── sync-transfer.md         # /sync-transfer
│   └── sync-hooks.md            # /sync-hooks
├── skills/
│   └── ai-sync-protocol/
│       └── SKILL.md             # Protocol spec (auto-loaded)
├── hooks/
│   └── hooks.json               # Session start/stop hooks
├── tests/
│   └── validate-plugin.sh       # Plugin validation tests
├── .github/
│   └── ISSUE_TEMPLATE/          # Bug, feature, adapter request templates
├── CONTRIBUTING.md
├── ROADMAP.md
├── LICENSE
└── CLAUDE.md
```

## Supported Tools

| Tool | Adapter File | Integration Level |
|------|-------------|-------------------|
| Claude Code | Plugin + `CLAUDE.md` | Full (commands, hooks, skill, conflict detection) |
| OpenAI Codex CLI | `AGENTS.md` | Read/write `.ai-sync/` |
| Cursor | `.cursorrules` | Read/write `.ai-sync/` |
| Cline | `.clinerules` | Read/write `.ai-sync/` |
| Windsurf | `.windsurfrules` | Read/write `.ai-sync/` |
| Aider | `.aider.conf.yml` | Read/write `.ai-sync/` |
| OpenCode | `AGENTS.md` | Read/write `.ai-sync/` |
| Continue.dev | `.continuerules` | Read/write `.ai-sync/` |
| GitHub Copilot | `.github/copilot-instructions.md` | Read `.ai-sync/` |

## Packages

Beyond the Claude Code plugin, ai-sync ships as standalone tools:

| Package | Description | Install |
|---------|-------------|---------|
| `@oreolion/ai-sync` | CLI tool — works with any AI agent | `npx @oreolion/ai-sync init` |
| `@oreolion/ai-sync-mcp` | MCP server — structured tool access for MCP-native tools | See `packages/mcp-server/` |
| `ai-sync` (VS Code) | VS Code extension with sidebar status + one-click handoff | See `packages/vscode-extension/` |
| `ai-sync-action` | GitHub Action — auto-update `.ai-sync/` on PRs | See `packages/github-action/` |
| `@oreolion/ai-sync-remote` | Cloudflare Workers API for team handoff | See `packages/remote-sync/` |
| `@oreolion/ai-sync-dashboard` | Next.js dashboard for sync analytics | See `packages/dashboard/` |

## Testing

```bash
bash tests/validate-plugin.sh
```

Validates plugin structure, JSON files, command frontmatter, skill metadata, hooks, and cross-references.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, how to add adapters, and the PR process.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development plan including npm package, MCP server, VS Code extension, and team sync features.

## License

[MIT](LICENSE)
