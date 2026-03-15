---
description: Show current .ai-sync/ state — progress, handoff status, and next steps
allowed-tools: [Read, Glob, Grep]
---

# Sync Status

Show the current state of the `.ai-sync/` cross-agent synchronization.

## Instructions

1. **Check if `.ai-sync/` exists**. If not, tell the user to run `/sync-init` first.

2. **Read and display:**
   - `.ai-sync/HANDOFF.md` — last agent, status, current phase, next steps
   - `.ai-sync/PROGRESS.md` — count completed vs total tasks, show current phase progress

3. **Show session history** — list files in `.ai-sync/sessions/` with timestamps and agent names

4. **Format output** as a concise status report:

```
## AI Sync Status

**Last Agent:** {name} at {timestamp}
**Status:** {status}
**Stop Reason:** {reason}
**Current Phase:** {phase}
**Progress:** {completed}/{total} tasks ({percentage}%)

### Completed Phases
- Phase 1: {name}
- Phase 2: {name}
...

### Current Phase: {name}
- [x] completed task
- [ ] pending task
...

### Next Steps
1. {step}
2. {step}

### Session History
- {date} — {agent}: {summary}
```
