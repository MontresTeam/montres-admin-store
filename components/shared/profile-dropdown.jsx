"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  Shield, 
  Calendar, 
  HelpCircle,
  CreditCard,
  Bell
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import userImg from "@/public/assets/images/user.png";

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
      "sales": "Sales Manager",
      "developer": "Developer",
      "admin": "Administrator"
    };
    return roleMap[role] || role || "Admin";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full sm:w-12 sm:h-12 w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30 dark:from-slate-700/50 dark:to-slate-800/50 dark:hover:from-slate-700 dark:hover:to-slate-800 border border-primary/20 dark:border-slate-700 cursor-pointer transition-all duration-200",
            isOpen && "ring-2 ring-primary/30 dark:ring-primary/50 shadow-lg"
          )}
        >
          {adminData?.profile ? (
            <div className="relative w-full h-full">
              <Image
                src={adminData.profile}
                className="rounded-full object-cover"
                fill
                sizes="(max-width: 48px) 100vw"
                alt={adminData.username || "Admin profile"}
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(adminData?.username)}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        {/* Profile Header */}
        <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="relative">
              {adminData?.profile ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg">
                  <Image
                    src={adminData.profile}
                    className="object-cover"
                    width={64}
                    height={64}
                    alt={adminData.username || "Admin profile"}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getInitials(adminData?.username)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                {adminData?.username ? adminData.username.charAt(0).toUpperCase() + adminData.username.slice(1) : "Admin User"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/80 text-xs font-medium">
                  {getRoleDisplayName(adminData?.role)}
                </div>
                <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 truncate">
                {adminData?.email || "admin@montres.ae"}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Last login: {adminData?.loginTime ? new Date(adminData.loginTime).toLocaleDateString() : "Today"}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          <div className="px-1">
            <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Link href="/profile" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">My Profile</span>
                  <p className="text-xs text-slate-500 dark:text-slate-500">View your personal information</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Link href="/notifications" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Notifications</span>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Check your alerts</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                  3
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Link href="/settings" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Settings</span>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Manage your preferences</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Link href="/billing" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Billing</span>
                  <p className="text-xs text-slate-500 dark:text-slate-500">View subscription plans</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem asChild className="cursor-pointer px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Link href="/help" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Help & Support</span>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Get assistance</p>
                </div>
              </Link>
            </DropdownMenuItem>
          </div>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-11 rounded-lg border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Montres Admin Portal • v2.4.1
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;