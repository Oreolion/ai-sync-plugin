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

2. **Conflict detection** — Before overwriting, check if another agent modified HANDOFF.md during this session:
   - Run `git log -1 --format="%H %ai" -- .ai-sync/HANDOFF.md` to get the latest commit that touched HANDOFF.md
   - Compare the HANDOFF.md `timestamp` field with the commit timestamp
   - If HANDOFF.md was committed after the timestamp recorded in its own frontmatter (meaning another agent wrote to it since the last known handoff), warn:
     "WARNING: HANDOFF.md was modified by another agent since the last recorded handoff. Showing changes..."
   - Show `git diff HEAD -- .ai-sync/HANDOFF.md` if there are uncommitted changes, or show the recent commit log
   - Ask the user: "Proceed with overwrite, or review first?"
   - If user says proceed, continue. If review, show the full current HANDOFF.md and stop.

3. **Analyze current session work:**
   - Review git diff to identify all changes made
   - Identify files created vs modified
   - Determine what tasks from PROGRESS.md were completed

4. **Run verification** (if TypeScript/JavaScript project):
   - `npx tsc --noEmit` — record pass/fail
   - `npm run build` — record pass/fail

5. **Auto-update PROGRESS.md** — Cross-reference changed files against PLAN.md tasks:
   - Run `git diff --name-only HEAD` to get all files changed in this session
   - Read `.ai-sync/PLAN.md` and `.ai-sync/PROGRESS.md`
   - For each unchecked task in PROGRESS.md, check if the task text references a file path that appears in the changed files list
   - If a match is found, mark that task as `[x]` in PROGRESS.md
   - Only match when the file path is clearly the deliverable for that task (e.g., task says "Create `src/auth.ts`" and `src/auth.ts` was created)
   - Report which tasks were auto-checked

6. **Write `.ai-sync/HANDOFF.md`** with:
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

7. **Update `.ai-sync/PROGRESS.md`** — check off any remaining completed items not caught by auto-update in step 5

8. **Create session log** at `.ai-sync/sessions/{YYYY-MM-DD-HHMMSS}-claude-code.md` with:
   - Session summary
   - Duration (if known)
   - Key decisions
   - Files changed

9. **Report** — Tell the user:
   - What was captured in the handoff
   - Which agent can pick up next
   - Any blockers that need resolution before continuing
   - Which tasks were auto-checked in PROGRESS.md (from step 5)
