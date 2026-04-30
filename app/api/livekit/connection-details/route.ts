import { AccessToken } from "livekit-server-sdk";
import { RoomConfiguration } from "@livekit/protocol";
import { getProject, getProjectPrompts } from "@/lib/project/actions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Sandbox-Id",
};

/**
 * Generic system instructions injected into every embedded voice agent.
 * The project-specific persona / scope comes from the `prompt` field, which
 * is authored via the widget assistant and stored in the `prompts` table.
 */
const GENERIC_INSTRUCTIONS = `You are an embedded AI voice assistant powered by Stridify.

Follow the system prompt below for your role, tone, and scope. Keep replies
short and natural for spoken conversation, usually 1–3 sentences. If the
user asks something outside your scope, politely redirect them. If you don't
know an answer, say so clearly instead of guessing.`;

const DEFAULT_TTS = "inworld/inworld-tts-1:Ashley";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/livekit/connection-details
 *
 * Generates a LiveKit access token for an embed session. The agent's
 * instructions and prompt are loaded from the project's most recent prompt
 * row in the database (authored by the widget assistant).
 *
 * Request:
 *   Headers: X-Sandbox-Id - the project identifier
 *   Body:    { room_config?, room_name?, participant_name?, participant_identity? }
 */
export async function POST(req: Request) {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return Response.json(
      { error: "LiveKit environment variables not configured" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const sandboxId = req.headers.get("x-sandbox-id");
  if (!sandboxId) {
    return Response.json(
      { error: "Missing X-Sandbox-Id header" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const project = await getProject(sandboxId);
  if (!project) {
    return Response.json(
      { error: "Project not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const prompts = await getProjectPrompts(sandboxId);
  const latestPrompt = prompts.length > 0 ? prompts[prompts.length - 1] : null;
  const promptContent = latestPrompt?.content?.trim() ?? "";

  console.log("Generating LiveKit token with prompt:", promptContent);

  const metadata = JSON.stringify({
    instructions: GENERIC_INSTRUCTIONS,
    prompt: promptContent,
    tts: DEFAULT_TTS,
  });

  const body = await req.json().catch(() => ({}));

  const roomName = `embed-${sandboxId}-${crypto.randomUUID().slice(0, 8)}`;
  const participantIdentity =
    body.participant_identity ?? `embed-user-${Date.now()}`;
  const participantName = body.participant_name ?? "Embed User";

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: "15m",
    metadata,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  // Only attach an explicit RoomAgentDispatch when the caller specified an
  // agent_name. Setting `roomConfig.agents` without an agent_name forces
  // explicit dispatch and prevents the auto-dispatched worker from ever
  // joining the room (which is what broke voice playback).
  // if (body.room_config) {
  //   const rc = new RoomConfiguration(body.room_config);
  //   if (rc.agents && rc.agents.length > 0) {
  //     rc.agents[0].metadata = metadata;
  //   }
  //   at.roomConfig = rc;
  // }

  const participantToken = await at.toJwt();

  return Response.json(
    {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantName,
      participantToken,
    },
    { status: 200, headers: CORS_HEADERS },
  );
}
