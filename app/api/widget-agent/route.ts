import { NextRequest } from "next/server";
import { createAgentUIStreamResponse, createIdGenerator, UIMessage } from "ai";
import {
  createWidgetAgent,
  type WidgetAgentMessageMetadata,
} from "@/lib/agents/widget-agent";
import { getProject } from "@/lib/project/actions";
import { loadChatMessages, saveChatMessages } from "@/lib/redis/chat";

// Use a separate Redis chat key namespace for the widget so we don't collide
// with the coding-agent history of the same project id.
const widgetChatKey = (projectId: string) => `widget:${projectId}`;

export async function POST(req: NextRequest) {
  const { message, id: chatId, projectId } = await req.json();
  console.log(
    `[widget-agent] POST /api/widget-agent — projectId=${projectId}, chatId=${chatId}`,
  );

  if (!projectId || !message) {
    return Response.json(
      { error: "Missing projectId or message" },
      { status: 400 },
    );
  }

  const project = await getProject(projectId);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const organizationId = project.organization_id;

  // Load previous messages from Redis (separate key from the coding agent).
  const previousMessages = await loadChatMessages(widgetChatKey(projectId));
  const messages = [...previousMessages, message].filter(
    (m: UIMessage) => m.parts && m.parts.length > 0,
  );

  let promptUpdated = false;
  let inputTokens = 0;
  let outputTokens = 0;

  const agent = createWidgetAgent({
    projectId,
    organizationId,
    onPromptUpdated: () => {
      promptUpdated = true;
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    messageMetadata({ part }): WidgetAgentMessageMetadata | undefined {
      if (part.type === "finish-step") {
        inputTokens += part.usage.inputTokens ?? 0;
        outputTokens += part.usage.outputTokens ?? 0;
        return {
          tokenUsage: {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
          },
          ...(promptUpdated && { promptUpdated: true }),
        };
      }
      if (part.type === "finish") {
        return {
          tokenUsage: {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
          },
          ...(promptUpdated && { promptUpdated: true }),
        };
      }
      return undefined;
    },
    async onFinish({ messages: finalMessages }) {
      try {
        await saveChatMessages(widgetChatKey(projectId), finalMessages);
      } catch (err) {
        console.error("[widget-agent] failed to save messages:", err);
      }
    },
  });
}
