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
- [ ] `/sync-resume` — Structured resume from HANDOFF.md (read + apply context)
- [ ] `/sync-diff` — Show what changed since last handoff
- [ ] Conflict detection — warn if HANDOFF.md was updated by another agent since last read
- [ ] Auto-update PROGRESS.md when files referenced in plan are modified

### 1.3 Adapter Improvements
- [ ] `.aider.conf.yml` adapter template
- [ ] `opencode.json` adapter template
- [ ] `.github/copilot-instructions.md` adapter for GitHub Copilot
- [ ] `continue.dev` config adapter
- [ ] Adapter generator command: `/sync-adapter <tool>` auto-creates the right file

---

## Phase 2: Integrate `ai-context-bridge`

[himanshuskukla/ai-context-bridge](https://github.com/himanshuskukla/ai-context-bridge) — Git hooks auto-save context on every commit.

### What It Brings
- Automatic context capture on `git commit` (pre-commit or post-commit hook)
- Generates resume prompts for 11+ tools
- Zero-friction — works silently in the background

### Integration Plan
- [ ] Add `ai-context-bridge` as optional dependency
- [ ] `/sync-init --hooks` flag installs git hooks that:
  1. Run `ai-context-bridge save` on commit
  2. Update `.ai-sync/HANDOFF.md` with latest commit context
  3. Auto-check completed tasks in PROGRESS.md based on changed files
- [ ] Merge context-bridge's resume prompt format into HANDOFF.md format
- [ ] Bridge reads `.ai-sync/PLAN.md` to generate plan-aware resume prompts (not just session dumps)
- [ ] Config: `.ai-sync/config.json` with `autoSaveOnCommit: true|false`

---

## Phase 3: Integrate `continues` (Session Transfer)

[yigitkonur/cli-continues](https://github.com/yigitkonur/cli-continues) — `npx continues`, 14+ tools, 182 handoff paths.

### What It Brings
- Session history extraction from any tool's local storage
- Conversation-aware context (what was said, not just what was done)
- Zero-install via npx

### Integration Plan
- [ ] `/sync-transfer` command wraps `npx continues` + appends session context to HANDOFF.md
- [ ] Session extraction feeds into `.ai-sync/sessions/` log files
- [ ] Merge conversation highlights into HANDOFF.md `context` section
- [ ] Dedup: if HANDOFF.md already has plan-aware state, don't overwrite with session dump — append as supplementary context
- [ ] Optional: extract action items from conversation history → auto-add to PROGRESS.md

---

## Phase 4: MCP Server (Advanced Sync)

### Why
Some tools (Cursor, Continue.dev, Claude Desktop) support MCP natively. An MCP server provides richer integration than file-based adapters.

### Plan
- [ ] `@ai-sync/mcp-server` — MCP server exposing:
  - `sync/getHandoff` — returns current HANDOFF.md as structured data
  - `sync/getProgress` — returns PROGRESS.md as checklist with completion %
  - `sync/getPlan` — returns PLAN.md
  - `sync/updateProgress` — check off tasks
  - `sync/createHandoff` — write handoff state
  - `sync/getSessionHistory` — list past sessions
- [ ] Transport: stdio (local) + SSE (remote/team sync)
- [ ] Schema validation for all sync files
- [ ] Publish to MCP registry

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
- [ ] `ai-sync init` — Create `.ai-sync/` + adapter files (interactive tool selection)
- [ ] `ai-sync handoff` — Interactive handoff (prompts for status, next steps, blockers)
- [ ] `ai-sync status` — Pretty-print progress with bar chart
- [ ] `ai-sync resume` — Generate resume prompt for target tool
- [ ] `ai-sync transfer` — Session transfer via `continues` integration
- [ ] `ai-sync hooks install` — Install git hooks for auto-save
- [ ] `ai-sync hooks remove` — Remove git hooks
- [ ] `ai-sync adapter <tool>` — Generate adapter file for specific tool
- [ ] `ai-sync diff` — Show changes since last handoff

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
- [ ] Test install: `claude plugin add Oreolion/ai-sync`
- [ ] Submit PR to `anthropics/claude-plugins-official` (if official marketplace exists)
- [ ] Alternative: users install via GitHub URL

### Marketplace Listing
- **Name**: ai-sync
- **Tagline**: Cross-platform AI agent synchronization — seamless handoff between Claude, Codex, Cursor, and more
- **Category**: Developer Productivity
- **Keywords**: sync, handoff, multi-agent, cross-platform, codex, cursor, collaboration

---

## Phase 7: Vercel Skills / Other Platforms

### Vercel Skills
- [ ] Research Vercel's skill publishing format and requirements
- [ ] Adapt ai-sync protocol as a Vercel skill if format is compatible
- [ ] Publish to Vercel skill marketplace

### Other Platforms
- [ ] **VS Code Extension** — sidebar panel showing sync status, one-click handoff
- [ ] **JetBrains Plugin** — same for IntelliJ/WebStorm users
- [ ] **GitHub Action** — auto-generate HANDOFF.md on PR creation
- [ ] **SkillKit Integration** — register ai-sync rules via SkillKit for 44-agent reach

---

## Phase 8: Team Sync (Future)

### Remote Sync
- [ ] Optional remote backend (git-based or cloud) for team handoff
- [ ] Multiple developers can hand off to each other's AI agents
- [ ] Conflict resolution when two agents update HANDOFF.md simultaneously
- [ ] Shared PLAN.md and PROGRESS.md across team members

### Dashboard
- [ ] Web dashboard showing all projects' sync status
- [ ] Timeline of agent sessions across tools
- [ ] Analytics: which tools are used most, handoff frequency, completion rates

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
