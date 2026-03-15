# @ai-sync/dashboard

Next.js 14 dashboard for ai-sync team handoff analytics. Displays project status, handoff history, progress tracking, and session timelines.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The dashboard runs at `http://localhost:3000` by default.

## Configuration

Set the API backend URL via environment variable:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

This defaults to `http://localhost:8787` (the remote-sync worker dev server).

## Pages

- **`/`** -- Lists all registered projects with status badges and progress bars.
- **`/projects/:id`** -- Full project detail: stats overview, latest handoff, progress content, handoff history, and session timeline.
