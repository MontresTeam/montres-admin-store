"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  User,
  MapPin,
  ArrowLeft,
  Printer,
  Mail,
  MoreVertical,
  Clock,
  RefreshCw,
  ShoppingBag,
  DollarSign
} from "lucide-react";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import newCurrencySymbol from "../../../../public/assets/newSymbole.png";

// Currency Display Component
const CurrencyDisplay = ({ amount, className = "" }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <Image
      src={newCurrencySymbol}
      alt="AED"
      width={14}
      height={14}
      className="w-3.5 h-3.5 object-contain opacity-80"
    />
    <span className="font-semibold tracking-tight">{amount?.toFixed(2) || '0.00'}</span>
  </div>
);

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileView, setMobileView] = useState(false);

  // API base URL
  const API_BASE_URL = "https://api.montres.ae/api/admin/order";

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setOrders(response.data.orders || response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single order by ID
  const fetchOrderById = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${orderId}`);
      setSelectedOrder(response.data.order || response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle order selection
  const handleOrderSelect = (order) => {
    if (order.items && order.shippingAddress) {
      setSelectedOrder(order);
    } else {
      fetchOrderById(order._id);
    }
  };

  // Map API status to display status
  const mapStatus = (apiStatus) => {
    const statusMap = {
      Pending: "pending",
      Processing: "processing",
      Shipped: "shipped",
      Delivered: "completed",
      Cancelled: "cancelled",
    };
    return statusMap[apiStatus] || apiStatus?.toLowerCase() || "pending";
  };

  // Format order data for display
  const formatOrderForDisplay = (order) => {
    if (!order) return null;
    return {
      id: order._id,
      customer: `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() || "Guest Customer",
      email: order.shippingAddress?.email || "N/A",
      date: new Date(order.createdAt).toISOString().split("T")[0],
      displayDate: new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: mapStatus(order.orderStatus),
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: order.items?.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image, // Assuming image might be available in future
      })) || [],
      shipping: {
        address: `${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city || ""}`,
        fullAddress: `${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""}, ${order.shippingAddress?.country || ""} - ${order.shippingAddress?.postalCode || ""}`,
        method: order.region === "local" ? "Standard Delivery" : "Express Shipping",
        phone: order.shippingAddress?.phone || "N/A"
      },
      billing: {
        address: `${order.billingAddress?.street || ""}, ${order.billingAddress?.city || ""}`,
        fullAddress: `${order.billingAddress?.street || ""}, ${order.billingAddress?.city || ""}, ${order.billingAddress?.state || ""}, ${order.billingAddress?.country || ""} - ${order.billingAddress?.postalCode || ""}`,
      },
      summary: {
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        vat: order.vat,
        total: order.total
      },
      rawData: order,
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "processing": return "info";
      case "shipped": return "default"; // blue-ish usually
      case "completed": return "success";
      case "cancelled": return "danger";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return Clock;
      case "processing": return RefreshCw;
      case "shipped": return Truck;
      case "completed": return CheckCircle;
      case "cancelled": return XCircle;
      default: return Package;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .map(formatOrderForDisplay)
      .filter((order) => {
        if (!order) return false;
        const matchesSearch =
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [orders, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => mapStatus(o.orderStatus) === 'pending').length;
    const processing = orders.filter(o => mapStatus(o.orderStatus) === 'processing').length;
    const completed = orders.filter(o => mapStatus(o.orderStatus) === 'completed').length;
    const revenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
    return { total, pending, processing, completed, revenue };
  }, [orders]);

  // Order List Item Component
  const OrderListItem = ({ order, isSelected, onClick }) => {
    const StatusIcon = getStatusIcon(order.status);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden
          ${isSelected
            ? "bg-primary/5 border-primary shadow-sm"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          }
        `}
      >
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}

        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-neutral-500">#{order.id.slice(-6)}</span>
            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize px-1.5 py-0.5 h-auto text-[10px]">
              {order.status}
            </Badge>
          </div>
          <span className="text-[10px] text-neutral-400">{order.displayDate}</span>
        </div>

        <div className="mb-2">
          <h4 className={`font-semibold text-sm truncate ${isSelected ? "text-primary" : "text-neutral-800 dark:text-neutral-100"}`}>
            {order.customer}
          </h4>
          <p className="text-xs text-neutral-500 truncate">{order.items.length} items • {order.shipping.method}</p>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 group-hover:border-neutral-200 dark:group-hover:border-neutral-700 transition-colors">
          <CurrencyDisplay amount={order.total} className="text-sm font-bold text-neutral-900 dark:text-white" />
          <StatusIcon size={14} className={
            order.status === 'completed' ? 'text-green-500' :
              order.status === 'pending' ? 'text-yellow-500' :
                order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'
          } />
        </div>
      </motion.div>
    );
  };

  // Detail View Component
  const OrderDetailsView = ({ order, onBack }) => {
    if (!order) return null;
    const StatusIcon = getStatusIcon(order.status);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden"
      >
        {/* Detail Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-start bg-neutral-50/50 dark:bg-neutral-900">
          <div className="flex items-start gap-4">
            {mobileView && (
              <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 shrink-0">
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Order #{order.id.slice(-6)}</h2>
                <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize gap-1">
                  <StatusIcon size={12} />
                  {order.status}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-2">
                <Calendar size={12} /> Placed on {order.displayDate} at {order.time}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Printer size={14} /> Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  Action <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Mark as Processing</DropdownMenuItem>
                <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
                <DropdownMenuItem>Mark as Delivered</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <User size={16} className="text-neutral-500" /> Customer Details
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm space-y-2 border border-neutral-100 dark:border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Name</span>
                  <span className="font-medium">{order.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Email</span>
                  <span className="font-medium">{order.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Phone</span>
                  <span className="font-medium">{order.shipping.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin size={16} className="text-neutral-500" /> Deliver To
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 text-sm space-y-2 border border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{order.customer}</span>
                  <span className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                    {order.shipping.fullAddress}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700 flex justify-between">
                  <span className="text-neutral-500">Method</span>
                  <span className="font-medium">{order.shipping.method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
              <ShoppingBag size={16} className="text-neutral-500" /> Order Items
            </h3>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-neutral-500">Item</th>
                    <th className="px-4 py-3 font-medium text-neutral-500 text-center">Qty</th>
                    <th className="px-4 py-3 font-medium text-neutral-500 text-right">Price</th>
                    <th className="px-4 py-3 font-medium text-neutral-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="bg-white dark:bg-neutral-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                            IMG
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-xs text-neutral-500">SKU: {item.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">
                        <CurrencyDisplay amount={item.price} className="justify-end" />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <CurrencyDisplay amount={item.price * item.quantity} className="justify-end" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <CreditCard size={16} className="text-neutral-500" /> Payment Info
              </h3>
              <div className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold tracking-widest">
                  VISA
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white uppercase">
                    {order.paymentMethod || 'Credit Card'}
                  </p>
                  <p className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    Status: {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <CurrencyDisplay amount={order.summary.subtotal} />
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>Shipping</span>
                <CurrencyDisplay amount={order.summary.shippingFee} />
              </div>
              <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>VAT (5%)</span>
                <CurrencyDisplay amount={order.summary.vat} />
              </div>
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="text-base font-bold text-neutral-900 dark:text-white">Total</span>
                <CurrencyDisplay amount={order.summary.total} className="text-xl font-bold text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const emptyState = (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-4 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800">
      <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center">
        <Package size={32} className="opacity-20" />
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">No order selected</h3>
        <p className="text-sm">Select an order from the list to view details</p>
      </div>
    </div>
  );

  return (
    <>
      <DashboardBreadcrumb title="Order Management" text="Orders" />

      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, icon: Package, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
            { label: 'Processing', value: stats.processing, icon: RefreshCw, color: 'bg-cyan-500' },
            { label: 'Total Revenue', value: stats.revenue, icon: DollarSign, color: 'bg-green-500', isCurrency: true },
          ].map((stat, i) => (
            <Card key={i} className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 ${stat.color}`} />
              <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    {stat.isCurrency ? <CurrencyDisplay amount={stat.value} /> : stat.value}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-${stat.color.replace('bg-', '')}`}>
                  <stat.icon size={20} className={stat.color.replace('bg-', 'text-')} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="h-[calc(100vh-280px)] min-h-[600px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Order List */}
          <div className={`${mobileView && selectedOrder ? 'hidden' : 'block'} lg:col-span-4 xl:col-span-3 flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden`}>
            {/* Filter Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-neutral-50 dark:bg-neutral-800 border-none shadow-none"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-neutral-50 dark:bg-neutral-800 border-none icon-right">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-neutral-500" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scrollable Order List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-neutral-400 space-y-3">
                  <RefreshCw className="animate-spin" size={24} />
                  <p className="text-sm">Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderListItem
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onClick={() => handleOrderSelect(order.rawData)}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-neutral-400">
                  <p className="text-sm">No orders found.</p>
                </div>
              )}
            </div>

            {/* Footer Count */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-center text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
              Showing {filteredOrders.length} orders
            </div>
          </div>

          {/* Right Column: Details View */}
          <div className={`${!mobileView || selectedOrder ? 'block' : 'hidden'} lg:col-span-8 xl:col-span-9 h-full relative`}>
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <OrderDetailsView
                  key={selectedOrder.id}
                  order={formatOrderForDisplay(selectedOrder)}
                  onBack={() => setSelectedOrder(null)}
                />
              ) : (
                <div key="empty" className="h-full">
                  {emptyState}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderManagement;