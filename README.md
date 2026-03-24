# ai-sync

**Stop losing context when you switch AI coding tools.**

[![npm](https://img.shields.io/npm/v/@oreolion/ai-sync)](https://www.npmjs.com/package/@oreolion/ai-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Plugin: Claude Code](https://img.shields.io/badge/Plugin-Claude%20Code-blueviolet)](https://claude.ai/code)

Every AI coding tool (Claude Code, Cursor, Codex, Aider, Cline, Windsurf, Copilot) keeps its own context. When you switch — because of rate limits, context exhaustion, or wanting a different model — all context is lost. The new agent doesn't know what was built, what's next, or whether the build is clean.

**ai-sync** fixes this. It creates a shared `.ai-sync/` directory in your project that any AI agent can read and write. One agent saves state, the next picks up exactly where it left off.

---

## Quick Start (2 minutes)

### Option A: CLI (works with any AI tool)

```bash
# Install globally
npm install -g @oreolion/ai-sync

# Go to your project
cd your-project

# Initialize — creates .ai-sync/ and adapter files for all tools
ai-sync init

# ... do work with any AI tool ...

# Save state before switching
ai-sync handoff

# Switch to a different tool — it reads .ai-sync/ automatically

# Check status anytime
ai-sync status
```

### Option B: Claude Code Plugin (adds /slash commands)

```bash
# Install the plugin
claude plugin add Oreolion/ai-sync

# Now inside Claude Code, you get slash commands:
# /sync-init    — bootstrap .ai-sync/
# /handoff      — save state before switching
# /sync-resume  — load context and continue
# /sync-status  — view progress
```

### Option C: Use both (recommended)

Install the CLI globally **and** add the Claude Code plugin. Use `/slash commands` when inside Claude Code, use `ai-sync` from the terminal when working with other tools.

```bash
npm install -g @oreolion/ai-sync       # CLI for any tool
claude plugin add Oreolion/ai-sync      # Plugin for Claude Code
```

---

## Important: CLI vs Plugin

These are **two separate things** that work together:

| | CLI (`@oreolion/ai-sync`) | Claude Code Plugin |
|---|---|---|
| **Install** | `npm install -g @oreolion/ai-sync` | `claude plugin add Oreolion/ai-sync` |
| **How to use** | `ai-sync init`, `ai-sync handoff` | `/sync-init`, `/handoff` |
| **Works with** | Any AI tool, any terminal | Claude Code only |
| **Auto-loads context** | No | Yes (on session start) |
| **Reminds you to save** | No | Yes (on session stop) |
| **Slash commands** | No | Yes |

**Common question**: "I ran `npm install -g @oreolion/ai-sync` but I don't see any commands in Claude Code."

That's expected. The npm package installs a terminal CLI (`ai-sync`). Claude Code doesn't scan your global npm packages for plugins. To get slash commands inside Claude Code, you also need `claude plugin add Oreolion/ai-sync`.

---

## What Gets Created

When you run `ai-sync init` (or `/sync-init`), your project gets:

```
your-project/
├── .ai-sync/
│   ├── HANDOFF.md      # Current state — what was done, what's next, blockers
│   ├── PLAN.md         # Implementation plan (linked or created)
│   ├── PROGRESS.md     # Task checklist: [x] done, [ ] pending
│   └── sessions/       # One log file per agent session
├── AGENTS.md           # Adapter for Codex, OpenCode, Continue.dev
├── .cursorrules        # Adapter for Cursor
├── .clinerules         # Adapter for Cline
├── .windsurfrules      # Adapter for Windsurf
├── .aider.conf.yml     # Adapter for Aider
├── .continuerules      # Adapter for Continue.dev
└── .github/
    └── copilot-instructions.md  # Adapter for GitHub Copilot
```

**Adapter files** are thin pointers. Each one simply tells its AI tool: "Read `.ai-sync/HANDOFF.md` for context before starting work." This is how every tool automatically picks up where the last one left off — no manual copy-paste needed.

---

## Workflow Examples

### Example 1: Claude Code hits rate limit, switch to Cursor

```
# In Claude Code:
You: /handoff
# Claude saves: what it built, what's next, build status, files changed

# Open same project in Cursor
# Cursor reads .cursorrules → reads .ai-sync/HANDOFF.md → knows everything
# Cursor continues the work

# When done in Cursor, run from terminal:
ai-sync handoff

# Back in Claude Code:
You: /sync-resume
# Claude loads the full context and continues from where Cursor stopped
```

### Example 2: Split work across Codex and Claude Code

```bash
# Terminal — initialize sync in your project
ai-sync init

# Work with Codex (reads AGENTS.md automatically)
codex "implement the auth module per the plan"

# Codex finishes or you want to switch
ai-sync handoff

# Continue in Claude Code
claude
> /sync-resume     # loads everything Codex did
> (continue work)
> /handoff         # save before stopping
```

### Example 3: Just checking where things stand

```bash
ai-sync status
# Shows: current phase, completion %, what's done, what's next, last agent, blockers
```

---

## All Commands

### CLI Commands (terminal)

| Command | Description |
|---------|-------------|
| `ai-sync init` | Create `.ai-sync/` + adapter files for all supported tools |
| `ai-sync handoff` | Save state before switching agents (conflict detection + auto-progress) |
| `ai-sync status` | Show progress with completion bar |
| `ai-sync resume [tool]` | Generate resume prompt for the target tool |
| `ai-sync diff` | Show changes since last handoff |
| `ai-sync adapter <tool>` | Generate adapter file for a specific tool |
| `ai-sync transfer` | Import session context via `continues` |
| `ai-sync hooks install` | Install git hooks for auto-save on commit |
| `ai-sync hooks remove` | Remove git hooks |

### Plugin Commands (inside Claude Code)

| Command | Description |
|---------|-------------|
| `/sync-init` | Bootstrap `.ai-sync/` in the current project |
| `/handoff` | Save state before switching agents (with conflict detection) |
| `/sync-status` | Show current progress, next steps, session history |
| `/sync-resume` | Load full context from last handoff and continue |
| `/sync-diff` | Show all changes since last handoff |
| `/sync-adapter <tool>` | Generate adapter file for a specific tool |
| `/sync-transfer` | Import session context from another tool |
| `/sync-hooks install\|remove` | Install/remove git hooks |

---

## How It Works Under the Hood

### When an agent starts work

1. Reads `.ai-sync/HANDOFF.md` — knows what happened and what's next
2. Reads `.ai-sync/PROGRESS.md` — knows which tasks are done vs pending
3. Reads `.ai-sync/PLAN.md` — follows the implementation plan

### While working

- Checks off completed tasks in `PROGRESS.md`
- Documents blockers in `HANDOFF.md` immediately

### When stopping

1. **Conflict detection** — checks if another agent modified `HANDOFF.md` during the session
2. **Auto-progress** — cross-references changed files against plan tasks and auto-checks `PROGRESS.md`
3. **State capture** — writes `HANDOFF.md` with completed work, specific next steps, and build status
4. **Session log** — creates a timestamped log in `.ai-sync/sessions/`

### The five rules all agents follow

1. **Follow the plan** — No unplanned features or refactors
2. **Don't repeat work** — Check `PROGRESS.md` before starting anything
3. **Be specific in handoffs** — "Create `api/auth.ts` with OAuth flow" not "Continue auth work"
4. **Run verification** — Build and typecheck before stopping
5. **Document decisions** — The next agent has zero context about why you made choices

---

## Supported Tools

| Tool | Adapter | How it picks up context |
|------|---------|------------------------|
| **Claude Code** | Plugin + CLAUDE.md | Full integration: slash commands, auto-load on start, reminder on stop |
| **Cursor** | `.cursorrules` | Reads `.ai-sync/HANDOFF.md` via rules file |
| **OpenAI Codex** | `AGENTS.md` | Reads `.ai-sync/HANDOFF.md` via agents file |
| **Cline** | `.clinerules` | Reads `.ai-sync/HANDOFF.md` via rules file |
| **Windsurf** | `.windsurfrules` | Reads `.ai-sync/HANDOFF.md` via rules file |
| **Aider** | `.aider.conf.yml` | Reads `.ai-sync/HANDOFF.md` via config |
| **OpenCode** | `AGENTS.md` | Reads `.ai-sync/HANDOFF.md` via agents file |
| **Continue.dev** | `.continuerules` | Reads `.ai-sync/HANDOFF.md` via rules file |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Reads `.ai-sync/HANDOFF.md` via instructions |

---

## Key Features

- **Conflict detection** — Warns if another agent modified `HANDOFF.md` while you were working
- **Auto-progress tracking** — Automatically checks off tasks when their output files are modified
- **Build-state awareness** — Records whether the last agent left a clean or broken build
- **Session audit trail** — Every agent session is logged with timestamps and decisions
- **Zero lock-in** — Pure Markdown + YAML protocol. No proprietary format, no vendor lock-in

---

## Also Available As

| Package | Description | Install |
|---------|-------------|---------|
| [`@oreolion/ai-sync`](https://www.npmjs.com/package/@oreolion/ai-sync) | CLI (this package) | `npm install -g @oreolion/ai-sync` |
| `@oreolion/ai-sync-mcp` | MCP server for MCP-native tools | See [`packages/mcp-server/`](packages/mcp-server/) |
| `ai-sync` (VS Code) | VS Code extension with sidebar UI | See [`packages/vscode-extension/`](packages/vscode-extension/) |
| `ai-sync-action` | GitHub Action for CI/CD | See [`packages/github-action/`](packages/github-action/) |
| `@oreolion/ai-sync-remote` | Cloudflare Workers API for teams | See [`packages/remote-sync/`](packages/remote-sync/) |
| `@oreolion/ai-sync-dashboard` | Next.js analytics dashboard | See [`packages/dashboard/`](packages/dashboard/) |

---

## Plugin Structure (for contributors)

```
ai-sync-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/                    # Slash command definitions
│   ├── sync-init.md
│   ├── handoff.md
│   ├── sync-status.md
│   ├── sync-resume.md
│   ├── sync-diff.md
│   ├── sync-adapter.md
│   ├── sync-transfer.md
│   └── sync-hooks.md
├── skills/
│   └── ai-sync-protocol/
│       └── SKILL.md             # Protocol spec (auto-loaded when .ai-sync/ exists)
├── hooks/
│   └── hooks.json               # Session start/stop hooks
├── packages/                    # Standalone packages (CLI, MCP, VS Code, etc.)
├── tests/
│   └── validate-plugin.sh
├── CONTRIBUTING.md
├── ROADMAP.md
└── LICENSE
```

## Protocol Specification

The full protocol spec is in [`skills/ai-sync-protocol/SKILL.md`](skills/ai-sync-protocol/SKILL.md). This defines the exact format of `HANDOFF.md` (YAML frontmatter + sections), `PROGRESS.md` (phase headers + checklists), and session logs.

## Testing

```bash
bash tests/validate-plugin.sh
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)
