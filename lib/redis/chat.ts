import { redis } from "./client";
import type { UIMessage } from "ai";

// Key: chat:messages:{projectId}
const chatKey = (projectId: string) => `chat:messages:${projectId}`;

export async function loadChatMessages(
  projectId: string,
): Promise<UIMessage[]> {
  const messages = await redis.get<UIMessage[]>(chatKey(projectId));
  return messages ?? [];
}

export async function saveChatMessages(
  projectId: string,
  messages: UIMessage[],
): Promise<void> {
  // Store with 30-day TTL — active projects will keep refreshing
  await redis.set(chatKey(projectId), messages, { ex: 60 * 60 * 24 * 30 });
}

export async function deleteChatMessages(projectId: string): Promise<void> {
  await redis.del(chatKey(projectId));
}
