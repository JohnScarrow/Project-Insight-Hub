import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { notesApi } from "@/lib/api";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";

export default function Notes() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditNotes = projectId ? canEdit(projectId) : false;
  const canDeleteNotes = projectId ? canDelete(projectId) : false;
  const [newNoteContent, setNewNoteContent] = useState("");

  console.log('[Notes] projectId:', projectId);
  console.log('[Notes] userRole:', userRole);
  console.log('[Notes] canEditNotes:', canEditNotes);
  console.log('[Notes] canDeleteNotes:', canDeleteNotes);

  // Fetch notes for this project
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: () => notesApi.getAll(projectId),
    enabled: !!projectId,
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      setNewNoteContent("");
      toast.success("Note added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create note");
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      toast.success("Note deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete note");
    },
  });

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !projectId) return;
    createMutation.mutate({
      projectId,
      content: newNoteContent,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold">Notes</h2>
        {userRole && (
          <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
            {userRole}
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <Textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="min-h-[120px]"
          placeholder="Write a new note..."
          disabled={!canEditNotes}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                onClick={handleAddNote} 
                disabled={!canEditNotes || createMutation.isPending || !newNoteContent.trim()}
                className="gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Note
              </Button>
            </span>
          </TooltipTrigger>
          {!canEditNotes && <TooltipContent>Editor or Admin role required</TooltipContent>}
        </Tooltip>
      </div>

      <div className="space-y-3">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(note.id)}
                        disabled={!canDeleteNotes || deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canDeleteNotes && <TooltipContent>Admin role required</TooltipContent>}
                </Tooltip>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
            <p>No notes yet. Add your first note above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
