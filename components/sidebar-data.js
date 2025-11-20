import {
  ClipboardList,
  Star,
  House,
  ImageUpscale,
  Mail,
  Truck,
  ShoppingBasket,
  MessageSquare,
  UsersRound,
  Boxes
} from "lucide-react";

import { FiDollarSign } from "react-icons/fi"; // Feather Icons

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
      title: "Delivery Managment",
      url: "/DeliveryManagement",
      icon: Truck,
    },
    {
      title: "Order Managment",
      url: "/orderManagment",
      icon: ClipboardList,
    },

    // ⭐ NEW INVENTORY STOCK MANAGEMENT
    {
      title: "Inventory Stock Management",
      url: "/InventoryStock",
      icon: Boxes, // use Boxes / Package / Layers / Warehouse icon (lucide-react)
      isActive: true,
    },

    {
      title: "Brand New",
      url: "/BrandNew",
      icon: Star,
      isActive: true,
    },

    {
      title: "Financial Overview",
      url: "/financial-overview",
      icon: FiDollarSign,
      isActive: false,
    },

    {
      title: "Inquiries",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Contact Messages",
          url: "/contact-messages",
          circleColor: "bg-blue-500",
        },
        {
          title: "Support Tickets",
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
