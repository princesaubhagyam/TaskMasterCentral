import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatDistanceToNow } from "date-fns";
import { TimeEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Clock, FileDown, Filter } from "lucide-react";

interface TimeLogTableProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
}

export function TimeLogTable({ timeEntries, isLoading }: TimeLogTableProps) {
  // Function to format the date
  const formatDate = (dateStr: Date) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Function to format the time
  const formatTime = (dateStr: Date | undefined | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to calculate the relative time
  const getRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  const columns = [
    {
      header: "Date",
      accessor: (entry: TimeEntry) => formatDate(entry.clockIn),
    },
    {
      header: "Clock In",
      accessor: (entry: TimeEntry) => formatTime(entry.clockIn),
    },
    {
      header: "Clock Out",
      accessor: (entry: TimeEntry) => formatTime(entry.clockOut),
    },
    {
      header: "Total Hours",
      accessor: (entry: TimeEntry) => entry.totalHours ?? "-",
    },
    {
      header: "Break",
      accessor: (entry: TimeEntry) =>
        entry.breakMinutes ? `${entry.breakMinutes} min` : "-",
    },
    {
      header: "Status",
      accessor: (entry: TimeEntry) => (
        <StatusBadge
          status={entry.status === "in_progress" ? "working" : "completed"}
        />
      ),
    },
    {
      header: "Notes",
      accessor: (entry: TimeEntry) => entry.notes || "-",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Time Log History</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <DataTable data={timeEntries} columns={columns} loading={isLoading} />

      <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{timeEntries.length}</span> of{" "}
          <span className="font-medium">{timeEntries.length}</span> entries
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-500 text-white"
          >
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
