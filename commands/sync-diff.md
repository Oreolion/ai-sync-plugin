---
description: Show what changed in the project since the last handoff
allowed-tools: [Read, Glob, Grep, Bash(git:*)]
---

# Sync Diff

Show all changes made to the project since the last handoff was recorded. Helps understand what happened between handoff sessions — whether by another agent, a human, or uncommitted work.

## Instructions

1. **Check if `.ai-sync/HANDOFF.md` exists**. If not, tell the user to run `/sync-init` first.

2. **Extract the handoff timestamp** — Read `.ai-sync/HANDOFF.md` YAML frontmatter and get the `timestamp` field.

3. **Find the handoff commit** — Identify the git commit closest to the handoff timestamp:
   - Run `git log --oneline --until="{timestamp}" -1` to find the commit at or before the handoff
   - Store this as `{handoff_commit}`

4. **Show changes since handoff:**

   a. **Committed changes** — Changes committed after the handoff:
      - `git log --oneline {handoff_commit}..HEAD`
      - `git diff --stat {handoff_commit}..HEAD`

   b. **Uncommitted changes** — Working tree changes not yet committed:
      - `git diff --stat`
      - `git diff --stat --cached` (staged)

   c. **Untracked files** — New files not yet added:
      - `git ls-files --others --exclude-standard`

5. **Check if `.ai-sync/` files changed** — Specifically check whether HANDOFF.md, PROGRESS.md, or PLAN.md were modified since the handoff commit:
   - `git diff {handoff_commit}..HEAD -- .ai-sync/`
   - If modified, flag: "Sync files were updated since the last handoff — another agent may have worked here."

6. **Check for new session logs** — Glob `.ai-sync/sessions/` and list any session files created after the handoff timestamp.

7. **Present the diff report:**

```
## Changes Since Last Handoff

**Handoff:** {last_agent} at {timestamp}
**Handoff Commit:** {short_sha} {message}

### Commits Since Handoff ({count})
- {sha} {message}
- {sha} {message}

### Files Changed ({count})
{git diff --stat output}

### Uncommitted Changes
{staged + unstaged summary, or "Working tree clean"}

### Untracked Files
{list or "None"}

### Sync File Changes
{whether .ai-sync/ files were modified, or "No sync file changes"}

### New Sessions Since Handoff
{list of session logs or "None"}
```
