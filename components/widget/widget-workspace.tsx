"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/provider/account-provider";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getProject, updateProjectTitle } from "@/lib/project/actions";
import { getWidgetChatMessages } from "@/lib/redis/actions";
import type { Project } from "@/model/project/project";
import type { UIMessage } from "ai";
import { HiOutlineChatBubbleLeftRight, HiOutlineEye } from "react-icons/hi2";
import { WidgetPreviewPanel } from "./widget-preview-panel";
import { WidgetChatPanel } from "./widget-chat-panel";

type MobileTab = "chat" | "preview";

interface WidgetWorkspaceProps {
  projectId: string;
}

export default function WidgetWorkspace({ projectId }: WidgetWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const { user, account, loading } = useAccount();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProject(projectId), getWidgetChatMessages(projectId)]).then(
      ([proj, msgs]) => {
        if (cancelled) return;
        setProject(proj);
        setInitialMessages(msgs);
        setDataLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleProjectNameChange = useCallback(
    async (newName: string) => {
      await updateProjectTitle(projectId, newName);
      setProject((p) => (p ? { ...p, title: newName } : p));
    },
    [projectId],
  );

  if (loading || !user || !account || dataLoading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <WorkspaceHeader
        projectId={projectId}
        projectName={project?.title}
        onProjectNameChange={handleProjectNameChange}
        snapshots={[]}
        activeSnapshotId={undefined}
        tokenUsage={null}
        onSaveVersion={async () => {}}
        saving={false}
      />

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
          Widget
          {mobileTab === "preview" && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-foreground" />
          )}
        </button>
      </div>

      <main className="flex flex-1 overflow-hidden">
        <div
          className={[
            "h-full md:flex",
            mobileTab === "chat" ? "flex w-full" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <WidgetChatPanel
            projectId={projectId}
            initialMessages={initialMessages}
          />
        </div>

        <div
          className={[
            "flex flex-col flex-1 md:flex",
            mobileTab === "preview" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <WidgetPreviewPanel projectId={projectId} />
        </div>
      </main>
    </div>
  );
}
