import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TimeEntry } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export function useTimeTracking() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  // Get current time entry (if any)
  const { data: currentTimeEntry, isLoading } = useQuery<TimeEntry | null>({
    queryKey: ["/api/time-entries/current"],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Get time entries history
  const { data: timeEntries = [], isLoading: isLoadingEntries } = useQuery<
    TimeEntry[]
  >({
    queryKey: ["/api/time-entries"],
    enabled: !!user,
  });

  // Clock in mutation
  const { mutate: clockIn, isPending: isClockingIn } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/time-entries/clock-in", {});
      return await res.json();
    },
    onSuccess: (timeEntry: TimeEntry) => {
      queryClient.setQueryData(["/api/time-entries/current"], timeEntry);
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setClockInTime(new Date(timeEntry.clockIn).toLocaleTimeString());
      toast({
        title: "Clocked in successfully",
        description: `Clocked in at ${new Date(
          timeEntry.clockIn
        ).toLocaleTimeString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clock in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clock out mutation
  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/time-entries/clock-out", {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/time-entries/current"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setClockInTime(null);
      toast({
        title: "Clocked out successfully",
        description: `Clocked out at ${new Date().toLocaleTimeString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clock out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set clock-in time from current entry
  useEffect(() => {
    if (currentTimeEntry) {
      setClockInTime(new Date(currentTimeEntry.clockIn).toLocaleTimeString());
    }
  }, [currentTimeEntry]);

  // Calculate stats
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.clockIn);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.clockIn);
      return entryDate >= weekStart;
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.clockIn);
      return entryDate >= monthStart;
    });

    // Calculate total hours
    const todayHours = todayEntries.reduce(
      (total, entry) => total + (entry.totalHours || 0),
      0
    );

    const weekHours = weekEntries.reduce(
      (total, entry) => total + (entry.totalHours || 0),
      0
    );

    const monthHours = monthEntries.reduce(
      (total, entry) => total + (entry.totalHours || 0),
      0
    );

    // Calculate overtime (assuming 8 hours per day)
    const overtimeHours = Math.max(0, todayHours - 8);

    return {
      todayHours,
      weekHours,
      monthHours,
      overtimeHours,
    };
  };

  const stats = !isLoadingEntries
    ? calculateStats()
    : {
        todayHours: 0,
        weekHours: 0,
        monthHours: 0,
        overtimeHours: 0,
      };

  return {
    isClockedIn: !!currentTimeEntry,
    clockInTime,
    currentTimeEntry,
    timeEntries,
    isLoading,
    isLoadingEntries,
    isClockingIn,
    isClockingOut,
    clockIn,
    clockOut,
    stats,
  };
}
