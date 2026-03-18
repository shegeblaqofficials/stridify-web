import { use } from "react";
import Workspace from "@/components/workspace/workspace";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const { projectId } = use(params);
  return <Workspace projectId={projectId} />;
}
