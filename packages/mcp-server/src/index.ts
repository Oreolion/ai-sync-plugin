/**
 * @oreolion/ai-sync-mcp — MCP server exposing .ai-sync/ protocol as structured tools.
 *
 * Provides 6 tools for reading, writing, and managing the .ai-sync/ protocol files
 * (HANDOFF.md, PROGRESS.md, PLAN.md, and session logs) over the Model Context Protocol.
 *
 * Transport: stdio (local usage via npx or direct invocation).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerGetHandoff } from "./tools/getHandoff.js";
import { registerGetProgress } from "./tools/getProgress.js";
import { registerGetPlan } from "./tools/getPlan.js";
import { registerUpdateProgress } from "./tools/updateProgress.js";
import { registerCreateHandoff } from "./tools/createHandoff.js";
import { registerGetSessionHistory } from "./tools/getSessionHistory.js";

const server = new McpServer({
  name: "ai-sync",
  version: "1.0.0",
});

// Register all 6 protocol tools
registerGetHandoff(server);
registerGetProgress(server);
registerGetPlan(server);
registerUpdateProgress(server);
registerCreateHandoff(server);
registerGetSessionHistory(server);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
