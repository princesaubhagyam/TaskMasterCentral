import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { TaskList } from "@/components/tasks/task-list";
import { Card, CardContent } from "@/components/ui/card";
import { TimeLogTable } from "@/components/time-tracking/time-log-table";
import { ClockInOutButton } from "@/components/clock-in-out-button";
import { Clock, ListTodo, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const {
    isClockedIn,
    clockInTime,
    isLoading: isLoadingTimeData,
    timeEntries,
    stats,
  } = useTimeTracking();
  const { isLoading: isLoadingTasks } = useTasks();
  const [_, navigate] = useLocation();

  const recentTimeEntries = timeEntries.slice(0, 5);

  return (
    <DashboardShell title="Employee Dashboard">
      <div className="space-y-6">
        {/* Time Tracking Status */}
        <Card className="bg-white shadow overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Time Tracking Status
              </h2>
              {!isLoadingTimeData && (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isClockedIn
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isClockedIn ? "Currently Working" : "Not Working"}
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingTimeData ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  {/* Today's Hours */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      Today's Hours
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.todayHours.toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">of 8 hours</div>
                  </div>

                  {/* Weekly Hours */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      Weekly Hours
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.weekHours.toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      of 40 hours
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      Status
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <Clock
                          className={`h-10 w-10 ${
                            isClockedIn
                              ? "text-green-500 animate-pulse"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                    {clockInTime && (
                      <div className="mt-1 text-sm text-gray-500">
                        Clocked in at {clockInTime}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* <div className="mt-6 flex justify-center">
              <ClockInOutButton />
            </div> */}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <TaskList />

        {/* Recent Time Logs */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Time Logs
            </h2>
            <Button
              variant="link"
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
              onClick={() => navigate("/time-tracking")}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <TimeLogTable
            timeEntries={recentTimeEntries}
            isLoading={isLoadingTimeData}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
