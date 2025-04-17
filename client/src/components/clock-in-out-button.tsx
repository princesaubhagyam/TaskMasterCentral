import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useTimeTracking } from "@/hooks/use-time-tracking";

export function ClockInOutButton() {
  const { isClockingIn, isClockingOut, isClockedIn, clockIn, clockOut } =
    useTimeTracking();

  const handleClick = () => {
    if (isClockedIn) {
      clockOut();
    } else {
      clockIn();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isClockingIn || isClockingOut}
      // variant={isClockedIn ? "outline" : "def"}
      className={`flex items-center ${
        isClockedIn
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600"
      }`}
    >
      <Clock className="mr-2 h-5 w-5" />
      <span>
        {isClockingIn
          ? "Clocking In..."
          : isClockingOut
          ? "Clocking Out..."
          : isClockedIn
          ? "Clock Out"
          : "Clock In"}
      </span>
    </Button>
  );
}
