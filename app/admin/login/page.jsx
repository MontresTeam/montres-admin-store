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
import { motion } from "framer-motion"; // Ensure framer-motion is installed

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";

import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  User,
  Shield,
  LogIn,
  Upload,
  Camera,
  X,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

// --- Configuration ---
const API_URL = "https://api.montres.ae/api/admin/login"; // Centralized API URL

// --- Zod Schema ---
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const AdminLoginForm = () => {
  // --- State ---
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");

  // --- Refs ---
  const fileInputRef = useRef(null);
  const loadingToastRef = useRef(null);

  // --- Form Methods ---
  const methods = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // --- Effects ---
  useEffect(() => {
    const savedUsername = localStorage.getItem("adminUsername");
    const savedRemember = localStorage.getItem("rememberAdmin") === "true";

    if (savedUsername && savedRemember) {
      methods.setValue("username", savedUsername);
      setRememberMe(true);
    }
  }, [methods]);

  // --- Helpers ---
  const showToast = (message, type = "success", duration = 4000) => {
    const background =
      type === "success"
        ? "linear-gradient(to right, #059669, #10B981)" // Emerald Green
        : type === "error"
          ? "linear-gradient(to right, #DC2626, #EF4444)" // Red
          : "linear-gradient(to right, #2563EB, #3B82F6)"; // Blue

    const icon = type === "success" ? "✨" : type === "error" ? "⚠️" : "ℹ️";

    return Toastify({
      text: `${icon} ${message}`,
      duration: duration,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: background,
        borderRadius: "12px",
        padding: "16px 24px",
        fontSize: "14px",
        fontWeight: "600",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        color: "#fff",
        minWidth: "320px",
        border: "1px solid rgba(255,255,255,0.1)",
      },
      onClick: function () { }, // Callback after click
    }).showToast();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        showToast("Invalid file type. Please use JPEG, PNG, or WebP.", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast("File is too large. Max size is 5MB.", "error");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      showToast("Profile image updated!", "success");
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Profile image removed.", "info");
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setApiError("");

    try {
      // Manage "Remember Me"
      if (rememberMe) {
        localStorage.setItem("adminUsername", values.username);
        localStorage.setItem("rememberAdmin", "true");
      } else {
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("rememberAdmin");
      }

      // FormData Construction
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);
      if (profileImage) {
        formData.append("profile", profileImage);
      }

      // Feedback
      // loadingToastRef.current = showToast("Authenticating credentials...", "info", 50000);

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
        withCredentials: true,
      });

      if (response.data.message === "Login successful") {
        showToast("Access Granted. Redirecting...", "success");

        if (response.data.token) {
          localStorage.setItem("adminToken", response.data.token);
          sessionStorage.setItem("adminToken", response.data.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

          const adminData = {
            id: response.data.id || 1,
            username: values.username,
            role: response.data.role || values.username,
            profile: response.data.profile || profilePreview || null,
            loginTime: new Date().toISOString(),
            token: response.data.token,
          };

          localStorage.setItem("adminData", JSON.stringify(adminData));
          localStorage.setItem("isAdminLoggedIn", "true");
          sessionStorage.setItem("isAdminLoggedIn", "true");
        }

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        // Fallback for successful request but failed logic
        throw new Error(response.data.message || "Authentication failed.");
      }
    } catch (error) {
      console.error("Login attempt failed:", error);
      let errMsg = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errMsg = "Connection timed out.";
        } else if (error.response) {
          errMsg = error.response.data?.message || `Server Error (${error.response.status})`;
          if (error.response.status === 401) errMsg = "Invalid username or password.";
          if (error.response.status === 403) errMsg = "Access denied. Insufficient permissions.";
        } else {
          errMsg = "Network error. Check your internet.";
        }
      } else if (error instanceof Error) {
        errMsg = error.message;
      }

      setApiError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 overflow-hidden bg-background">
      {/* --- Left Column: Form & Interaction --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto grid w-full max-w-[420px] gap-8"
        >
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access the admin portal.
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

              {/* Profile Picture Upload Section (Optional) */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-muted shadow-xl ring-2 ring-muted">
                    {profilePreview ? (
                      <Image
                        src={profilePreview}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <User className="h-10 w-10 opacity-50" />
                      </div>
                    )}
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {/* Input Trigger */}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0 rounded-full z-20"
                    onChange={handleProfileImageChange}
                    disabled={isSubmitting}
                    ref={fileInputRef}
                    title="Change profile picture"
                  />
                  {/* Utility Button: Remove */}
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      className="absolute -right-2 top-0 z-30 rounded-full bg-destructive p-1.5 text-white shadow-sm hover:bg-destructive/90 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <FormField
                  control={methods.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                          <Input
                            placeholder="admin"
                            className="pl-10 h-11 bg-muted/50 border-input/60 focus:bg-background transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/admin/forgot-password"
                          className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11 bg-muted/50 border-input/60 focus:bg-background transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground/60 hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Remember Me & Error */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                  >
                    Remember me on this device
                  </label>
                </div>

                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2 border border-destructive/20"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{apiError}</p>
                  </motion.div>
                )}
              </div>

              {/* Submit Action */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In <LogIn className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="https://montres.ae">Back to Website</Link>
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </motion.div>
      </div>

      {/* --- Right Column: Visual / Branding --- */}
      <div className="hidden lg:block relative bg-slate-900 border-l border-white/10">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6 max-w-lg"
          >
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl mb-8">
              <LayoutDashboard className="h-16 w-16 text-primary" />
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Montres <span className="text-primary">Admin</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              Manage your inventory, track sales, and oversee operations with our comprehensive dashboard.
              Designed for efficiency and elegance.
            </p>

            {/* Stats or Trust Badge Example */}
            <div className="pt-12 grid grid-cols-3 gap-8 border-t border-white/10 mt-12">
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Encrypted</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Fast</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Performance</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer copyright on right side */}
        <div className="absolute bottom-8 w-full text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Montres Admin Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
