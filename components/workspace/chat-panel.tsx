"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import type { Prompt } from "@/model/project/prompt";
import type {
  CodingAgentUIMessage,
  AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
import { checkProjectBalance } from "@/lib/project/actions";
import {
  HiOutlineUser,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
  HiOutlinePlus,
  HiOutlineMicrophone,
  HiOutlinePaintBrush,
  HiOutlineCodeBracket,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineDocument,
  HiOutlineCommandLine,
  HiOutlineFolderOpen,
  HiOutlinePencilSquare,
  HiOutlineLightBulb,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineBolt,
} from "react-icons/hi2";

const quickActions = [
  { label: "Add Feature", icon: HiOutlinePlus },
  { label: "Edit Voice Flow", icon: HiOutlineMicrophone },
  { label: "Change UI", icon: HiOutlinePaintBrush },
  { label: "Improve Conversation", icon: HiOutlineSparkles },
];

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface ChatPanelProps {
  projectId: string;
  initialPrompt?: Prompt | null;
  initialMessages?: UIMessage[];
  isNewProject?: boolean;
  sandboxReady?: boolean;
  balanceExhausted?: boolean;
  isSubscribed?: boolean;
  onTokenUpdate?: (usage: TokenUsage) => void;
  onStreamingComplete?: () => void;
  onInsufficientBalance?: () => void;
  onBuyCredits?: () => void;
}

export function ChatPanel({
  projectId,
  initialPrompt,
  initialMessages,
  isNewProject,
  sandboxReady = false,
  balanceExhausted: balanceExhaustedProp = false,
  isSubscribed = false,
  onTokenUpdate,
  onStreamingComplete,
  onInsufficientBalance,
  onBuyCredits,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [balanceExhaustedLocal, setBalanceExhaustedLocal] = useState(false);
  const initialPromptSent = useRef(false);

  const balanceExhausted = balanceExhaustedProp || balanceExhaustedLocal;

  // Reset local state when parent signals balance is restored
  useEffect(() => {
    if (!balanceExhaustedProp) setBalanceExhaustedLocal(false);
  }, [balanceExhaustedProp]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent",
        body: { projectId },
        // Only send the last message — history is loaded server-side from Redis
        prepareSendMessagesRequest({ messages, id }) {
          return {
            body: {
              message: messages[messages.length - 1],
              id,
              projectId,
            },
          };
        },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat<CodingAgentUIMessage>({
    id: projectId,
    messages: initialMessages as CodingAgentUIMessage[] | undefined,
    transport,
    onError(error) {
      // The transport throws on non-2xx. Check for 402 insufficient balance.
      if (
        error?.message?.includes("402") ||
        error?.message?.includes("insufficient_balance")
      ) {
        setBalanceExhaustedLocal(true);
        onInsufficientBalance?.();
        return;
      }
      // Stream may have been aborted server-side due to balance exhaustion.
      // Verify by checking the actual balance.
      checkProjectBalance(projectId).then(({ exhausted }) => {
        if (exhausted) {
          setBalanceExhaustedLocal(true);
          onInsufficientBalance?.();
        }
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-send the initial prompt only for brand-new projects (no prior snapshots).
  // Wait for sandboxReady so the agent route can reuse the warmup sandbox
  // instead of creating a duplicate.
  useEffect(() => {
    if (
      isNewProject &&
      sandboxReady &&
      initialPrompt?.content &&
      !initialPromptSent.current &&
      messages.length === 0
    ) {
      initialPromptSent.current = true;
      sendMessage({ text: initialPrompt.content });
    }
  }, [isNewProject, sandboxReady, initialPrompt, messages.length, sendMessage]);

  // Notify parent when streaming completes so it can refresh project data
  const prevStatus = useRef(status);
  useEffect(() => {
    if (
      prevStatus.current === "streaming" &&
      status === "ready" &&
      onStreamingComplete
    ) {
      onStreamingComplete();
    }
    prevStatus.current = status;
  }, [status, onStreamingComplete]);

  // Extract token usage and balance status from the latest assistant message metadata
  useEffect(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const metadata = lastAssistant?.metadata as
      | AgentMessageMetadata
      | undefined;
    if (metadata?.tokenUsage) {
      onTokenUpdate?.(metadata.tokenUsage);
    }
    if (metadata?.balanceExhausted && !balanceExhausted) {
      setBalanceExhaustedLocal(true);
      onInsufficientBalance?.();
    }
  }, [messages, onTokenUpdate, onInsufficientBalance, balanceExhausted]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <aside className="w-full md:w-[420px] h-full flex flex-col border-r border-border/60 bg-background shrink-0 min-h-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 workspace-scrollbar min-h-0"
      >
        {messages.length === 0 && !initialPrompt ? (
          <div className="flex flex-col items-center justify-center text-center px-6 pt-24">
            <div className="size-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <HiOutlineSparkles className="size-5 text-primary/80" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-foreground/90">
              Build your agent
            </h3>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Describe what you want to create and I&apos;ll help you build it.
            </p>
          </div>
        ) : (
          <>
            {/* Show initial prompt as first user message */}
            {initialPrompt && messages.length === 0 && (
              <div className="flex gap-2.5">
                <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-surface-elevated border border-border/60">
                  <HiOutlineUser className="size-3 text-muted-foreground/70" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-surface-elevated border border-border/40 max-w-[85%]">
                  {initialPrompt.content}
                </div>
              </div>
            )}
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-surface-elevated border border-border/60">
                    <HiOutlineUser className="size-3 text-muted-foreground/70" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-surface-elevated border border-border/40 max-w-[85%]">
                    {message.parts?.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-primary/8 border border-primary/15">
                    <HiOutlineCpuChip className="size-3 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {groupParts(message.parts).map((group, i) => {
                      if (group.kind === "reasoning")
                        return (
                          <ReasoningBlock
                            key={i}
                            text={group.text}
                            isStreaming={group.isStreaming}
                          />
                        );
                      if (group.kind === "text")
                        return <TextBlock key={i} text={group.text} />;
                      if (group.kind === "tool-group")
                        return (
                          <ToolOperationsGroup key={i} tools={group.tools} />
                        );
                      if (group.kind === "subagent")
                        return (
                          <SubagentBlock
                            key={i}
                            type={group.type}
                            input={group.input}
                            state={group.state}
                            output={group.output}
                            preliminary={group.preliminary}
                          />
                        );
                      return null;
                    })}
                  </div>
                </div>
              ),
            )}
          </>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex gap-2.5">
            <div className="size-6 rounded-full bg-primary/8 border border-primary/15 shrink-0 flex items-center justify-center">
              <HiOutlineCpuChip className="size-3 text-primary/70" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-elevated border border-border/40">
              <span className="flex items-center gap-0.5">
                <span className="size-1 rounded-full bg-primary/50 animate-pulse" />
                <span
                  className="size-1 rounded-full bg-primary/50 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1 rounded-full bg-primary/50 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="text-[11px] text-muted-foreground/60 font-medium">
                Processing
              </span>
            </div>
          </div>
        )}

        {/* Balance exhausted inline banner */}
        {balanceExhausted && (
          <div className="mx-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <HiOutlineBolt className="size-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Out of credits
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    Your progress has been saved. Upgrade your plan to keep
                    building.
                  </p>
                  {onBuyCredits && (
                    <button
                      type="button"
                      onClick={() => onBuyCredits()}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.97]"
                    >
                      <HiOutlineSparkles className="size-3" />
                      {isSubscribed ? "Buy 50,000 Credits" : "Upgrade Plan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions + Input — always pinned to bottom */}
      <div className="mt-auto shrink-0">
        <div className="px-3 pb-2 md:px-4">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface-elevated/80 text-muted-foreground/70 border border-border/40 hover:border-border hover:text-foreground/80 transition-all flex items-center gap-1.5"
              >
                <action.icon className="size-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 md:p-4 border-t border-border/60">
          {/* Processing indicator */}
          {isLoading && (
            <div className="flex items-center justify-end gap-1.5 pb-1.5 animate-in fade-in duration-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-medium text-red-500">
                Processing...
              </span>
            </div>
          )}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={balanceExhausted}
              className={`w-full h-20 md:h-28 p-3 md:p-3.5 pr-12 rounded-xl bg-surface-elevated border outline-none text-[13px] resize-none workspace-scrollbar placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                isLoading
                  ? "border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50"
                  : "border-border/50 focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              }`}
              placeholder={
                balanceExhausted
                  ? "Upgrade your plan to continue..."
                  : "Describe the feature or logic you want to build..."
              }
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-surface text-muted-foreground transition-colors"
              >
                <HiOutlinePaperClip className="size-5" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim() || balanceExhausted}
                className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                <HiOutlinePaperAirplane className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------- */

type ToolPartData = {
  type: string;
  input?: Record<string, unknown>;
  state: string;
  output?: unknown;
  preliminary?: boolean;
};

type GroupedPart =
  | { kind: "reasoning"; text: string; isStreaming: boolean }
  | { kind: "text"; text: string }
  | { kind: "tool-group"; tools: ToolPartData[] }
  | {
      kind: "subagent";
      type: string;
      input?: Record<string, unknown>;
      state: string;
      output?: unknown;
      preliminary?: boolean;
    };

const SUBAGENT_TOOL_TYPES = new Set([
  "tool-designPage",
  "tool-editSandbox",
  "tool-editContent",
  "tool-generateImage",
]);

function groupParts(
  parts: CodingAgentUIMessage["parts"] | undefined,
): GroupedPart[] {
  if (!parts) return [];
  const result: GroupedPart[] = [];
  let currentTools: ToolPartData[] | null = null;

  for (const part of parts) {
    const isToolPart = part.type.startsWith("tool-");
    const isSubagent = SUBAGENT_TOOL_TYPES.has(part.type);

    if (isSubagent) {
      // Flush any pending regular tool group
      if (currentTools) {
        result.push({ kind: "tool-group", tools: currentTools });
        currentTools = null;
      }
      result.push({
        kind: "subagent",
        type: part.type,
        input:
          "input" in part ? (part.input as Record<string, unknown>) : undefined,
        state: "state" in part ? String(part.state) : "",
        output: "output" in part ? part.output : undefined,
        preliminary:
          "preliminary" in part ? Boolean(part.preliminary) : undefined,
      });
    } else if (isToolPart) {
      if (!currentTools) currentTools = [];
      currentTools.push({
        type: part.type,
        input:
          "input" in part ? (part.input as Record<string, unknown>) : undefined,
        state: "state" in part ? String(part.state) : "",
        output: "output" in part ? part.output : undefined,
      });
    } else {
      if (currentTools) {
        result.push({ kind: "tool-group", tools: currentTools });
        currentTools = null;
      }
      if (part.type === "reasoning") {
        result.push({
          kind: "reasoning",
          text: part.text,
          isStreaming: part.state === "streaming",
        });
      } else if (part.type === "text") {
        result.push({ kind: "text", text: part.text });
      }
    }
  }

  if (currentTools) {
    result.push({ kind: "tool-group", tools: currentTools });
  }
  return result;
}

function extractFilename(path: string): { name: string; dir: string } {
  if (!path) return { name: "", dir: "" };
  const segments = path.replace(/^\//, "").split("/");
  const name = segments.pop() || path;
  const dir = segments.join("/");
  return { name, dir };
}

/* ---------------------------------------------------------------------------
 * TextBlock – renders agent text with paragraph spacing
 * ----------------------------------------------------------------------- */

function TextBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="text-[13px] leading-relaxed text-foreground/90 space-y-1.5">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ReasoningBlock – collapsible thinking display with streaming indicator
 * ----------------------------------------------------------------------- */

function ReasoningBlock({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border/60 bg-surface overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-surface-elevated/20 transition-colors"
      >
        <HiOutlineChevronRight
          className={`size-2.5 text-muted-foreground/60 transition-transform duration-150 shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <HiOutlineLightBulb className="size-3 text-muted-foreground/60 shrink-0" />
        <span className="font-medium text-muted-foreground/70 text-[11px]">
          Thinking
        </span>
        {isStreaming && (
          <span className="flex items-center gap-0.5 ml-0.5">
            <span className="size-1 rounded-full bg-sky-400 animate-pulse" />
            <span
              className="size-1 rounded-full bg-sky-400 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="size-1 rounded-full bg-sky-400 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/40 px-3 pb-2.5">
          <div className="pt-2 text-[11px] text-muted-foreground/70 leading-relaxed whitespace-pre-wrap">
            {text}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ToolOperationsGroup – collapsible panel grouping consecutive tool calls
 * ----------------------------------------------------------------------- */

function ToolOperationsGroup({ tools }: { tools: ToolPartData[] }) {
  const allComplete = tools.every((t) => t.state === "output-available");
  const [expanded, setExpanded] = useState(!allComplete);
  const runningCount = tools.filter(
    (t) => t.state !== "output-available",
  ).length;

  const writeCount = tools.filter((t) => t.type === "tool-writeFile").length;
  const readCount = tools.filter((t) => t.type === "tool-readFile").length;
  const cmdCount = tools.filter((t) => t.type === "tool-runCommand").length;
  const listCount = tools.filter((t) => t.type === "tool-listFiles").length;

  const headerParts: string[] = [];
  if (writeCount > 0)
    headerParts.push(`${writeCount} write${writeCount > 1 ? "s" : ""}`);
  if (readCount > 0)
    headerParts.push(`${readCount} read${readCount > 1 ? "s" : ""}`);
  if (listCount > 0)
    headerParts.push(`${listCount} dir${listCount > 1 ? "s" : ""}`);
  if (cmdCount > 0)
    headerParts.push(`${cmdCount} cmd${cmdCount > 1 ? "s" : ""}`);
  const headerLabel = headerParts.join(" \u00b7 ");

  return (
    <div className="rounded-xl border border-border/60 bg-surface overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-surface-elevated/20 transition-colors"
      >
        <HiOutlineChevronRight
          className={`size-2.5 text-muted-foreground/60 transition-transform duration-150 shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <HiOutlineCodeBracket className="size-3 text-muted-foreground/60 shrink-0" />
        <span className="font-medium text-foreground/80 truncate text-[11px]">
          {headerLabel}
        </span>
        <span className="ml-auto flex items-center gap-1.5 shrink-0">
          {!allComplete && runningCount > 0 && (
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {runningCount} running
            </span>
          )}
          {allComplete ? (
            <HiOutlineCheck className="size-3 text-emerald-400/80" />
          ) : (
            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border/40">
          {tools.map((tool, i) => (
            <ToolRow key={i} tool={tool} isLast={i === tools.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * SubagentBlock – renders a subagent delegation with nested operations
 * ----------------------------------------------------------------------- */

const SUBAGENT_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }
> = {
  "tool-designPage": {
    label: "Design Agent",
    icon: HiOutlinePaintBrush,
    accent: "text-violet-400",
  },
  "tool-editSandbox": {
    label: "Sandbox Agent",
    icon: HiOutlineCommandLine,
    accent: "text-sky-400",
  },
  "tool-editContent": {
    label: "Content Agent",
    icon: HiOutlinePencilSquare,
    accent: "text-emerald-400",
  },
  "tool-generateImage": {
    label: "Image Agent",
    icon: HiOutlineSparkles,
    accent: "text-amber-400",
  },
};

function SubagentBlock({
  type,
  input,
  state,
  output,
  preliminary,
}: {
  type: string;
  input?: Record<string, unknown>;
  state: string;
  output?: unknown;
  preliminary?: boolean;
}) {
  const [showTask, setShowTask] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = SUBAGENT_META[type] ?? {
    label: "Agent",
    icon: HiOutlineCpuChip,
    accent: "text-sky-400",
  };
  const Icon = meta.icon;

  const isStreaming = state === "output-available" && preliminary === true;
  const isComplete = state === "output-available" && !preliminary;
  const isWaiting = state !== "output-available";
  const taskDescription = (input?.task as string) ?? "";

  // Extract nested parts from subagent output (UIMessage)
  const outputMessage = output as
    | {
        parts?: Array<{
          type: string;
          text?: string;
          input?: Record<string, unknown>;
          state?: string;
          output?: unknown;
        }>;
      }
    | undefined;

  const nestedTools: ToolPartData[] = [];
  const nestedTexts: string[] = [];

  if (outputMessage?.parts) {
    for (const part of outputMessage.parts) {
      if (part.type.startsWith("tool-")) {
        nestedTools.push({
          type: part.type,
          input: part.input,
          state: part.state ?? "",
          output: part.output,
        });
      } else if (part.type === "text" && part.text?.trim()) {
        nestedTexts.push(part.text);
      }
    }
  }

  // Auto-scroll the file list to the bottom as new items stream in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [nestedTools.length]);

  return (
    <div className="rounded-xl border border-border/60 bg-surface overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className={`size-3.5 shrink-0 ${meta.accent}`} />
        <span className="text-xs font-medium text-foreground">
          {meta.label}
        </span>

        {/* Status badge */}
        <span className="ml-auto">
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
              <HiOutlineCheck className="size-3" />
              Done
            </span>
          ) : isStreaming ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-red-500">
              <span className="flex items-center gap-0.5">
                <span className="size-1 rounded-full bg-red-500 animate-pulse" />
                <span
                  className="size-1 rounded-full bg-red-500 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1 rounded-full bg-red-500 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              Working
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-red-500">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              Starting
            </span>
          )}
        </span>
      </div>

      {/* Task instruction — collapsible, default collapsed */}
      {taskDescription && (
        <div className="border-t border-border/40">
          <button
            onClick={() => setShowTask((v) => !v)}
            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <HiOutlineChevronRight
              className={`size-2.5 shrink-0 transition-transform duration-150 ${
                showTask ? "rotate-90" : ""
              }`}
            />
            <span>Task instruction</span>
          </button>
          {showTask && (
            <div className="px-3 pb-2.5 text-[11px] text-muted-foreground/80 leading-relaxed">
              {taskDescription}
            </div>
          )}
        </div>
      )}

      {/* Streaming file activity list */}
      {nestedTools.length > 0 && (
        <div
          ref={scrollRef}
          className="border-t border-border/40 max-h-40 overflow-y-auto workspace-scrollbar"
        >
          {nestedTools.map((tool, i) => (
            <FileActivityRow
              key={i}
              tool={tool}
              isLast={i === nestedTools.length - 1}
            />
          ))}
        </div>
      )}

      {/* Subagent summary / feedback — collapsible, default collapsed */}
      {nestedTexts.length > 0 && (
        <div className="border-t border-border/40">
          <button
            onClick={() => setShowSummary((v) => !v)}
            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <HiOutlineChevronRight
              className={`size-2.5 shrink-0 transition-transform duration-150 ${
                showSummary ? "rotate-90" : ""
              }`}
            />
            <span>Agent summary</span>
          </button>
          {showSummary && (
            <div className="px-3 pb-2.5 text-[11px] text-muted-foreground/80 leading-relaxed space-y-1">
              {nestedTexts.map((text, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading placeholder when waiting with no output yet */}
      {isWaiting && nestedTools.length === 0 && (
        <div className="border-t border-border/40 px-3 py-2 flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <span className="size-1 rounded-full bg-red-500 animate-pulse" />
            <span
              className="size-1 rounded-full bg-red-500 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="size-1 rounded-full bg-red-500 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </span>
          <span className="text-[10px] text-red-500 font-medium">
            Preparing...
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * FileActivityRow – streaming file change row inside SubagentBlock
 * Shows "edited src/foo.tsx", "read src/bar.tsx", etc. in real-time.
 * Done = green, active = blue.
 * ----------------------------------------------------------------------- */

const SANDBOX_PREFIX = /^\/?(vercel\/sandbox|sandbox)\//;

const FILE_ACTION_LABELS: Record<string, string> = {
  "tool-writeFile": "edited",
  "tool-readFile": "read",
  "tool-listFiles": "listed",
  "tool-runCommand": "ran",
  "tool-generateImage": "generated",
};

const FILE_ACTION_ICONS: Record<string, React.ReactNode> = {
  "tool-writeFile": <HiOutlinePencilSquare className="size-3" />,
  "tool-readFile": <HiOutlineDocument className="size-3" />,
  "tool-listFiles": <HiOutlineFolderOpen className="size-3" />,
  "tool-runCommand": <HiOutlineCommandLine className="size-3" />,
  "tool-generateImage": <HiOutlineSparkles className="size-3" />,
};

function stripSandboxPath(path: string): string {
  return path.replace(SANDBOX_PREFIX, "");
}

function FileActivityRow({
  tool,
  isLast,
}: {
  tool: ToolPartData;
  isLast: boolean;
}) {
  const isComplete = tool.state === "output-available";
  const action = FILE_ACTION_LABELS[tool.type] ?? "processed";
  const icon = FILE_ACTION_ICONS[tool.type] ?? (
    <HiOutlineDocument className="size-3" />
  );

  const input = tool.input as
    | Record<string, string | string[] | undefined>
    | undefined;
  const isCommand = tool.type === "tool-runCommand";

  const displayPath = isCommand
    ? `${input?.cmd ?? ""} ${Array.isArray(input?.args) ? input.args.join(" ") : ""}`.trim()
    : stripSandboxPath((input?.path as string) ?? "");

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] animate-in fade-in slide-in-from-bottom-1 duration-200 ${
        !isLast ? "border-b border-border/30" : ""
      }`}
    >
      {/* Icon — colored by state */}
      <span
        className={`shrink-0 ${isComplete ? "text-emerald-400" : "text-sky-400"}`}
      >
        {icon}
      </span>

      {/* Action label + path */}
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span
          className={`text-[10px] font-medium shrink-0 ${
            isComplete ? "text-emerald-400/80" : "text-sky-400/80"
          }`}
        >
          {action}
        </span>
        <span className="font-medium text-foreground/80 truncate">
          {displayPath}
        </span>
      </div>

      {/* Status dot */}
      {isComplete ? (
        <HiOutlineCheck className="size-3 text-emerald-400 shrink-0" />
      ) : (
        <span className="size-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ToolRow – individual file / command row inside the operations group
 * ----------------------------------------------------------------------- */

function ToolRow({ tool, isLast }: { tool: ToolPartData; isLast: boolean }) {
  const isComplete = tool.state === "output-available";

  const icon: Record<string, React.ReactNode> = {
    "tool-writeFile": <HiOutlinePencilSquare className="size-3" />,
    "tool-readFile": <HiOutlineDocument className="size-3" />,
    "tool-listFiles": <HiOutlineFolderOpen className="size-3" />,
    "tool-runCommand": <HiOutlineCommandLine className="size-3" />,
    "tool-generateImage": <HiOutlineSparkles className="size-3" />,
  };

  const input = tool.input as
    | Record<string, string | string[] | undefined>
    | undefined;
  const isCommand = tool.type === "tool-runCommand";
  const detail = isCommand
    ? `${input?.cmd ?? ""} ${Array.isArray(input?.args) ? input.args.join(" ") : ""}`.trim()
    : ((input?.path as string) ?? "");

  const { name, dir } = isCommand
    ? { name: detail, dir: "" }
    : extractFilename(detail);

  const lineCount =
    tool.type === "tool-writeFile" && input?.content
      ? String(input.content).split("\n").length
      : null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] ${
        !isLast ? "border-b border-border/30" : ""
      }`}
    >
      <span className="text-muted-foreground/50 shrink-0">
        {icon[tool.type] ?? <HiOutlineDocument className="size-3" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-medium text-foreground/80 truncate">
            {name}
          </span>
          {dir && (
            <span className="text-[10px] text-muted-foreground/50 truncate">
              {dir}
            </span>
          )}
        </div>
      </div>
      {lineCount && (
        <span className="text-[10px] font-medium text-emerald-400/70 tabular-nums shrink-0">
          +{lineCount.toLocaleString()}
        </span>
      )}
      {isComplete ? (
        <span className="size-1.5 rounded-full bg-emerald-400/60 shrink-0" />
      ) : (
        <span className="size-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
      )}
    </div>
  );
}
