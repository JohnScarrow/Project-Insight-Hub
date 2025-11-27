import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectLayout from "./pages/projects/ProjectLayout";
import Notes from "./pages/projects/Notes";
import Docs from "./pages/projects/Docs";
import Connections from "./pages/projects/Connections";
import Costs from "./pages/projects/Costs";
import Tasks from "./pages/projects/Tasks";
import Calendar from "./pages/projects/Calendar";
import Time from "./pages/projects/Time";
import Architecture from "./pages/projects/Architecture";
import Activity from "./pages/projects/Activity";
import Emails from "./pages/projects/Emails";
import TimeLogs from "./pages/TimeLogs";
import RBAC from "./pages/RBAC";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedAppLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <RoleProvider>
      <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectLayout />}>
                <Route path="notes" element={<Notes />} />
                <Route path="docs" element={<Docs />} />
                <Route path="connections" element={<Connections />} />
                <Route path="costs" element={<Costs />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="time" element={<Time />} />
                <Route path="architecture" element={<Architecture />} />
                <Route path="activity" element={<Activity />} />
                <Route path="emails" element={<Emails />} />
              </Route>
              <Route path="/time-logs" element={<TimeLogs />} />
              <Route path="/rbac" element={<RBAC />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      </SidebarProvider>
    </RoleProvider>
  );
}

import Login from './pages/Login';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedAppLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
