/**
 * Protocol module — re-exports reader and writer for external consumption.
 *
 * Usage:
 *   import { readHandoff, writeHandoff } from '@oreolion/ai-sync/protocol';
 */

export {
  readHandoff,
  readProgress,
  parseProgressContent,
  readPlan,
  listSessions,
  readSessionLog,
  hasAiSync,
  hasAiSyncFile,
} from './reader.js';

export {
  writeHandoff,
  writeProgress,
  writePlan,
  writeSessionLog,
  updateProgress,
  createAiSyncDir,
  generateHandoffContent,
  generateProgressContent,
} from './writer.js';

export type {
  HandoffData,
  HandoffFrontmatter,
  HandoffSections,
  HandoffStatus,
  StopReason,
  ProgressData,
  ProgressPhase,
  ProgressTask,
  SessionLogEntry,
  SessionLogData,
  AdapterTool,
  ProjectType,
} from '../types.js';
