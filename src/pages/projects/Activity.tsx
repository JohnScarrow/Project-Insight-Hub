import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, CheckSquare, Link as LinkIcon } from "lucide-react";

const activities = [
  { id: "1", user: "John Deegan", action: "Updated notes", timestamp: "2024-01-21 14:30", icon: FileText },
  { id: "2", user: "Sarah Smith", action: "Added new cost entry", timestamp: "2024-01-21 11:15", icon: DollarSign },
  { id: "3", user: "John Deegan", action: "Completed task: Header component", timestamp: "2024-01-20 16:45", icon: CheckSquare },
  { id: "4", user: "Mike Johnson", action: "Added new connection", timestamp: "2024-01-20 09:20", icon: LinkIcon },
  { id: "5", user: "John Deegan", action: "Updated project status", timestamp: "2024-01-19 13:00", icon: FileText },
];

export default function Activity() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Audit Log</h2>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <activity.icon className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium">{activity.user}</TableCell>
                <TableCell>{activity.action}</TableCell>
                <TableCell className="text-muted-foreground">{activity.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
