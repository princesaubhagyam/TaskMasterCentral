import { useAuth } from "@/hooks/use-auth";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Calendar, MoreHorizontal } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { LeaveRequest } from "@shared/schema";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeaveApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [comments, setComments] = useState("");
  
  const {
    allLeaveRequests,
    isLoading,
    error,
    processLeaveRequestMutation,
  } = useLeaveRequests();

  // Return if not a manager or admin
  if (user?.role !== "manager" && user?.role !== "admin") {
    return (
      <DashboardShell title="Leave Approvals">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view this page. Only managers and administrators can approve leave requests.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const calculateDuration = (start: Date, end: Date) => {
    const days = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
    return days === 1 ? "1 day" : `${days} days`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      await processLeaveRequestMutation.mutateAsync({
        leaveRequestId: selectedRequest.id,
        status: "approved",
        comments: comments,
      });
      setReviewOpen(false);
      setComments("");
      setSelectedRequest(null);
    }
  };

  const handleReject = async () => {
    if (selectedRequest) {
      await processLeaveRequestMutation.mutateAsync({
        leaveRequestId: selectedRequest.id,
        status: "rejected",
        comments: comments,
      });
      setReviewOpen(false);
      setComments("");
      setSelectedRequest(null);
    }
  };

  const handleReview = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setReviewOpen(true);
    setComments("");
  };

  const filteredRequests = allLeaveRequests?.filter(req => {
    if (activeTab === "pending") return req.status === "pending";
    if (activeTab === "approved") return req.status === "approved";
    if (activeTab === "rejected") return req.status === "rejected";
    if (activeTab === "cancelled") return req.status === "cancelled";
    return true; // 'all' tab
  }) || [];

  return (
    <DashboardShell title="Leave Approvals">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve or reject leave requests from employees.
        </p>
      </div>

      <Tabs defaultValue="pending" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {filteredRequests.length > 0 && activeTab !== "pending" && (
              <Badge className="ml-2 px-1.5 h-5 absolute -top-2 -right-2 bg-primary text-primary-foreground">
                {filteredRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className={cn(
              request.status === "pending" && "border-primary"
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">
                      {request.type.replace("_", " ")} Leave
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(request.startDate), "PPP")} - {format(new Date(request.endDate), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize mr-2">
                      {request.status}
                    </Badge>
                    {request.status === "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleReview(request)}>
                            Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRequest(request);
                            handleApprove();
                          }}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRequest(request);
                            setReviewOpen(true);
                            setComments("");
                          }}>
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Employee:</span>
                    <span>{request.userId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Duration:</span>
                    <span>{calculateDuration(request.startDate, request.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Requested:</span>
                    <span>{format(new Date(request.requestedOn), "PPP")}</span>
                  </div>
                  {request.reason && (
                    <div className="text-sm">
                      <span className="font-medium">Reason:</span>
                      <p className="mt-1">{request.reason}</p>
                    </div>
                  )}
                  {request.reviewedOn && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Reviewed:</span>
                      <span>{format(new Date(request.reviewedOn), "PPP")}</span>
                    </div>
                  )}
                  {request.comments && (
                    <div className="text-sm">
                      <span className="font-medium">Comments:</span>
                      <p className="mt-1">{request.comments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {request.status === "pending" && (
                <CardFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleReview(request)}
                  >
                    Review
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1" 
                    onClick={() => {
                      setSelectedRequest(request);
                      handleApprove();
                    }}
                    disabled={processLeaveRequestMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setReviewOpen(true);
                    }}
                    disabled={processLeaveRequestMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-semibold mb-2">No leave requests found</h3>
          <p className="text-muted-foreground">
            {activeTab === "pending"
              ? "There are no pending leave requests to review."
              : `There are no ${activeTab} leave requests.`}
          </p>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Review Leave Request
            </DialogTitle>
            <DialogDescription>
              Add comments before approving or rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="capitalize">{selectedRequest.type} Leave</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{calculateDuration(selectedRequest.startDate, selectedRequest.endDate)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Dates:</span>
                    <p>
                      {format(new Date(selectedRequest.startDate), "PPP")} - {format(new Date(selectedRequest.endDate), "PPP")}
                    </p>
                  </div>
                  {selectedRequest.reason && (
                    <div className="col-span-2">
                      <span className="font-medium">Reason:</span>
                      <p>{selectedRequest.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="comments" className="text-sm font-medium">
                Comments (optional)
              </label>
              <Textarea
                id="comments"
                placeholder="Add comments for this review decision"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processLeaveRequestMutation.isPending}
            >
              {processLeaveRequestMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={processLeaveRequestMutation.isPending}
            >
              {processLeaveRequestMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}