import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, CheckCircle, XCircle, MessageSquare, Search, Filter } from "lucide-react";

// Mock data for leave requests that need approval
const mockPendingRequests = [
  {
    id: 1,
    type: "annual",
    startDate: new Date(2025, 3, 15),
    endDate: new Date(2025, 3, 18),
    reason: "Family wedding",
    status: "pending",
    requestedOn: new Date(2025, 3, 1),
    user: {
      id: 3,
      name: "John Smith",
      role: "employee",
      avatar: null,
      department: "Engineering",
    },
  },
  {
    id: 2,
    type: "sick",
    startDate: new Date(2025, 4, 3),
    endDate: new Date(2025, 4, 3),
    reason: "Doctor's appointment",
    status: "pending",
    requestedOn: new Date(2025, 3, 29),
    user: {
      id: 4,
      name: "Emily Johnson",
      role: "employee",
      avatar: null,
      department: "Marketing",
    },
  },
  {
    id: 3,
    type: "unpaid",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 5),
    reason: "Personal matters",
    status: "pending",
    requestedOn: new Date(2025, 4, 20),
    user: {
      id: 5,
      name: "David Brown",
      role: "employee",
      avatar: null,
      department: "Finance",
    },
  },
];

const mockReviewedRequests = [
  {
    id: 4,
    type: "annual",
    startDate: new Date(2025, 2, 10),
    endDate: new Date(2025, 2, 15),
    reason: "Vacation",
    status: "approved",
    requestedOn: new Date(2025, 1, 25),
    reviewedOn: new Date(2025, 1, 27),
    comments: "Approved as requested.",
    user: {
      id: 6,
      name: "Sarah Wilson",
      role: "employee",
      avatar: null,
      department: "Customer Support",
    },
  },
  {
    id: 5,
    type: "bereavement",
    startDate: new Date(2025, 3, 5),
    endDate: new Date(2025, 3, 9),
    reason: "Family funeral",
    status: "approved",
    requestedOn: new Date(2025, 3, 4),
    reviewedOn: new Date(2025, 3, 4),
    comments: "Condolences. Take all the time you need.",
    user: {
      id: 3,
      name: "John Smith",
      role: "employee",
      avatar: null,
      department: "Engineering",
    },
  },
  {
    id: 6,
    type: "annual",
    startDate: new Date(2025, 4, 25),
    endDate: new Date(2025, 5, 10),
    reason: "Summer vacation",
    status: "rejected",
    requestedOn: new Date(2025, 3, 15),
    reviewedOn: new Date(2025, 3, 18),
    comments: "Cannot approve due to project deadline. Please reschedule.",
    user: {
      id: 4,
      name: "Emily Johnson",
      role: "employee",
      avatar: null,
      department: "Marketing",
    },
  },
];

export default function LeaveApprovals() {
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
  const [reviewedRequests, setReviewedRequests] = useState(mockReviewedRequests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  
  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    // In a real app, this would call an API to approve the leave request
    const updatedRequest = {
      ...selectedRequest,
      status: "approved",
      reviewedOn: new Date(),
      comments: approvalComments,
    };
    
    setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
    setReviewedRequests(prev => [updatedRequest, ...prev]);
    
    toast({
      title: "Leave request approved",
      description: "The leave request has been approved successfully.",
    });
    
    setIsDetailsOpen(false);
    setApprovalComments("");
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    // In a real app, this would call an API to reject the leave request
    const updatedRequest = {
      ...selectedRequest,
      status: "rejected",
      reviewedOn: new Date(),
      comments: approvalComments,
    };
    
    setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
    setReviewedRequests(prev => [updatedRequest, ...prev]);
    
    toast({
      title: "Leave request rejected",
      description: "The leave request has been rejected.",
    });
    
    setIsDetailsOpen(false);
    setApprovalComments("");
  };

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

  const filteredPendingRequests = pendingRequests.filter(request => {
    const matchesSearchTerm = 
      searchTerm === "" || 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === "all" || 
      request.user.department === filterDepartment;
    
    return matchesSearchTerm && matchesDepartment;
  });

  const filteredReviewedRequests = reviewedRequests.filter(request => {
    const matchesSearchTerm = 
      searchTerm === "" || 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === "all" || 
      request.user.department === filterDepartment;
    
    return matchesSearchTerm && matchesDepartment;
  });

  const departments = ["Engineering", "Marketing", "Finance", "Customer Support", "HR"];

  return (
    <DashboardShell title="Leave Approvals">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Approval Management</h2>
          <p className="text-muted-foreground">
            Review and manage employee leave requests
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by employee name or reason..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">
              Pending Approvals
              <Badge variant="outline" className="ml-2">
                {filteredPendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed Requests
              <Badge variant="outline" className="ml-2">
                {filteredReviewedRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {filteredPendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <CalendarIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-center text-gray-500">
                      No pending leave requests to approve
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-9 w-9 mr-2">
                            <AvatarImage src={request.user.avatar || ""} />
                            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{request.user.name}</CardTitle>
                            <CardDescription>
                              {request.user.department} • Requested on {format(request.requestedOn, "PPP")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <h3 className="font-semibold">{getLeaveTypeLabel(request.type)}</h3>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(request.startDate, "PPP")} - {format(request.endDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Duration: {calculateDuration(request.startDate, request.endDate)} day(s)
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{request.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalComments("");
                          handleReject();
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalComments("");
                          handleApprove();
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reviewed" className="mt-6">
            <div className="grid gap-4">
              {filteredReviewedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <CalendarIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-center text-gray-500">
                      No reviewed leave requests found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviewedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-9 w-9 mr-2">
                            <AvatarImage src={request.user.avatar || ""} />
                            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{request.user.name}</CardTitle>
                            <CardDescription>
                              {request.user.department} • Requested on {format(request.requestedOn, "PPP")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <h3 className="font-semibold">{getLeaveTypeLabel(request.type)}</h3>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(request.startDate, "PPP")} - {format(request.endDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            Duration: {calculateDuration(request.startDate, request.endDate)} day(s)
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">Your comments:</div>
                            <p className="text-sm text-gray-700">{request.comments || "No comments provided."}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reviewed on {format(request.reviewedOn, "PPP")}
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
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review this leave request and provide your decision.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.user.avatar || ""} />
                  <AvatarFallback>{selectedRequest.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{selectedRequest.user.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.user.department} • {selectedRequest.user.role}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Leave Type</div>
                    <div className="text-gray-700">{getLeaveTypeLabel(selectedRequest.type)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Date Range</div>
                  <div className="text-gray-700">
                    {format(selectedRequest.startDate, "PPP")} - {format(selectedRequest.endDate, "PPP")}
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)} day(s)
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Reason</div>
                  <div className="text-gray-700">{selectedRequest.reason}</div>
                </div>
                
                <div className="border-t pt-4">
                  <Label htmlFor="comments" className="text-sm font-medium">
                    Comments (optional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Add your comments about this leave request"
                    rows={3}
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}