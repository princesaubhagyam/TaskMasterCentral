import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, Clock, Clipboard, CalendarDays, 
  LayoutDashboard, Briefcase, Users, BarChart3, 
  CheckSquare, Settings, LogOut, Moon, Sun
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

export function Sidebar({ isSidebarOpen, closeSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, would actually toggle dark mode in the UI
  };

  const isEmployee = user?.role === "employee";
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-white border-r border-gray-200 overflow-y-auto md:translate-x-0 md:static md:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & App Name */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-semibold text-gray-800">TimeTracker</span>
          </div>
          <button onClick={closeSidebar} className="md:hidden rounded-md p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || "User"}</p>
              <div className="flex items-center">
                {isEmployee && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Employee</span>
                )}
                {isManager && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Manager</span>
                )}
                {isAdmin && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">Admin</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          {/* Employee Links */}
          {isEmployee && (
            <div className="space-y-1">
              <SidebarLink 
                href="/" 
                icon={<Home size={20} />} 
                title="Dashboard" 
                isActive={location === "/"} 
              />
              <SidebarLink 
                href="/time-tracking" 
                icon={<Clock size={20} />} 
                title="Time Tracking" 
                isActive={location === "/time-tracking"}
              />
              <SidebarLink 
                href="/tasks" 
                icon={<Clipboard size={20} />} 
                title="My Tasks" 
                isActive={location === "/tasks"}
              />
              <SidebarLink 
                href="/leave-requests" 
                icon={<CalendarDays size={20} />} 
                title="Leave Requests" 
                isActive={location === "/leave-requests"}
              />
            </div>
          )}

          {/* Manager Links */}
          {(isManager || isAdmin) && (
            <div className="space-y-1">
              <SidebarLink 
                href="/manager" 
                icon={<LayoutDashboard size={20} />} 
                title="Dashboard" 
                isActive={location === "/manager"}
              />
              <SidebarLink 
                href="/projects" 
                icon={<Briefcase size={20} />} 
                title="Projects" 
                isActive={location === "/projects"}
              />
              <SidebarLink 
                href="/team" 
                icon={<Users size={20} />} 
                title="Team" 
                isActive={location === "/team"}
              />
              <SidebarLink 
                href="/reports" 
                icon={<BarChart3 size={20} />} 
                title="Reports" 
                isActive={location === "/reports"}
              />
              <SidebarLink 
                href="/leave-approvals" 
                icon={<CheckSquare size={20} />} 
                title="Leave Approvals" 
                isActive={location === "/leave-approvals"}
              />
            </div>
          )}

          <Separator className="my-4" />
          
          {/* Common Links */}
          <div className="space-y-1">
            <SidebarLink 
              href="/settings" 
              icon={<Settings size={20} />} 
              title="Settings" 
              isActive={location === "/settings"}
            />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-normal px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-normal px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <>
                  <Sun size={20} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

function SidebarLink({ href, icon, title, isActive }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "group flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer",
        isActive
          ? "bg-blue-500 text-white"
          : "text-gray-600 hover:bg-gray-100"
      )}>
        <span className="mr-3">{icon}</span>
        {title}
      </a>
    </Link>
  );
}
