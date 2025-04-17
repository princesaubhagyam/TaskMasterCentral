import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Eye, EyeOff, Save } from "lucide-react";

export default function Profile() {
  const { user, updateProfileMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    department: user?.department || "",
    newPassword: "",
    confirmPassword: "",
    profile_img: user?.profile_img || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile_img", file);

      // Upload the image and get the URL
      fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setProfileData((prev) => ({
            ...prev,
            profile_img: data.imageUrl, // Set the URL returned by the server
          }));
        })
        .catch((err) => {
          toast({
            title: "Error uploading image",
            description: err.message,
            variant: "destructive",
          });
        });
    }
  };

  const handleSaveProfile = () => {
    // Ensure passwords match
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    // Trigger profile update mutation
    updateProfileMutation.mutate(
      {
        name: profileData.name,
        email: profileData.email,
        username: profileData.username,
        department: profileData.department,
        profile_img: profileData.profile_img,
        newPassword: profileData.newPassword,
      },
      {
        onSuccess: () => {
          toast({
            title: "Profile updated",
            description: "Your profile has been successfully updated.",
          });
          setIsEditing(false);
        },
        onError: (error: Error) => {
          toast({
            title: "Profile update failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleChangePassword = () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (profileData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(
      {
        name: profileData.name,
        email: profileData.email,
        username: profileData.username,
        department: profileData.department,
        profile_img: profileData.profile_img,
        newPassword: profileData.newPassword,
      },
      {
        onSuccess: () => {
          toast({
            title: "Password updated",
            description: "Your password has been successfully changed.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Password update failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <DashboardShell title="My Profile">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal information and how it appears across the
                system.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={profileData.profile_img || user?.profile_img || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0) || <User />}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange} // Use the new handleImageChange function
                  />
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full shadow-md"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                    >
                      Edit
                    </Button>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{user?.email}</span>
                    {user?.role && (
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize
                        ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "manager"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="ml-auto md:mt-0"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Your department"
                      value={profileData.department || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Username"
                      value={profileData.username}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            {isEditing && (
              <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Change your password and manage your security preferences.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={profileData.newPassword}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={profileData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-medium">Password Requirements:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                  <li>Minimum of 6 characters</li>
                  <li>Include at least one uppercase letter</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t pt-4">
              <Button onClick={handleChangePassword}>
                <Save className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
