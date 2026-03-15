---
description: Resume work from last handoff — load context, apply state, and continue where the previous agent left off
allowed-tools: [Read, Glob, Grep, Bash(git:*)]
---

# Sync Resume

Structured resume from `.ai-sync/HANDOFF.md`. Loads full context from the last agent session so you can continue seamlessly.

## Instructions

1. **Check if `.ai-sync/` exists**. If not, tell the user to run `/sync-init` first.

2. **Load handoff state** — Read `.ai-sync/HANDOFF.md` and extract:
   - `last_agent`, `timestamp`, `status`, `stop_reason`
   - `current_phase` and `current_task`
   - Next Steps section (these are your immediate action items)
   - Blockers section (resolve these before proceeding)
   - Build Status section (know if the last agent left a clean build)

3. **Load progress** — Read `.ai-sync/PROGRESS.md` and identify:
   - Current phase and its pending tasks
   - Overall completion percentage

4. **Load plan** — Read `.ai-sync/PLAN.md` to understand the implementation plan. Do not deviate from it.

5. **Record conflict baseline** — Store the current state of HANDOFF.md so conflict detection works during `/handoff`:
   - Run `git log -1 --format="%H" -- .ai-sync/HANDOFF.md` to get the last commit hash that touched HANDOFF.md
   - Run `git diff --quiet -- .ai-sync/HANDOFF.md` to check for uncommitted changes
   - Remember both values — the `/handoff` command will use them to detect if another agent modified the file during this session

6. **Check for conflicts** — Compare HANDOFF.md `timestamp` against recent git history:
   - Run `git log --oneline --since="{handoff_timestamp}" -- .ai-sync/HANDOFF.md`
   - If HANDOFF.md was modified after the recorded timestamp by a different commit than the one at resume time, warn: "HANDOFF.md was updated since the last recorded handoff — another agent may have worked on this project. Review the changes before continuing."
   - Show the diff: `git diff {handoff_commit}..HEAD -- .ai-sync/HANDOFF.md`
   - Ask the user whether to continue (incorporate changes) or abort (review first)

7. **Check build state** — If the handoff reports a failed build or typecheck:
   - Warn the user: "Last session ended with build errors — resolving these first."

8. **Read the last session log** — Glob `.ai-sync/sessions/` for the most recent file, read it for additional context about key decisions made.

9. **Present the resume briefing:**

```
## Resuming from Handoff

**Last Agent:** {agent} at {timestamp}
**Status:** {status} | **Stop Reason:** {reason}
**Phase:** {current_phase}
**Task:** {current_task}
**Build:** {clean/failing}

### What Was Done
{summary from handoff}

### Your Next Steps
1. {step from handoff Next Steps}
2. {step}

### Blockers
{blockers or "None"}

### Progress
{completed}/{total} tasks — {phase status}
```

10. **Begin work** — Start executing the first item from Next Steps. Follow the plan. Do not add unplanned features or refactors.
