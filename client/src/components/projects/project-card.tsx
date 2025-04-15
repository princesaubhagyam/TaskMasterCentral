import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Clock } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const getStatusColor = () => {
    switch (project.status) {
      case "not_started":
        return "bg-gray-200";
      case "in_progress":
        return "bg-blue-200";
      case "completed":
        return "bg-green-200";
      default:
        return "bg-gray-200";
    }
  };

  // Calculate a random progress percentage for demo
  // In a real app, this would be calculated based on tasks completed
  const progress = Math.floor(Math.random() * 100);

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "No deadline";
    return format(new Date(date), "MMMM d, yyyy");
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${getStatusColor()}`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-500 line-clamp-2">
            {project.description || "No description provided"}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-gray-700">Deadline:</span>
            </div>
            <span className="text-sm font-medium">
              {formatDate(project.deadline)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Status:</span>
            <StatusBadge status={project.status} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Progress:</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Team:</span>
            <div className="flex -space-x-2">
              {/* These would be real team members in a production app */}
              <Avatar className="h-6 w-6 ring-2 ring-white">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=AB`} />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 ring-2 ring-white">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=CD`} />
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 ring-2 ring-white">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=EF`} />
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          variant="outline" 
          onClick={() => onViewDetails(project)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
