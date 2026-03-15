# ai-sync Vercel Skill

The ai-sync protocol packaged as a Vercel skill for use with Vercel's AI tools.

## Installation

Copy `ai-sync-protocol.md` to your project's skills directory, or reference it via Vercel's skill marketplace (when available).

## What It Does

Auto-triggers when your project has a `.ai-sync/` directory or when you mention "handoff", "switch agents", or related keywords. Provides the full cross-platform AI agent synchronization protocol so any AI tool can read and write `.ai-sync/` state files correctly.

## Skill Format

The skill follows the standard Markdown + YAML frontmatter format:

```yaml
---
name: ai-sync-protocol
description: ...trigger keywords...
version: 1.0.0
---

# Skill content (protocol documentation)
```

## Related

- [ai-sync plugin](https://github.com/Oreolion/ai-sync) — Full Claude Code plugin with slash commands
- [@oreolion/ai-sync](https://www.npmjs.com/package/@oreolion/ai-sync) — Standalone CLI
- [@ai-sync/mcp-server](https://www.npmjs.com/package/@ai-sync/mcp-server) — MCP server
