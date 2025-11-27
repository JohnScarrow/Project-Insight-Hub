import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { docsApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

export default function Docs() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditDocs = projectId ? canEdit(projectId) : false;
  const canDeleteDocs = projectId ? canDelete(projectId) : false;
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["docs", projectId],
    queryFn: () => docsApi.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: docsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", projectId] });
      toast.success("Document added successfully");
      setNewDocName("");
      setNewDocUrl("");
    },
    onError: () => {
      toast.error("Failed to add document");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: docsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", projectId] });
      toast.success("Document removed");
    },
    onError: () => {
      toast.error("Failed to remove document");
    },
  });

  const handleAdd = () => {
    if (!newDocName.trim() || !newDocUrl.trim()) {
      toast.error("Name and URL are required");
      return;
    }

    createMutation.mutate({
      title: newDocName,
      url: newDocUrl,
      projectId: projectId || "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        {userRole && (
          <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
            {userRole}
          </Badge>
        )}
      </div>
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">Add New Document</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Document name"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            disabled={!canEditDocs}
          />
          <Input
            placeholder="URL"
            value={newDocUrl}
            onChange={(e) => setNewDocUrl(e.target.value)}
            disabled={!canEditDocs}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button onClick={handleAdd} size="sm" className="gap-2" disabled={!canEditDocs}>
                <Plus className="h-4 w-4" />
                Add Document
              </Button>
            </span>
          </TooltipTrigger>
          {!canEditDocs && <TooltipContent>Editor or Admin role required</TooltipContent>}
        </Tooltip>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No documents yet. Add your first document above.
                </TableCell>
              </TableRow>
            ) : (
              docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {doc.url.length > 40 ? doc.url.substring(0, 40) + "..." : doc.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            disabled={!canDeleteDocs}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDeleteDocs && <TooltipContent>Admin role required</TooltipContent>}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
