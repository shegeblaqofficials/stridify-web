"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import type {
  WidgetAgentUIMessage,
  WidgetAgentMessageMetadata,
} from "@/lib/agents/widget-agent";

interface WidgetChatPanelProps {
  projectId: string;
  initialMessages?: UIMessage[];
  onPromptUpdated?: () => void;
}

export function WidgetChatPanel({
  projectId,
  initialMessages,
  onPromptUpdated,
}: WidgetChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/widget-agent",
        body: { projectId },
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

  const { messages, sendMessage, status } = useChat<WidgetAgentUIMessage>({
    id: `widget-${projectId}`,
    messages: initialMessages as WidgetAgentUIMessage[] | undefined,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Notify parent whenever a message arrives that flagged a prompt update.
  useEffect(() => {
    if (!onPromptUpdated || messages.length === 0) return;
    const last = messages[messages.length - 1];
    const meta = last?.metadata as WidgetAgentMessageMetadata | undefined;
    if (meta?.promptUpdated) onPromptUpdated();
  }, [messages, onPromptUpdated]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full md:w-100 md:border-r border-border bg-surface">
      <div className="flex items-center gap-2 h-10 px-4 border-b border-border shrink-0">
        <HiOutlineSparkles className="size-4 text-foreground" />
        <span className="text-xs font-semibold text-foreground">
          Widget assistant
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
          Refines your agent&apos;s prompt
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.length === 0 && <EmptyState />}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2 text-sm justify-start">
            <AssistantAvatar />
            <div className="rounded-2xl px-3 py-2 text-xs bg-section-alt text-muted-foreground italic">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-3 shrink-0"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-foreground/20">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe what you want your agent to do…"
            className="flex-1 bg-transparent outline-none text-xs resize-none max-h-32 placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center size-7 rounded-lg bg-foreground text-background disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            aria-label="Send"
          >
            <HiOutlinePaperAirplane className="size-3.5" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/70 text-center">
          The assistant refines your prompt and saves it to your project.
        </p>
      </form>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
      <div className="size-10 rounded-full bg-section-alt flex items-center justify-center">
        <HiOutlineSparkles className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Shape your agent&apos;s prompt
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Tell the assistant what your widget should do — its role, tone, and
          scope. It&apos;ll write a polished prompt and save it for your voice
          agent.
        </p>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="size-6 rounded-full bg-section-alt flex items-center justify-center shrink-0 mt-0.5">
      <HiOutlineSparkles className="size-3.5 text-muted-foreground" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="size-6 rounded-full bg-section-alt flex items-center justify-center shrink-0 mt-0.5">
      <HiOutlineUser className="size-3.5 text-muted-foreground" />
    </div>
  );
}

interface MessageBubbleProps {
  message: WidgetAgentUIMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={[
        "flex gap-2 text-sm",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      {!isUser && <AssistantAvatar />}
      <div
        className={[
          "max-w-[85%] space-y-2",
          isUser ? "items-end" : "items-start",
        ].join(" ")}
      >
        {message.parts?.map((part, i) => {
          if (part.type === "text") {
            return (
              <div
                key={i}
                className={[
                  "rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                  isUser
                    ? "bg-foreground text-background"
                    : "bg-section-alt text-foreground",
                ].join(" ")}
              >
                {part.text}
              </div>
            );
          }

          if (part.type === "tool-updatePrompt") {
            return (
              <UpdatePromptToolPart
                key={i}
                state={part.state}
                output={part.output as ToolOutput | undefined}
              />
            );
          }

          return null;
        })}
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}

type ToolOutput =
  | { ok: true; promptId: string; contentPreview: string }
  | { ok: false; error: string };

interface UpdatePromptToolPartProps {
  state: string;
  output?: ToolOutput;
}

function UpdatePromptToolPart({ state, output }: UpdatePromptToolPartProps) {
  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-foreground/60 animate-pulse" />
        Saving prompt…
      </div>
    );
  }

  if (output?.ok) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 text-[11px] space-y-2">
        <div className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <HiOutlineCheckCircle className="size-3.5 text-emerald-500" />
          Prompt updated
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap line-clamp-6">
          {output.contentPreview}
        </p>
      </div>
    );
  }

  if (output && !output.ok) {
    return (
      <div className="inline-flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
        <HiOutlineExclamationCircle className="size-3.5 mt-0.5 shrink-0" />
        <span>Couldn&apos;t save prompt: {output.error}</span>
      </div>
    );
  }

  return null;
}
