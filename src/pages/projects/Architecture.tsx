import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialArchitecture = [
  { id: "1", category: "Frontend", technology: "React + TypeScript", version: "18.3", purpose: "UI Framework" },
  { id: "2", category: "Backend", technology: "Node.js", version: "20.x", purpose: "API Server" },
  { id: "3", category: "Database", technology: "PostgreSQL", version: "15", purpose: "Primary Database" },
  { id: "4", category: "Hosting", technology: "Vercel", version: "-", purpose: "Frontend Hosting" },
];

export default function Architecture() {
  const [items, setItems] = useState(initialArchitecture);
  const [newCategory, setNewCategory] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newCategory || !newTech) return;
    
    setItems([
      ...items,
      {
        id: String(Date.now()),
        category: newCategory,
        technology: newTech,
        version: newVersion,
        purpose: newPurpose,
      },
    ]);
    setNewCategory("");
    setNewTech("");
    setNewVersion("");
    setNewPurpose("");
    toast({ title: "Technology added successfully" });
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Technology removed" });
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">Add Technology</h3>
        <div className="grid grid-cols-4 gap-3">
          <Input
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Input
            placeholder="Technology"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
          />
          <Input
            placeholder="Version"
            value={newVersion}
            onChange={(e) => setNewVersion(e.target.value)}
          />
          <Input
            placeholder="Purpose"
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Technology
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Technology</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell>{item.technology}</TableCell>
                <TableCell className="text-muted-foreground">{item.version}</TableCell>
                <TableCell>{item.purpose}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
