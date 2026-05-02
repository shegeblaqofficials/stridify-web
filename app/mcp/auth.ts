/**
 * Lightweight bearer-token auth for the Stridify MCP endpoint.
 *
 * The LiveKit agent worker (or any other internal client) must present
 * `Authorization: Bearer <STRIDIFY_MCP_TOKEN>` on every request.
 */
export function authorize(
  req: Request,
): { ok: true } | { ok: false; res: Response } {
  const expected = process.env.STRIDIFY_MCP_TOKEN;
  if (!expected) {
    return {
      ok: false,
      res: new Response("MCP token not configured", { status: 500 }),
    };
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || value !== expected) {
    return { ok: false, res: new Response("Unauthorized", { status: 401 }) };
  }

  return { ok: true };
}
