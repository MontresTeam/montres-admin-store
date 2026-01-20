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
  Bell,
  Wrench,
  FileText,
  CreditCard,
  UserCog
} from "lucide-react";

import newCurrency from "../public/assets/newSymbole.png";
import Image from "next/image";

const CurrencyPngIcon = () => (
  <Image src={newCurrency} alt="currency" width={18} height={18} />
);

export const data = {
  navMain: [
    /* ================= MAIN ================= */
    {
      label: "Overview",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },

    /* ================= INVENTORY & PRODUCTS ================= */
    {
      label: "Inventory & Products",
    },
    {
      title: "Products",
      url: "/productmanage",
      icon: ShoppingBasket,
    },
    {
      title: "Inventory & Stock",
      url: "/InventoryStock",
      icon: Boxes,
    },
    {
      title: "Purchase Management",
      url: "/PurchaseManaging",
      icon: Package,
    },
    {
      title: "Watch Services",
      url: "/watch-services",
      icon: Wrench,
    },

    /* ================= SALES & ORDERS ================= */
    {
      label: "Sales & Orders",
    },
    {
      title: "Order Management",
      url: "/orderManagment",
      icon: ClipboardList,
    },
    {
      title: "Delivery Management",
      url: "/DeliveryManagement",
      icon: Truck,
    },

    /* ================= CUSTOMERS ================= */
    {
      label: "Customers & Support",
    },
    {
      title: "Customers",
      url: "/users-list",
      icon: UsersRound,
    },
    {
      title: "Subscribers",
      url: "/back-in-stock-subscribers",
      icon: Bell,
    },
    {
      title: "Inquiries",
      url: "/contact-messages",
      icon: MessageSquare,
    },

    /* ================= CONTENT ================= */
    {
      label: "Content Management",
    },
    {
      title: "Homepage Setup",
      url: "/homecustomization",
      icon: ImageUpscale,
    },
    {
      title: "SEO & Content",
      icon: Star,
      items: [
        { title: "All Pages", url: "/seo-content/AllPages", circleColor: "bg-blue-500" },
        { title: "Category Pages", url: "/seo-content/categories", circleColor: "bg-purple-500" },
      ],
    },

    /* ================= ANALYTICS ================= */
    {
      label: "Analytics",
    },
    {
      title: "Reports",
      icon: BarChartBig,
      items: [
        { title: "Monthly Sales", url: "/reports/monthly-sales", circleColor: "bg-green-500" },
        { title: "Inventory Status", url: "/reports/inventory-monthly", circleColor: "bg-orange-500" },
        { title: "Brand Performance", url: "/reports/brand", circleColor: "bg-blue-500" },
        { title: "Low Stock", url: "/reports/low-stock", circleColor: "bg-red-500" },
        { title: "Dead Stock", url: "/reports/dead-stock", circleColor: "bg-gray-500" },
      ],
    },

 
  ],
};
