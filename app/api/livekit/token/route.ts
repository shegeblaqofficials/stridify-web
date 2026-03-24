import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { voiceTemplates } from "@/lib/livekit/templates";

/* ------------------------------------------------------------------ */
/*  POST /api/livekit/token?template=<slug>                            */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return Response.json(
      { error: "LiveKit environment variables not configured" },
      { status: 500 },
    );
  }

  /* ---- Resolve template metadata from query param ---- */
  const templateSlug = new URL(req.url).searchParams.get("template");

  if (!templateSlug) {
    return Response.json(
      { error: "Missing 'template' query parameter" },
      { status: 400 },
    );
  }

  const templateMeta = voiceTemplates[templateSlug];

  if (!templateMeta) {
    return Response.json(
      { error: `Unknown template: ${templateSlug}` },
      { status: 400 },
    );
  }

  const metadata = JSON.stringify(templateMeta);

  /* ---- Build token ---- */
  const body = await req.json().catch(() => ({}));

  const roomName =
    body.room_name ?? `${templateSlug}-${crypto.randomUUID().slice(0, 8)}`;
  const participantIdentity = body.participant_identity ?? `user-${Date.now()}`;
  const participantName = body.participant_name ?? "User";

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: "10m",
  });

  at.addGrant({ roomJoin: true, room: roomName });

  // If the client SDK sends room_config (e.g. from useSession with agentName),
  // merge it with our template metadata.  Otherwise build a fresh config.
  if (body.room_config) {
    const rc = new RoomConfiguration(body.room_config);
    if (rc.agents && rc.agents.length > 0) {
      rc.agents[0].metadata = metadata;
    }
    at.roomConfig = rc;
  } else {
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          metadata: metadata,
        }),
      ],
    });
  }

  const participantToken = await at.toJwt();

  return Response.json(
    { server_url: LIVEKIT_URL, participant_token: participantToken },
    { status: 201 },
  );
}
