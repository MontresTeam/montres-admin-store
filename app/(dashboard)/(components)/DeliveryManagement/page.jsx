"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  FiRefreshCw, 
  FiSearch, 
  FiDownload, 
  FiX, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiUser
} from 'react-icons/fi'
import { 
  MdPending, 
  MdLocalShipping, 
  MdDoneAll, 
  MdCancel,
  MdLocationOn
} from 'react-icons/md'
import newCurrency from '../../../../public/assets/newSymbole.png'

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9000/api/admin/order');
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
  const categorizeOrders = (orders) => {
    return {
      pending: orders.filter(order => 
        order.orderStatus === 'Pending' || 
        order.orderStatus === 'pending' ||
        order.paymentStatus === 'pending'
      ),
      inProgress: orders.filter(order => 
        order.orderStatus === 'Processing' || 
        order.orderStatus === 'Shipped' ||
        order.orderStatus === 'processing' ||
        order.orderStatus === 'shipped'
      ),
      delivered: orders.filter(order => 
        order.orderStatus === 'Delivered' || 
        order.orderStatus === 'delivered' ||
        order.orderStatus === 'Completed' ||
        order.orderStatus === 'completed'
      ),
      cancelled: orders.filter(order => 
        order.orderStatus === 'Cancelled' || 
        order.orderStatus === 'cancelled' ||
        order.orderStatus === 'Refunded' ||
        order.orderStatus === 'refunded'
      )
    };
  };

  const deliveryData = categorizeOrders(orders);

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (statusLower.includes('processing') || statusLower.includes('shipped')) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (statusLower.includes('delivered') || statusLower.includes('completed')) return 'bg-green-100 text-green-800 border border-green-200';
    if (statusLower.includes('cancelled') || statusLower.includes('refunded')) return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusText = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'Pending';
    if (statusLower.includes('processing')) return 'Processing';
    if (statusLower.includes('shipped')) return 'Shipped';
    if (statusLower.includes('delivered') || statusLower.includes('completed')) return 'Delivered';
    if (statusLower.includes('cancelled')) return 'Cancelled';
    if (statusLower.includes('refunded')) return 'Refunded';
    return status;
  };

  const formatCurrency = (amount, currency = 'AED') => {
    return (
      <span className="flex items-center font-medium">
        <img src={newCurrency.src} alt="AED" className="w-3 h-3 mr-1" />
        {new Intl.NumberFormat('en-AE').format(amount)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (order) => {
    return `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'N/A';
  };

  const getCustomerPhone = (order) => {
    return order.shippingAddress?.phone || 'N/A';
  };

  const getFullAddress = (order) => {
    const addr = order.shippingAddress;
    if (!addr) return 'N/A';
    
    const addressParts = [
      addr.street,
      addr.city,
      addr.state,
      addr.country,
      addr.zipCode
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ');
  };

  const getShortAddress = (order) => {
    const addr = order.shippingAddress;
    if (!addr) return 'N/A';
    
    const shortParts = [addr.city, addr.country].filter(part => part && part.trim() !== '');
    return shortParts.join(', ');
  };

  // Get product names from order items
  const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) return 'No items';
    
    const firstItem = order.items[0];
    const firstName = firstItem.product?.name || firstItem.name || 'Product';
    
    if (order.items.length === 1) {
      return firstName;
    }
    
    return `${firstName} +${order.items.length - 1} more`;
  };

  // Calculate total items quantity
  const getTotalItemsQuantity = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Get order amount breakdown with proper fallbacks
  const getOrderAmountDetails = (order) => {
    // Calculate from items if subtotal is not available
    const calculatedSubtotal = order.items?.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0) || 0;

    const subtotal = order.subtotal || calculatedSubtotal;
    const shippingFee = order.shippingFee || order.shippingPrice || 0;
    const tax = order.tax || order.taxAmount || 0;
    const discount = order.discount || order.discountAmount || 0;
    const total = order.total || subtotal + shippingFee + tax - discount;

    return {
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      itemsTotal: calculatedSubtotal
    };
  };

  // Action handlers
  const handleUpdateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    try {
      await axios.put(`http://localhost:9000/api/admin/order/${orderId}`, {
        orderStatus: newStatus,
        ...additionalData
      });
      fetchOrders(); // Refresh data
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleMarkAsProcessing = async (orderId) => {
    await handleUpdateOrderStatus(orderId, 'Processing');
  };

  const handleMarkAsShipped = async (orderId) => {
    await handleUpdateOrderStatus(orderId, 'Shipped');
  };

  const handleMarkAsDelivered = async (orderId) => {
    await handleUpdateOrderStatus(orderId, 'Delivered', {
      deliveredAt: new Date().toISOString()
    });
  };

  const handleCancelOrder = async (orderId) => {
    await handleUpdateOrderStatus(orderId, 'Cancelled', {
      cancellationReason: 'Admin cancelled'
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const filteredData = deliveryData[activeTab].filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getCustomerName(order).toLowerCase().includes(searchLower) ||
      order._id.toLowerCase().includes(searchLower) ||
      getCustomerPhone(order).includes(searchTerm) ||
      order.shippingAddress?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Compact Order Details Modal
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const amountDetails = getOrderAmountDetails(order);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 space-y-1 sm:space-y-0">
              <span className="truncate">Order ID: {order._id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                {getStatusText(order.orderStatus)}
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  Customer
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <FiUser className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{getCustomerName(order)}</span>
                  </div>
                  <div className="flex items-start">
                    <FiPhone className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{getCustomerPhone(order)}</span>
                  </div>
                  <div className="flex items-start">
                    <FiMail className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 break-all">{order.shippingAddress?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <MdLocationOn className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-xs">{getFullAddress(order)}</span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  Order Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="text-xs text-gray-600">Order Date</label>
                    <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Payment Status</label>
                    <p className="text-gray-900 capitalize">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Payment Method</label>
                    <p className="text-gray-900">{order.paymentMethod || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiPackage className="w-4 h-4 mr-2" />
                Order Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product?.name || item.name || 'Product'}
                      </p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 flex items-center justify-end">
                        {formatCurrency((item.price || item.product?.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 border-b pb-2 flex items-center">
                <FiDollarSign className="w-4 h-4 mr-2" />
                Amount Breakdown
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(amountDetails.subtotal)}</span>
                </div>
                {amountDetails.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span className="font-medium">{formatCurrency(amountDetails.shippingFee)}</span>
                  </div>
                )}
                {amountDetails.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(amountDetails.tax)}</span>
                  </div>
                )}
                {amountDetails.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(amountDetails.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(amountDetails.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
              {(activeTab === 'pending' || activeTab === 'inProgress') && (
                <button
                  onClick={() => {
                    handleCancelOrder(order._id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4 font-medium">{error}</p>
          <button 
            onClick={fetchOrders}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Delivery Management
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium">
              Manage and track all delivery orders efficiently
            </p>
          </div>
          <button 
            onClick={fetchOrders}
            className="mt-3 sm:mt-0 px-3 sm:px-4 md:px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg sm:rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center text-xs sm:text-sm md:text-base font-medium shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2" />
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        {[
          { key: 'pending', label: 'Pending', count: deliveryData.pending.length, color: 'yellow', icon: MdPending },
          { key: 'inProgress', label: 'In Progress', count: deliveryData.inProgress.length, color: 'blue', icon: MdLocalShipping },
          { key: 'delivered', label: 'Delivered', count: deliveryData.delivered.length, color: 'green', icon: MdDoneAll },
          { key: 'cancelled', label: 'Cancelled', count: deliveryData.cancelled.length, color: 'red', icon: MdCancel },
        ].map(stat => (
          <div key={stat.key} className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stat.count}</p>
              </div>
              <div className={`text-lg sm:text-xl md:text-2xl ${
                stat.color === 'yellow' ? 'text-yellow-500' :
                stat.color === 'blue' ? 'text-blue-500' :
                stat.color === 'green' ? 'text-green-500' : 'text-red-500'
              }`}>
                <stat.icon />
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                  stat.color === 'yellow' ? 'bg-yellow-500' :
                  stat.color === 'blue' ? 'bg-blue-500' :
                  stat.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${(stat.count / orders.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Search and Controls */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by customer name, order ID, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 transition-all duration-200"
                />
                <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Export Button */}
            <button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center text-xs sm:text-sm md:text-base font-medium shadow-lg hover:shadow-xl whitespace-nowrap w-full lg:w-auto">
              <FiDownload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { key: 'pending', label: 'Pending', count: deliveryData.pending.length, icon: MdPending },
              { key: 'inProgress', label: 'In Progress', count: deliveryData.inProgress.length, icon: MdLocalShipping },
              { key: 'delivered', label: 'Delivered', count: deliveryData.delivered.length, icon: MdDoneAll },
              { key: 'cancelled', label: 'Cancelled', count: deliveryData.cancelled.length, icon: MdCancel },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap min-w-max transition-all duration-200 flex-1 sm:flex-none justify-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                  activeTab === tab.key ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className={`ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs font-bold ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No orders found</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto px-4">
                  {searchTerm ? 'Try adjusting your search criteria.' : `No ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} orders available.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredData.map((order) => {
                  const amountDetails = getOrderAmountDetails(order);
                  
                  return (
                    <div key={order._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            #{order._id.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-2 sm:mb-3">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <FiUser className="w-3 h-3 mr-1" />
                          {getCustomerName(order)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                          <FiPhone className="w-3 h-3 mr-1" />
                          {getCustomerPhone(order)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MdLocationOn className="w-3 h-3 mr-1" />
                          {getShortAddress(order)}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div>
                          <div className="text-xs text-gray-500 font-medium">Items</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {getTotalItemsQuantity(order)} item{getTotalItemsQuantity(order) !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {getProductNames(order)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-medium">Total Amount</div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center">
                            {formatCurrency(amountDetails.total)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="mb-2 sm:mb-3">
                        <div className="text-xs font-medium">
                          Payment: <span className={`${
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 sm:px-3 py-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors font-medium flex items-center"
                        >
                          <FiSearch className="w-3 h-3 mr-1" />
                          Details
                        </button>
                        
                        {activeTab === 'pending' && (
                          <button 
                            onClick={() => handleMarkAsProcessing(order._id)}
                            className="text-green-600 hover:text-green-800 text-xs px-2 sm:px-3 py-1.5 border border-green-200 rounded hover:bg-green-50 transition-colors font-medium flex items-center"
                          >
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Process
                          </button>
                        )}
                        
                        {activeTab === 'inProgress' && (
                          <>
                            <button 
                              onClick={() => handleMarkAsShipped(order._id)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 sm:px-3 py-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors font-medium flex items-center"
                            >
                              <FiTruck className="w-3 h-3 mr-1" />
                              Ship
                            </button>
                            <button 
                              onClick={() => handleMarkAsDelivered(order._id)}
                              className="text-green-600 hover:text-green-800 text-xs px-2 sm:px-3 py-1.5 border border-green-200 rounded hover:bg-green-50 transition-colors font-medium flex items-center"
                            >
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Deliver
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Address</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((order) => {
                const amountDetails = getOrderAmountDetails(order);
                
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">#</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {order._id.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {getTotalItemsQuantity(order)} item{getTotalItemsQuantity(order) !== 1 ? 's' : ''} • {getProductNames(order)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{getCustomerName(order)}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <FiPhone className="w-3 h-3 mr-1" />
                        {getCustomerPhone(order)}
                      </div>
                      <div className="text-xs text-gray-500 xl:hidden flex items-center mt-1">
                        <MdLocationOn className="w-3 h-3 mr-1" />
                        {getShortAddress(order)}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden xl:table-cell">
                      <div className="max-w-xs truncate flex items-start">
                        <MdLocationOn className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span title={getFullAddress(order)}>
                          {getFullAddress(order)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 flex items-center">
                        {formatCurrency(amountDetails.total)}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                        <div className="text-xs text-gray-500">
                          Payment: <span className={`font-medium ${
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800 text-left font-medium hover:underline transition-colors flex items-center"
                        >
                          <FiSearch className="w-3 h-3 mr-1" />
                          View Details
                        </button>
                        
                        {activeTab === 'pending' && (
                          <button 
                            onClick={() => handleMarkAsProcessing(order._id)}
                            className="text-green-600 hover:text-green-800 text-left font-medium hover:underline transition-colors flex items-center"
                          >
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Mark as Processing
                          </button>
                        )}
                        
                        {activeTab === 'inProgress' && (
                          <>
                            <button 
                              onClick={() => handleMarkAsShipped(order._id)}
                              className="text-blue-600 hover:text-blue-800 text-left font-medium hover:underline transition-colors flex items-center"
                            >
                              <FiTruck className="w-3 h-3 mr-1" />
                              Mark as Shipped
                            </button>
                            <button 
                              onClick={() => handleMarkAsDelivered(order._id)}
                              className="text-green-600 hover:text-green-800 text-left font-medium hover:underline transition-colors flex items-center"
                            >
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Mark as Delivered
                            </button>
                          </>
                        )}
                        
                        {(activeTab === 'pending' || activeTab === 'inProgress') && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-red-600 hover:text-red-800 text-left font-medium hover:underline transition-colors flex items-center"
                          >
                            <FiXCircle className="w-3 h-3 mr-1" />
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State for Desktop */}
          {filteredData.length === 0 && (
            <div className="hidden md:block text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search criteria.' : `No ${activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} orders available at the moment.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }} 
        />
      )}
    </div>
  )
}

export default DeliveryManagement