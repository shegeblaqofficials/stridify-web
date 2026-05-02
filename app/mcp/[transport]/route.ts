import { createMcpHandler } from "@vercel/mcp-adapter";
import { registerStridifyTools } from "../tools";
import { authorize } from "../auth";

/**
 * Stridify MCP server entrypoint.
 *
 * Catch-all route handles every transport variant the adapter exposes:
 *   - POST /mcp/mcp          (Streamable HTTP, recommended)
 *   - GET  /mcp/sse          (legacy SSE)
 *   - POST /mcp/message      (legacy SSE messages)
 *
 * All tool implementations live in [tools.ts](./tools.ts); auth in
 * [auth.ts](./auth.ts). This file does nothing else.
 */
const mcpHandler = createMcpHandler(
  (server) => {
    registerStridifyTools(server);
  },
  {},
  {
    basePath: "/mcp",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV !== "production",
  },
);

async function gated(req: Request): Promise<Response> {
  const auth = authorize(req);
  if (!auth.ok) return auth.res;
  return mcpHandler(req);
}

export { gated as GET, gated as POST, gated as DELETE };
