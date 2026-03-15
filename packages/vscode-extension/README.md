# AI Sync -- Cross-Platform Agent Handoff

A VS Code extension that provides a sidebar panel for monitoring `.ai-sync/` protocol status and performing one-click handoffs between AI coding agents.

## Features

- **Sync Status Panel** -- Real-time view of handoff state, current phase, progress, and next steps parsed from `.ai-sync/HANDOFF.md` and `.ai-sync/PROGRESS.md`.
- **Session History** -- Browse past session logs stored in `.ai-sync/sessions/`.
- **One-Click Handoff** -- Guided input flow to set status, stop reason, and next steps, then write an updated `HANDOFF.md`.
- **Resume Command** -- Quickly read the current handoff state and open the handoff file for reference.
- **Status Bar** -- At-a-glance phase and progress percentage in the VS Code status bar.
- **Auto-Refresh** -- File watcher on `.ai-sync/` triggers automatic sidebar updates on every change.

## Activation

The extension activates automatically when a workspace contains `.ai-sync/HANDOFF.md`.

## Commands

| Command | Description |
|---------|-------------|
| `AI Sync: Handoff` | Start a handoff flow with status, reason, and next steps |
| `AI Sync: Resume` | Show current handoff state and open HANDOFF.md |
| `AI Sync: Refresh Status` | Manually refresh the sidebar panels |
| `AI Sync: Open HANDOFF.md` | Open the handoff file in the editor |

## Requirements

- VS Code 1.85.0 or later
- A workspace with `.ai-sync/HANDOFF.md` present

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm run watch    # Watch mode
npm run package  # Build .vsix
```
