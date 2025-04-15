import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useProjects } from "@/hooks/use-projects";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Briefcase, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ManagerDashboard() {
  const [_, navigate] = useLocation();
  
  const { 
    projects, 
    isLoading: isLoadingProjects, 
    completedProjects,
    inProgressProjects,
    upcomingDeadlines
  } = useProjects();
  
  // Get team members (employees)
  const { 
    data: employees = [], 
    isLoading: isLoadingEmployees 
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  return (
    <DashboardShell title="Manager Dashboard">
      <div className="space-y-6">
        {/* Project Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Completed Projects */}
          <Card className="bg-white shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                {isLoadingProjects ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <>
                    <h2 className="text-lg font-medium text-gray-900">{completedProjects.length}</h2>
                    <p className="text-sm text-gray-500">Completed Projects</p>
                  </>
                )}
              </div>
            </div>
          </Card>
          
          {/* Active Projects */}
          <Card className="bg-white shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                {isLoadingProjects ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <>
                    <h2 className="text-lg font-medium text-gray-900">{inProgressProjects.length}</h2>
                    <p className="text-sm text-gray-500">Active Projects</p>
                  </>
                )}
              </div>
            </div>
          </Card>
          
          {/* Upcoming Deadlines */}
          <Card className="bg-white shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                {isLoadingProjects ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <>
                    <h2 className="text-lg font-medium text-gray-900">{upcomingDeadlines.length}</h2>
                    <p className="text-sm text-gray-500">Upcoming Deadlines</p>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Team Status */}
        <Card className="bg-white shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Team Status (Today)</h2>
            <Button 
              variant="link" 
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
              onClick={() => navigate("/team")}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-0">
            <DataTable
              data={employees}
              loading={isLoadingEmployees}
              columns={[
                {
                  header: "Employee",
                  accessor: (employee) => (
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${employee.username}`} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  accessor: () => <StatusBadge status="working" />,
                },
                {
                  header: "Hours Worked",
                  accessor: () => "6.5 / 8",
                },
                {
                  header: "Tasks Completed",
                  accessor: () => "3 / 5",
                },
                {
                  header: "Action",
                  accessor: (employee) => (
                    <Button 
                      variant="link" 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => navigate(`/team/${employee.id}`)}
                    >
                      View Details
                    </Button>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
        
        {/* Project Deadlines */}
        <Card className="bg-white shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Project Deadlines</h2>
            <Button 
              variant="link" 
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
              onClick={() => navigate("/projects")}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {isLoadingProjects ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {upcomingDeadlines.slice(0, 3).map((project) => (
                <li key={project.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                      <div className="mt-1 flex items-center">
                        <p className="text-sm text-gray-500">
                          {project.deadline ? (
                            `Due ${new Date(project.deadline).toLocaleDateString()}`
                          ) : (
                            'No deadline'
                          )}
                        </p>
                        <span className="ml-4">
                          <StatusBadge status={project.status} />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-4">
                        {/* Sample avatars for team members - in a real app, would show actual assignees */}
                        <Avatar className="h-6 w-6 ring-2 ring-white">
                          <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 ring-2 ring-white">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          <AvatarFallback>U2</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {Math.floor(Math.random() * 100)}%
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
