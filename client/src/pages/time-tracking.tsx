import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { ClockInOutButton } from "@/components/clock-in-out-button";
import { TimeLogTable } from "@/components/time-tracking/time-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimeTracking() {
  const {
    isClockedIn,
    clockInTime,
    isLoading,
    isLoadingEntries,
    timeEntries,
    stats,
  } = useTimeTracking();

  return (
    <DashboardShell title="Time Tracking">
      <div className="space-y-6">
        {/* Clock In/Out Card */}
        <Card className="bg-white shadow overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Time Tracking
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isLoading ? (
                    <Skeleton className="h-4 w-60" />
                  ) : (
                    <>
                      {isClockedIn ? (
                        <>You are currently clocked in since {clockInTime}</>
                      ) : (
                        <>You are not currently clocked in</>
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-6">
                  <p className="text-sm font-medium text-gray-900">
                    Current Status
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    <p
                      className={`mt-1 text-sm font-medium ${
                        isClockedIn ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isClockedIn ? "Working" : "Not Working"}
                    </p>
                  )}
                </div>
                {/* <ClockInOutButton /> */}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              {isLoadingEntries ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  {/* Today */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      Today
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.todayHours.toFixed(1)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">hours</div>
                  </div>

                  {/* This Week */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      This Week
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.weekHours.toFixed(1)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">hours</div>
                  </div>

                  {/* This Month */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      This Month
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.monthHours.toFixed(1)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">hours</div>
                  </div>

                  {/* Overtime */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">
                      Overtime
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                      {stats.overtimeHours.toFixed(1)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">hours</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Log History */}
        <TimeLogTable timeEntries={timeEntries} isLoading={isLoadingEntries} />
      </div>
    </DashboardShell>
  );
}
