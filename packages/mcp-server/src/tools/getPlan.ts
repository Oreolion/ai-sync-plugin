/**
 * Tool: sync_getPlan
 * Returns PLAN.md content as text.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readPlan } from "../protocol/reader.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
};

export function registerGetPlan(server: McpServer): void {
  server.tool(
    "sync_getPlan",
    "Read .ai-sync/PLAN.md and return its full content as text",
    inputSchema,
    async ({ projectDir }) => {
      try {
        const plan = await readPlan(projectDir);
        return {
          content: [
            {
              type: "text" as const,
              text: plan,
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
              text: `Error reading PLAN.md: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
