"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import newCurrencySymbol from '../../../../public/assets/newSymbole.png';

const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:9000/api/admin/order';

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      // Assuming the API returns an array of orders directly
      // If it returns { orders: [...] } then use response.data.orders
      setOrders(response.data.orders || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
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
      console.error('Error fetching order:', err);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle order selection
  const handleOrderSelect = (order) => {
    // If we already have full order details, use them
    if (order.items && order.shippingAddress) {
      setSelectedOrder(order);
    } else {
      // Otherwise fetch full order details
      fetchOrderById(order._id);
    }
  };

  // Map API status to display status
  const mapStatus = (apiStatus) => {
    const statusMap = {
      'Pending': 'pending',
      'Processing': 'processing',
      'Shipped': 'shipped',
      'Delivered': 'completed',
      'Cancelled': 'cancelled'
    };
    return statusMap[apiStatus] || apiStatus.toLowerCase();
  };

  // Format order data for display
  const formatOrderForDisplay = (order) => ({
    id: order._id,
    customer: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
    email: order.shippingAddress?.email || '',
    date: new Date(order.createdAt).toISOString().split('T')[0],
    status: mapStatus(order.orderStatus),
    total: order.total,
    items: order.items?.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })) || [],
    shipping: {
      address: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}, ${order.shippingAddress?.country || ''} - ${order.shippingAddress?.postalCode || ''}`,
      method: order.region === 'local' ? 'Standard' : 'Express'
    },
    // Include raw data for details view
    rawData: order
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const filteredOrders = orders
    .map(formatOrderForDisplay)
    .filter(order => {
      const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const CurrencyDisplay = ({ amount, className = "" }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <Image 
        src={newCurrencySymbol} 
        alt="Currency" 
        width={16} 
        height={16}
        className="w-4 h-4 object-contain"
      />
      <span>{amount?.toFixed(2) || '0.00'}</span>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
        selectedOrder?._id === order.rawData?._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => handleOrderSelect(order.rawData)}
    >
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-800 truncate">{order.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 font-medium truncate">{order.customer}</p>
          <p className="text-gray-500 text-sm truncate">{order.email}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end space-y-1">
          <p className="text-gray-500 text-sm whitespace-nowrap">{order.date}</p>
          <div className="text-lg font-bold text-gray-800">
            <CurrencyDisplay amount={order.total} />
          </div>
        </div>
      </div>
    </div>
  );

  const OrderDetails = () => {
    if (!selectedOrder) return null;

    const order = formatOrderForDisplay(selectedOrder);

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{order.id}</h2>
            <p className="text-gray-600">Order Details</p>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-gray-500 hover:text-gray-700 self-end sm:self-start"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="font-medium text-gray-800 truncate">{order.customer}</p>
                <p className="text-gray-600 truncate">{order.email}</p>
                <p className="text-gray-500 text-sm mt-2">Order Date: {order.date}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Payment Status: <span className={`font-medium ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-gray-600 break-words">{order.shipping.address}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-gray-500 text-sm">
                  Shipping Method: {order.shipping.method}
                </p>
              </div>
            </div>

            {/* Billing Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Billing Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-gray-600 break-words">
                  {selectedOrder.billingAddress?.street}, {selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.state}, {selectedOrder.billingAddress?.country} - {selectedOrder.billingAddress?.postalCode}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Payment Method: {selectedOrder.paymentMethod?.charAt(0).toUpperCase() + selectedOrder.paymentMethod?.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="ml-3">
                    <CurrencyDisplay amount={item.price} className="font-semibold text-gray-800 text-sm sm:text-base" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="mt-4 sm:mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <CurrencyDisplay amount={selectedOrder.subtotal} className="text-gray-800" />
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Shipping Fee</span>
                <CurrencyDisplay amount={selectedOrder.shippingFee} className="text-gray-800" />
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">VAT</span>
                <CurrencyDisplay amount={selectedOrder.vat} className="text-gray-800" />
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <span>Total</span>
                <CurrencyDisplay amount={selectedOrder.total} className="text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm mt-2 text-right">
                Currency: {selectedOrder.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
          <button className="flex-1 min-w-[120px] bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
            Update Status
          </button>
          <button className="flex-1 min-w-[120px] bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base">
            Send Tracking
          </button>
          <button className="flex-1 min-w-[120px] bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base">
            Print Invoice
          </button>
          <button className="flex-1 min-w-[120px] bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base">
            Cancel Order
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage and track customer orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                <svg 
                  className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Orders ({filteredOrders.length})
                </h2>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <OrderDetails />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Order Selected</h3>
                <p className="text-gray-500 text-sm sm:text-base">Select an order from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;