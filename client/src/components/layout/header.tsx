import { useState } from "react";
import { Bell, CheckCircle, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClockInOutButton } from "@/components/clock-in-out-button";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  title: string;
  openSidebar: () => void;
}

export function Header({ title, openSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const isEmployee = user?.role === "employee";

  // Mock notifications
  // const [notifications] = useState([
  //   {
  //     id: 1,
  //     title: "New task assigned",
  //     time: "15 minutes ago",
  //     description: "Update the API documentation for the project",
  //     icon: <FileText className="h-5 w-5 text-blue-500" />,
  //   },
  //   {
  //     id: 2,
  //     title: "Leave request approved",
  //     time: "1 hour ago",
  //     description: "Your leave request for June 15-18 has been approved",
  //     icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  //   },
  // ]);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              onClick={openSidebar}
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center">
            {/* Clock In/Out Button for Employee */}
            {isEmployee && (
              <div className="mr-4">
                <ClockInOutButton />
              </div>
            )}

            {/* Notifications dropdown */}
            {/* <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex items-start p-3 cursor-pointer"
                      >
                        <div className="flex-shrink-0 mr-3">
                          {notification.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center">
                    <Button variant="ghost" className="w-full">
                      View all notifications
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage
                        src={user?.profile_img || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Your Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
