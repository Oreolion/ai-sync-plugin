/**
 * Tool: sync_updateProgress
 * Toggle a specific task in PROGRESS.md and return the updated progress state.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { updateProgressTask } from "../protocol/writer.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
  phase: z
    .number()
    .int()
    .min(0)
    .describe("Zero-based index of the phase containing the task"),
  task: z
    .number()
    .int()
    .min(0)
    .describe("Zero-based index of the task within the phase"),
  checked: z
    .boolean()
    .describe("Whether to mark the task as checked (true) or unchecked (false)"),
};

export function registerUpdateProgress(server: McpServer): void {
  server.tool(
    "sync_updateProgress",
    "Toggle a specific task checkbox in .ai-sync/PROGRESS.md and return the updated progress",
    inputSchema,
    async ({ projectDir, phase, task, checked }) => {
      try {
        const updatedProgress = await updateProgressTask(
          projectDir,
          phase,
          task,
          checked
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(updatedProgress, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error updating PROGRESS.md: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
