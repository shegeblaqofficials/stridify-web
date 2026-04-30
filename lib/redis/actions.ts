"use server";

import { loadChatMessages, saveChatMessages, deleteChatMessages } from "./chat";
import {
  getOrganizationMetrics as _getOrgMetrics,
  getOrganizationTokenUsage as _getOrgTokenUsage,
} from "./metrics";
import type { UIMessage } from "ai";

export async function getChatMessages(projectId: string): Promise<UIMessage[]> {
  return loadChatMessages(projectId);
}

export async function getWidgetChatMessages(
  projectId: string,
): Promise<UIMessage[]> {
  return loadChatMessages(`widget:${projectId}`);
}

export async function storeChatMessages(
  projectId: string,
  messages: UIMessage[],
): Promise<void> {
  return saveChatMessages(projectId, messages);
}

export async function clearChatMessages(projectId: string): Promise<void> {
  return deleteChatMessages(projectId);
}

// ── Metric server actions ─────────────────────────────────────────────

export async function getRedisOrganizationMetrics(organizationId: string) {
  return _getOrgMetrics(organizationId);
}

export async function getRedisOrganizationTokenUsage(organizationId: string) {
  return _getOrgTokenUsage(organizationId);
}
