"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@/provider/account-provider";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { ChatPanel, type TokenUsage } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { UpgradeModal } from "@/components/workspace/upgrade-modal";
import { PageLoader } from "@/components/ui/page-loader";
import { getProject, getProjectPrompts } from "@/lib/project/actions";
import { getProjectSnapshots } from "@/lib/snapshot/actions";
import type { Project } from "@/model/project/project";
import type { Prompt } from "@/model/project/prompt";
import type { Snapshot } from "@/model/project/snapshot";
import type { ProjectVersion } from "@/components/workspace/workspace-header";

interface WorkspaceProps {
  projectId: string;
}

export default function Workspace({ projectId }: WorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<Prompt | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [sandboxReady, setSandboxReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
    ]).then(([proj, prompts, snaps]) => {
      setProject(proj);
      if (prompts.length > 0) setInitialPrompt(prompts[0]);
      setSnapshots(snaps);
      setDataLoading(false);
    });
  }, [projectId]);

  // Warm up sandbox on load for existing projects with snapshots
  useEffect(() => {
    if (dataLoading || !project || sandboxReady) return;

    // Only warm up if there are snapshots (i.e. this project has been used before)
    // For brand-new projects, the sandbox will start on first chat message
    const hasSnapshots = snapshots.length > 0;
    if (!hasSnapshots) return;

    let cancelled = false;
    console.log(`[workspace] warming up sandbox for project ${projectId}...`);

    fetch("/api/sandbox/warmup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
      .then((res) => {
        if (res.status === 402) {
          setShowUpgradeModal(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        console.log(`[workspace] sandbox warm — previewUrl=${data.previewUrl}`);
        setSandboxReady(true);
        // Refresh project to pick up new preview_url
        refreshProject();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[workspace] sandbox warmup failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [
    dataLoading,
    project,
    snapshots,
    sandboxReady,
    projectId,
    refreshProject,
  ]);

  const handleStreamingComplete = useCallback(() => {
    console.log("[workspace] agent streaming complete, refreshing project...");
    refreshProject();
    setPreviewRefreshKey((k) => k + 1);
  }, [refreshProject]);

  if (loading || !user || !account || dataLoading) {
    return <PageLoader />;
  }

  const versions: ProjectVersion[] = snapshots.map((s) => ({
    id: s.snapshot_id,
    label: `v${s.version_number} — ${new Date(s.created_at).toLocaleDateString()}`,
  }));

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <WorkspaceHeader
        projectName={project?.title}
        versions={versions.length > 0 ? versions : undefined}
        activeVersionId={snapshots[0]?.snapshot_id}
        tokenUsage={tokenUsage}
      />
      <main className="flex flex-1 overflow-hidden">
        <ChatPanel
          projectId={projectId}
          initialPrompt={initialPrompt}
          isNewProject={snapshots.length === 0}
          onTokenUpdate={setTokenUsage}
          onStreamingComplete={handleStreamingComplete}
          onInsufficientBalance={() => setShowUpgradeModal(true)}
        />
        <PreviewPanel
          previewUrl={project?.preview_url ?? undefined}
          projectStatus={project?.status}
          refreshKey={previewRefreshKey}
        />
      </main>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
