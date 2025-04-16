import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Calendar as CalendarIcon2, Clock, Loader2 } from "lucide-react";

// Mock data for leave requests
const mockLeaveRequests = [
  {
    id: 1,
    type: "annual",
    startDate: new Date(2025, 3, 20),
    endDate: new Date(2025, 3, 25),
    reason: "Family vacation",
    status: "approved",
    requestedOn: new Date(2025, 3, 1),
  },
  {
    id: 2,
    type: "sick",
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 6),
    reason: "Doctor's appointment",
    status: "pending",
    requestedOn: new Date(2025, 4, 1),
  },
  {
    id: 3,
    type: "unpaid",
    startDate: new Date(2025, 5, 10),
    endDate: new Date(2025, 5, 15),
    reason: "Personal matters",
    status: "rejected",
    requestedOn: new Date(2025, 4, 25),
  },
];

export default function LeaveRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState({
    type: "annual",
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
  });

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setLeaveData(prev => ({
        ...prev,
        startDate: date,
        endDate: date > prev.endDate ? date : prev.endDate,
      }));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setLeaveData(prev => ({
        ...prev,
        endDate: date,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to create a leave request
      const newLeaveRequest = {
        id: leaveRequests.length + 1,
        ...leaveData,
        status: "pending",
        requestedOn: new Date(),
      };
      
      setLeaveRequests(prev => [newLeaveRequest, ...prev]);
      
      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted successfully.",
      });
      
      setLeaveData({
        type: "annual",
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to submit leave request",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (id: number) => {
    // In a real app, this would call an API to cancel the leave request
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: "cancelled" } : req
      )
    );
    
    toast({
      title: "Leave request cancelled",
      description: "Your leave request has been cancelled.",
    });
  };

  const pendingRequests = leaveRequests.filter(req => req.status === "pending");
  const approvedRequests = leaveRequests.filter(req => req.status === "approved");
  const rejectedRequests = leaveRequests.filter(req => req.status === "rejected" || req.status === "cancelled");

  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "annual":
        return "Annual Leave";
      case "sick":
        return "Sick Leave";
      case "unpaid":
        return "Unpaid Leave";
      case "bereavement":
        return "Bereavement Leave";
      case "maternity":
        return "Maternity Leave";
      case "paternity":
        return "Paternity Leave";
      default:
        return type;
    }
  };

  return (
    <DashboardShell title="Leave Requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
            <p className="text-muted-foreground">
              View and manage your leave requests
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
                <DialogDescription>
                  Submit a new leave request for approval.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select
                    value={leaveData.type}
                    onValueChange={(value) => 
                      setLeaveData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                          id="start-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveData.startDate ? (
                            format(leaveData.startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={leaveData.startDate}
                          onSelect={handleStartDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                          id="end-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leaveData.endDate ? (
                            format(leaveData.endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={leaveData.endDate}
                          onSelect={handleEndDateSelect}
                          disabled={(date) => date < leaveData.startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reason">Reason</Label>
                    <span className="text-xs text-gray-500">
                      Duration: {calculateDuration(leaveData.startDate, leaveData.endDate)} day(s)
                    </span>
                  </div>
                  <Textarea
                    id="reason"
                    placeholder="Enter the reason for your leave request"
                    value={leaveData.reason}
                    onChange={(e) => 
                      setLeaveData(prev => ({ ...prev, reason: e.target.value }))
                    }
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              Pending
              <Badge variant="outline" className="ml-2">
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="outline" className="ml-2">
                {approvedRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="outline" className="ml-2">
                {rejectedRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <CalendarIcon2 className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-center text-gray-500">
                      No pending leave requests
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((leave) => (
                  <Card key={leave.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          {getLeaveTypeLabel(leave.type)}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(leave.status)}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {format(leave.requestedOn, "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(leave.startDate, "PPP")} - {format(leave.endDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Duration: {calculateDuration(leave.startDate, leave.endDate)} day(s)
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{leave.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => handleCancel(leave.id)}
                      >
                        Cancel Request
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <div className="grid gap-4">
              {approvedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <CalendarIcon2 className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-center text-gray-500">
                      No approved leave requests
                    </p>
                  </CardContent>
                </Card>
              ) : (
                approvedRequests.map((leave) => (
                  <Card key={leave.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          {getLeaveTypeLabel(leave.type)}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(leave.status)}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {format(leave.requestedOn, "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(leave.startDate, "PPP")} - {format(leave.endDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Duration: {calculateDuration(leave.startDate, leave.endDate)} day(s)
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{leave.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-4">
              {rejectedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <CalendarIcon2 className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-center text-gray-500">
                      No rejected or cancelled leave requests
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedRequests.map((leave) => (
                  <Card key={leave.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          {getLeaveTypeLabel(leave.type)}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(leave.status)}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {format(leave.requestedOn, "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(leave.startDate, "PPP")} - {format(leave.endDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Duration: {calculateDuration(leave.startDate, leave.endDate)} day(s)
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{leave.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}