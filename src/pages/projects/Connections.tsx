import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { connectionsApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

export default function Connections() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditConns = projectId ? canEdit(projectId) : false;
  const canDeleteConns = projectId ? canDelete(projectId) : false;
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newConfig, setNewConfig] = useState("");

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["connections", projectId],
    queryFn: () => connectionsApi.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: connectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections", projectId] });
      toast.success("Connection added successfully");
      setNewName("");
      setNewType("");
      setNewConfig("");
    },
    onError: () => {
      toast.error("Failed to add connection");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: connectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections", projectId] });
      toast.success("Connection removed");
    },
    onError: () => {
      toast.error("Failed to remove connection");
    },
  });

  const handleAdd = () => {
    if (!newName.trim() || !newType.trim() || !newConfig.trim()) {
      toast.error("All fields are required");
      return;
    }

    createMutation.mutate({
      name: newName,
      type: newType,
      config: newConfig,
      projectId: projectId || "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this connection?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading connections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Connections</h2>
        {userRole && (
          <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
            {userRole}
          </Badge>
        )}
      </div>
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">Add New Connection</h3>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Connection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Type (API Key, DB, etc)"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Input
            placeholder="Config/Value"
            type="password"
            value={newConfig}
            onChange={(e) => setNewConfig(e.target.value)}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button onClick={handleAdd} size="sm" className="gap-2" disabled={!canEditConns}>
                <Plus className="h-4 w-4" />
                Add Connection
              </Button>
            </span>
          </TooltipTrigger>
          {!canEditConns && <TooltipContent>Editor or Admin role required</TooltipContent>}
        </Tooltip>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Config</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No connections yet. Add your first connection above.
                </TableCell>
              </TableRow>
            ) : (
              connections.map((conn) => (
                <TableRow key={conn.id}>
                  <TableCell className="font-medium">{conn.name}</TableCell>
                  <TableCell>{conn.type}</TableCell>
                  <TableCell className="font-mono text-sm">{conn.config}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(conn.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(conn.id)}
                            disabled={!canDeleteConns}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDeleteConns && <TooltipContent>Admin role required</TooltipContent>}
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
