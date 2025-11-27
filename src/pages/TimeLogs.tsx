import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeLogsApi } from "@/lib/api";

export default function TimeLogs() {
  const { data: allTimeLogs = [], isLoading } = useQuery({
    queryKey: ["timeLogs"],
    queryFn: () => timeLogsApi.getAll({}),
  });

  const totalHours = allTimeLogs.reduce((sum, log) => sum + (log.duration / 60), 0);
  const thisWeekHours = allTimeLogs
    .filter((log) => {
      const logDate = new Date(log.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return logDate > weekAgo;
    })
    .reduce((sum, log) => sum + (log.duration / 60), 0);

  const uniqueUsers = new Set(allTimeLogs.map((log) => log.userId)).size;

  if (isLoading) {
    return <div className="p-8">Loading time logs...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time Logs</h1>
        <p className="text-muted-foreground mt-1">Aggregated time tracking across all projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisWeekHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTimeLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No time logs yet. Start logging time in your projects.
                </TableCell>
              </TableRow>
            ) : (
              allTimeLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.userId}</TableCell>
                  <TableCell>{log.projectId}</TableCell>
                  <TableCell>{log.notes || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">{(log.duration / 60).toFixed(1)}h</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
