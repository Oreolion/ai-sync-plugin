import { Hono } from 'hono';
import type { Env, CreateSessionBody, ApiResponse, Session } from '../types';

const sessions = new Hono<{ Bindings: Env }>();

// GET /api/projects/:id/sessions — List sessions for a project
sessions.get('/:id/sessions', async (c) => {
  const projectId = c.req.param('id');
  const limit = Math.min(Number(c.req.query('limit') || '50'), 100);
  const offset = Number(c.req.query('offset') || '0');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  )
    .bind(projectId, limit, offset)
    .all<Session>();

  return c.json<ApiResponse<Session[]>>({ data: results });
});

// POST /api/projects/:id/sessions — Create a new session log
sessions.post('/:id/sessions', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const body = await c.req.json<CreateSessionBody>().catch(() => null);

  if (!body || !body.agent || !body.timestamp || !body.content) {
    return c.json<ApiResponse>(
      { data: null, error: 'Missing required fields: agent, timestamp, content' },
      400
    );
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO sessions (project_id, agent, timestamp, summary, content) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(projectId, body.agent, body.timestamp, body.summary ?? null, body.content)
    .run();

  const created = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Session>();

  return c.json<ApiResponse<Session>>({ data: created }, 201);
});

// GET /api/projects/:id/sessions/:sid — Get a single session
sessions.get('/:id/sessions/:sid', async (c) => {
  const projectId = c.req.param('id');
  const sessionId = Number(c.req.param('sid'));

  if (isNaN(sessionId)) {
    return c.json<ApiResponse>({ data: null, error: 'Invalid session id' }, 400);
  }

  const row = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE id = ? AND project_id = ?'
  )
    .bind(sessionId, projectId)
    .first<Session>();

  if (!row) {
    return c.json<ApiResponse>({ data: null, error: 'Session not found' }, 404);
  }

  return c.json<ApiResponse<Session>>({ data: row });
});

export default sessions;
