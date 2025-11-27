import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const mockProjects = [
  { id: "1", name: "Website Redesign" },
  { id: "2", name: "Mobile App" },
  { id: "3", name: "API Integration" },
];

const mockTasks: Record<string, { id: string; name: string; parentId?: string }[]> = {
  "1": [
    { id: "t1", name: "Homepage Design" },
    { id: "t2", name: "Component Library", parentId: "t1" },
    { id: "t3", name: "User Testing" },
  ],
  "2": [
    { id: "t4", name: "Authentication" },
    { id: "t5", name: "Dashboard" },
  ],
  "3": [
    { id: "t6", name: "API Documentation" },
    { id: "t7", name: "Integration Testing" },
  ],
};

interface LogTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogTimeModal({ open, onOpenChange }: LogTimeModalProps) {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [isParentTask, setIsParentTask] = useState(true);
  const { toast } = useToast();

  const tasks = selectedProject ? mockTasks[selectedProject] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Time logged successfully",
      description: "Your time entry has been recorded.",
    });
    onOpenChange(false);
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input id="hours" type="number" step="0.5" min="0" placeholder="2.5" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="What did you work on?" rows={3} />
          </div>

          {selectedProject && tasks.length > 0 && (
            <div className="space-y-2">
              <Label>Tasks (optional)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-center gap-2 ${task.parentId ? 'ml-6' : ''}`}>
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <Label htmlFor={`task-${task.id}`} className="cursor-pointer">
                      {task.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <Label>Add New Task</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <Select value={isParentTask ? "parent" : "child"} onValueChange={(v) => setIsParentTask(v === "parent")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Time</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
