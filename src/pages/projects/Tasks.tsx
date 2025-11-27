import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { tasksApi, Task } from "@/lib/api";

interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
}

function TaskRow({
  task,
  level = 0,
  onToggle,
  onDelete,
  allTasks,
}: {
  task: TaskWithChildren;
  level?: number;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete?: (taskId: string) => void;
  allTasks: Task[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Find children from allTasks
  const children = allTasks.filter((t) => t.parentId === task.id);
  const hasChildren = children.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        />
        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
          {task.title}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={() => onDelete?.(task.id)}
                disabled={!onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          {!onDelete && <TooltipContent>Admin role required</TooltipContent>}
        </Tooltip>
      </div>
      {hasChildren &&
        isExpanded &&
        children.map((child) => (
          <TaskRow
            key={child.id}
            task={child as TaskWithChildren}
            level={level + 1}
            onToggle={onToggle}
            onDelete={onDelete}
            allTasks={allTasks}
          />
        ))}
    </>
  );
}

export default function Tasks() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditTasks = projectId ? canEdit(projectId) : false;
  const canDeleteTasks = projectId ? canDelete(projectId) : false;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    parentId: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => tasksApi.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task created successfully");
      setIsDialogOpen(false);
      setNewTask({ title: "", parentId: "" });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleToggle = (taskId: string, completed: boolean) => {
    updateMutation.mutate({ id: taskId, data: { completed } });
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Delete this task and all its subtasks?")) {
      deleteMutation.mutate(taskId);
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    createMutation.mutate({
      title: newTask.title,
      projectId: projectId || "",
      parentId: newTask.parentId || null,
      completed: false,
    });
  };

  // Get root tasks (those without parents)
  const rootTasks = tasks.filter((task) => !task.parentId);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Task List</h2>
          {userRole && (
            <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
              {userRole}
            </Badge>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Dialog open={isDialogOpen} onOpenChange={canEditTasks ? setIsDialogOpen : undefined}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2" disabled={!canEditTasks}>
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to this project</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title *</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Enter task title"
                      />
                    </div>
                    {/* Removed description/status/priority fields to align with current schema */}
                    <div className="space-y-2">
                      <Label htmlFor="parent">Parent Task (optional)</Label>
                      <Select
                        value={newTask.parentId || "none"}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, parentId: value === "none" ? "" : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None (root task)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (root task)</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>Create Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </span>
          </TooltipTrigger>
          {!canEditTasks && <TooltipContent>Editor or Admin role required</TooltipContent>}
        </Tooltip>
      </div>

      <div className="border rounded-lg p-2">
        {rootTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks yet. Create your first task to get started.
          </div>
        ) : (
          rootTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task as TaskWithChildren}
              onToggle={handleToggle}
              onDelete={canDeleteTasks ? handleDelete : undefined}
              allTasks={tasks}
            />
          ))
        )}
      </div>
    </div>
  );
}
