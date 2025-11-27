import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialEmails = [
  { id: "1", email: "admin@project.com", purpose: "Admin Access", createdAt: "2024-01-10" },
  { id: "2", email: "support@project.com", purpose: "Support Tickets", createdAt: "2024-01-12" },
  { id: "3", email: "noreply@project.com", purpose: "Automated Emails", createdAt: "2024-01-15" },
];

export default function Emails() {
  const [emails, setEmails] = useState(initialEmails);
  const [newEmail, setNewEmail] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newEmail || !newPurpose) return;
    
    setEmails([
      ...emails,
      {
        id: String(Date.now()),
        email: newEmail,
        purpose: newPurpose,
        createdAt: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewEmail("");
    setNewPurpose("");
    toast({ title: "Email account added successfully" });
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast({ title: "Email account removed" });
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h3 className="font-semibold">Add Email Account</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Email address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            placeholder="Purpose"
            value={newPurpose}
            onChange={(e) => setNewPurpose(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Email Account
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="font-medium">{email.email}</TableCell>
                <TableCell>{email.purpose}</TableCell>
                <TableCell className="text-muted-foreground">{email.createdAt}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(email.id)}
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
