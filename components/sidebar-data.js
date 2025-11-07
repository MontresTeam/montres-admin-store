import {
  Boxes,
  CalendarDays,
  ChartPie,
  Component,
  House,
  ImageUpscale,
  Mail,
  MessageCircleMore,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  MessageSquare,
  UsersRound,

} from "lucide-react";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },
    {
      title: "Product Management",
      url: "/productmanage",
      icon: ShoppingBasket,
      isActive: true,
    },
    {
      title: "User Management",
      url: "/notfound",
      icon: UsersRound,
      isActive: true
    },
    {
      title: "Home Customization",
      url: "/homecustomization",
      icon: ImageUpscale,
      isActive: true
    },
    {
      title: "Email",
      url: "/notfound",
      icon: Mail,
    },
    {
      title: "Chat",
      url: "/notfound",
      icon: MessageCircleMore,
    },
    {
      title: "Calendar",
      url: "/notfound",
      icon: CalendarDays,
    },

    {
      title: "Components",
      url: "#",
      icon: Component,
      isActive: true,
      items: [
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
      title: "Inquiries",
      url: "#",
      icon: MessageSquare, // or Mail, or Inbox icon from lucide-react
      items: [
        {
          title: "Contact Messages",
          url: "/contact-messages",
          circleColor: "bg-blue-500",
        },
        {
          title: "Support Tickets", // optional, if you later add more
          url: "/support-tickets",
          circleColor: "bg-green-500",
        },
      ],
    },

    // {
    //   title: "Setting",
    //   url: "#",
    //   icon: Settings,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Company",
    //       url: "/company",
    //       circleColor: "bg-primary",
    //     },
    //     {
    //       title: "Notification",
    //       url: "/settings-notification",
    //       circleColor: "bg-yellow-500",
    //     },
    //     {
    //       title: "Notification Alert",
    //       url: "/notification-alert",
    //       circleColor: "bg-yellow-500",
    //     },
    //   ],
    // },
  ],
};
