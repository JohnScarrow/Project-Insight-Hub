import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2 } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { timeLogsApi } from "@/lib/api";

export default function Time() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditTime = projectId ? canEdit(projectId) : false;
  const canDeleteTime = projectId ? canDelete(projectId) : false;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    hours: "",
    notes: "",
  });

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["timeLogs", projectId],
    queryFn: () => timeLogsApi.getAll({ projectId: projectId || "" }),
  });

  const createMutation = useMutation({
    mutationFn: timeLogsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeLogs", projectId] });
      toast.success("Time log added successfully");
      setIsDialogOpen(false);
      setNewLog({ hours: "", notes: "" });
    },
    onError: () => {
      toast.error("Failed to add time log");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: timeLogsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeLogs", projectId] });
      toast.success("Time log deleted");
    },
    onError: () => {
      toast.error("Failed to delete time log");
    },
  });

  const handleCreate = () => {
    if (!newLog.hours.trim()) {
      toast.error("Hours are required");
      return;
    }

    const hours = parseFloat(newLog.hours);
    if (isNaN(hours) || hours <= 0) {
      toast.error("Please enter a valid number of hours");
      return;
    }

    createMutation.mutate({
      duration: Math.round(hours * 60), // Convert hours to minutes
      notes: newLog.notes || null,
      projectId: projectId || "",
      userId: "cmidjywpb0000hag9wx0hsy0g", // TODO: Get from auth context
      taskId: null,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this time log?")) {
      deleteMutation.mutate(id);
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);

  if (isLoading) {
    return <div>Loading time logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold">Time Tracking</h2>
        {userRole && (
          <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
            {userRole}
          </Badge>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="border rounded-lg p-4 bg-primary/5 flex-1 mr-4">
          <div className="text-sm text-muted-foreground">Total Hours Logged</div>
          <div className="text-3xl font-bold text-primary">{totalHours.toFixed(1)}h</div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Dialog open={isDialogOpen} onOpenChange={canEditTime ? setIsDialogOpen : undefined}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!canEditTime}>
                    <Plus className="h-4 w-4" />
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                    <DialogDescription>Add time spent on this project</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours *</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.25"
                        placeholder="e.g. 2.5"
                        value={newLog.hours}
                        onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="What did you work on?"
                        value={newLog.notes}
                        onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Log Time</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </span>
          </TooltipTrigger>
          {!canEditTime && (
            <TooltipContent>
              Editor or Admin role required to log time
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No time logs yet. Start logging your time above.
                </TableCell>
              </TableRow>
            ) : (
              timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">{(entry.duration / 60).toFixed(1)}h</TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            disabled={!canDeleteTime}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDeleteTime && <TooltipContent>Admin role required</TooltipContent>}
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
