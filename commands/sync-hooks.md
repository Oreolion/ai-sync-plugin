---
description: Install or remove git hooks that auto-save .ai-sync/ context on every commit
allowed-tools: [Read, Write, Edit, Bash(git:*), Bash(ls:*), Bash(cat:*), Bash(chmod:*), Bash(mkdir:*), Bash(rm:*), Glob]
---

# Sync Hooks

Install or remove git hooks that automatically update `.ai-sync/` state on every commit. Integrates with [ai-context-bridge](https://github.com/himanshuskukla/ai-context-bridge) if available.

## Arguments

$ARGUMENTS — `install` or `remove`

## Instructions

### If `install`:

1. **Check if `.ai-sync/` exists**. If not, tell the user to run `/sync-init` first.

2. **Check if `.git/` exists**. If not, tell the user this must be a git repository.

3. **Create or update `.ai-sync/config.json`** with:
   ```json
   {
     "autoSaveOnCommit": true,
     "useContextBridge": false
   }
   ```
   If config.json already exists, only update `autoSaveOnCommit` to true.

4. **Check if `ai-context-bridge` is available:**
   - Run `npx ai-context-bridge --help` silently
   - If available, set `useContextBridge: true` in config.json
   - If not, proceed without it (hooks will work standalone)

5. **Create the post-commit hook** at `.git/hooks/post-commit`:

   ```bash
   #!/usr/bin/env bash
   # ai-sync: Auto-update .ai-sync/ state on commit
   # Installed by /sync-hooks install

   SYNC_DIR=".ai-sync"
   CONFIG="$SYNC_DIR/config.json"

   # Only run if .ai-sync/ exists
   if [ ! -d "$SYNC_DIR" ]; then
     exit 0
   fi

   # Check config
   AUTO_SAVE=$(node -e "try{const c=JSON.parse(require('fs').readFileSync('$CONFIG','utf8'));console.log(c.autoSaveOnCommit||false)}catch{console.log('true')}" 2>/dev/null || echo "true")

   if [ "$AUTO_SAVE" != "true" ]; then
     exit 0
   fi

   # Get commit info
   COMMIT_SHA=$(git rev-parse --short HEAD)
   COMMIT_MSG=$(git log -1 --format="%s")
   COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)
   TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

   # Update HANDOFF.md timestamp
   if [ -f "$SYNC_DIR/HANDOFF.md" ]; then
     # Update timestamp in frontmatter
     sed -i "s/^timestamp:.*/timestamp: $TIMESTAMP/" "$SYNC_DIR/HANDOFF.md" 2>/dev/null || true
   fi

   # Auto-check PROGRESS.md tasks if files match
   if [ -f "$SYNC_DIR/PROGRESS.md" ] && [ -f "$SYNC_DIR/PLAN.md" ]; then
     # For each changed file, check if it appears in an unchecked task
     echo "$COMMIT_FILES" | while read -r file; do
       if [ -n "$file" ]; then
         # Escape for sed and check in PROGRESS.md
         escaped=$(echo "$file" | sed 's/[\/&]/\\&/g')
         sed -i "s/^- \[ \] \(.*${escaped}.*\)/- [x] \1/" "$SYNC_DIR/PROGRESS.md" 2>/dev/null || true
       fi
     done
   fi

   # Run ai-context-bridge if available and configured
   USE_BRIDGE=$(node -e "try{const c=JSON.parse(require('fs').readFileSync('$CONFIG','utf8'));console.log(c.useContextBridge||false)}catch{console.log('false')}" 2>/dev/null || echo "false")

   if [ "$USE_BRIDGE" = "true" ]; then
     npx ai-context-bridge save 2>/dev/null || true
   fi
   ```

6. **Make the hook executable:**
   - Run `chmod +x .git/hooks/post-commit`

7. **Check for existing hooks:**
   - If `.git/hooks/post-commit` already exists and was NOT created by ai-sync, warn the user
   - Offer to append the ai-sync logic to the existing hook instead of replacing it
   - Look for the comment `# ai-sync:` to detect our hook

8. **Report:**
   - "Git post-commit hook installed. `.ai-sync/` will auto-update on every commit."
   - If ai-context-bridge was detected: "ai-context-bridge integration enabled."
   - Remind: "Disable with `/sync-hooks remove` or set `autoSaveOnCommit: false` in `.ai-sync/config.json`"

### If `remove`:

1. **Check if `.git/hooks/post-commit` exists and contains ai-sync hook:**
   - Look for `# ai-sync:` comment
   - If the entire file is our hook, remove it
   - If our hook is appended to another hook, remove only our section

2. **Update `.ai-sync/config.json`:**
   - Set `autoSaveOnCommit: false`

3. **Report:** "Git hooks removed. Auto-save disabled."

### If no argument:

Show current status:
- Whether hooks are installed
- Whether ai-context-bridge is available
- Current config.json settings
