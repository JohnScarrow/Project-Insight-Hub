import { LayoutDashboard, FolderKanban, Clock, Shield, User, LogOut, ScrollText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Time Logs", url: "/time-logs", icon: Clock },
  { title: "RBAC", url: "/rbac", icon: Shield },
  { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isGlobalAdmin } = useRole();

  const filteredNavItems = mainNavItems.filter(item => {
    if (item.title === 'RBAC') return isGlobalAdmin();
    return true;
  });

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4">
            <h2 className="text-lg font-semibold text-sidebar-primary">Project Tracker</h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-sidebar-accent rounded-md transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent rounded-md transition-colors w-full">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              {open && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.email || 'Guest'}</span>
                  <span className="text-xs text-muted-foreground">{user?.name || 'User'}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/login')}>Switch User</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
