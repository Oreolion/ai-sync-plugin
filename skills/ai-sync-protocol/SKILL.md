---
name: ai-sync-protocol
description: This skill should be used when the project has a `.ai-sync/` directory, when the user mentions "handoff", "switch agents", "sync state", "continue where left off", "cross-platform agents", "rate limit switch", "agent synchronization", or when starting work on a project with existing `.ai-sync/HANDOFF.md`. Provides the cross-platform AI agent synchronization protocol.
version: 1.0.0
---

# AI Agent Synchronization Protocol

## Overview

The `.ai-sync/` protocol enables seamless handoff between different AI coding agents (Claude Code, Codex, OpenCode, Cursor, Aider, Cline, Windsurf) working on the same project. When one agent stops, the next picks up exactly where it left off.

## When This Applies

- Project has a `.ai-sync/` directory
- User is switching between AI coding tools
- Session is starting on a project with existing handoff state
- User hit rate limit and needs to continue with different tool

## Protocol

### On Start
1. Read `.ai-sync/HANDOFF.md` — understand current state
2. Read `.ai-sync/PROGRESS.md` — what's done vs pending
3. Read `.ai-sync/PLAN.md` — the implementation plan
4. Follow the plan. Do not deviate. Do not add unplanned features.

### During Work
- Check off completed items in PROGRESS.md
- Document blockers in HANDOFF.md immediately
- Match existing code patterns

### On Stop
1. Update HANDOFF.md with: completed work, next steps, files changed, build status
2. Update PROGRESS.md with completed items
3. Create session log in `.ai-sync/sessions/`

## Key Rules

1. **Follow the plan** — No features, refactors, or improvements not in the plan
2. **Don't repeat work** — Check PROGRESS.md first
3. **Be specific in handoffs** — "Continue Phase 8" is bad. "Create `convex/ai.ts` per Phase 8 spec" is good
4. **Run verification** — Build and typecheck before stopping
5. **Document decisions** — The next agent has zero context

## File Formats

### HANDOFF.md
```yaml
---
last_agent: {name}
timestamp: {ISO-8601}
status: in-progress | paused | blocked | completed
current_phase: "{Phase name}"
current_task: "{Task description}"
stop_reason: rate-limit | context-limit | completed | user-switch | error
---
```

Sections: What Was Completed, Work In Progress, Next Steps, Files Modified/Created, Blockers, Key Decisions, Build Status.

### PROGRESS.md
Markdown checklist format with phases and tasks:
```markdown
## Phase N: Name — COMPLETE|IN PROGRESS|PENDING
- [x] Completed task
- [ ] Pending task
```

## Slash Commands

- `/sync-init` — Bootstrap `.ai-sync/` in a new project
- `/handoff` — Capture state before switching agents
- `/sync-status` — Show current sync state and progress
