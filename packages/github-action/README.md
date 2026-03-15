# AI Sync GitHub Action

Automatically update `.ai-sync/` handoff state when a pull request is created or updated. This action integrates the [ai-sync protocol](https://github.com/Oreolion/ai-sync-plugin) into your CI/CD pipeline so that cross-agent synchronization files stay current without manual intervention.

## What It Does

1. **Updates HANDOFF.md** -- Sets the timestamp, records which files were modified/created by the PR, and updates the build status section.
2. **Auto-completes PROGRESS.md tasks** -- Cross-references PR changed files against unchecked tasks. If a task references a file that was changed in the PR, it gets automatically checked off.
3. **Posts a PR comment** -- Summarizes the current sync status including phase, progress percentage, auto-completed tasks, and remaining work. Updates the same comment on subsequent pushes instead of creating duplicates.
4. **Commits changes back** -- Stages and pushes any `.ai-sync/` modifications to the PR branch with `[skip ci]` to prevent recursive workflow triggers.

## Usage

```yaml
# .github/workflows/ai-sync.yml
name: AI Sync
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: write
  pull-requests: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          # Full history needed for accurate diff detection
          fetch-depth: 0
          # Use a token that can push back to the PR branch
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: Oreolion/ai-sync-plugin/packages/github-action@main
        with:
          auto-progress: 'true'
          comment: 'true'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `sync-dir` | Path to the `.ai-sync/` directory relative to the repo root | No | `.ai-sync` |
| `auto-progress` | Automatically check off PROGRESS.md tasks that match changed files | No | `true` |
| `comment` | Post a PR comment with the sync status summary | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `tasks-completed` | Number of tasks auto-completed by this run |
| `tasks-completed-list` | JSON array of task descriptions that were auto-completed |
| `total-progress` | Total number of completed tasks across all phases |
| `total-tasks` | Total number of tasks across all phases |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Token for GitHub API access (PR comments, file listing) | Yes |

## How Auto-Progress Works

The action reads `PROGRESS.md` and checks each unchecked task against the list of files changed in the PR. A task is considered matched when:

- The task text contains the exact file path (e.g., `Create src/auth.ts` matches `src/auth.ts`)
- The task text contains the file basename (e.g., `auth module` matches `auth.ts` if the basename is sufficiently long)
- The task text contains a backtick-quoted path that matches (e.g., `` `src/auth.ts` `` matches `src/auth.ts`)

## Graceful Behavior

- If `.ai-sync/` does not exist in the repository, the action logs an informational message and exits successfully. It will not fail your workflow.
- If the event is not a `pull_request`, the action exits gracefully.
- If no tasks match changed files, PROGRESS.md is left unchanged.
- If no `.ai-sync/` files were modified, no commit is created.

## PR Comment Format

The action posts (or updates) a comment on the PR:

```markdown
## AI Sync Status

**Phase:** Phase 3: API Implementation
**Progress:** 12/20 tasks (60%)
**Last Agent:** github-action

### Tasks auto-completed by this PR
- [x] Create `src/api/routes.ts`
- [x] Create `src/api/middleware.ts`

### Remaining in current phase
- [ ] Add rate limiting
- [ ] Write API documentation
```

On subsequent pushes to the same PR, the existing comment is updated rather than posting a new one.

## Prerequisites

Your repository must have a `.ai-sync/` directory initialized. Use one of these methods:

- **Claude Code plugin**: Run `/sync-init` in your project
- **CLI**: Run `npx @oreolion/ai-sync init`
- **Manual**: Create `.ai-sync/HANDOFF.md` and `.ai-sync/PROGRESS.md` following the [protocol format](https://github.com/Oreolion/ai-sync-plugin/blob/main/skills/ai-sync-protocol/SKILL.md)

## Development

```bash
cd packages/github-action
npm install
npm run build
```

The build step compiles TypeScript and bundles with `@vercel/ncc` into a single `dist/index.js` file, which is what GitHub Actions executes.

## License

MIT
