import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useQuery } from "@tanstack/react-query";
import { User, Task, TimeEntry } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Search, Loader2, ClipboardList, Clock } from "lucide-react";

export default function Team() {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch employee's tasks when an employee is selected
  const { data: employeeTasks = [], isLoading: isLoadingTasks } = useQuery<
    Task[]
  >({
    queryKey: ["/api/tasks", selectedEmployee?.id],
    enabled: !!selectedEmployee,
  });

  // Fetch employee's time entries when an employee is selected
  const { data: timeEntries = [], isLoading: isLoadingTimeEntries } = useQuery<
    TimeEntry[]
  >({
    queryKey: ["/api/time-entries", selectedEmployee?.id],
    enabled: !!selectedEmployee,
  });

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.role === "employee" &&
      (search === "" ||
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase()) ||
        employee.department?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleViewDetails = (employee: User) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  };

  // Calculate employee stats
  const calculateEmployeeStats = (employee: User) => {
    const isWorking = true; // In a real app, this would be determined by an API call
    const tasksCompleted = 3; // Sample value
    const tasksInProgress = 2; // Sample value

    return {
      isWorking,
      tasksCompleted,
      tasksInProgress,
    };
  };

  return (
    <DashboardShell title="Team">
      <div className="space-y-6">
        {/* Search */}
        <Card className="bg-white shadow">
          <CardContent className="p-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search team members..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No team members found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => {
              const stats = calculateEmployeeStats(employee);

              return (
                <Card key={employee.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={employee?.profile_img || ""}
                          alt={employee?.name || "User"}
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {employee.name}
                        </CardTitle>
                        <CardDescription>
                          {employee.department || "No department"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Email: </span>
                        <span className="font-medium">{employee.email}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <StatusBadge
                            status={stats.isWorking ? "working" : "on leave"}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Tasks Completed:
                          </span>
                          <span className="font-medium">
                            {stats.tasksCompleted}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Tasks In Progress:
                          </span>
                          <span className="font-medium">
                            {stats.tasksInProgress}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(employee)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Employee Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={selectedEmployee?.profile_img || ""}
                  alt={selectedEmployee?.name || "User"}
                />
                <AvatarFallback>
                  {selectedEmployee?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee?.department || "No department"} •{" "}
              {selectedEmployee?.email}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="tasks" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Tracking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4">
              {isLoadingTasks ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : employeeTasks.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  No tasks assigned to this employee
                </div>
              ) : (
                <DataTable
                  data={employeeTasks}
                  columns={[
                    {
                      header: "Task",
                      accessor: (task) => (
                        <div>
                          <div
                            className={`font-medium ${
                              task.status === "completed"
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      header: "Priority",
                      accessor: (task) => (
                        <StatusBadge status={task.priority || ""} />
                      ),
                    },
                    {
                      header: "Status",
                      accessor: (task) => (
                        <StatusBadge status={task.status || ""} />
                      ),
                    },
                    {
                      header: "Due Date",
                      accessor: (task) =>
                        task.dueDate
                          ? format(new Date(task.dueDate), "MMM d, yyyy")
                          : "No deadline",
                    },
                  ]}
                />
              )}
            </TabsContent>

            <TabsContent value="time" className="mt-4">
              {isLoadingTimeEntries ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  No time entries for this employee
                </div>
              ) : (
                <DataTable
                  data={timeEntries}
                  columns={[
                    {
                      header: "Date",
                      accessor: (entry) =>
                        format(new Date(entry.clockIn), "MMM d, yyyy"),
                    },
                    {
                      header: "Clock In",
                      accessor: (entry) =>
                        format(new Date(entry.clockIn), "h:mm a"),
                    },
                    {
                      header: "Clock Out",
                      accessor: (entry) =>
                        entry.clockOut
                          ? format(new Date(entry.clockOut), "h:mm a")
                          : "Still working",
                    },
                    {
                      header: "Hours",
                      accessor: (entry) =>
                        entry.totalHours ? entry.totalHours.toFixed(2) : "-",
                    },
                    {
                      header: "Status",
                      accessor: (entry) => (
                        <StatusBadge
                          status={
                            entry.status === "in_progress"
                              ? "working"
                              : "completed"
                          }
                        />
                      ),
                    },
                  ]}
                />
              )}

              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">Today</div>
                    <div className="text-xl font-bold">
                      {isLoadingTimeEntries ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        "4.5 hrs"
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">This Week</div>
                    <div className="text-xl font-bold">
                      {isLoadingTimeEntries ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        "22.5 hrs"
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">This Month</div>
                    <div className="text-xl font-bold">
                      {isLoadingTimeEntries ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        "86.25 hrs"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
