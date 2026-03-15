---
description: Generate an adapter file for a specific AI tool — points the tool to .ai-sync/
allowed-tools: [Read, Write, Edit, Bash(mkdir:*), Bash(ls:*), Glob]
---

# Sync Adapter

Generate an adapter file that connects a specific AI coding tool to the `.ai-sync/` protocol.

## Arguments

$ARGUMENTS — the target tool name (e.g., `cursor`, `aider`, `copilot`). If empty, list available tools.

## Instructions

1. **Check if `.ai-sync/` exists**. If not, tell the user to run `/sync-init` first.

2. **If no tool specified**, list available adapters and exit:
   ```
   Available adapters:
     cursor       → .cursorrules
     cline        → .clinerules
     windsurf     → .windsurfrules
     aider        → .aider.conf.yml
     opencode     → AGENTS.md (shared with Codex)
     copilot      → .github/copilot-instructions.md
     continue     → .continuerules
     codex        → AGENTS.md

   Usage: /sync-adapter <tool>
   ```

3. **Read project context** — Check for CLAUDE.md or .ai-sync/HANDOFF.md to extract project name, tech stack, and conventions.

4. **Generate the adapter file** based on the tool specified:

### cursor → `.cursorrules`
```
# Cross-Agent Synchronization

This project uses .ai-sync/ for cross-platform AI agent handoff.

## On Start
- Read .ai-sync/HANDOFF.md — understand current state and next steps
- Read .ai-sync/PROGRESS.md — know what's done, don't repeat work
- Read .ai-sync/PLAN.md — follow the plan, no deviations

## During Work
- Check off completed items in .ai-sync/PROGRESS.md
- Match existing code patterns and conventions

## On Stop
- Update .ai-sync/HANDOFF.md with: what you completed, specific next steps, files changed, build status
- Update .ai-sync/PROGRESS.md with completed tasks
- Run build/typecheck verification before stopping

## Rules
1. Follow the plan — no unplanned features or refactors
2. Don't repeat work — check PROGRESS.md first
3. Be specific in handoffs — actionable next steps, not vague summaries
4. Run verification — build and typecheck before stopping
5. Document decisions — the next agent has zero context
```

### cline → `.clinerules`
Same content as `.cursorrules` above.

### windsurf → `.windsurfrules`
Same content as `.cursorrules` above.

### aider → `.aider.conf.yml`
```yaml
# ai-sync: Cross-platform AI agent synchronization
# Read these files at the start of every session for project context

read:
  - .ai-sync/HANDOFF.md
  - .ai-sync/PROGRESS.md
  - .ai-sync/PLAN.md

# Conventions: Follow .ai-sync/ protocol
# - Check PROGRESS.md before starting — don't repeat completed work
# - Follow PLAN.md — no unplanned features or refactors
# - Before stopping, update HANDOFF.md with progress and next steps
# - Run build/typecheck verification before stopping
```

### opencode / codex → `AGENTS.md`
```markdown
# AI Agent Instructions

This project uses `.ai-sync/` for cross-platform AI agent synchronization.

## On Start
1. Read `.ai-sync/HANDOFF.md` — current state, what was done, what's next
2. Read `.ai-sync/PROGRESS.md` — completed vs pending tasks
3. Read `.ai-sync/PLAN.md` — the implementation plan (do not deviate)

## During Work
- Check off completed tasks in PROGRESS.md
- Match existing code patterns

## On Stop
1. Update `HANDOFF.md` with: completed work, specific next steps, files changed, build status
2. Update `PROGRESS.md` with completed items
3. Run verification (build + typecheck) before stopping

## Rules
1. Follow the plan — no unplanned features or refactors
2. Don't repeat work — check PROGRESS.md first
3. Be specific in handoffs — actionable next steps required
4. Run verification before stopping
5. Document decisions — the next agent has zero context
```

### copilot → `.github/copilot-instructions.md`
```markdown
# Copilot Instructions

This project uses `.ai-sync/` for cross-platform AI agent synchronization.

When working on this project:
- Read `.ai-sync/HANDOFF.md` for current project state and next steps
- Read `.ai-sync/PROGRESS.md` to understand what's done vs pending
- Follow `.ai-sync/PLAN.md` — do not deviate from the plan
- Before finishing, note what was accomplished and what should happen next
- Match existing code patterns and conventions
- Run build/typecheck verification when possible
```

### continue → `.continuerules`
Same content as `.cursorrules` above.

5. **Check if file already exists**. If it does, warn: "Adapter file `{filename}` already exists. Overwriting with updated version." Then overwrite.

6. **Create parent directories** if needed (e.g., `.github/` for copilot).

7. **Report** — Tell the user which file was created and remind them to commit it.
