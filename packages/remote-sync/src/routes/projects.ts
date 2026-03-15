import { Hono } from 'hono';
import type { Env, CreateProjectBody, ApiResponse, Project } from '../types';

const projects = new Hono<{ Bindings: Env }>();

// POST /api/projects — Register a new project
projects.post('/', async (c) => {
  const body = await c.req.json<CreateProjectBody>().catch(() => null);

  if (!body || !body.id || !body.name) {
    return c.json<ApiResponse>({ data: null, error: 'Missing required fields: id, name' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM projects WHERE id = ?')
    .bind(body.id)
    .first();

  if (existing) {
    return c.json<ApiResponse>({ data: null, error: 'Project with this id already exists' }, 409);
  }

  await c.env.DB.prepare(
    'INSERT INTO projects (id, name, repo_url) VALUES (?, ?, ?)'
  )
    .bind(body.id, body.name, body.repo_url ?? null)
    .run();

  const project = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?')
    .bind(body.id)
    .first<Project>();

  return c.json<ApiResponse<Project>>({ data: project }, 201);
});

// GET /api/projects/:id — Get project info
projects.get('/:id', async (c) => {
  const id = c.req.param('id');

  const project = await c.env.DB.prepare('SELECT * FROM projects WHERE id = ?')
    .bind(id)
    .first<Project>();

  if (!project) {
    return c.json<ApiResponse>({ data: null, error: 'Project not found' }, 404);
  }

  return c.json<ApiResponse<Project>>({ data: project });
});

export default projects;
