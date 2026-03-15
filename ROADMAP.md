# ai-sync — Roadmap

## Vision

A unified cross-platform AI agent synchronization infrastructure that combines the best of plan-aware handoff (`.ai-sync/`), session transfer (`continues`), and auto-save context bridging (`ai-context-bridge`) into one cohesive tool.

---

## Phase 1: Core Plugin Polish (Current)

### 1.1 Finalize `.ai-sync/` Protocol
- [x] HANDOFF.md format with YAML frontmatter
- [x] PROGRESS.md checklist format
- [x] PLAN.md pointer/summary format
- [x] Session logs in `sessions/`
- [x] Adapter files for Codex, Cursor, Cline, Windsurf

### 1.2 Claude Code Plugin
- [x] `/sync-init` — Bootstrap `.ai-sync/` in any project
- [x] `/handoff` — Capture state before switching agents
- [x] `/sync-status` — Show progress and next steps
- [x] Auto-loaded skill (SKILL.md) for protocol awareness
- [x] Session start/stop hooks
- [x] `/sync-resume` — Structured resume from HANDOFF.md (read + apply context)
- [x] `/sync-diff` — Show what changed since last handoff
- [x] Conflict detection — warn if HANDOFF.md was updated by another agent since last read
- [x] Auto-update PROGRESS.md when files referenced in plan are modified

### 1.3 Adapter Improvements
- [x] `.aider.conf.yml` adapter template
- [x] `opencode.json` adapter template
- [x] `.github/copilot-instructions.md` adapter for GitHub Copilot
- [x] `continue.dev` config adapter
- [x] Adapter generator command: `/sync-adapter <tool>` auto-creates the right file
- [x] Open source project setup (LICENSE, CONTRIBUTING.md, issue templates)
---

## Phase 2: Integrate `ai-context-bridge`

