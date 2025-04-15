import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useQuery } from "@tanstack/react-query";
import { User, TimeEntry, Task, Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { FileDown, Users, Briefcase, Clock, CalendarIcon, Loader2, BarChart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Reports() {
  const [reportType, setReportType] = useState("timeTracking");
  const [dateRange, setDateRange] = useState<"week" | "month" | "custom">("month");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Get data for reports
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: timeEntries = [], isLoading: isLoadingTimeEntries } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });
  
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Calculate date range
  const getDateRange = () => {
    switch (dateRange) {
      case "week":
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate),
        };
      case "month":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      case "custom":
        // For custom, we could implement a date range picker
        // For now, we'll use last 3 months
        return {
          start: subMonths(startOfMonth(selectedDate), 2),
          end: endOfMonth(selectedDate),
        };
    }
  };
  
  const range = getDateRange();
  
  // Filter time entries by date range and employee
  const filteredTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.clockIn);
    const inDateRange = entryDate >= range.start && entryDate <= range.end;
    const matchesEmployee = selectedEmployee === "all" || entry.userId.toString() === selectedEmployee;
    
    return inDateRange && matchesEmployee;
  });
  
  // Calculate total hours by employee
  const employeeHours = employees.reduce((acc, employee) => {
    if (employee.role !== "employee") return acc;
    
    const entries = filteredTimeEntries.filter(entry => entry.userId === employee.id);
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    
    acc.push({
      employeeId: employee.id,
      name: employee.name,
      department: employee.department || "No department",
      totalHours,
    });
    
    return acc;
  }, [] as { employeeId: number; name: string; department: string; totalHours: number }[]);
  
  // Calculate project progress
  const projectProgress = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === "completed").length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      projectId: project.id,
      name: project.name,
      status: project.status,
      totalTasks,
      completedTasks,
      progressPercentage,
    };
  });
  
  const handleDownloadReport = () => {
    // In a real app, this would generate and download a report
    alert("Report download functionality would be implemented here.");
  };
  
  const isLoading = isLoadingEmployees || isLoadingTimeEntries || isLoadingTasks || isLoadingProjects;
  
  return (
    <DashboardShell title="Reports">
      <div className="space-y-6">
        {/* Report Controls */}
        <Card className="bg-white shadow">
          <CardHeader className="pb-4">
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Report Type</label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timeTracking">Time Tracking</SelectItem>
                    <SelectItem value="projectProgress">Project Progress</SelectItem>
                    <SelectItem value="employeePerformance">Employee Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
                <Select
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as "week" | "month" | "custom")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Month</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "MMMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Employee</label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees
                      .filter(emp => emp.role === "employee")
                      .map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleDownloadReport}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <Tabs defaultValue="timeTracking" value={reportType} onValueChange={setReportType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeTracking" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Tracking
              </TabsTrigger>
              <TabsTrigger value="projectProgress" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Project Progress
              </TabsTrigger>
              <TabsTrigger value="employeePerformance" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Employee Performance
              </TabsTrigger>
            </TabsList>
            
            {/* Time Tracking Report */}
            <TabsContent value="timeTracking" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
                  <CardTitle className="text-lg">
                    Time Tracking Report: {format(range.start, "MMM d, yyyy")} - {format(range.end, "MMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Clock className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Total Hours</div>
                        <div className="text-2xl font-bold">
                          {filteredTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0).toFixed(1)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Users className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Employees Tracked</div>
                        <div className="text-2xl font-bold">
                          {new Set(filteredTimeEntries.map(entry => entry.userId)).size}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <BarChart className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Avg. Daily Hours</div>
                        <div className="text-2xl font-bold">
                          {(filteredTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / 
                          (new Set(filteredTimeEntries.map(entry => format(new Date(entry.clockIn), "yyyy-MM-dd"))).size || 1)).toFixed(1)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-4">Hours by Employee</h3>
                    <DataTable
                      data={employeeHours.sort((a, b) => b.totalHours - a.totalHours)}
                      columns={[
                        {
                          header: "Employee",
                          accessor: (row) => (
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${row.name}`} />
                                <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{row.name}</div>
                                <div className="text-sm text-gray-500">{row.department}</div>
                              </div>
                            </div>
                          ),
                        },
                        {
                          header: "Total Hours",
                          accessor: (row) => (
                            <div className="font-medium">{row.totalHours.toFixed(1)}</div>
                          ),
                        },
                        {
                          header: "Chart",
                          accessor: (row) => (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, (row.totalHours / 40) * 100)}%` }}
                              ></div>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Project Progress Report */}
            <TabsContent value="projectProgress" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
                  <CardTitle className="text-lg">
                    Project Progress Report: {format(range.start, "MMM d, yyyy")} - {format(range.end, "MMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Briefcase className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Total Projects</div>
                        <div className="text-2xl font-bold">
                          {projects.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Clock className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">In Progress</div>
                        <div className="text-2xl font-bold">
                          {projects.filter(p => p.status === "in_progress").length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                        <div className="text-2xl font-bold">
                          {projects.filter(p => p.status === "completed").length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-4">Project Completion Status</h3>
                    <DataTable
                      data={projectProgress}
                      columns={[
                        {
                          header: "Project",
                          accessor: (row) => (
                            <div className="font-medium">{row.name}</div>
                          ),
                        },
                        {
                          header: "Status",
                          accessor: (row) => (
                            <StatusBadge status={row.status} />
                          ),
                        },
                        {
                          header: "Tasks",
                          accessor: (row) => (
                            <div>{row.completedTasks} / {row.totalTasks}</div>
                          ),
                        },
                        {
                          header: "Progress",
                          accessor: (row) => (
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${row.progressPercentage}%` }}
                                ></div>
                              </div>
                              <span>{row.progressPercentage}%</span>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Employee Performance Report */}
            <TabsContent value="employeePerformance" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6">
                  <CardTitle className="text-lg">
                    Employee Performance: {format(range.start, "MMM d, yyyy")} - {format(range.end, "MMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Users className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Total Employees</div>
                        <div className="text-2xl font-bold">
                          {employees.filter(emp => emp.role === "employee").length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-gray-500">Completed Tasks</div>
                        <div className="text-2xl font-bold">
                          {tasks.filter(t => t.status === "completed").length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center">
                        <Clock className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-xs text-gray-500">Avg. Hours per Employee</div>
                        <div className="text-2xl font-bold">
                          {(filteredTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / 
                          Math.max(1, employeeHours.length)).toFixed(1)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-4">Performance by Employee</h3>
                    <DataTable
                      data={employeeHours}
                      columns={[
                        {
                          header: "Employee",
                          accessor: (row) => (
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${row.name}`} />
                                <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{row.name}</div>
                                <div className="text-sm text-gray-500">{row.department}</div>
                              </div>
                            </div>
                          ),
                        },
                        {
                          header: "Hours Worked",
                          accessor: (row) => (
                            <div className="font-medium">{row.totalHours.toFixed(1)}</div>
                          ),
                        },
                        {
                          header: "Tasks Completed",
                          accessor: (row) => {
                            const employeeTasks = tasks.filter(t => t.assigneeId === row.employeeId);
                            const completedTasks = employeeTasks.filter(t => t.status === "completed").length;
                            return `${completedTasks} / ${employeeTasks.length}`;
                          },
                        },
                        {
                          header: "Performance",
                          accessor: (row) => {
                            // Calculate performance score based on hours worked and tasks completed
                            // This is a simplified calculation for demonstration
                            const performanceScore = Math.min(100, row.totalHours >= 40 ? 100 : (row.totalHours / 40) * 100);
                            
                            return (
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      performanceScore >= 80 ? "bg-green-600" : 
                                      performanceScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${performanceScore}%` }}
                                  ></div>
                                </div>
                                <span>{Math.round(performanceScore)}%</span>
                              </div>
                            );
                          },
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardShell>
  );
}
