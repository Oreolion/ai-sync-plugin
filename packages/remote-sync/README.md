# @ai-sync/remote-sync

Cloudflare Workers API for ai-sync team handoff synchronization. Uses Hono for routing and Cloudflare D1 (SQLite) for persistence.

## Setup

```bash
npm install
```

## Local Development

Run the D1 migration locally, then start the dev server:

```bash
npm run db:migrate:local
npm run dev
```

The worker runs at `http://localhost:8787`.

## Deploy

1. Create a D1 database in your Cloudflare account:
   ```bash
   npx wrangler d1 create ai-sync
   ```
2. Update `wrangler.toml` with the real `database_id`.
3. Run the migration against production:
   ```bash
   npm run db:migrate
   ```
4. Deploy the worker:
   ```bash
   npm run deploy
   ```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/api/projects` | Register a project |
| GET | `/api/projects/:id` | Get project info |
| GET | `/api/projects/:id/handoff` | Get latest handoff |
| POST | `/api/projects/:id/handoff` | Create new handoff |
| GET | `/api/projects/:id/handoffs` | List handoff history |
| GET | `/api/projects/:id/progress` | Get current progress |
| PUT | `/api/projects/:id/progress` | Update progress |
| GET | `/api/projects/:id/sessions` | List sessions |
| POST | `/api/projects/:id/sessions` | Create session log |
| GET | `/api/projects/:id/sessions/:sid` | Get session detail |
| GET | `/api/projects/:id/stats` | Get project stats |

All responses use the envelope `{ data, error? }`.
