"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "@/provider/account-provider";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { ChatPanel, type TokenUsage } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { UpgradeModal } from "@/components/workspace/upgrade-modal";
import { PageLoader } from "@/components/ui/page-loader";
import { getProject, getProjectPrompts } from "@/lib/project/actions";
import { getProjectSnapshots } from "@/lib/snapshot/actions";
import { getChatMessages } from "@/lib/redis/actions";
import type { Project } from "@/model/project/project";
import type { Prompt } from "@/model/project/prompt";
import type { Snapshot } from "@/model/project/snapshot";
import type { UIMessage } from "ai";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
  HiOutlineComputerDesktop,
  HiOutlineXMark,
} from "react-icons/hi2";
import { s } from "@upstash/redis";

type MobileTab = "chat" | "preview";

interface WorkspaceProps {
  projectId: string;
}

export default function Workspace({ projectId }: WorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<Prompt | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [sandboxLoading, setSandboxLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [balanceExhausted, setBalanceExhausted] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const { user, account, loading } = useAccount();

  const refreshProject = useCallback(async () => {
    const [proj, snaps] = await Promise.all([
      getProject(projectId),
      getProjectSnapshots(projectId),
    ]);
    if (proj) setProject(proj);
    setSnapshots(snaps);
  }, [projectId]);

  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getProjectPrompts(projectId),
      getProjectSnapshots(projectId),
      getChatMessages(projectId),
    ]).then(([proj, prompts, snaps, chatMessages]) => {
      setProject(proj);
      if (prompts.length > 0) setInitialPrompt(prompts[0]);
      setSnapshots(snaps);
      setInitialMessages(chatMessages);
      setDataLoading(false);
    });
  }, [projectId]);

  // Warm up sandbox on load for existing projects with snapshots.
  // Ref guard prevents React Strict Mode from firing two warmup requests.
  const warmupStarted = useRef(false);
  const handleInitializeSandbox = useCallback(() => {
    console.log("[workspace] initializing sandbox...");
    if (dataLoading || !project) return;
    if (warmupStarted.current) return;

    warmupStarted.current = true;
    console.log(`[workspace] warming up sandbox for project ${projectId}...`);

    fetch("/api/sandbox/warmup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
      .then((res) => {
        if (res.status === 402) {
          setBalanceExhausted(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        console.log(`[workspace] sandbox warm — previewUrl=${data.previewUrl}`);
        // Refresh project to pick up new preview_url
        setProject((p) => (p ? { ...p, preview_url: data.previewUrl } : p));
        setSandboxLoading(false);
      })
      .catch((err) => {
        setSandboxLoading(false);
        console.error("[workspace] sandbox warmup failed:", err);
      });
  }, [project, dataLoading, projectId, refreshProject]);

  useEffect(() => {
    handleInitializeSandbox();
  }, [handleInitializeSandbox]);

  const handleStreamingComplete = useCallback(async () => {
    console.log("[workspace] agent streaming complete");
    // Refresh project and snapshots to pick up any changes
    const [proj, snaps] = await Promise.all([
      getProject(projectId),
      getProjectSnapshots(projectId),
    ]);
    if (proj) setProject(proj);
    setSnapshots(snaps);
    setPreviewRefreshKey((k) => k + 1);
  }, [projectId]);

  if (loading || !user || !account || dataLoading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <WorkspaceHeader
        projectName={project?.title}
        snapshots={snapshots}
        activeSnapshotId={snapshots[0]?.snapshot_id}
        tokenUsage={tokenUsage}
      />

      {/* Mobile desktop-suggestion banner — phones only */}
      {showMobileBanner && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-primary/10 text-primary text-[11px] leading-tight border-b border-primary/15 shrink-0 sm:hidden animate-in fade-in slide-in-from-top-1 duration-300">
          <HiOutlineComputerDesktop className="size-3.5 shrink-0" />
          <span className="flex-1">
            For the best experience, use a desktop browser.
          </span>
          <button
            type="button"
            onClick={() => setShowMobileBanner(false)}
            className="p-0.5 rounded hover:bg-primary/10 transition-colors"
          >
            <HiOutlineXMark className="size-3.5" />
          </button>
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="flex h-10 items-center border-b border-border bg-surface shrink-0 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={[
            "flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold transition-colors relative",
            mobileTab === "chat" ? "text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <HiOutlineChatBubbleLeftRight className="size-3.5" />
          Chat
          {mobileTab === "chat" && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-foreground" />
          )}
        </button>
        <div className="w-px h-5 bg-border" />
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={[
            "flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold transition-colors relative",
            mobileTab === "preview"
              ? "text-foreground"
              : "text-muted-foreground",
          ].join(" ")}
        >
          <HiOutlineEye className="size-3.5" />
          Preview
          {mobileTab === "preview" && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-foreground" />
          )}
        </button>
      </div>

      <main className="flex flex-1 overflow-hidden">
        {/* Chat — full width on mobile when active, fixed width on desktop */}
        <div
          className={[
            "flex flex-col md:flex h-full transition-all duration-300 ease-in-out",
            mobileTab === "chat" ? "flex w-full" : "hidden",
            chatCollapsed
              ? "md:w-0 md:min-w-0 md:overflow-hidden md:opacity-0"
              : "md:w-auto md:opacity-100",
            "md:flex!",
          ].join(" ")}
        >
          <ChatPanel
            projectId={projectId}
            initialPrompt={initialPrompt}
            initialMessages={initialMessages}
            isNewProject={snapshots.length === 0}
            onTokenUpdate={setTokenUsage}
            onStreamingComplete={handleStreamingComplete}
            onInsufficientBalance={() => {
              setBalanceExhausted(true);
            }}
            onBuyCredits={() => setShowUpgradeModal(true)}
          />
        </div>

        {/* Preview — full width on mobile when active, flex-1 on desktop */}
        <div
          className={[
            "flex flex-col flex-1 md:flex",
            mobileTab === "preview" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <PreviewPanel
            previewUrl={project?.preview_url}
            projectStatus={project?.status ?? "draft"}
            refreshKey={previewRefreshKey}
            balanceExhausted={balanceExhausted}
            sandboxLoading={sandboxLoading}
            onUpgrade={() => setShowUpgradeModal(true)}
            chatCollapsed={chatCollapsed}
            onToggleChat={() => setChatCollapsed((c) => !c)}
          />
        </div>
      </main>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
