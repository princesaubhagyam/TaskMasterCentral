import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Bell, BellOff, Mail, Clock } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    taskReminders: true,
    clockInReminders: false,
    timeZone: "UTC",
    language: "en",
    dateFormat: "MM/DD/YYYY",
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveAppearance = () => {
    // In a real app, this would save the appearance settings to user preferences
    toast({
      title: "Appearance settings saved",
      description: "Your appearance preferences have been updated.",
    });
  };

  const handleSaveNotifications = async () => {
    try {
      // Request notification permission if not granted
      if (settings.pushNotifications) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Notification Permission Required",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive"
          });
          return;
        }
      }

      // Save settings
      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleSaveRegional = () => {
    // In a real app, this would save the regional settings to user preferences
    toast({
      title: "Regional settings saved",
      description: "Your regional preferences have been updated.",
    });
  };

  return (
    <DashboardShell title="Settings">
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      {settings.darkMode ? (
                        <Moon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dark-mode" className="font-medium">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-gray-500">
                        Switch between light and dark mode
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={() => handleToggle("darkMode")}
                  />
                </div>
                
                <div className="py-4 border-t border-gray-100">
                  <Label htmlFor="theme-select" className="block font-medium mb-2">
                    Theme Color
                  </Label>
                  <Select
                    value={theme}
                    onValueChange={(value) => setTheme(value)}
                  >
                    <SelectTrigger id="theme-select" className="w-full">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose the primary color for the application
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleSaveAppearance}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle("emailNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive alerts in the browser
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={() => handleToggle("pushNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="clock-in-reminders" className="font-medium">
                        Clock-in Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get reminded to clock in/out
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="clock-in-reminders"
                    checked={settings.clockInReminders}
                    onCheckedChange={() => handleToggle("clockInReminders")}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <BellOff className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="task-reminders" className="font-medium">
                        Task Reminders
                      </Label>
                      <p className="text-sm text-gray-500">
                        Get notified about upcoming tasks
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={settings.taskReminders}
                    onCheckedChange={() => handleToggle("taskReminders")}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleSaveNotifications}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="regional" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure regional preferences such as language and date format.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="language-select" className="block font-medium mb-2">
                    Language
                  </Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSelect("language", value)}
                  >
                    <SelectTrigger id="language-select" className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-t pt-6">
                  <Label htmlFor="timezone-select" className="block font-medium mb-2">
                    Time Zone
                  </Label>
                  <Select
                    value={settings.timeZone}
                    onValueChange={(value) => handleSelect("timeZone", value)}
                  >
                    <SelectTrigger id="timezone-select" className="w-full">
                      <SelectValue placeholder="Select a time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">IST (Indian Standard Time)</SelectItem>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="Asia/Colombo">Sri Lanka Time</SelectItem>
                      <SelectItem value="Asia/Dhaka">Bangladesh Time</SelectItem>
                      <SelectItem value="Asia/Dubai">Gulf Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-t pt-6">
                  <Label htmlFor="date-format-select" className="block font-medium mb-2">
                    Date Format
                  </Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleSelect("dateFormat", value)}
                  >
                    <SelectTrigger id="date-format-select" className="w-full">
                      <SelectValue placeholder="Select a date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleSaveRegional}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}