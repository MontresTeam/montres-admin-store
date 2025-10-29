import {
  ClipboardList,
  Star,
  House,
  Mail,
  Truck,
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
      url: "/users-list",
      icon: UsersRound,
      isActive: true,
    },
    {},
    {
      title: "Email",
      url: "/notfound",
      icon: Mail,
    },
    {
      title: "Delivery Managment",
      url: "/DeliveryManagement",
      icon: Truck,
    },
    {
      title: "Order Managment",
      url: "/orderManagment",
      icon: ClipboardList,
    },

    {
    title: "Brand New",  // Add as main menu item
    url: "/BrandNew",
    icon: Star, // You can use Star, Tag, or any appropriate icon
    isActive: true,
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
