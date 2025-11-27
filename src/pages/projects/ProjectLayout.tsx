import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProjectSecondaryNav } from "@/components/ProjectSecondaryNav";
import { projectsApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ProjectLayout() {
  const { projectId } = useParams();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  return (
    <div className="flex h-full">
      <ProjectSecondaryNav />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading...
                </span>
              ) : error ? (
                'Access denied'
              ) : (
                project?.name || "Project"
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {error ? 'You do not have permission to view this project.' : (project?.description || "Project details and management")}
            </p>
          </div>
          {!error ? <Outlet /> : null}
        </div>
      </div>
    </div>
  );
}
