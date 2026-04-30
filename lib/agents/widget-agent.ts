import { ToolLoopAgent, stepCountIs, InferAgentUIMessage, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { updateProjectPrompt } from "@/lib/project/actions";

/**
 * Metadata attached to widget-agent UI messages. Mirrors the shape used by
 * the coding agent so the chat panel can read token usage uniformly.
 */
export interface WidgetAgentMessageMetadata {
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  promptUpdated?: boolean;
}

const WIDGET_AGENT_INSTRUCTIONS = `You are the Stridify Widget Assistant.

Your job is to help the user craft and refine the *system prompt* that will
drive their embedded voice AI agent (the floating popup / iframe widget).
You don't build code, run sandboxes, or do anything else — you only help
shape the prompt.

## How you work

1. **Understand intent first.** When the user describes what they want their
   widget agent to do, restate it briefly to confirm. If the description is
   vague or ambiguous, ask one focused clarifying question before writing
   anything.

2. **Write a polished system prompt.** Once intent is clear, generate a
   well-structured prompt for the voice agent that covers:
   - the agent's role / persona,
   - the domain and tone (warm, professional, concise, etc.),
   - what it should and should not do,
   - how it should respond when it doesn't know something,
   - any opening greeting style.

   Keep it tight and useful — avoid filler. Don't change *what* the user
   wants the agent for; only refine *how* it's expressed.

3. **Save it with the tool.** When you have a good prompt, call the
   \`updatePrompt\` tool with the final text. Always do this immediately after
   producing or revising the prompt — never just paste the prompt in chat
   without saving it.

4. **Iterate.** If the user later asks for tweaks (tone, scope, examples),
   apply them and call \`updatePrompt\` again with the updated text.

## Style

- Talk to the user in plain, friendly English. Be short.
- After you save, briefly summarize what changed in one sentence.
- Never expose internal tool names or implementation details.

## Important rules

- Do NOT invent business facts, product names, pricing, or policies that the
  user didn't mention. Use placeholders like \`{{COMPANY_NAME}}\` if needed
  and ask the user to fill them in.
- Do NOT call \`updatePrompt\` with an empty or near-empty string.
- If the user is just chatting and hasn't given you enough to work with, ask
  a clarifying question instead of guessing.
`;

interface WidgetAgentDeps {
  projectId: string;
  organizationId: string;
  userId?: string;
  /** Called whenever the prompt is successfully updated, so the route can
   * surface that fact in metadata or refresh state after streaming. */
  onPromptUpdated?: (content: string) => void;
}

/**
 * Build a fresh widget agent bound to the given project. The agent has a
 * single tool — `updatePrompt` — which writes back to the `prompts` table
 * via a server action.
 */
export function createWidgetAgent({
  projectId,
  organizationId,
  userId,
  onPromptUpdated,
}: WidgetAgentDeps) {
  const updatePromptTool = tool({
    description:
      "Save the refined voice-agent system prompt for this project. " +
      "Call this whenever you produce or revise the prompt the user wants " +
      "their widget to use. Pass the final, complete prompt text — not a " +
      "diff or summary.",
    inputSchema: z.object({
      content: z
        .string()
        .min(20, "Prompt must be at least 20 characters")
        .describe(
          "The full system prompt for the voice agent. Should describe " +
            "role, tone, scope, and behavior. Plain text only.",
        ),
    }),
    execute: async ({ content }) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return { ok: false as const, error: "Prompt content is empty" };
      }
      const result = await updateProjectPrompt(
        projectId,
        organizationId,
        trimmed,
        userId,
      );
      if (!result) {
        return { ok: false as const, error: "Failed to save prompt" };
      }
      onPromptUpdated?.(trimmed);
      return {
        ok: true as const,
        promptId: result.prompt_id,
        contentPreview:
          trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed,
      };
    },
  });

  return new ToolLoopAgent({
    model: openai("gpt-5.4-mini"),
    instructions: WIDGET_AGENT_INSTRUCTIONS,
    tools: { updatePrompt: updatePromptTool },
    providerOptions: {
      openai: { parallelToolCalls: false },
    },
    stopWhen: stepCountIs(5),
  });
}

export type WidgetAgentUIMessage = InferAgentUIMessage<
  ReturnType<typeof createWidgetAgent>
>;