[himanshuskukla/ai-context-bridge](https://github.com/himanshuskukla/ai-context-bridge) — Git hooks auto-save context on every commit.

### What It Brings
- Automatic context capture on `git commit` (pre-commit or post-commit hook)
- Generates resume prompts for 11+ tools
- Zero-friction — works silently in the background

### Integration Plan
- [x] Add `ai-context-bridge` as optional dependency (detected automatically by `/sync-hooks`)
- [x] `/sync-hooks install` installs git post-commit hook that:
  1. Runs `ai-context-bridge save` on commit (if available)
  2. Updates `.ai-sync/HANDOFF.md` timestamp with latest commit
  3. Auto-checks completed tasks in PROGRESS.md based on changed files
- [x] Merge context-bridge's resume prompt format into HANDOFF.md format (via `/sync-hooks`)
- [x] Bridge reads `.ai-sync/PLAN.md` to generate plan-aware resume prompts
- [x] Config: `.ai-sync/config.json` with `autoSaveOnCommit` and `useContextBridge` flags

---

## Phase 3: Integrate `continues` (Session Transfer)

[yigitkonur/cli-continues](https://github.com/yigitkonur/cli-continues) — `npx continues`, 14+ tools, 182 handoff paths.

### What It Brings
- Session history extraction from any tool's local storage
- Conversation-aware context (what was said, not just what was done)
- Zero-install via npx

### Integration Plan
- [x] `/sync-transfer` command wraps `npx continues` + appends session context to HANDOFF.md
- [x] Session extraction feeds into `.ai-sync/sessions/` log files
- [x] Merge conversation highlights into HANDOFF.md `context` section
- [x] Dedup: if HANDOFF.md already has plan-aware state, don't overwrite with session dump — append as supplementary context
- [x] Optional: extract action items from conversation history → auto-add to PROGRESS.md

---

## Phase 4: MCP Server (Advanced Sync)

### Why
Some tools (Cursor, Continue.dev, Claude Desktop) support MCP natively. An MCP server provides richer integration than file-based adapters.

### Plan
- [x] `@ai-sync/mcp-server` — MCP server exposing:
  - `sync/getHandoff` — returns current HANDOFF.md as structured data
  - `sync/getProgress` — returns PROGRESS.md as checklist with completion %
  - `sync/getPlan` — returns PLAN.md
  - `sync/updateProgress` — check off tasks
  - `sync/createHandoff` — write handoff state
  - `sync/getSessionHistory` — list past sessions
- [x] Transport: stdio (local)
- [x] Schema validation for all sync files
- [ ] Publish to MCP registry
- [ ] SSE transport for remote/team sync

---

## Phase 5: npm Package

### Package: `@oreolion/ai-sync`

```bash
npm install -g @oreolion/ai-sync
# or
npx ai-sync init
npx ai-sync handoff
npx ai-sync status
npx ai-sync resume
npx ai-sync transfer  # wraps continues
```

### CLI Commands
- [x] `ai-sync init` — Create `.ai-sync/` + adapter files (interactive tool selection)
- [x] `ai-sync handoff` — Interactive handoff (prompts for status, next steps, blockers)
- [x] `ai-sync status` — Pretty-print progress with bar chart
- [x] `ai-sync resume` — Generate resume prompt for target tool
- [x] `ai-sync transfer` — Session transfer via `continues` integration
- [x] `ai-sync hooks install` — Install git hooks for auto-save
- [x] `ai-sync hooks remove` — Remove git hooks
- [x] `ai-sync adapter <tool>` — Generate adapter file for specific tool
- [x] `ai-sync diff` — Show changes since last handoff

### Package Structure
```
@oreolion/ai-sync/
├── bin/
│   └── ai-sync.js          # CLI entry
├── src/
│   ├── commands/            # CLI command handlers
│   ├── protocol/            # File format parsers/writers
│   ├── adapters/            # Tool-specific adapter generators
│   ├── hooks/               # Git hook scripts
│   └── mcp/                 # MCP server (optional)
├── templates/               # HANDOFF.md, PROGRESS.md templates
├── package.json
└── README.md
```

### Publishing
```bash
npm login
npm publish --access public
```

---

## Phase 6: Claude Code Marketplace

### Requirements
- Plugin follows Claude Code plugin spec (`.claude-plugin/plugin.json`, commands/, skills/, hooks/)
- Clean README with install instructions
- MIT license

### Steps
- [ ] Create GitHub repo: `Oreolion/ai-sync`
- [ ] Push plugin code to repo
- [x] Plugin manifest updated with full metadata, keywords, and categories
- [ ] Test install: `claude plugin add Oreolion/ai-sync`
- [ ] Submit PR to `anthropics/claude-plugins-official` (if official marketplace exists)
- [ ] Alternative: users install via GitHub URL

### Marketplace Listing
- **Name**: ai-sync
- **Tagline**: Cross-platform AI agent synchronization — seamless handoff between Claude, OpenCode, Codex, Cursor, and more
- **Category**: Developer Productivity
- **Keywords**: sync, handoff, multi-agent, cross-platform, codex, cursor, collaboration

---

## Phase 7: Vercel Skills / Other Platforms

### Vercel Skills
- [x] Research Vercel's skill publishing format and requirements
- [x] Adapt ai-sync protocol as a Vercel skill (Markdown + YAML frontmatter format)
- [ ] Publish to Vercel skill marketplace

### Other Platforms
- [x] **VS Code Extension** — sidebar panel showing sync status, one-click handoff (`packages/vscode-extension/`)
- [ ] **JetBrains Plugin** — same for IntelliJ/WebStorm users
- [x] **GitHub Action** — auto-update `.ai-sync/` on PR creation (`packages/github-action/`)
- [ ] **SkillKit Integration** — register ai-sync rules via SkillKit for 44-agent reach

---

## Phase 8: Team Sync (Future)

### Remote Sync
- [x] Optional remote backend (Cloudflare Workers + D1) for team handoff (`packages/remote-sync/`)
- [x] Multiple developers can hand off to each other's AI agents (REST API)
- [x] Conflict resolution via handoff history tracking
- [x] Shared PLAN.md and PROGRESS.md across team members (API endpoints)

### Dashboard
- [x] Web dashboard scaffold showing all projects' sync status (`packages/dashboard/`)
- [x] Timeline of agent sessions across tools (Timeline component)
- [x] Analytics: project stats API endpoint (handoff count, completion rates)

---

## Competitive Landscape & Differentiation

| Tool | Approach | Our Advantage |
|------|----------|---------------|
| `continues` | Session history dump | We track structured plans + progress, not chat logs |
| `ai-context-bridge` | Git-hook context save | We add plan-awareness and multi-phase tracking |
| `memorix` | MCP memory bridge | We're file-based (zero server), plus MCP as optional upgrade |
| `cross_agent_session_resumer` | Format converter | We define one canonical format, not N-to-N conversion |
| `SkillKit` | Rules sync (44 agents) | We sync state/progress, not just coding rules |
| `AI Rules Sync` | Symlink-based rules | We go beyond rules to track implementation progress |

### Our Unique Value
1. **Plan-aware** — Tracks what needs to happen, not what was said
2. **Progress-tracking** — Checklist-based completion, not session replay
3. **Build-state-aware** — Records whether the last agent left a clean build
4. **File-change audit** — Which files were modified, created, deleted
5. **Tool-agnostic** — Plain markdown files, any agent can read/write
6. **Combined infrastructure** — Merges best of context-bridge + continues + protocol

---

## Quick Start for Development

```bash
# Clone
git clone https://github.com/Oreolion/ai-sync.git
cd ai-sync

# Test as Claude Code plugin
claude --plugin-dir .

# Test commands
# In any project:
/sync-init
/sync-status
/handoff
```

---

## Priority Order

1. **Phase 1.2** — Finish remaining plugin commands (`/sync-resume`, `/sync-diff`)
2. **Phase 5** — npm package (widest reach, tool-agnostic)
3. **Phase 2** — `ai-context-bridge` integration (auto-save)
4. **Phase 3** — `continues` integration (session transfer)
5. **Phase 6** — Claude marketplace publish
6. **Phase 4** — MCP server (advanced integrations)
7. **Phase 7** — Vercel/VS Code/other platforms
8. **Phase 8** — Team sync (future)
