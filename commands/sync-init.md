---
description: Bootstrap .ai-sync/ cross-agent synchronization in the current project
allowed-tools: [Read, Write, Edit, Bash(mkdir:*), Bash(ls:*), Glob, Grep]
---

# Initialize AI Sync

Bootstrap the `.ai-sync/` cross-platform agent synchronization directory in this project.

## Arguments

Optional: $ARGUMENTS (can specify a plan file path to link)

## Instructions

1. **Check if `.ai-sync/` already exists**. If it does, report current state and exit.

2. **Create the directory structure:**
   ```
   .ai-sync/
   ├── HANDOFF.md
   ├── PLAN.md
   ├── PROGRESS.md
   └── sessions/
   ```

3. **Read existing context:**
   - Check for `CLAUDE.md` — extract project overview, tech stack, conventions
   - Check for existing plans in `.claude/plans/`
   - Check git status and recent commits for current state

4. **Populate HANDOFF.md** with:
   - Current project state based on git history and code analysis
   - `status: paused`
   - Next steps based on any identified pending work
   - Use the exact HANDOFF.md format from the protocol

5. **Populate PLAN.md** with:
   - Pointer to existing plan files if found
   - Brief project summary extracted from CLAUDE.md

6. **Populate PROGRESS.md** with:
   - Any phases/tasks identifiable from git history or plan files
   - Mark completed work based on existing code

7. **Create adapter files** (only if they don't already exist):
   - `AGENTS.md` — for Codex and generic AI agents
   - `.cursorrules` — for Cursor
   - `.clinerules` — for Cline
   Add cross-agent sync directive to each, plus project conventions from CLAUDE.md

8. **Update CLAUDE.md** — Add a "Cross-Agent Synchronization" section if not present:
   ```markdown
   ## Cross-Agent Synchronization
   This project uses `.ai-sync/` for cross-platform AI agent handoff.
   Before stopping, update `.ai-sync/HANDOFF.md` with progress and next steps.
   ```

9. **Report what was created** and instruct the user to:
   - Add `.ai-sync/sessions/` to `.gitignore`
   - Review the generated files
   - Update HANDOFF.md after each session
