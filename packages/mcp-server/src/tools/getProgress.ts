/**
 * Tool: sync_getProgress
 * Returns PROGRESS.md as phases array with tasks, completion counts, overall percentage.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readProgress } from "../protocol/reader.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
};

export function registerGetProgress(server: McpServer): void {
  server.tool(
    "sync_getProgress",
    "Read .ai-sync/PROGRESS.md and return phases with tasks, completion counts, and overall percentage",
    inputSchema,
    async ({ projectDir }) => {
      try {
        const progress = await readProgress(projectDir);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(progress, null, 2),
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
              text: `Error reading PROGRESS.md: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
