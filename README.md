# ai-sync — Cross-Platform AI Agent Synchronization

Seamless handoff between AI coding agents. When Claude Code hits a rate limit, switch to Codex, Cursor, Aider, or any other tool — and pick up exactly where you left off.

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
- `AGENTS.md` → Codex, generic agents
- `.cursorrules` → Cursor
- `.clinerules` → Cline
- `.windsurfrules` → Windsurf
- `CLAUDE.md` → Claude Code

## Installation

### As a Claude Code Plugin

```bash
/plugin install ai-sync@claude-code-marketplace
```

Or for development:
```bash
claude --plugin-dir /path/to/ai-sync-plugin
```

### Manual Setup (Any Tool)

Create `.ai-sync/` in your project and populate the files. See the [Protocol](../ai-sync/PROTOCOL.md) for format details.

## Commands

| Command | Description |
|---------|-------------|
| `/sync-init` | Bootstrap `.ai-sync/` in the current project |
| `/handoff` | Write handoff state before switching agents |
| `/sync-status` | Show current progress and next steps |

## How It Works

### Starting Work (Any Agent)
1. Agent reads `.ai-sync/HANDOFF.md` — knows what happened, what's next
2. Agent reads `.ai-sync/PROGRESS.md` — knows what's done
3. Agent follows `.ai-sync/PLAN.md` — no deviation

### Stopping Work (Any Agent)
1. Agent updates `HANDOFF.md` with completed work and specific next steps
2. Agent checks off tasks in `PROGRESS.md`
3. Agent logs session in `sessions/`

### Switching Tools
```
Claude Code → hits rate limit → /handoff → switch to Codex → reads HANDOFF.md → continues
```

## Plugin Structure

```
ai-sync/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── commands/
│   ├── sync-init.md          # /sync-init command
│   ├── handoff.md            # /handoff command
│   └── sync-status.md        # /sync-status command
├── skills/
│   └── ai-sync-protocol/
│       └── SKILL.md          # Protocol (auto-loaded)
├── hooks/
│   └── hooks.json            # Session start/stop hooks
└── README.md
```

## Supported Tools

| Tool | Adapter File | Status |
|------|-------------|--------|
| Claude Code | `CLAUDE.md` + plugin | Full (commands, hooks, skill) |
| OpenAI Codex CLI | `AGENTS.md` | Read/write `.ai-sync/` |
| Cursor | `.cursorrules` | Read/write `.ai-sync/` |
| Cline | `.clinerules` | Read/write `.ai-sync/` |
| Windsurf | `.windsurfrules` | Read/write `.ai-sync/` |
| Aider | `.aider.conf.yml` | Read/write `.ai-sync/` |
| OpenCode | `AGENTS.md` | Read/write `.ai-sync/` |
| Continue.dev | `AGENTS.md` | Read/write `.ai-sync/` |

## License

MIT
