# @oreolion/ai-sync

Cross-platform AI agent synchronization CLI. Seamless handoff between Claude Code, Codex, Cursor, Aider, Cline, Windsurf, Copilot, OpenCode, and Continue.dev.

[![npm](https://img.shields.io/npm/v/@oreolion/ai-sync)](https://www.npmjs.com/package/@oreolion/ai-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Oreolion/ai-sync-plugin/blob/main/LICENSE)

## The Problem

Every AI coding tool keeps its own context. When you switch tools (rate limits, context exhaustion, wanting a different perspective), all context is lost. The new agent doesn't know what was built, what's next, or whether the build is clean.

## The Solution

A `.ai-sync/` directory at your project root with standardized state files that any AI agent can read and write.

## Quick Start

```bash
# Initialize in any project
npx @oreolion/ai-sync init

# Do some work with any AI tool, then capture state
npx @oreolion/ai-sync handoff

# Switch tools, then resume
npx @oreolion/ai-sync resume

# Check progress
npx @oreolion/ai-sync status
```

## Install Globally

```bash
npm install -g @oreolion/ai-sync
```

Then use `ai-sync` directly:

```bash
ai-sync init
ai-sync handoff
ai-sync status
ai-sync resume
```

## Commands

| Command | Description |
|---------|-------------|
| `ai-sync init` | Create `.ai-sync/` + adapter files for all supported tools |
| `ai-sync handoff` | Capture state before switching agents (conflict detection + auto-progress) |
| `ai-sync status` | Show current progress with completion bar |
| `ai-sync resume [tool]` | Generate a resume prompt for the target tool |
| `ai-sync diff` | Show changes since last handoff |
| `ai-sync adapter <tool>` | Generate adapter file for a specific tool |
| `ai-sync transfer` | Import session context via `continues` |
| `ai-sync hooks install\|remove` | Install/remove git hooks for auto-save |

## What Gets Created

```
.ai-sync/
├── HANDOFF.md      # Current state (YAML frontmatter + markdown)
├── PLAN.md         # Implementation plan
├── PROGRESS.md     # Task checklist with completion tracking
└── sessions/       # Timestamped session audit trail
```

Plus adapter files for each supported tool:

| Tool | Adapter File |
|------|-------------|
| Codex / OpenCode | `AGENTS.md` |
| Cursor | `.cursorrules` |
| Cline | `.clinerules` |
| Windsurf | `.windsurfrules` |
| Aider | `.aider.conf.yml` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Continue.dev | `.continuerules` |

## How Handoff Works

1. You work with any AI agent
2. Run `ai-sync handoff` -- saves what was done, what's next, build status
3. Switch to a different tool
4. The new tool reads `.ai-sync/HANDOFF.md` via its adapter file
5. Picks up exactly where the last agent stopped

## Also Available As

- **Claude Code Plugin** -- `claude plugin add Oreolion/ai-sync` (full integration with slash commands)
- **MCP Server** -- `@oreolion/ai-sync-mcp` (structured tools for MCP-native clients)
- **GitHub Action** -- Auto-updates `.ai-sync/` on PRs

## Links

- [GitHub](https://github.com/Oreolion/ai-sync-plugin)
- [Full Documentation](https://github.com/Oreolion/ai-sync-plugin#readme)
- [Protocol Specification](https://github.com/Oreolion/ai-sync-plugin/blob/main/skills/ai-sync-protocol/SKILL.md)

## License

MIT
