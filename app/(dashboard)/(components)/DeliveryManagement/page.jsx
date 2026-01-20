"use client"
import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Search,
  Download,
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  Printer,
  ChevronRight,
  ClipboardList,
  Clock,
  Box,
  ArrowRight
} from 'lucide-react'

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import newCurrencySymbol from '../../../../public/assets/newSymbole.png'
import Image from "next/image";

// Currency Display Component
const CurrencyDisplay = ({ amount, className = "" }) => (
  <div className={`flex items-center gap-1 ${className}`}>
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

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileView, setMobileView] = useState(false);

  // Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');

  // Constants
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

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Categorize orders by status
  const categorizeOrders = (allOrders) => {
    return {
      pending: allOrders.filter(order =>
        ['Pending', 'pending'].includes(order.orderStatus)
      ),
      processing: allOrders.filter(order =>
        ['Processing', 'processing'].includes(order.orderStatus)
      ),
      shipped: allOrders.filter(order =>
        ['Shipped', 'shipped'].includes(order.orderStatus)
      ),
      delivered: allOrders.filter(order =>
        ['Delivered', 'delivered', 'Completed', 'completed'].includes(order.orderStatus)
      ),
      cancelled: allOrders.filter(order =>
        ['Cancelled', 'cancelled', 'Refunded', 'refunded'].includes(order.orderStatus)
      )
    };
  };

  const deliveryData = useMemo(() => categorizeOrders(orders), [orders]);

  // Action handlers
  const handleUpdateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    try {
      // Optimistic update
      const updatedOrders = orders.map(o =>
        o._id === orderId ? { ...o, orderStatus: newStatus, ...additionalData } : o
      );
      setOrders(updatedOrders);

      await axios.put(`${API_BASE_URL}/${orderId}`, {
        orderStatus: newStatus,
        ...additionalData
      });

      // Refresh to ensure sync
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert optimism if needed (could implement revert logic here)
      alert('Failed to update order status. Please try again.');
      fetchOrders();
    }
  };

  const moveToProcessing = (orderId) => handleUpdateOrderStatus(orderId, 'Processing');

  const openTrackingModal = (orderId) => {
    setSelectedOrderIdForTracking(orderId);
    setTrackingNumber('');
    setCourierName('');
    setTrackingModalOpen(true);
  };

  const submitShipment = async () => {
    if (!selectedOrderIdForTracking) return;

    await handleUpdateOrderStatus(selectedOrderIdForTracking, 'Shipped', {
      trackingNumber,
      courierName,
      shippedAt: new Date().toISOString()
    });
    setTrackingModalOpen(false);
  };

  const markAsDelivered = (orderId) => handleUpdateOrderStatus(orderId, 'Delivered', { deliveredAt: new Date().toISOString() });
  const cancelOrder = (orderId) => handleUpdateOrderStatus(orderId, 'Cancelled');

  // Filtered List based on Active Tab & Search
  const filteredList = useMemo(() => {
    const list = deliveryData[activeTab] || [];
    if (!searchTerm) return list;

    const lowerTerm = searchTerm.toLowerCase();
    return list.filter(order =>
      (order.shippingAddress?.firstName?.toLowerCase() || '').includes(lowerTerm) ||
      (order.shippingAddress?.lastName?.toLowerCase() || '').includes(lowerTerm) ||
      (order._id?.toLowerCase() || '').includes(lowerTerm) ||
      (order.shippingAddress?.phone || '').includes(lowerTerm)
    );
  }, [deliveryData, activeTab, searchTerm]);

  // Render Functions
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return "warning";
    if (s.includes('processing')) return "info";
    if (s.includes('shipped')) return "default"; // blue usually
    if (s.includes('delivered') || s.includes('completed')) return "success";
    if (s.includes('cancelled')) return "danger";
    return "secondary";
  };

  const StatCard = ({ title, count, icon: Icon, colorClass, activeKey }) => (
    <button onClick={() => setActiveTab(activeKey)} className="text-left w-full h-full">
      <Card className={`h-full border transition-all duration-200 hover:shadow-md ${activeTab === activeKey ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-900 border-primary' : 'border-neutral-200 dark:border-neutral-800'}`}>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{count}</h3>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon size={20} />
          </div>
        </CardContent>
        {/* Progress bar indicator */}
        <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 mt-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((count / (orders.length || 1)) * 100, 100)}%` }}
            className={`h-full ${colorClass.replace('/10 text-', ' bg-').replace('/20 text-', ' bg-').split(' ')[0].replace('bg-', 'bg-')}`}
          />
        </div>
      </Card>
    </button>
  );

  const getFullAddress = (address) => {
    if (!address) return "N/A";
    return [address.street, address.city, address.state, address.country].filter(Boolean).join(', ');
  };

  // Modern Card Item for List
  const DeliveryItem = ({ order }) => {
    const isMobile = mobileView;
    const actions = (
      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 justify-end">
        {activeTab === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => cancelOrder(order._id)}>
              <X size={14} className="mr-1" /> Reject
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => moveToProcessing(order._id)}>
              <RefreshCw size={14} className="mr-1" /> Process
            </Button>
          </>
        )}
        {activeTab === 'processing' && (
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => openTrackingModal(order._id)}>
            <Truck size={14} className="mr-1" /> Ship Order
          </Button>
        )}
        {activeTab === 'shipped' && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => markAsDelivered(order._id)}>
            <CheckCircle size={14} className="mr-1" /> Mark Delivered
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { }}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Print Invoice</DropdownMenuItem>
            <DropdownMenuItem>Print Label</DropdownMenuItem>
            {activeTab !== 'cancelled' && <DropdownMenuSeparator />}
            {activeTab !== 'cancelled' && <DropdownMenuItem className="text-red-600" onClick={() => cancelOrder(order._id)}>Cancel Order</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 mb-3"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between">

          {/* Left: Info */}
          <div className="flex gap-4">
            {/* Icon Box */}
            <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center 
              ${order.orderStatus === 'Delivered' ? 'bg-green-100/50 text-green-600' :
                order.orderStatus === 'Shipped' ? 'bg-indigo-100/50 text-indigo-600' :
                  order.orderStatus === 'Processing' ? 'bg-blue-100/50 text-blue-600' :
                    order.orderStatus === 'Cancelled' ? 'bg-red-100/50 text-red-600' : 'bg-yellow-100/50 text-yellow-600'
              }`}>
              {order.orderStatus === 'Delivered' ? <CheckCircle size={20} /> :
                order.orderStatus === 'Shipped' ? <Truck size={20} /> :
                  order.orderStatus === 'Processing' ? <RefreshCw size={20} /> :
                    order.orderStatus === 'Cancelled' ? <XCircle size={20} /> : <Clock size={20} />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">#{order._id.slice(-6)}</span>
                <Badge variant={getStatusColor(order.orderStatus)} className="capitalize h-5 px-1.5 text-[10px] font-semibold border-0">
                  {order.orderStatus}
                </Badge>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </h4>

              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{getFullAddress(order.shippingAddress)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="shrink-0" />
                  <span>{order.shippingAddress?.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1.5 rounded-md w-fit">
                <Box size={12} className="text-neutral-400" />
                <span className="font-medium">{order.items?.length || 0} items</span>
                <span className="text-neutral-300 mx-1">|</span>
                <CurrencyDisplay amount={order.total} className="font-bold text-neutral-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col justify-between items-end min-w-[140px]">
            {actions}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <DashboardBreadcrumb title="Delivery Management" text="Shipments" />

      <div className="space-y-6 max-w-[1600px] mx-auto pb-20">

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Shipment Overview</h2>
            <p className="text-sm text-neutral-500">Track and manage your order deliveries.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4">
          <StatCard
            title="Pending"
            count={deliveryData.pending.length}
            icon={Clock}
            colorClass="bg-yellow-100/20 text-yellow-600"
            activeKey="pending"
          />
          <StatCard
            title="Processing"
            count={deliveryData.processing.length}
            icon={RefreshCw}
            colorClass="bg-blue-100/20 text-blue-600"
            activeKey="processing"
          />
          <StatCard
            title="Shipped"
            count={deliveryData.shipped.length}
            icon={Truck}
            colorClass="bg-indigo-100/20 text-indigo-600"
            activeKey="shipped"
          />
          <StatCard
            title="Delivered"
            count={deliveryData.delivered.length}
            icon={CheckCircle}
            colorClass="bg-green-100/20 text-green-600"
            activeKey="delivered"
          />
          <StatCard
            title="Cancelled"
            count={deliveryData.cancelled.length}
            icon={XCircle}
            colorClass="bg-red-100/20 text-red-600"
            activeKey="cancelled"
          />
        </div>

        {/* Main Interface */}
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                placeholder="Search by customer, ID or phone..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 whitespace-nowrap hidden sm:flex">
              <span>Show:</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-[70px] border-none bg-neutral-100 dark:bg-neutral-800">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredList.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 px-2 pb-1 uppercase tracking-wide font-medium">
                  <span>{activeTab} Shipments ({filteredList.length})</span>
                  <span>Actions</span>
                </div>
                <AnimatePresence mode="popLayout">
                  {filteredList.map(order => (
                    <DeliveryItem key={order._id} order={order} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-dashed border-neutral-200 dark:border-neutral-800">
                  <Package size={32} className="text-neutral-300" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No shipments found</h3>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto mt-1">
                  There are no orders in the <span className="font-medium text-neutral-800 dark:text-neutral-300 capitalize">{activeTab}</span> stage currently.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ship Order Modal */}
      <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
            <DialogDescription>
              Enter tracking details to mark this order as shipped.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Name</label>
              <Input
                placeholder="e.g. DHL, FedEx, Aramex"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                placeholder="e.g. 1234567890"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingModalOpen(false)}>Cancel</Button>
            <Button onClick={submitShipment} disabled={!trackingNumber || !courierName}>Confirm Shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeliveryManagement