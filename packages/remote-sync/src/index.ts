import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, ApiResponse, ProjectStats, Handoff } from './types';
import projects from './routes/projects';
import handoff from './routes/handoff';
import progress from './routes/progress';
import sessions from './routes/sessions';

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ───────────────────────────────────────────

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ── Health check ────────────────────────────────────────────────

app.get('/', (c) =>
  c.json({ status: 'ok', service: 'ai-sync-remote', version: '0.1.0' })
);

// ── Project routes ──────────────────────────────────────────────

app.route('/api/projects', projects);

// ── Handoff routes ──────────────────────────────────────────────

app.route('/api/projects', handoff);

// ── Progress routes ─────────────────────────────────────────────

app.route('/api/projects', progress);

// ── Session routes ──────────────────────────────────────────────

app.route('/api/projects', sessions);

// ── Stats route ─────────────────────────────────────────────────

app.get('/api/projects/:id/stats', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const handoffCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM handoffs WHERE project_id = ?'
  )
    .bind(projectId)
    .first<{ count: number }>();

  const sessionCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM sessions WHERE project_id = ?'
  )
    .bind(projectId)
    .first<{ count: number }>();

  const latestHandoff = await c.env.DB.prepare(
    'SELECT status FROM handoffs WHERE project_id = ? ORDER BY created_at DESC LIMIT 1'
  )
    .bind(projectId)
    .first<Pick<Handoff, 'status'>>();

  const completedCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM handoffs WHERE project_id = ? AND status = 'completed'"
  )
    .bind(projectId)
    .first<{ count: number }>();

  const totalHandoffs = handoffCount?.count ?? 0;
  const completedHandoffs = completedCount?.count ?? 0;
  const completionPercentage =
    totalHandoffs > 0 ? Math.round((completedHandoffs / totalHandoffs) * 100) : 0;

  const stats: ProjectStats = {
    handoff_count: totalHandoffs,
    session_count: sessionCount?.count ?? 0,
    latest_status: latestHandoff?.status ?? null,
    completion_percentage: completionPercentage,
  };

  return c.json<ApiResponse<ProjectStats>>({ data: stats });
});

// ── 404 fallback ────────────────────────────────────────────────

app.notFound((c) =>
  c.json<ApiResponse>({ data: null, error: 'Not found' }, 404)
);

// ── Global error handler ────────────────────────────────────────

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json<ApiResponse>({ data: null, error: 'Internal server error' }, 500);
});

export default app;
