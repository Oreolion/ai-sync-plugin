/**
 * Tool: sync_getSessionHistory
 * Returns a list of session logs with metadata, most recent first.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listSessions } from "../protocol/reader.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
  limit: z
    .number()
    .int()
    .min(1)
    .describe("Maximum number of session entries to return")
    .optional(),
};

export function registerGetSessionHistory(server: McpServer): void {
  server.tool(
    "sync_getSessionHistory",
    "List .ai-sync/sessions/ log files with metadata, most recent first",
    inputSchema,
    async ({ projectDir, limit }) => {
      try {
        let sessions = await listSessions(projectDir);

        if (limit !== undefined) {
          sessions = sessions.slice(0, limit);
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  count: sessions.length,
                  sessions,
                },
                null,
                2
              ),
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
              text: `Error listing sessions: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
