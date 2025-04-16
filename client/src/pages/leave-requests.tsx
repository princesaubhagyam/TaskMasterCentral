import { useAuth } from "@/hooks/use-auth";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const leaveRequestFormSchema = z.object({
  type: z.string({
    required_error: "Please select a leave type",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().optional(),
}).refine(data => {
  return data.endDate >= data.startDate;
}, {
  message: "End date cannot be before start date",
  path: ["endDate"]
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

export default function LeaveRequests() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { 
    leaveRequests,
    isLoading,
    createLeaveRequestMutation,
    cancelLeaveRequestMutation,
  } = useLeaveRequests();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      type: "",
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      reason: "",
    },
  });

  const onSubmit = async (values: LeaveRequestFormValues) => {
    await createLeaveRequestMutation.mutateAsync({
      type: values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason,
    });
    setOpen(false);
    form.reset();
  };

  const handleCancel = async (leaveRequestId: number) => {
    if (confirm("Are you sure you want to cancel this leave request?")) {
      await cancelLeaveRequestMutation.mutateAsync(leaveRequestId);
    }
  };

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

  return (
    <DashboardShell title="Leave Requests">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground">
            View your leave requests or submit new ones.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Fill out the form below to request time off.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">Annual Leave</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                          <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                          <SelectItem value="maternity">Maternity Leave</SelectItem>
                          <SelectItem value="paternity">Paternity Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < form.getValues("startDate")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a reason for your leave request"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createLeaveRequestMutation.isPending}
                  >
                    {createLeaveRequestMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : leaveRequests && leaveRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">
                      {request.type.replace("_", " ")} Leave
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(request.startDate), "PPP")} - {format(new Date(request.endDate), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span>{calculateDuration(request.startDate, request.endDate)}</span>
                  </div>
                  {request.reason && (
                    <div>
                      <span className="text-sm font-medium">Reason:</span>
                      <p className="text-sm mt-1">{request.reason}</p>
                    </div>
                  )}
                  {request.comments && (
                    <div>
                      <span className="text-sm font-medium">Comments:</span>
                      <p className="text-sm mt-1">{request.comments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {request.status === "pending" && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleCancel(request.id)}
                    disabled={cancelLeaveRequestMutation.isPending}
                  >
                    {cancelLeaveRequestMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cancel Request
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-semibold mb-2">No leave requests found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any leave requests yet.
          </p>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
        </div>
      )}
    </DashboardShell>
  );
}