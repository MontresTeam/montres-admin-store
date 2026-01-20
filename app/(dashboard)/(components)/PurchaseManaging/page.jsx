"use client"
import React, { useState, useEffect } from 'react';

// Sample initial data
const initialPurchases = [
  {
    purchase_id: 1,
    product_name: 'Laptop',
    purchase_amount: 1200,
    shipping_cost: 25,
    total_cost: 1225,
    shipping_date: '2024-01-15',
    has_shipping: true
  },
  {
    purchase_id: 2,
    product_name: 'Office Chair',
    purchase_amount: 350,
    shipping_cost: 45,
    total_cost: 395,
    shipping_date: '2024-01-20',
    has_shipping: true
  },
  {
    purchase_id: 3,
    product_name: 'Software License',
    purchase_amount: 500,
    shipping_cost: 0,
    total_cost: 500,
    shipping_date: null,
    has_shipping: false
  },
  {
    purchase_id: 4,
    product_name: 'Printer',
    purchase_amount: 450,
    shipping_cost: 35,
    total_cost: 485,
    shipping_date: '2024-01-25',
    has_shipping: true
  }
];

const PurchaseManagementSystem = () => {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [filteredPurchases, setFilteredPurchases] = useState(initialPurchases);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterShipping, setFilterShipping] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'purchase_id', direction: 'asc' });

  // Form state
  const [formData, setFormData] = useState({
    product_name: '',
    purchase_amount: '',
    shipping_cost: '',
    shipping_date: '',
    has_shipping: true
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const amount = parseFloat(formData.purchase_amount) || 0;
    const shipping = parseFloat(formData.shipping_cost) || 0;
    return (amount + shipping).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPurchase = {
      purchase_id: editingId || purchases.length + 1,
      product_name: formData.product_name,
      purchase_amount: parseFloat(formData.purchase_amount),
      shipping_cost: formData.has_shipping ? parseFloat(formData.shipping_cost) : 0,
      total_cost: parseFloat(calculateTotalCost()),
      shipping_date: formData.has_shipping ? formData.shipping_date : null,
      has_shipping: formData.has_shipping
    };

    if (editingId) {
      // Update existing purchase
      setPurchases(prev => prev.map(p => 
        p.purchase_id === editingId ? newPurchase : p
      ));
    } else {
      // Add new purchase
      setPurchases(prev => [...prev, newPurchase]);
    }

    handleResetForm();
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({
      product_name: '',
      purchase_amount: '',
      shipping_cost: '',
      shipping_date: '',
      has_shipping: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Edit purchase
  const handleEdit = (purchase) => {
    setFormData({
      product_name: purchase.product_name,
      purchase_amount: purchase.purchase_amount.toString(),
      shipping_cost: purchase.shipping_cost.toString(),
      shipping_date: purchase.shipping_date || '',
      has_shipping: purchase.has_shipping
    });
    setEditingId(purchase.purchase_id);
    setShowForm(true);
  };

  // Delete purchase
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      setPurchases(prev => prev.filter(p => p.purchase_id !== id));
    }
  };

  // Filter purchases based on shipping status and search term
  useEffect(() => {
    let filtered = purchases;

    // Filter by shipping status
    if (filterShipping === 'with_shipping') {
      filtered = filtered.filter(p => p.has_shipping);
    } else if (filterShipping === 'without_shipping') {
      filtered = filtered.filter(p => !p.has_shipping);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPurchases(filtered);
  }, [purchases, filterShipping, searchTerm]);

  // Sort purchases
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredPurchases].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPurchases(sorted);
  };

  // Statistics
  const stats = {
    totalPurchases: purchases.length,
    withShipping: purchases.filter(p => p.has_shipping).length,
    withoutShipping: purchases.filter(p => !p.has_shipping).length,
    totalCost: purchases.reduce((sum, p) => sum + p.total_cost, 0),
    totalShipping: purchases.reduce((sum, p) => sum + p.shipping_cost, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Purchase Management System
        </h1>
        <p className="text-gray-600">Manage and track all purchases efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Purchases</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPurchases}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">With Shipping</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.withShipping}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Digital/No Shipping</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.withoutShipping}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Value</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">${stats.totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterShipping}
              onChange={(e) => setFilterShipping(e.target.value)}
            >
              <option value="all">All Purchases</option>
              <option value="with_shipping">With Shipping</option>
              <option value="without_shipping">Without Shipping</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {editingId ? 'Edit Purchase' : 'Add Purchase'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingId ? 'Edit Purchase' : 'Add New Purchase'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Amount ($) *
                </label>
                <input
                  type="number"
                  name="purchase_amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.purchase_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="has_shipping"
                  id="has_shipping"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={formData.has_shipping}
                  onChange={handleInputChange}
                />
                <label htmlFor="has_shipping" className="text-sm font-medium text-gray-700">
                  Requires Shipping
                </label>
              </div>

              {formData.has_shipping && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Cost ($)
                    </label>
                    <input
                      type="number"
                      name="shipping_cost"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.shipping_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Date
                    </label>
                    <input
                      type="date"
                      name="shipping_date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.shipping_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Total Cost: <span className="text-lg font-bold text-green-600">
                      ${calculateTotalCost()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
              >
                {editingId ? 'Update Purchase' : 'Save Purchase'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('purchase_id')}
                >
                  <div className="flex items-center gap-1">
                    ID
                    {sortConfig.key === 'purchase_id' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('product_name')}
                >
                  <div className="flex items-center gap-1">
                    Product Name
                    {sortConfig.key === 'product_name' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('purchase_amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    {sortConfig.key === 'purchase_amount' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total_cost')}
                >
                  <div className="flex items-center gap-1">
                    Total Cost
                    {sortConfig.key === 'total_cost' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.purchase_id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{purchase.purchase_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{purchase.product_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">${purchase.purchase_amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {purchase.has_shipping ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          With Shipping
                        </span>
                        {purchase.shipping_date && (
                          <span className="text-xs text-gray-500 mt-1">
                            Ships: {new Date(purchase.shipping_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs text-gray-600">
                          Cost: ${purchase.shipping_cost.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Digital/No Shipping
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      ${purchase.total_cost.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="text-blue-600 hover:text-blue-900 transition duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.purchase_id)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search term' : 'Get started by creating a new purchase'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="md:hidden mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Purchases</h2>
        {filteredPurchases.map((purchase) => (
          <div key={purchase.purchase_id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900">#{purchase.purchase_id} - {purchase.product_name}</h3>
                <p className="text-sm text-gray-600">${purchase.purchase_amount.toFixed(2)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                purchase.has_shipping 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {purchase.has_shipping ? 'With Shipping' : 'No Shipping'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              {purchase.has_shipping && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Cost:</span>
                  <span className="font-medium">${purchase.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-bold text-lg">${purchase.total_cost.toFixed(2)}</span>
              </div>
              {purchase.shipping_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Date:</span>
                  <span className="font-medium">
                    {new Date(purchase.shipping_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <button
                onClick={() => handleEdit(purchase)}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(purchase.purchase_id)}
                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Purchases Value</p>
            <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Shipping Costs</p>
            <p className="text-2xl font-bold text-gray-900">${stats.totalShipping.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Purchase Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalPurchases > 0 ? (stats.totalCost / stats.totalPurchases).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagementSystem;