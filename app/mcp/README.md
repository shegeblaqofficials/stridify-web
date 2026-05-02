# Stridify MCP Server

Internal Model Context Protocol endpoint used by the Stridify LiveKit agent
worker (and other internal clients) at runtime.

```
app/mcp/
├── [transport]/route.ts   # Next.js catch-all that mounts the adapter
├── auth.ts                # Bearer-token gate
├── tools.ts               # Tool registrations (the only file you usually touch)
└── README.md              # this file
```

## Transports

The `@vercel/mcp-adapter` exposes the same handler over several transports:

| Method | Path           | Transport                   |
| ------ | -------------- | --------------------------- |
| POST   | `/mcp/mcp`     | Streamable HTTP (preferred) |
| GET    | `/mcp/sse`     | Legacy SSE stream           |
| POST   | `/mcp/message` | Legacy SSE messages         |
| DELETE | `/mcp/...`     | Session cleanup             |

Use `/mcp/mcp` from the LiveKit worker.

## Auth

Set `STRIDIFY_MCP_TOKEN` in the environment (web app **and** worker). Every
request must send:

```
Authorization: Bearer <STRIDIFY_MCP_TOKEN>
```

Requests without a valid token are rejected with `401`.

## Tools

Defined in [tools.ts](./tools.ts).

| Tool                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `get_project_context`      | Fetch latest prompt + widget/telephony config for a project  |
| `update_project_prompt`    | Replace the system prompt for a project                      |
| `get_organization_balance` | Read remaining token balance for an org                      |
| `record_session_usage`     | Log a session and deduct its token cost from the org balance |

Add new tools by registering them inside `registerStridifyTools` in `tools.ts`.

## Connecting from the LiveKit worker (Python)

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client(
    "https://app.stridify.ai/mcp/mcp",
    headers={"Authorization": f"Bearer {os.environ['STRIDIFY_MCP_TOKEN']}"},
) as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()
        result = await session.call_tool(
            "get_project_context",
            {"projectId": project_id},
        )
```

## Local testing

```bash
curl -N -X POST http://localhost:3000/mcp/mcp \
  -H "Authorization: Bearer $STRIDIFY_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
