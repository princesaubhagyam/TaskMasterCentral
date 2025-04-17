import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTasks(id: number | null) {
  const { toast } = useToast();

  // Get all tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, "id">) => {
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to get today's tasks
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      // Tasks due today or past due but not completed
      return (
        (taskDate.getTime() === today.getTime() || taskDate < today) &&
        task.status !== "completed"
      );
    });
  };

  // Create a task
  const createTask = (taskData: Omit<Task, "id">) => {
    createTaskMutation.mutate(taskData);
  };

  // Update a task
  const updateTask = (id: number, data: Partial<Task>) => {
    return updateTaskMutation.mutateAsync({ id, ...data });
  };

  return {
    tasks,
    todayTasks: getTodayTasks(),
    isLoading,
    isError,
    createTask,
    updateTask,
  };
}
