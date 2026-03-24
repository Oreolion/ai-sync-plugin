# @oreolion/ai-sync

**Stop losing context when you switch AI coding tools.**

[![npm](https://img.shields.io/npm/v/@oreolion/ai-sync)](https://www.npmjs.com/package/@oreolion/ai-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Oreolion/ai-sync-plugin/blob/main/LICENSE)

A CLI that creates a shared `.ai-sync/` directory in your project so any AI agent (Claude Code, Cursor, Codex, Aider, Cline, Windsurf, Copilot) can hand off work seamlessly. One agent saves state, the next picks up exactly where it left off.

---

## Install

```bash
npm install -g @oreolion/ai-sync
```

Or use without installing:

```bash
npx @oreolion/ai-sync init
```

## Quick Start

```bash
# 1. Go to your project
cd your-project

# 2. Initialize — creates .ai-sync/ and adapter files for all AI tools
ai-sync init

# 3. Work with any AI tool (Claude Code, Cursor, Codex, etc.)

# 4. Save state before switching tools
ai-sync handoff

# 5. Open the project in a different AI tool — it picks up automatically

# 6. Check progress anytime
ai-sync status
```

## What Happens When You Run `ai-sync init`

Creates these files in your project:

```
your-project/
├── .ai-sync/
│   ├── HANDOFF.md      # Current state: what was done, what's next, blockers
│   ├── PLAN.md         # Implementation plan
│   ├── PROGRESS.md     # Task checklist: [x] done, [ ] pending
│   └── sessions/       # One log per agent session
├── AGENTS.md           # Adapter for Codex, OpenCode
├── .cursorrules        # Adapter for Cursor
├── .clinerules         # Adapter for Cline
├── .windsurfrules      # Adapter for Windsurf
├── .aider.conf.yml     # Adapter for Aider
├── .continuerules      # Adapter for Continue.dev
└── .github/
    └── copilot-instructions.md  # Adapter for GitHub Copilot
```

Each **adapter file** is a thin pointer that tells its AI tool: "Read `.ai-sync/HANDOFF.md` before starting." That's how every tool picks up context automatically.

## Commands

| Command | Description |
|---------|-------------|
| `ai-sync init` | Create `.ai-sync/` + adapter files for all supported tools |
| `ai-sync handoff` | Save state before switching agents (conflict detection + auto-progress) |
| `ai-sync status` | Show progress with completion bar |
| `ai-sync resume [tool]` | Generate a resume prompt for the target tool |
| `ai-sync diff` | Show changes since last handoff |
| `ai-sync adapter <tool>` | Generate adapter file for a specific tool |
| `ai-sync transfer` | Import session context via `continues` |
| `ai-sync hooks install` | Install git hooks for auto-save on commit |
| `ai-sync hooks remove` | Remove git hooks |

## Example: Claude Code hits rate limit, switch to Cursor

```bash
# In Claude Code — save state
ai-sync handoff

# Open same project in Cursor
# Cursor reads .cursorrules → reads .ai-sync/HANDOFF.md → knows everything
# Work in Cursor...

# Save state from Cursor
ai-sync handoff

# Back to Claude Code — it picks up where Cursor left off
```

## Using with Claude Code

This CLI works **alongside** the Claude Code plugin. For the best experience with Claude Code, also install the plugin:

```bash
claude plugin add Oreolion/ai-sync
```

This gives you `/slash commands` inside Claude Code (`/handoff`, `/sync-resume`, `/sync-status`, etc.) plus automatic context loading on session start and save reminders on stop.

**Note**: `npm install -g @oreolion/ai-sync` installs the terminal CLI. It does NOT add commands to Claude Code. The npm package and the Claude Code plugin are separate — install both for the full experience.

## Links

- [GitHub](https://github.com/Oreolion/ai-sync-plugin) — full docs, protocol spec, plugin source
- [Protocol Specification](https://github.com/Oreolion/ai-sync-plugin/blob/main/skills/ai-sync-protocol/SKILL.md)

## License

MIT
