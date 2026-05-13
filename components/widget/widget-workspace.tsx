"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/provider/account-provider";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { PageLoader } from "@/components/ui/page-loader";
import {
  getProject,
  getProjectPrompts,
  getWidgetProject,
  createWidgetProject,
  updateProjectStatus,
  updateProjectTitle,
  getVoices,
  type Voice,
} from "@/lib/project/actions";
import type { Project } from "@/model/project/project";
import type { WidgetProject } from "@/model/project/widget-project";
import {
  HiOutlineCog6Tooth,
  HiOutlineEye,
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { KnowledgeBaseOverlay } from "@/components/knowledge/knowledge-base-overlay";
import { WidgetPreviewPanel } from "./widget-preview-panel";
import { WidgetSetupPanel } from "./widget-setup-panel";

type MobileTab = "settings" | "preview";

interface WidgetWorkspaceProps {
  projectId: string;
}

export default function WidgetWorkspace({ projectId }: WidgetWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [widget, setWidget] = useState<WidgetProject | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [setupError, setSetupError] = useState(false);
  const { user, account, organization, loading } = useAccount();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProject(projectId),
      getWidgetProject(projectId),
      getProjectPrompts(projectId),
      getVoices(),
    ]).then(async ([proj, w, prompts, v]) => {
      if (cancelled) return;

      let resolvedWidget = w;
      if (!resolvedWidget && proj) {
        resolvedWidget = await createWidgetProject({
          projectId: proj.project_id,
          organizationId: proj.organization_id,
        });
      }

      if (!resolvedWidget) {
        setSetupError(true);
        setDataLoading(false);
        return;
      }

      setProject(proj);
      setWidget(resolvedWidget);
      setVoices(v);
      setSystemPrompt(
        prompts.length > 0 ? prompts[prompts.length - 1].content : "",
      );
      setDataLoading(false);
    });
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

  const handleGoLive = useCallback(async () => {
    if (!projectId || publishing || isLive) return;
    setPublishing(true);
    const ok = await updateProjectStatus(projectId, "deployed");
    setPublishing(false);
    if (ok) {
      setIsLive(true);
      setProject((p) => (p ? { ...p, status: "deployed" } : p));
    }
  }, [projectId, publishing, isLive]);

  if (loading || !user || !account || !organization || dataLoading) {
    return <PageLoader />;
  }

  if (setupError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="text-[15px] font-semibold">Widget project not found</p>
        <p className="text-[13px] text-muted-foreground">
          This project doesn&apos;t have a widget configuration. Please contact
          support or create a new widget project.
        </p>
        <a
          href="/projects"
          className="mt-2 text-[13px] text-accent underline underline-offset-2"
        >
          Back to projects
        </a>
      </div>
    );
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
        hideVersions
        hideMoreMenu
        deployLabel={isLive ? "Live" : publishing ? "Publishing…" : "Go Live"}
        deployIcon={isLive ? HiOutlineCheckCircle : HiOutlineRocketLaunch}
        deployDisabled={publishing || isLive}
        onDeployOverride={handleGoLive}
      />

      <div className="flex h-10 items-center border-b border-border bg-surface shrink-0 md:hidden">
        <TabButton
          active={mobileTab === "settings"}
          onClick={() => setMobileTab("settings")}
          icon={HiOutlineCog6Tooth}
          label="Agent"
        />
        <div className="w-px h-5 bg-border" />
        <TabButton
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
          icon={HiOutlineEye}
          label="Widget"
        />
      </div>

      <main className="flex flex-1 overflow-hidden relative">
        <div
          className={[
            "h-full w-full md:w-105 shrink-0 md:border-r md:border-border",
            mobileTab === "settings" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          {widget && (
            <WidgetSetupPanel
              projectId={projectId}
              organizationId={organization.organization_id}
              voices={voices}
              widget={widget}
              systemPrompt={systemPrompt}
              onOpenKnowledgeBase={() => setShowKnowledgeBase(true)}
              onWidgetChange={setWidget}
            />
          )}
        </div>

        <div
          className={[
            "flex flex-col flex-1 md:flex min-w-0",
            mobileTab === "preview" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <WidgetPreviewPanel projectId={projectId} />
        </div>

        <KnowledgeBaseOverlay
          open={showKnowledgeBase}
          onClose={() => setShowKnowledgeBase(false)}
          projectId={projectId}
          organizationId={organization.organization_id}
        />
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold transition-colors relative",
        active ? "text-foreground" : "text-muted-foreground",
      ].join(" ")}
    >
      <Icon className="size-3.5" />
      {label}
      {active && (
        <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-foreground" />
      )}
    </button>
  );
}
