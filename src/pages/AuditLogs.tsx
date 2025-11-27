import { useQuery } from "@tanstack/react-query";
import { auditLogsApi, AuditLog } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLogs() {
  const { user } = useAuth();

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.getAll({ limit: 200 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    if (action === 'CREATE') return 'default';
    if (action === 'UPDATE') return 'secondary';
    if (action === 'DELETE') return 'destructive';
    return 'outline';
  };

  const getResourceIcon = (resource: string) => {
    return resource.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            View all system activity and errors
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Clock className="h-3 w-3" />
          {logs?.length || 0} entries
        </Badge>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead className="w-[120px]">Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} className={!log.success ? 'bg-destructive/5' : ''}>
                  <TableCell>
                    {log.success ? (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getResourceIcon(log.resource)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{log.details || 'No details'}</p>
                      {log.errorMessage && (
                        <p className="text-xs text-destructive font-mono bg-destructive/10 p-1 rounded">
                          {log.errorMessage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        User: {log.userId || 'System'} | IP: {log.ipAddress || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
