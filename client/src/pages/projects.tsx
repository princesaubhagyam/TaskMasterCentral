import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useProjects } from "@/hooks/use-projects";
import { Project } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const { toast } = useToast();
  const { projects, isLoading, updateProject } = useProjects();
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = search === "" || 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description?.toLowerCase().includes(search.toLowerCase()));
    
    // Status filter
    const matchesFilter = 
      filter === "all" || 
      (filter === "completed" && project.status === "completed") ||
      (filter === "in_progress" && project.status === "in_progress") ||
      (filter === "not_started" && project.status === "not_started");
    
    return matchesSearch && matchesFilter;
  });

  const activeProjects = filteredProjects.filter(p => p.status !== "completed");
  const completedProjects = filteredProjects.filter(p => p.status === "completed");

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (projectId: number, status: string) => {
    try {
      await updateProject(projectId, { status });
      toast({
        title: "Project updated",
        description: `Project status changed to ${status}`,
      });
      
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({
          ...selectedProject,
          status,
        });
      }
    } catch (error) {
      toast({
        title: "Error updating project",
        description: "Failed to update project status",
        variant: "destructive",
      });
    }
  };

  // Get tasks for the selected project
  const projectTasks = tasks.filter(task => 
    task.projectId === selectedProject?.id
  );

  return (
    <DashboardShell title="Projects">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={filter}
                onValueChange={setFilter}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 ml-auto">
                <Button 
                  variant={viewType === "grid" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewType("grid")}
                >
                  Grid
                </Button>
                <Button 
                  variant={viewType === "list" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewType("list")}
                >
                  List
                </Button>
                
                <CreateProjectDialog>
                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-1" />
                    New Project
                  </Button>
                </CreateProjectDialog>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active Projects
                {activeProjects.length > 0 && (
                  <Badge variant="info" className="ml-2">
                    {activeProjects.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed Projects
                {completedProjects.length > 0 && (
                  <Badge variant="success" className="ml-2">
                    {completedProjects.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-6">
              {viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      No active projects found
                    </div>
                  ) : (
                    activeProjects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </div>
              ) : (
                <DataTable
                  data={activeProjects}
                  loading={isLoading}
                  columns={[
                    {
                      header: "Name",
                      accessor: (project) => (
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description || "No description"}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Status",
                      accessor: (project) => <StatusBadge status={project.status} />,
                    },
                    {
                      header: "Deadline",
                      accessor: (project) => project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline",
                    },
                    {
                      header: "Action",
                      accessor: (project) => (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                        >
                          View
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              {viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      No completed projects found
                    </div>
                  ) : (
                    completedProjects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </div>
              ) : (
                <DataTable
                  data={completedProjects}
                  loading={isLoading}
                  columns={[
                    {
                      header: "Name",
                      accessor: (project) => (
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description || "No description"}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Status",
                      accessor: (project) => <StatusBadge status={project.status} />,
                    },
                    {
                      header: "Deadline",
                      accessor: (project) => project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline",
                    },
                    {
                      header: "Action",
                      accessor: (project) => (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                        >
                          View
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Project Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-sm">Status:</span>
                <StatusBadge status={selectedProject?.status || ""} />
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-sm">Deadline:</span>
                <span className="text-sm">
                  {selectedProject?.deadline 
                    ? format(new Date(selectedProject.deadline), "MMMM d, yyyy") 
                    : "No deadline"}
                </span>
              </div>
              <div className="pt-2">
                <label className="font-medium text-sm block mb-2">Update Status:</label>
                <Select
                  value={selectedProject?.status}
                  onValueChange={(value) => selectedProject && handleUpdateStatus(selectedProject.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Project Tasks</h3>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : projectTasks.length === 0 ? (
                <div className="text-sm text-gray-500 border rounded-md p-3 bg-gray-50">
                  No tasks associated with this project
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-40 overflow-y-auto">
                    {projectTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div className="flex items-center">
                          <Checkbox 
                            checked={task.status === "completed"} 
                            className="mr-2 h-4 w-4" 
                            disabled 
                          />
                          <span className={`text-sm ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                          </span>
                        </div>
                        <StatusBadge status={task.priority} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
