---
description: Transfer session context from another AI tool into .ai-sync/ using continues
allowed-tools: [Read, Write, Edit, Bash(npx:*), Bash(git:*), Glob, Grep]
---

# Sync Transfer

Import session context from another AI coding tool into `.ai-sync/` using [continues](https://github.com/yigitkonur/cli-continues). This captures conversation history and context from the previous tool's local storage and merges it into the handoff state.

## Arguments

$ARGUMENTS — optional: the source tool name (e.g., `cursor`, `codex`, `aider`)

## Instructions

1. **Check if `.ai-sync/` exists**. If not, tell the user to run `/sync-init` first.

2. **Check if `continues` is available:**
   - Run `npx continues --help` to verify it's accessible
   - If it fails, tell the user: "The `continues` tool is required for session transfer. Install it with `npm install -g continues` or it will be fetched automatically via npx."

3. **Read current HANDOFF.md** to understand existing state. This is the primary record — session transfer only supplements it, never replaces it.

4. **Run session extraction:**
   - If source tool specified: `npx continues --from $ARGUMENTS`
   - If no source tool: `npx continues` (interactive mode lets user pick)
   - Capture the output

5. **Parse extracted session context:**
   - Extract key information: what was discussed, what was decided, what was done
   - Identify any action items or next steps mentioned in the conversation
   - Extract file references (files discussed or modified)

6. **Merge into HANDOFF.md** — Append a `## Session Context` section to the existing HANDOFF.md:
   ```markdown
   ## Session Context (transferred from {tool})

   ### Conversation Highlights
   - {key discussion point}
   - {decision made}

   ### Action Items Mentioned
   - {item from conversation}

   ### Files Discussed
   - {file path}
   ```

   **Important dedup rules:**
   - Do NOT overwrite existing HANDOFF.md frontmatter or structured sections
   - Do NOT duplicate information already in "What Was Completed" or "Next Steps"
   - Only append genuinely new context from the conversation
   - If HANDOFF.md already has a Session Context section, replace it (don't stack multiple transfers)

7. **Extract action items to PROGRESS.md** (optional):
   - If the conversation mentions specific tasks that aren't in PROGRESS.md, add them as unchecked items under the current phase
   - Prefix with `(from session transfer)` to distinguish from planned tasks

8. **Create session log** at `.ai-sync/sessions/{YYYY-MM-DD-HHMMSS}-transfer-{source}.md`:
   - Source tool
   - Transfer timestamp
   - Raw extracted context (for audit trail)
   - What was merged into HANDOFF.md

9. **Report:**
   - What context was transferred
   - What was added to HANDOFF.md
   - How many action items were found
   - Remind user to review the merged context for accuracy
