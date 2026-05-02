import {
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
} from "livekit-server-sdk";
import {
  getProject,
  getProjectPrompts,
  getTelephonyProject,
  getWidgetProject,
} from "@/lib/project/actions";

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

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

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

  // Pull project-type-specific config (voice, agent name, branding) so the
  // worker has everything it needs to spin up the right TTS / persona.
  const [widget, telephony, prompts] = await Promise.all([
    project.agent_type === "widget"
      ? getWidgetProject(sandboxId)
      : Promise.resolve(null),
    project.agent_type === "telephony"
      ? getTelephonyProject(sandboxId)
      : Promise.resolve(null),
    getProjectPrompts(sandboxId),
  ]);

  const latestPrompt = prompts.length > 0 ? prompts[prompts.length - 1] : null;
  const promptContent = latestPrompt?.content?.trim() ?? "";

  // Use the saved agent voice if it looks like a real TTS model ID (contains "/"),
  // otherwise fall back to the default.
  const savedVoice = widget?.agent_voice || telephony?.agent_voice;
  const jobContext = {
    projectId: project.project_id,
    instructions: GENERIC_INSTRUCTIONS,
    prompt: promptContent,
    tts: savedVoice ? savedVoice : DEFAULT_TTS,
  };

  const metadata = JSON.stringify(jobContext);

  const body = await req.json().catch(() => ({}));

  const roomName = `embed-${sandboxId}-${crypto.randomUUID().slice(0, 8)}`;
  const participantIdentity =
    body.participant_identity ?? `embed-user-${Date.now()}`;
  const participantName = "Embed User";

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: "15m",
  });
  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        metadata,
      }),
    ],
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

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
