import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProjects() {
  const { toast } = useToast();

  // Get all projects
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<Project, "id">) => {
      // Ensure deadline is properly formatted as a Date object
      const formattedData = {
        ...projectData,
        deadline: projectData.deadline ? new Date(projectData.deadline) : null,
      };
      const res = await apiRequest("POST", "/api/projects", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      // Ensure deadline is properly formatted as a Date object if present
      const formattedData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
      };
      const res = await apiRequest("PUT", `/api/projects/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get projects by status
  const getProjectsByStatus = (status: string) => {
    return projects.filter((project) => project.status === status);
  };

  // Get upcoming deadlines
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    return projects
      .filter((project) => {
        if (!project.deadline) return false;

        const deadlineDate = new Date(project.deadline);
        return (
          deadlineDate >= today &&
          deadlineDate <= twoWeeksLater &&
          project.status !== "completed"
        );
      })
      .sort((a, b) => {
        if (!a.deadline || !b.deadline) return 0;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  };

  // Create a project
  const createProject = (projectData: Omit<Project, "id">) => {
    createProjectMutation.mutate(projectData);
  };

  // Update a project
  const updateProject = (id: number, data: Partial<Project>) => {
    updateProjectMutation.mutate({ id, ...data });
  };

  return {
    projects,
    isLoading,
    isError,
    createProject,
    updateProject,
    completedProjects: getProjectsByStatus("completed"),
    inProgressProjects: getProjectsByStatus("in_progress"),
    upcomingDeadlines: getUpcomingDeadlines(),
  };
}
