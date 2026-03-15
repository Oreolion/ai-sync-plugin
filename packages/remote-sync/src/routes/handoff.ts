import { Hono } from 'hono';
import type { Env, CreateHandoffBody, ApiResponse, Handoff } from '../types';

const VALID_STATUSES = ['in-progress', 'paused', 'blocked', 'completed'] as const;
const VALID_STOP_REASONS = ['rate-limit', 'context-limit', 'completed', 'user-switch', 'error'] as const;

const handoff = new Hono<{ Bindings: Env }>();

// GET /api/projects/:id/handoff — Get latest handoff for a project
handoff.get('/:id/handoff', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const row = await c.env.DB.prepare(
    'SELECT * FROM handoffs WHERE project_id = ? ORDER BY created_at DESC LIMIT 1'
  )
    .bind(projectId)
    .first<Handoff>();

  if (!row) {
    return c.json<ApiResponse>({ data: null, error: 'No handoff found for this project' }, 404);
  }

  return c.json<ApiResponse<Handoff>>({ data: row });
});

// POST /api/projects/:id/handoff — Create a new handoff
handoff.post('/:id/handoff', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const body = await c.req.json<CreateHandoffBody>().catch(() => null);

  if (!body || !body.last_agent || !body.timestamp || !body.status || !body.content) {
    return c.json<ApiResponse>(
      { data: null, error: 'Missing required fields: last_agent, timestamp, status, content' },
      400
    );
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return c.json<ApiResponse>(
      { data: null, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      400
    );
  }

  if (body.stop_reason && !VALID_STOP_REASONS.includes(body.stop_reason)) {
    return c.json<ApiResponse>(
      { data: null, error: `Invalid stop_reason. Must be one of: ${VALID_STOP_REASONS.join(', ')}` },
      400
    );
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO handoffs (project_id, last_agent, timestamp, status, current_phase, current_task, stop_reason, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      projectId,
      body.last_agent,
      body.timestamp,
      body.status,
      body.current_phase ?? null,
      body.current_task ?? null,
      body.stop_reason ?? null,
      body.content
    )
    .run();

  const created = await c.env.DB.prepare('SELECT * FROM handoffs WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<Handoff>();

  return c.json<ApiResponse<Handoff>>({ data: created }, 201);
});

// GET /api/projects/:id/handoffs — List handoff history
handoff.get('/:id/handoffs', async (c) => {
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
    'SELECT * FROM handoffs WHERE project_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  )
    .bind(projectId, limit, offset)
    .all<Handoff>();

  return c.json<ApiResponse<Handoff[]>>({ data: results });
});

export default handoff;
