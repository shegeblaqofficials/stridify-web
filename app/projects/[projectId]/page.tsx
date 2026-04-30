import { use } from "react";
import { getProject } from "@/lib/project/actions";
import Workspace from "@/components/workspace/workspace";
import TelephonyWorkspace from "@/components/telephony/telephony-workspace";
import WidgetWorkspace from "@/components/widget/widget-workspace";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const { projectId } = use(params);
  const project = use(getProject(projectId));

  if (project?.agent_type === "telephony") {
    return <TelephonyWorkspace projectId={projectId} />;
  }

  if (project?.agent_type === "widget") {
    return <WidgetWorkspace projectId={projectId} />;
  }

  return <Workspace projectId={projectId} />;
}
