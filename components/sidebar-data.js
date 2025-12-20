import {
  ClipboardList,
  Star,
  House,
  ImageUpscale,
  Truck,
  ShoppingBasket,
  MessageSquare,
  UsersRound,
  Boxes,
  Settings,
  Package,
  BarChartBig,
} from "lucide-react";

import newCurrency from "../public/assets/newSymbole.png";
import Image from "next/image";

const CurrencyPngIcon = () => (
  <Image src={newCurrency} alt="currency" width={18} height={18} />
);

export const data = {
  navMain: [
    /* ================= DASHBOARD ================= */
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },

    /* ================= PRODUCTS ================= */
    {
      title: "Products",
      url: "/productmanage",
      icon: ShoppingBasket,
      isActive: true,
    },

    /* ================= INVENTORY ================= */
    {
      title: "Inventory & Stock",
      url: "/InventoryStock",
      icon: Boxes,
      isActive: true,
    },

     {
    title: "Reports",
    icon: BarChartBig,
    items: [
      { title: "Monthly Sales", url: "/reports/monthly-sales" },
      { title: "Inventory Month-End", url: "/reports/inventory-monthly" },
      { title: "Brand Report", url: "/reports/brand" },
      { title: "Low Stock", url: "/reports/low-stock" },
      { title: "Dead Stock", url: "/reports/dead-stock" },
    ],
  },

    /* ================= ORDERS ================= */
    {
      title: "Order Management",
      url: "/orderManagment",
      icon: ClipboardList,
    },

    /* ================= DELIVERY ================= */
    {
      title: "Delivery Management",
      url: "/DeliveryManagement",
      icon: Truck,
    },

    /* ================= CUSTOMERS ================= */
    {
      title: "Customers",
      url: "/users-list",
      icon: UsersRound,
      isActive: true,
    },

    /* ================= WATCH SERVICES ================= */
    {
      title: "Watch Services",
      url: "/watch-services",
      icon: Package,
      isActive: true,
    },

    /* ================= HOME CUSTOMIZATION ================= */
    {
      title: "Homepage Customization",
      url: "/homecustomization",
      icon: ImageUpscale,
      isActive: true,
    },

    /* ================= MARKETING ================= */
    {
      title: "Marketing & Offers",
      url: "#",
      icon: Star,
      items: [
        { title: "Coupons", url: "/coupons" },
        { title: "Campaigns", url: "/campaigns" },
        { title: "Push Notifications", url: "/push-notification" },
      ],
    },

    /* ================= FINANCIAL ================= */
    {
      title: "Financial Overview",
      url: "/financial-overview",
      icon: CurrencyPngIcon,
      isActive: true,
    },

    /* ================= INQUIRIES ================= */
    {
      title: "Inquiries",
      url: "/contact-messages", // or "#" if it's just a placeholder
      icon: MessageSquare,
    },

    /* ================= SETTINGS ================= */
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        { title: "Company Info", url: "/company" },
        { title: "Staff & Permissions", url: "/staff" },
        { title: "Notification Settings", url: "/settings-notification" },
        { title: "Alert Settings", url: "/notification-alert" },
        { title: "System Settings", url: "/system" },
      ],
    },
  ],
};
