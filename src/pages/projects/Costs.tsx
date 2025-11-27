import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { costsApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

export default function Costs() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { getUserRole, canEdit, canDelete } = useRole();
  const userRole = projectId ? getUserRole(projectId) : null;
  const canEditCosts = projectId ? canEdit(projectId) : false;
  const canDeleteCosts = projectId ? canDelete(projectId) : false;
  const [newService, setNewService] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPeriod, setNewPeriod] = useState("");

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["costs", projectId],
    queryFn: () => costsApi.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: costsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      toast.success("Cost entry added successfully");
      setNewService("");
      setNewAmount("");
      setNewPeriod("");
    },
    onError: () => {
      toast.error("Failed to add cost entry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: costsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      toast.success("Cost entry removed");
    },
    onError: () => {
      toast.error("Failed to remove cost entry");
    },
  });

  const handleAdd = () => {
    if (!newService.trim() || !newAmount.trim() || !newPeriod.trim()) {
      toast.error("All fields are required");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createMutation.mutate({
      service: newService,
      amount,
      period: newPeriod,
      projectId: projectId || "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this cost entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (isLoading) {
    return <div>Loading costs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Cost Tracking</h2>
        {userRole && (
          <Badge variant={userRole === 'Admin' ? 'default' : userRole === 'Editor' ? 'secondary' : 'outline'}>
            {userRole}
          </Badge>
        )}
      </div>
      <div className="border rounded-lg p-4 bg-primary/5">
        <div className="text-sm text-muted-foreground">Total Monthly Cost</div>
        <div className="text-3xl font-bold text-primary">${totalCosts.toFixed(2)}</div>
      </div>

      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">Add New Cost</h3>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Service name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            disabled={!canEditCosts}
          />
          <Input
            placeholder="Amount"
            type="number"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            disabled={!canEditCosts}
          />
          <Input
            placeholder="Period (e.g. 2025-01)"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            disabled={!canEditCosts}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button onClick={handleAdd} size="sm" className="gap-2" disabled={!canEditCosts}>
                <Plus className="h-4 w-4" />
                Add Cost
              </Button>
            </span>
          </TooltipTrigger>
          {!canEditCosts && <TooltipContent>Editor or Admin role required</TooltipContent>}
        </Tooltip>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No cost entries yet. Add your first cost entry above.
                </TableCell>
              </TableRow>
            ) : (
              costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{cost.service}</TableCell>
                  <TableCell>{cost.period}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(cost.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </TableCell>
                  <TableCell className="font-semibold">${cost.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cost.id)}
                            disabled={!canDeleteCosts}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canDeleteCosts && <TooltipContent>Admin role required</TooltipContent>}
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
