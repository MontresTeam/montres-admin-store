"use client"
import React, { useState } from 'react'

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample delivery data
  const deliveryData = {
    pending: [
      { id: 1, orderId: 'ORD-001', customer: 'John Doe', address: '123 Main St', phone: '+1234567890', items: 3, amount: '$45.99', status: 'pending' },
      { id: 2, orderId: 'ORD-002', customer: 'Jane Smith', address: '456 Oak Ave', phone: '+1234567891', items: 2, amount: '$29.99', status: 'pending' },
      { id: 3, orderId: 'ORD-003', customer: 'Mike Johnson', address: '789 Pine Rd', phone: '+1234567892', items: 5, amount: '$89.99', status: 'pending' },
    ],
    inProgress: [
      { id: 4, orderId: 'ORD-004', customer: 'Sarah Wilson', address: '321 Elm St', phone: '+1234567893', items: 1, amount: '$15.99', status: 'in-progress', driver: 'Driver A' },
      { id: 5, orderId: 'ORD-005', customer: 'Tom Brown', address: '654 Maple Dr', phone: '+1234567894', items: 4, amount: '$67.99', status: 'in-progress', driver: 'Driver B' },
    ],
    delivered: [
      { id: 6, orderId: 'ORD-006', customer: 'Emily Davis', address: '987 Cedar Ln', phone: '+1234567895', items: 2, amount: '$34.99', status: 'delivered', driver: 'Driver A', deliveredAt: '2024-01-15 14:30' },
      { id: 7, orderId: 'ORD-007', customer: 'Chris Lee', address: '159 Birch St', phone: '+1234567896', items: 3, amount: '$52.99', status: 'delivered', driver: 'Driver C', deliveredAt: '2024-01-15 16:45' },
    ],
    cancelled: [
      { id: 8, orderId: 'ORD-008', customer: 'Alex Kim', address: '753 Walnut Ave', phone: '+1234567897', items: 2, amount: '$28.99', status: 'cancelled', reason: 'Customer unavailable' },
    ]
  };

  const drivers = ['Driver A', 'Driver B', 'Driver C', 'Driver D'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredData = deliveryData[activeTab].filter(delivery =>
    delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Delivery Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all delivery orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{deliveryData.pending.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{deliveryData.inProgress.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">{deliveryData.delivered.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{deliveryData.cancelled.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6 md:mb-8">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders, customers, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver}>{driver}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { key: 'pending', label: 'Pending', count: deliveryData.pending.length },
              { key: 'inProgress', label: 'In Progress', count: deliveryData.inProgress.length },
              { key: 'delivered', label: 'Delivered', count: deliveryData.delivered.length },
              { key: 'cancelled', label: 'Cancelled', count: deliveryData.cancelled.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-4 md:px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Address</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500 sm:hidden">{delivery.phone}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    {delivery.address}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {delivery.items} items
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.amount}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                      {getStatusText(delivery.status)}
                    </span>
                    {delivery.driver && (
                      <div className="text-xs text-gray-500 mt-1">{delivery.driver}</div>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      {delivery.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900">Assign</button>
                      )}
                      {delivery.status === 'in-progress' && (
                        <button className="text-green-600 hover:text-green-900">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryManagement