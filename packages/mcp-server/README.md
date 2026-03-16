# @oreolion/ai-sync-mcp

MCP (Model Context Protocol) server that exposes the `.ai-sync/` protocol as structured tools. Enables AI agents in MCP-compatible clients (Claude Desktop, Cursor, Continue.dev) to read and write handoff state, track progress, and manage session history programmatically.

## Installation

```bash
npm install -g @oreolion/ai-sync-mcp
```

Or run directly with npx:

```bash
npx @oreolion/ai-sync-mcp
```

## MCP Configuration

Add the following to your MCP client configuration:

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-sync": {
      "command": "npx",
      "args": ["@oreolion/ai-sync-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "ai-sync": {
      "command": "npx",
      "args": ["@oreolion/ai-sync-mcp"]
    }
  }
}
```

### Continue.dev

Add to your Continue configuration:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["@oreolion/ai-sync-mcp"]
        }
      }
    ]
  }
}
```

## Tools

The server exposes 6 tools:

### sync_getHandoff

Read `.ai-sync/HANDOFF.md` and return it as structured JSON with frontmatter fields and sections.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.

**Returns:** JSON with `lastAgent`, `timestamp`, `status`, `currentPhase`, `currentTask`, `stopReason`, and `sections`.

### sync_getProgress

Read `.ai-sync/PROGRESS.md` and return phases with tasks, completion counts, and overall percentage.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.

**Returns:** JSON with `phases` array, `totalTasks`, `completedTasks`, and `percentage`.

### sync_getPlan

Read `.ai-sync/PLAN.md` and return its full content as text.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.

**Returns:** Raw PLAN.md content.

### sync_updateProgress

Toggle a specific task checkbox in `.ai-sync/PROGRESS.md` and return the updated progress.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.
- `phase` (number, required) — Zero-based index of the phase containing the task.
- `task` (number, required) — Zero-based index of the task within the phase.
- `checked` (boolean, required) — Whether to mark the task as checked or unchecked.

**Returns:** Updated progress JSON (same format as sync_getProgress).

### sync_createHandoff

Write `.ai-sync/HANDOFF.md` with the provided handoff data.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.
- `data` (object, required) — Handoff data including:
  - `lastAgent` (string) — Name of the agent creating the handoff.
  - `timestamp` (string) — ISO-8601 timestamp.
  - `status` — One of: `in-progress`, `paused`, `blocked`, `completed`.
  - `currentPhase` (string) — Current phase name.
  - `currentTask` (string) — Current task description.
  - `stopReason` — One of: `rate-limit`, `context-limit`, `completed`, `user-switch`, `error`.
  - `sections` (object) — Markdown content for each section (`completed`, `inProgress`, `nextSteps`, `filesModified`, `blockers`, `keyDecisions`, `buildStatus`).

**Returns:** Confirmation JSON with timestamp and agent.

### sync_getSessionHistory

List `.ai-sync/sessions/` log files with metadata, most recent first.

**Input:**
- `projectDir` (string, optional) — Absolute path to the project directory. Defaults to cwd.
- `limit` (number, optional) — Maximum number of session entries to return.

**Returns:** JSON with `count` and `sessions` array.

## Protocol

This server implements the `.ai-sync/` protocol for cross-platform AI agent synchronization. See the [main project README](../../README.md) for full protocol documentation.

### File Formats

- **HANDOFF.md** — YAML frontmatter with agent metadata + markdown sections for state transfer
- **PROGRESS.md** — Phase headers with `COMPLETE|IN PROGRESS|PENDING` status + task checklists
- **PLAN.md** — Free-form implementation plan
- **sessions/*.md** — Timestamped session logs with agent metadata

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
