/**
 * Tool: sync_getHandoff
 * Returns HANDOFF.md as structured JSON (frontmatter fields + sections).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readHandoff } from "../protocol/reader.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
};

export function registerGetHandoff(server: McpServer): void {
  server.tool(
    "sync_getHandoff",
    "Read .ai-sync/HANDOFF.md and return it as structured JSON with frontmatter fields and sections",
    inputSchema,
    async ({ projectDir }) => {
      try {
        const handoff = await readHandoff(projectDir);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(handoff, null, 2),
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
              text: `Error reading HANDOFF.md: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
