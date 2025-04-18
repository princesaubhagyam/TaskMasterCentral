import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import EmployeeDashboard from "@/pages/employee-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import TimeTracking from "@/pages/time-tracking";
import Tasks from "@/pages/tasks";
import Projects from "@/pages/projects";
import Team from "@/pages/team";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import LeaveRequests from "@/pages/leave-requests";
import LeaveApprovals from "@/pages/leave-approvals";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Employee routes */}
      <ProtectedRoute
        path="/"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <EmployeeDashboard />
        )}
      />
      
      <ProtectedRoute
        path="/time-tracking"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <TimeTracking />
        )}
      />
      
      <ProtectedRoute
        path="/tasks"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <Tasks />
        )}
      />
      
      {/* Manager routes */}
      <ProtectedRoute
        path="/manager"
        allowedRoles={["manager", "admin"]}
        component={() => (
          <ManagerDashboard />
        )}
      />
      
      <ProtectedRoute
        path="/projects"
        allowedRoles={["manager", "admin"]}
        component={() => (
          <Projects />
        )}
      />
      
      <ProtectedRoute
        path="/team"
        allowedRoles={["manager", "admin"]}
        component={() => (
          <Team />
        )}
      />
      
      <ProtectedRoute
        path="/reports"
        allowedRoles={["manager", "admin"]}
        component={() => (
          <Reports />
        )}
      />
      
      {/* Leave Management */}
      <ProtectedRoute
        path="/leave-requests"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <LeaveRequests />
        )}
      />
      
      <ProtectedRoute
        path="/leave-approvals"
        allowedRoles={["manager", "admin"]}
        component={() => (
          <LeaveApprovals />
        )}
      />
      
      {/* Common Routes */}
      <ProtectedRoute
        path="/profile"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <Profile />
        )}
      />
      
      <ProtectedRoute
        path="/settings"
        allowedRoles={["employee", "manager", "admin"]}
        component={() => (
          <Settings />
        )}
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
