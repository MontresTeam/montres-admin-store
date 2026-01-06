"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { ArrowLeft, Save, User, Mail, Briefcase, Activity, Hash, Calendar } from "lucide-react";
import Link from "next/link";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const UpdatedUser = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    serialNumber: "",
    username: "",
    email: "",
    designation: "",
    status: "active"
  });

  const showToast = (message, backgroundColor = "#EF4444") => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: backgroundColor,
      className: "mobile:!left-0 mobile:!right-0 mobile:!mx-4 mobile:!max-w-[calc(100vw-2rem)]",
      stopOnFocus: true,
    }).showToast();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setFetchLoading(true);
        const response = await axios.get(`https://api.montres.ae/api/customers/All/${params.id}`);
        
        if (response.data && response.data.customer) {
          const userData = response.data.customer;
          setUser(userData);
          setFormData({
            serialNumber: userData.serialNumber?.toString() || "",
            username: userData.username || "",
            email: userData.email || "",
            designation: userData.designation || "",
            status: userData.status || "active"
          });
        } else {
          throw new Error("Invalid user data structure");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.response?.status === 404) {
          showToast("User not found. Please check the user ID.");
        } else {
          showToast("Failed to load user data. Please try again.");
        }
        // Redirect back to users list if user not found
        setTimeout(() => {
          router.push("/users-list");
        }, 2000);
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For serial number, only allow numbers
    if (name === "serialNumber") {
      // Allow only numbers and empty string
      if (value === "" || /^\d+$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.serialNumber || !formData.username || !formData.email || !formData.designation) {
      showToast("Please fill in all required fields");
      return;
    }

    // Validate serial number is a positive integer
    if (!/^\d+$/.test(formData.serialNumber) || parseInt(formData.serialNumber) <= 0) {
      showToast("Please enter a valid serial number");
      return;
    }

    setLoading(true);

    try {
      await axios.put(`https://api.montres.ae/api/customers/${params.id}`, {
        ...formData,
        serialNumber: parseInt(formData.serialNumber) // Ensure it's sent as number
      });
      showToast("User updated successfully!", "#10B981");
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/users-list");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.status === 409) {
        showToast("Serial number already exists. Please use a different one.");
      } else if (error.response?.status === 404) {
        showToast("User not found. The user may have been deleted.");
      } else {
        showToast("Failed to update user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-muted-foreground">Loading user data...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">User not found</div>
          <Button asChild>
            <Link href="/users-list">
              Back to Users List
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardBreadcrumb 
        title="Update User" 
        text="Update User" 
      />

      <Card className="mb-6 mx-4 sm:mx-0">
        <CardHeader className="border-b border-neutral-200 dark:border-slate-600 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="flex-shrink-0">
              <Link href="/users-list">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Update User</h2>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                Update user account information for {user.username}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* User Information Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Join Date:</span>
              <span className="text-sm">{formatDate(user.joinDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Last Updated:</span>
              <span className="text-sm">{formatDate(user.updatedAt)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Serial Number Field */}
              <div className="space-y-3">
                <Label htmlFor="serialNumber" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="w-4 h-4" />
                  Serial Number *
                </Label>
                <div className="relative">
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    type="text"
                    inputMode="numeric"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique identifier for the user
                </p>
              </div>

              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Username *
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  User's login username
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  User's primary email address
                </p>
              </div>

              {/* Designation Field */}
              <div className="space-y-3">
                <Label htmlFor="designation" className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="w-4 h-4" />
                  Designation *
                </Label>
                <div className="relative">
                  <Input
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  User's role or position
                </p>
              </div>

              {/* Status Field */}
              <div className="space-y-3">
                <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="w-4 h-4" />
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Account status
                </p>
              </div>
            </div>

            {/* User Summary Card */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  User ID: <strong>{user._id}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Current Status: <strong className="capitalize">{user.status}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-11 px-6 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Updating User..." : "Update User"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                asChild
                className="h-11 px-6 flex-1 sm:flex-none"
              >
                <Link href="/users-list">
                  Cancel
                </Link>
              </Button>
            </div>

            {/* Form Help Text */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Fields marked with * are required. Serial number must be unique.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default UpdatedUser;