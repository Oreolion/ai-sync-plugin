---
description: Write handoff state before switching to another AI agent
allowed-tools: [Read, Write, Edit, Bash(git:*), Bash(npx:*), Bash(npm:*), Glob, Grep]
---

# Agent Handoff

Capture current work state and write handoff files so the next AI agent can continue seamlessly.

## Context

- Current git status: !`git status`
- Current git diff (staged + unstaged): !`git diff HEAD --stat`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -5`

## Instructions

1. **Read the current HANDOFF.md** at `.ai-sync/HANDOFF.md` to understand what was planned

2. **Analyze current session work:**
   - Review git diff to identify all changes made
   - Identify files created vs modified
   - Determine what tasks from PROGRESS.md were completed

3. **Run verification** (if TypeScript/JavaScript project):
   - `npx tsc --noEmit` — record pass/fail
   - `npm run build` — record pass/fail

4. **Write `.ai-sync/HANDOFF.md`** with:
   - `last_agent: claude-code`
   - `timestamp:` current ISO-8601
   - `status:` paused (or blocked if errors)
   - `current_phase:` from PROGRESS.md
   - `current_task:` specific task
   - `stop_reason:` user-switch
   - Detailed "What Was Completed This Session"
   - Specific "Next Steps" — actionable, numbered, detailed
   - All files modified/created
   - Any blockers or warnings
   - Build status results

5. **Update `.ai-sync/PROGRESS.md`** — check off completed items

6. **Create session log** at `.ai-sync/sessions/{YYYY-MM-DD-HHMMSS}-claude-code.md` with:
   - Session summary
   - Duration (if known)
   - Key decisions
   - Files changed

7. **Report** — Tell the user:
   - What was captured in the handoff
   - Which agent can pick up next
   - Any blockers that need resolution before continuing
