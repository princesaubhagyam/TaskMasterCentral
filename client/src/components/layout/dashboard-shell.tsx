import { useState, ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  title: string;
  children: ReactNode;
}

export function DashboardShell({ title, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          openSidebar={openSidebar} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
