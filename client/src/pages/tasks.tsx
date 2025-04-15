import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Filter, Calendar } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { toast } from "@/hooks/use-toast";

export default function Tasks() {
  const { tasks, isLoading, updateTask } = useTasks();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = search === "" || 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description?.toLowerCase().includes(search.toLowerCase()));
    
    // Status filter
    const matchesFilter = 
      filter === "all" || 
      (filter === "completed" && task.status === "completed") ||
      (filter === "in_progress" && task.status === "in_progress") ||
      (filter === "not_started" && task.status === "not_started");
    
    return matchesSearch && matchesFilter;
  });

  // Group tasks by their due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() + 7);

  const overdueTasksData = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== "completed";
  });

  const todayTasksData = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const tomorrowTasksData = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
  });

  const laterTasksData = filteredTasks.filter(task => {
    if (!task.dueDate) return task.status !== "completed";
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > tomorrow && dueDate <= thisWeek;
  });

  const completedTasksData = filteredTasks.filter(task => 
    task.status === "completed"
  );

  const renderTaskList = (taskList: Task[]) => (
    <div className="space-y-1">
      {taskList.length === 0 ? (
        <div className="py-4 text-center text-gray-500">
          No tasks found
        </div>
      ) : (
        taskList.map(task => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-white rounded-md border hover:shadow-sm"
          >
            <div className="flex items-center max-w-[70%]">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={() => handleToggleTask(task)}
                disabled={updating === task.id}
                className="h-4 w-4 text-blue-500"
              />
              <div className="ml-3 overflow-hidden">
                <p className={`text-sm font-medium truncate ${
                  task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"
                }`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={task.priority} />
              {updating === task.id && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <DashboardShell title="Tasks">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
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
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
                
                <CreateTaskDialog>
                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-1" />
                    New Task
                  </Button>
                </CreateTaskDialog>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming
                {(overdueTasksData.length + todayTasksData.length + tomorrowTasksData.length + laterTasksData.length) > 0 && (
                  <Badge variant="info" className="ml-1">
                    {overdueTasksData.length + todayTasksData.length + tomorrowTasksData.length + laterTasksData.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedTasksData.length > 0 && (
                  <Badge variant="success" className="ml-1">
                    {completedTasksData.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">
                All Tasks
                {filteredTasks.length > 0 && (
                  <Badge className="ml-1">
                    {filteredTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {/* Overdue Tasks */}
              {overdueTasksData.length > 0 && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-red-600 text-sm font-medium">Overdue</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2 pt-0">
                    {renderTaskList(overdueTasksData)}
                  </CardContent>
                </Card>
              )}
              
              {/* Today's Tasks */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 pt-0">
                  {renderTaskList(todayTasksData)}
                </CardContent>
              </Card>
              
              {/* Tomorrow's Tasks */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 pt-0">
                  {renderTaskList(tomorrowTasksData)}
                </CardContent>
              </Card>
              
              {/* Later Tasks */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Later This Week</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 pt-0">
                  {renderTaskList(laterTasksData)}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 pt-0">
                  {renderTaskList(completedTasksData)}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">All Tasks</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 pt-0">
                  {renderTaskList(filteredTasks)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardShell>
  );
}
