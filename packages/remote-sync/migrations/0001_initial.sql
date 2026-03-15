-- Migration 0001: Initial schema
-- Creates core tables for ai-sync remote handoff synchronization.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  repo_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS handoffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  last_agent TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('in-progress','paused','blocked','completed')),
  current_phase TEXT,
  current_task TEXT,
  stop_reason TEXT CHECK(stop_reason IN ('rate-limit','context-limit','completed','user-switch','error')),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  content TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  agent TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_handoffs_project ON handoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
