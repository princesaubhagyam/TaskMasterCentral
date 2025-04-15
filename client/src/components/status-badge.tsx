import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      // Task/Project statuses
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
        
      // Priority levels
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
        
      // Time tracking statuses
      case "working":
        return "bg-green-100 text-green-800";
      case "break":
        return "bg-yellow-100 text-yellow-800";
      case "on leave":
        return "bg-gray-100 text-gray-800";
        
      // Default fallback
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getDisplayText = () => {
    switch (status.toLowerCase()) {
      case "not_started":
        return "Not Started";
      case "in_progress":
        return "In Progress";
      default:
        // Capitalize first letter of each word
        return status
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 text-xs font-medium rounded-full",
      getStatusStyles(),
      className
    )}>
      {getDisplayText()}
    </span>
  );
}
