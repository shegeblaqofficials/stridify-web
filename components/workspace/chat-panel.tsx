"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { Prompt } from "@/model/project/prompt";
import type {
  CodingAgentUIMessage,
  AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
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
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineCheck,
} from "react-icons/hi2";

const quickActions = [
  { label: "Add Feature", icon: HiOutlinePlus },
  { label: "Edit Voice Flow", icon: HiOutlineMicrophone },
  { label: "Change UI", icon: HiOutlinePaintBrush },
  { label: "Add API", icon: HiOutlineCodeBracket },
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
  isNewProject?: boolean;
  onTokenUpdate?: (usage: TokenUsage) => void;
  onStreamingComplete?: () => void;
  onInsufficientBalance?: () => void;
}

export function ChatPanel({
  projectId,
  initialPrompt,
  isNewProject,
  onTokenUpdate,
  onStreamingComplete,
  onInsufficientBalance,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const initialPromptSent = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent",
        body: { projectId },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat<CodingAgentUIMessage>({
    id: projectId,
    transport,
    onError(error) {
      // The transport throws on non-2xx. Check for 402 insufficient balance.
      if (
        error?.message?.includes("402") ||
        error?.message?.includes("insufficient_balance")
      ) {
        onInsufficientBalance?.();
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-send the initial prompt only for brand-new projects (no prior snapshots).
  // Returning projects just load the sandbox/iframe — the user can type to continue.
  useEffect(() => {
    if (
      isNewProject &&
      initialPrompt?.content &&
      !initialPromptSent.current &&
      messages.length === 0
    ) {
      initialPromptSent.current = true;
      sendMessage({ text: initialPrompt.content });
    }
  }, [isNewProject, initialPrompt, messages.length, sendMessage]);

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

  // Extract token usage from the latest assistant message metadata
  useEffect(() => {
    if (!onTokenUpdate) return;
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const metadata = lastAssistant?.metadata as
      | AgentMessageMetadata
      | undefined;
    if (metadata?.tokenUsage) {
      onTokenUpdate(metadata.tokenUsage);
    }
  }, [messages, onTokenUpdate]);

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
    <aside className="w-[420px] flex flex-col border-r border-border bg-surface shrink-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 workspace-scrollbar"
      >
        {messages.length === 0 && !initialPrompt ? (
          <div className="flex flex-col items-center justify-center text-center px-6 pt-24">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <HiOutlineSparkles className="size-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Build your agent</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Describe what you want to create and I&apos;ll help you build it.
            </p>
          </div>
        ) : (
          <>
            {/* Show initial prompt as first user message */}
            {initialPrompt && messages.length === 0 && (
              <div className="flex gap-3">
                <div className="size-7 rounded-full flex-shrink-0 flex items-center justify-center bg-surface-elevated border border-border">
                  <HiOutlineUser className="size-3.5 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-xl text-sm leading-relaxed bg-surface-elevated border border-border rounded-tl-none max-w-[85%]">
                  {initialPrompt.content}
                </div>
              </div>
            )}
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex gap-3">
                  <div className="size-7 rounded-full flex-shrink-0 flex items-center justify-center bg-surface-elevated border border-border">
                    <HiOutlineUser className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="p-3 rounded-xl text-sm leading-relaxed bg-surface-elevated border border-border rounded-tl-none max-w-[85%]">
                    {message.parts?.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex gap-3">
                  <div className="size-7 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/10 border border-primary/20">
                    <HiOutlineCpuChip className="size-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
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
                      return null;
                    })}
                  </div>
                </div>
              ),
            )}
          </>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex gap-3">
            <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center">
              <HiOutlineCpuChip className="size-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
                <div
                  className="size-1.5 rounded-full bg-primary/60 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="size-1.5 rounded-full bg-primary/60 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-primary/60 font-medium">
                Processing
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-elevated text-muted-foreground border border-transparent hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1"
            >
              <action.icon className="size-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
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
            className="w-full h-32 p-4 pr-12 rounded-xl bg-surface-elevated border border-border focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm resize-none workspace-scrollbar placeholder:text-muted-foreground"
            placeholder="Describe the feature or logic you want to build..."
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
              disabled={isLoading || !input.trim()}
              className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
            >
              <HiOutlinePaperAirplane className="size-5" />
            </button>
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
};

type GroupedPart =
  | { kind: "reasoning"; text: string; isStreaming: boolean }
  | { kind: "text"; text: string }
  | { kind: "tool-group"; tools: ToolPartData[] };

function groupParts(
  parts: CodingAgentUIMessage["parts"] | undefined,
): GroupedPart[] {
  if (!parts) return [];
  const result: GroupedPart[] = [];
  let currentTools: ToolPartData[] | null = null;

  for (const part of parts) {
    const isToolPart = part.type.startsWith("tool-");

    if (isToolPart) {
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
      // step-start flushes tool group but renders nothing
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
    <div className="text-sm leading-relaxed text-foreground space-y-2">
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
  const preview = text.length > 140 ? text.slice(0, 140) + "\u2026" : text;

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-colors ${
        isStreaming
          ? "border-blue-500/30 bg-blue-500/5"
          : "border-border bg-surface-elevated/50"
      }`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface-elevated/50 transition-colors"
      >
        <div
          className={`flex items-center justify-center size-5 rounded ${
            isStreaming
              ? "bg-blue-500/10 text-blue-400"
              : "bg-surface-elevated text-muted-foreground"
          }`}
        >
          <HiOutlineLightBulb className="size-3" />
        </div>
        <span
          className={`font-medium ${
            isStreaming ? "text-blue-400" : "text-muted-foreground"
          }`}
        >
          Thinking
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 ml-0.5">
            <span className="size-1 rounded-full bg-blue-400 animate-pulse" />
            <span
              className="size-1 rounded-full bg-blue-400 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="size-1 rounded-full bg-blue-400 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        )}
        <HiOutlineChevronDown
          className={`ml-auto size-3 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Preview when collapsed */}
      {!expanded && text && (
        <div className="px-3 pb-2.5 -mt-1 text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-2">
          {preview}
        </div>
      )}

      {/* Full content when expanded */}
      {expanded && (
        <div className="border-t border-border/50 px-3 pb-3">
          <div className="pt-2.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
  const [expanded, setExpanded] = useState(true);
  const allComplete = tools.every((t) => t.state === "output-available");
  const runningCount = tools.filter(
    (t) => t.state !== "output-available",
  ).length;

  const writeCount = tools.filter((t) => t.type === "tool-writeFile").length;
  const readCount = tools.filter((t) => t.type === "tool-readFile").length;
  const cmdCount = tools.filter((t) => t.type === "tool-runCommand").length;
  const listCount = tools.filter((t) => t.type === "tool-listFiles").length;

  const headerParts: string[] = [];
  if (writeCount > 0)
    headerParts.push(`Edited ${writeCount} file${writeCount > 1 ? "s" : ""}`);
  if (readCount > 0)
    headerParts.push(`Read ${readCount} file${readCount > 1 ? "s" : ""}`);
  if (listCount > 0)
    headerParts.push(`Listed ${listCount} dir${listCount > 1 ? "s" : ""}`);
  if (cmdCount > 0)
    headerParts.push(`Ran ${cmdCount} command${cmdCount > 1 ? "s" : ""}`);
  const headerLabel = headerParts.join(" \u00b7 ");

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-colors ${
        allComplete
          ? "border-border bg-surface"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface-elevated/30 transition-colors"
      >
        <HiOutlineChevronRight
          className={`size-3 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <span className="font-semibold text-foreground truncate">
          {headerLabel}
        </span>
        <span className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {!allComplete && runningCount > 0 && (
            <span className="text-[10px] text-amber-400 font-medium">
              {runningCount} running
            </span>
          )}
          {allComplete ? (
            <HiOutlineCheck className="size-3.5 text-emerald-400" />
          ) : (
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border/50">
          {tools.map((tool, i) => (
            <ToolRow key={i} tool={tool} isLast={i === tools.length - 1} />
          ))}
        </div>
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
    "tool-writeFile": <HiOutlinePencilSquare className="size-3.5" />,
    "tool-readFile": <HiOutlineDocument className="size-3.5" />,
    "tool-listFiles": <HiOutlineFolderOpen className="size-3.5" />,
    "tool-runCommand": <HiOutlineCommandLine className="size-3.5" />,
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
      className={`flex items-center gap-2.5 px-3 py-2 text-xs ${
        !isLast ? "border-b border-border/30" : ""
      }`}
    >
      <span
        className={`flex items-center justify-center size-6 rounded ${
          isComplete
            ? "bg-surface-elevated text-muted-foreground"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {icon[tool.type] ?? <HiOutlineDocument className="size-3.5" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-medium text-foreground truncate">{name}</span>
          {dir && (
            <span className="text-[10px] text-muted-foreground truncate">
              {dir}
            </span>
          )}
        </div>
      </div>
      {lineCount && (
        <span className="text-[10px] font-semibold text-emerald-400 tabular-nums flex-shrink-0">
          +{lineCount.toLocaleString()}
        </span>
      )}
      {isComplete ? (
        <span className="size-2 rounded-full bg-emerald-400 flex-shrink-0" />
      ) : (
        <span className="size-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      )}
    </div>
  );
}
