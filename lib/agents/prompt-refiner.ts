"use server";

import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { AgentType } from "@/model/project/project";

export interface RefinedAgent {
  /** Final structured system prompt for the voice agent. */
  prompt: string;
  /**
   * Agent name extracted from the user's description, only when they
   * explicitly named the assistant (e.g. "an assistant called Maya").
   * `null` when no name was provided.
   */
  agentName: string | null;
  /**
   * A short, human-friendly project title (2–6 words) derived from the
   * user's description. Always set — the model is required to produce one.
   */
  projectTitle: string | null;
}

/**
 * Refine a raw user prompt into a polished system prompt for a voice AI
 * agent. Used at project-creation time for `telephony` and `widget` agents.
 *
 * The user's *intent* must not change. We only restructure and clarify.
 * If the user explicitly named the assistant, the model calls a tool to
 * surface that name so it can be persisted on the project row.
 */
const REFINER_SYSTEM = (channel: "voice phone" | "embedded voice widget") => `
You convert a short user description into a high-quality system prompt for a
${channel} AI agent. You do NOT change what the user wants the agent to do.
You only restructure it for clarity and add the structure a voice agent
needs.

You MUST call the \`setProjectTitle\` tool ONCE with a short, descriptive
title (2–6 words, Title Case, no quotes, no trailing punctuation) that
summarizes what this agent does — e.g. "Pizza Ordering Hotline",
"Dental Clinic Receptionist", "Support Voice Widget".

If — and ONLY if — the user explicitly gives the assistant a name
(e.g. "an assistant named Maya", "call her Ada", "the bot is called Rio"),
also call the \`setAgentName\` tool ONCE with that exact name. If no name
is given, do not call that tool.

After calling the required tool(s), output a single plain-text system
prompt (no markdown headings, no commentary, no preamble). Keep it tight:
120–250 words.

The prompt must cover:
- Role and persona (one short sentence).
- Domain and scope (what the agent handles, drawn only from the user's text).
- Tone (warm, concise, natural for spoken conversation).
- Response style: 1–3 sentence replies, plain language, no markdown.
- Out-of-scope handling: politely redirect.
- Unknowns: say so clearly instead of guessing.
- An opening line style (one short sentence describing how it greets).

Rules:
- Do NOT invent business names, prices, hours, policies, or facts the user
  did not provide. If a placeholder is needed, write it as {{COMPANY_NAME}}
  or similar.
- Do NOT include meta text like "Here is the prompt" — return only the
  prompt itself.
`;

export async function refineAgentPrompt(
  rawPrompt: string,
  agentType: AgentType,
): Promise<RefinedAgent> {
  const trimmed = rawPrompt.trim();
  if (!trimmed) return { prompt: trimmed, agentName: null, projectTitle: null };

  const channel =
    agentType === "telephony" ? "voice phone" : "embedded voice widget";

  let extractedName: string | null = null;
  let extractedTitle: string | null = null;

  const setProjectTitle = tool({
    description:
      "Set a short, human-friendly project title (2-6 words, Title Case) summarizing what this agent does. Required: call this exactly once.",
    inputSchema: z.object({
      title: z
        .string()
        .min(1)
        .max(80)
        .describe("Short project title, 2-6 words, Title Case."),
    }),
    execute: async ({ title }) => {
      const cleaned = title
        .trim()
        .replace(/^[\"'`]+|[\"'`]+$/g, "")
        .replace(/[.!?]+$/g, "")
        .slice(0, 80);
      if (cleaned) extractedTitle = cleaned;
      return { ok: true };
    },
  });

  const setAgentName = tool({
    description:
      "Record the assistant's name when, and only when, the user explicitly named it in their description. Pass the bare name, no quotes or honorifics.",
    inputSchema: z.object({
      name: z
        .string()
        .min(1)
        .max(40)
        .describe("The assistant's name as given by the user."),
    }),
    execute: async ({ name }) => {
      const cleaned = name.trim().replace(/^["'`]+|["'`]+$/g, "");
      if (cleaned) extractedName = cleaned;
      return { ok: true };
    },
  });

  try {
    const { text } = await generateText({
      model: openai("gpt-5.4-mini"),
      system: REFINER_SYSTEM(channel),
      prompt: `User description:\n\n${trimmed}\n\nWrite the system prompt now.`,
      tools: { setProjectTitle, setAgentName },
      stopWhen: stepCountIs(4),
    });
    return {
      prompt: text.trim() || trimmed,
      agentName: extractedName,
      projectTitle: extractedTitle,
    };
  } catch (err) {
    console.error("[prompt-refiner] failed, falling back to raw prompt:", err);
    return { prompt: trimmed, agentName: null, projectTitle: null };
  }
}
