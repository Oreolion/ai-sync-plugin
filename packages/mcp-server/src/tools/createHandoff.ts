/**
 * Tool: sync_createHandoff
 * Write HANDOFF.md with provided data and return confirmation.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { writeHandoff } from "../protocol/writer.js";
import type { HandoffData } from "../protocol/types.js";

const inputSchema = {
  projectDir: z
    .string()
    .describe("Absolute path to the project directory. Defaults to cwd.")
    .default(process.cwd()),
  data: z.object({
    lastAgent: z.string().describe("Name of the agent creating the handoff"),
    timestamp: z
      .string()
      .describe("ISO-8601 timestamp of the handoff")
      .default(new Date().toISOString()),
    status: z.enum(["in-progress", "paused", "blocked", "completed"]),
    currentPhase: z.string().describe("Current phase name"),
    currentTask: z.string().describe("Current task description"),
    stopReason: z.enum([
      "rate-limit",
      "context-limit",
      "completed",
      "user-switch",
      "error",
    ]),
    sections: z
      .object({
        completed: z.string().optional(),
        inProgress: z.string().optional(),
        nextSteps: z.string().optional(),
        filesModified: z.string().optional(),
        blockers: z.string().optional(),
        keyDecisions: z.string().optional(),
        buildStatus: z.string().optional(),
      })
      .describe("Markdown content for each HANDOFF.md section"),
  }),
};

export function registerCreateHandoff(server: McpServer): void {
  server.tool(
    "sync_createHandoff",
    "Write .ai-sync/HANDOFF.md with the provided handoff data",
    inputSchema,
    async ({ projectDir, data }) => {
      try {
        const handoffData: HandoffData = {
          lastAgent: data.lastAgent,
          timestamp: data.timestamp,
          status: data.status,
          currentPhase: data.currentPhase,
          currentTask: data.currentTask,
          stopReason: data.stopReason,
          sections: data.sections,
        };

        await writeHandoff(projectDir, handoffData);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: "HANDOFF.md written successfully",
                  timestamp: handoffData.timestamp,
                  agent: handoffData.lastAgent,
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
              text: `Error writing HANDOFF.md: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
