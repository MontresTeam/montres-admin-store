import {
  Boxes,
  CalendarDays,
  ChartPie,
  Component,
  House,
  Mail,
  MessageCircleMore,
  Server,
  Settings,
  ShieldCheck,
  StickyNote,
  UsersRound,
} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/ecommerce",
      icon: House,
      isActive: true
    },
    {
      label: "Application",
    },
    {
      title: "Email",
      url: "/email",
      icon: Mail,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageCircleMore,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      label: "UI Elements",
    },
    {
      title: "Components",
      url: "#",
      icon: Component,
      isActive: true,
      items: [
        {
          title: "Product managment",
          url: "/productmanage",
          circleColor: "bg-primary",
        },
        {
          title: "Colors",
          url: "/colors",
          circleColor: "bg-yellow-500",
        },
        
      ],
    },
  
   
    {
      title: "Users",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "Users List",
          url: "/users-list",
          circleColor: "bg-primary",
        },
        {
          title: "Users Grid",
          url: "/users-grid",
          circleColor: "bg-yellow-500",
        },
        {
          title: "View Profile",
          url: "/view-profile",
          circleColor: "bg-red-600",
        },
      ],
    },
    {
      label: "Pages",
    },
    {
      title: "Authentication",
      url: "#",
      icon: ShieldCheck,
      isActive: true,
      items: [
        {
          title: "Sign In",
          url: "/auth/login",
          circleColor: "bg-primary",
        },
        {
          title: "Sign Up",
          url: "/auth/register",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Forgot Password",
          url: "/auth/forgot-password",
          circleColor: "bg-cyan-500",
        },
      ],
    },
    {
      title: "Setting",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Company",
          url: "/company",
          circleColor: "bg-primary",
        },
        {
          title: "Notification",
          url: "/settings-notification",
          circleColor: "bg-yellow-500",
        },
        {
          title: "Notification Alert",
          url: "/notification-alert",
          circleColor: "bg-yellow-500",
        },
      ],
    },
  ],
};
