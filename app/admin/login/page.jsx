"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  User,
  Shield,
  LogIn,
  Upload,
  Camera,
  X,
  AlertCircle,
} from "lucide-react";

// Zod Schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Demo credentials mapping
const DEMO_CREDENTIALS = {
  ceo: { username: "ceo", password: "ceo123" },
  sales: { username: "sales", password: "sales123" },
  developer: { username: "developer", password: "dev123" },
};

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const loadingToastRef = useRef(null);

  const methods = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("adminUsername");
    const savedRemember = localStorage.getItem("rememberAdmin") === "true";

    if (savedUsername && savedRemember) {
      methods.setValue("username", savedUsername);
      setRememberMe(true);
    }
  }, [methods]);

  const showToast = (message, type = "success", duration = 4000) => {
    const background =
      type === "success"
        ? "linear-gradient(to right, #00b09b, #96c93d)"
        : type === "error"
          ? "linear-gradient(to right, #ff416c, #ff4b2b)"
          : "linear-gradient(to right, #3498db, #2980b9)";

    const icon = type === "success" ? "✅ " : type === "error" ? "❌ " : "ℹ️ ";

    return Toastify({
      text: icon + message,
      duration: duration,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: background,
        borderRadius: "8px",
        padding: "16px 24px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        color: "#fff",
        minWidth: "300px",
      },
    }).showToast();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        showToast(
          "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
          "error"
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      // Create preview
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      showToast("Profile image selected successfully", "success");
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Profile image removed", "info");
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setApiError("");

    try {
      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem("adminUsername", values.username);
        localStorage.setItem("rememberAdmin", "true");
      } else {
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("rememberAdmin");
      }

      // Prepare FormData for API request
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);

      if (profileImage) {
        formData.append("profile", profileImage);
      }

      // Show loading toast
      loadingToastRef.current = showToast(
        "🔐 Authenticating...",
        "info",
        10000
      );

      // Make API call to your backend
      const response = await axios.post(
        "http://localhost:9000/api/admin/login",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
          withCredentials: true,
        }
      );

      if (response.data.message === "Login successful") {
        showToast("🎉 Admin login successful!", "success");

        // Store authentication data
        if (response.data.token) {
          // Store token
          localStorage.setItem("adminToken", response.data.token);
          sessionStorage.setItem("adminToken", response.data.token);

          // Set default headers for future requests
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          // Store admin data
          const adminData = {
            id: response.data.id || 1,
            username: values.username,
            role: response.data.role || values.username, // Use username as role if not provided
            profile: response.data.profile || profilePreview || null,
            loginTime: new Date().toISOString(),
            token: response.data.token,
          };

          localStorage.setItem("adminData", JSON.stringify(adminData));

          // Store a simple flag to indicate user is logged in
          localStorage.setItem("isAdminLoggedIn", "true");
          sessionStorage.setItem("isAdminLoggedIn", "true");
        }

        // Redirect to dashboard after delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showToast(response.data.message || "Login failed", "error");
        setApiError(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (error.response) {
          // Server responded with error status
          const serverError = error.response.data;
          errorMessage =
            serverError?.message || `Error: ${error.response.status}`;

          // Handle specific status codes
          switch (error.response.status) {
            case 400:
              errorMessage =
                serverError.message || "Invalid username or password";
              break;
            case 401:
              errorMessage = "Invalid credentials";
              break;
            case 403:
              errorMessage = "Access denied. Admin privileges required.";
              break;
            case 404:
              errorMessage = "Login endpoint not found";
              break;
            case 422:
              errorMessage = "Validation error. Please check your input.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
          }
        } else if (error.request) {
          // Request made but no response
          errorMessage =
            "Network error. Please check your internet connection.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Left Side - Brand/Logo Section */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Montres Admin Portal
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Secure access to luxury watch inventory & management
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <Card className="w-full border-none shadow-xl rounded-2xl overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden bg-gradient-to-r from-primary to-primary/80 text-white p-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Admin Login</h1>
                <p className="text-sm text-white/80">Secure access portal</p>
              </div>
            </div>
          </div>

          <CardHeader className="hidden md:block">
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Admin Login
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <FormProvider {...methods}>
              <form
                ref={formRef}
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-5 md:space-y-6"
              >
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                      {profilePreview ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={profilePreview}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <label
                      htmlFor="profile-upload"
                      className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg ${isSubmitting
                        ? "bg-slate-300 dark:bg-slate-600 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 hover:shadow-xl active:scale-95"
                        }`}
                    >
                      {profilePreview ? (
                        <Camera className="w-5 h-5 text-white" />
                      ) : (
                        <Upload className="w-5 h-5 text-white" />
                      )}
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                        ref={fileInputRef}
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>

                  {/* Upload Instructions */}
                  <div className="text-center mt-3">
                    <p
                      className={`text-sm ${profilePreview
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {profilePreview
                        ? "✓ Profile image selected"
                        : "Upload admin profile (optional)"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      JPEG, PNG, GIF, WebP • Max 5MB
                    </p>

                    {/* Remove button if image is selected */}
                    {profilePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveProfileImage}
                        className="mt-2 text-xs h-7 px-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Username Field */}
                <FormField
                  control={methods.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter username"
                            className="pl-12 pr-4 h-14 rounded-xl bg-white dark:bg-slate-800 
                            border-2 border-slate-200 dark:border-slate-700 
                            focus:border-primary focus:ring-2 focus:ring-primary/20 
                            transition-all duration-200
                            text-base placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={methods.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-12 pr-12 h-14 rounded-xl bg-white dark:bg-slate-800 
                            border-2 border-slate-200 dark:border-slate-700 
                            focus:border-primary focus:ring-2 focus:ring-primary/20 
                            transition-all duration-200
                            text-base placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 
                            hover:bg-transparent text-muted-foreground disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <div className="flex justify-between items-center mt-2">
                        <Link
                          href="/admin/forgot-password"
                          className={`text-sm text-primary hover:text-primary/80 hover:underline transition-colors ${isSubmitting ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember"
                    className={`text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none ${isSubmitting ? "opacity-50" : ""
                      }`}
                  >
                    Remember this device
                  </label>
                </div>

                {/* API Error Display */}
                {apiError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-in fade-in duration-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {apiError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Security Note */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      For security reasons, please logout after completing your
                      administrative tasks. Session expires after 24 hours.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl text-base font-semibold
                  bg-gradient-to-r from-primary to-primary/90
                  hover:from-primary/90 hover:to-primary
                  shadow-lg hover:shadow-xl
                  transition-all duration-200 transform hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-3" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign In as Admin
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-3 text-muted-foreground">
                      Secure Connection
                    </span>
                  </div>
                </div>

                {/* Return to Main Site */}
                <div className="text-center pt-4">
                  <Link
                    href="https://www.montres.ae"
                    className={`inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors ${isSubmitting ? "opacity-50 pointer-events-none" : ""
                      }`}
                  >
                    ← Return to main website
                  </Link>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginForm;
