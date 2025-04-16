import { useMutation, useQuery } from "@tanstack/react-query";
import { LeaveRequest, InsertLeaveRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useLeaveRequests() {
  const { toast } = useToast();

  // Get leave requests for the authenticated user
  const {
    data: leaveRequests,
    isLoading,
    error,
  } = useQuery<LeaveRequest[], Error>({
    queryKey: ["/api/leave-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leave-requests");
      return await res.json();
    },
  });

  // For managers to get all leave requests
  const {
    data: allLeaveRequests,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery<LeaveRequest[], Error>({
    queryKey: ["/api/leave-requests/all"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leave-requests/all");
      return await res.json();
    },
    enabled: false, // This query is disabled by default and only enabled for managers/admins
  });

  // Create a new leave request
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (leaveRequestData: Omit<InsertLeaveRequest, "userId" | "status">) => {
      const res = await apiRequest("POST", "/api/leave-requests", leaveRequestData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit leave request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel a leave request (for employees)
  const cancelLeaveRequestMutation = useMutation({
    mutationFn: async (leaveRequestId: number) => {
      const res = await apiRequest("PUT", `/api/leave-requests/${leaveRequestId}`, {
        status: "cancelled",
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Leave request cancelled",
        description: "Your leave request has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel leave request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process a leave request (for managers/admins)
  const processLeaveRequestMutation = useMutation({
    mutationFn: async ({ 
      leaveRequestId, 
      status, 
      comments 
    }: { 
      leaveRequestId: number; 
      status: "approved" | "rejected"; 
      comments?: string;
    }) => {
      const res = await apiRequest("PUT", `/api/leave-requests/${leaveRequestId}`, {
        status,
        comments,
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      const action = variables.status === "approved" ? "approved" : "rejected";
      toast({
        title: `Leave request ${action}`,
        description: `The leave request has been ${action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests/all"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to process leave request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    leaveRequests,
    allLeaveRequests,
    isLoading,
    isLoadingAll,
    error,
    errorAll,
    createLeaveRequestMutation,
    cancelLeaveRequestMutation,
    processLeaveRequestMutation,
  };
}