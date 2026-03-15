import { Hono } from 'hono';
import type { Env, UpdateProgressBody, ApiResponse, Progress } from '../types';

const progress = new Hono<{ Bindings: Env }>();

// GET /api/projects/:id/progress — Get current progress for a project
progress.get('/:id/progress', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const row = await c.env.DB.prepare(
    'SELECT * FROM progress WHERE project_id = ? ORDER BY updated_at DESC LIMIT 1'
  )
    .bind(projectId)
    .first<Progress>();

  if (!row) {
    return c.json<ApiResponse>({ data: null, error: 'No progress found for this project' }, 404);
  }

  return c.json<ApiResponse<Progress>>({ data: row });
});

// PUT /api/projects/:id/progress — Create or update progress
progress.put('/:id/progress', async (c) => {
  const projectId = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(projectId)
    .first();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  const body = await c.req.json<UpdateProgressBody>().catch(() => null);

  if (!body || !body.content) {
    return c.json<ApiResponse>({ data: null, error: 'Missing required field: content' }, 400);
  }

  // Check if progress already exists for this project
  const existing = await c.env.DB.prepare(
    'SELECT id FROM progress WHERE project_id = ? ORDER BY updated_at DESC LIMIT 1'
  )
    .bind(projectId)
    .first<{ id: number }>();

  let row: Progress | null;

  if (existing) {
    // Update existing progress record
    await c.env.DB.prepare(
      "UPDATE progress SET content = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(body.content, existing.id)
      .run();

    row = await c.env.DB.prepare('SELECT * FROM progress WHERE id = ?')
      .bind(existing.id)
      .first<Progress>();
  } else {
    // Insert new progress record
    const result = await c.env.DB.prepare(
      'INSERT INTO progress (project_id, content) VALUES (?, ?)'
    )
      .bind(projectId, body.content)
      .run();

    row = await c.env.DB.prepare('SELECT * FROM progress WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<Progress>();
  }

  return c.json<ApiResponse<Progress>>({ data: row });
});

export default progress;
