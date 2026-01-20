"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  User,
  LogOut,
  Shield,
  Calendar,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const ProfileDropdown = () => {
  const [adminData, setAdminData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load admin data from localStorage on component mount
    const loadAdminData = () => {
      if (typeof window !== "undefined") {
        const storedData = localStorage.getItem("adminData");
        if (storedData) {
          try {
            setAdminData(JSON.parse(storedData));
          } catch (error) {
            console.error("Error parsing admin data:", error);
            setAdminData(null);
          }
        }
      }
    };

    loadAdminData();

    // Listen for storage events (in case data changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "adminData") {
        loadAdminData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event if you update data within same tab
    const handleAdminDataChange = () => {
      loadAdminData();
    };

    window.addEventListener("adminDataUpdated", handleAdminDataChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminDataUpdated", handleAdminDataChange);
    };
  }, []);

  const handleLogout = () => {
    // Clear all admin-related data from storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("rememberAdmin");

    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("isAdminLoggedIn");

    // Clear axios default headers
    if (typeof axios !== 'undefined') {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Dispatch event for other components
    window.dispatchEvent(new Event("adminDataUpdated"));

    // Redirect to login page
    window.location.href = "/admin/login";
  };

  const getInitials = (username) => {
    if (!username) return "A";
    return username.charAt(0).toUpperCase();
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      "ceo": "CEO",
      "sales": "Sales Management",
      "developer": "Developer",
      "admin": "Administrator"
    };
    return roleMap[role] || role || "Admin";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-10 w-10 sm:h-auto sm:w-auto rounded-full sm:rounded-xl p-0 sm:px-3 sm:py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200",
            isOpen && "bg-slate-100 dark:bg-slate-800"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm",
              "ring-2 ring-transparent group-hover:ring-primary/20",
              isOpen && "ring-primary/30"
            )}>
              {adminData?.profile ? (
                <Image
                  src={adminData.profile}
                  className="object-cover"
                  fill
                  sizes="36px"
                  alt={adminData.username || "Admin profile"}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                  {getInitials(adminData?.username)}
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none mb-1">
                {adminData?.username ? adminData.username.charAt(0).toUpperCase() + adminData.username.slice(1) : "Admin"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                {getRoleDisplayName(adminData?.role)}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900"
        align="end"
        sideOffset={8}
      >
        {/* User Info Section */}
        <div className="px-2 py-2 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              {getRoleDisplayName(adminData?.role)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {adminData?.email || "admin@montres.ae"}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg mb-1">
            <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4 text-slate-500" />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            <Link href="/help" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Help & Support
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

        {/* Last Login Info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-100 dark:border-slate-800">
            <Calendar className="w-3 h-3" />
            <span>Login: {adminData?.loginTime ? new Date(adminData.loginTime).toLocaleDateString() : "Just now"}</span>
          </div>
        </div>

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-lg text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 mt-1"
        >
          <div className="flex items-center gap-2.5 px-2 py-1 w-full font-medium">
            <LogOut className="w-4 h-4" />
            Sign Out
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;