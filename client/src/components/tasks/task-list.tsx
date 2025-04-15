import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { Task } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function TaskList() {
  const { tasks, isLoading, updateTask } = useTasks();
  const [updating, setUpdating] = useState<number | null>(null);

  const handleToggleTask = async (task: Task) => {
    setUpdating(task.id);
    try {
      const newStatus = task.status === "completed" ? "in_progress" : "completed";
      await updateTask(task.id, { status: newStatus });
      
      toast({
        title: `Task ${newStatus === "completed" ? "completed" : "reopened"}`,
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-white">
        <p className="text-gray-500">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleToggleTask(task)}
                  disabled={updating === task.id}
                  className="h-4 w-4 text-blue-500"
                />
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {task.projectId ? `Project: Project ${task.projectId}` : "Administrative"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <StatusBadge 
                  status={task.priority} 
                  className="mr-2"
                />
                {updating === task.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <span className="text-sm text-gray-500">
                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-6 py-4 bg-gray-50">
        <Button variant="link" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
          View all tasks <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
