import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Clock, DollarSign, Users } from "lucide-react";

const metrics = [
  { title: "Active Projects", value: "12", icon: FolderKanban, change: "+2 this month" },
  { title: "Hours Logged", value: "342", icon: Clock, change: "+23 this week" },
  { title: "Monthly Costs", value: "$4,328", icon: DollarSign, change: "-5% vs last month" },
  { title: "Team Members", value: "8", icon: Users, change: "+1 this month" },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { project: "Website Redesign", action: "Updated tasks", time: "2 hours ago" },
                { project: "Mobile App", action: "Logged 4.5 hours", time: "5 hours ago" },
                { project: "API Integration", action: "Added new connection", time: "Yesterday" },
              ].map((activity, i) => (
                <div key={i} className="flex justify-between items-start border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{activity.project}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Projects by Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Website Redesign", hours: 127, percentage: 75 },
                { name: "Mobile App", hours: 89, percentage: 52 },
                { name: "API Integration", hours: 64, percentage: 38 },
              ].map((project) => (
                <div key={project.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">{project.hours}h</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${project.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
