import { NavLink } from "@/components/NavLink";
import { useParams } from "react-router-dom";
import {
  FileText,
  File,
  Link as LinkIcon,
  DollarSign,
  CheckSquare,
  Calendar,
  Clock,
  Code,
  Activity,
  Mail,
} from "lucide-react";

const secondaryNavItems = [
  { title: "Notes", path: "notes", icon: FileText },
  { title: "Docs", path: "docs", icon: File },
  { title: "Connections", path: "connections", icon: LinkIcon },
  { title: "Costs", path: "costs", icon: DollarSign },
  { title: "Tasks", path: "tasks", icon: CheckSquare },
  { title: "Calendar", path: "calendar", icon: Calendar },
  { title: "Time Logging", path: "time", icon: Clock },
  { title: "Architecture", path: "architecture", icon: Code },
  { title: "Activity", path: "activity", icon: Activity },
  { title: "Email Accounts", path: "emails", icon: Mail },
];

export function ProjectSecondaryNav() {
  const { projectId } = useParams();

  return (
    <div className="w-56 border-r border-border bg-muted/30 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Project Details</h3>
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/projects/${projectId}/${item.path}`}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              activeClassName="bg-accent text-accent-foreground font-medium"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
