"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import newCurrency from '../../../../public/assets/newSymbole.png';

const InventoryStockManagement = () => {
  const [inventory, setInventory] = useState([
    {
      id: '1',
      brand: 'Apple',
      productName: 'iPhone 15 Pro',
      codeInternal: 'APL-IP15P-256',
      quantity: 15,
      status: 'available',
      cost: 850,
      sellingPrice: 1199,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      brand: 'Samsung',
      productName: 'Galaxy S24 Ultra',
      codeInternal: 'SAM-GS24U-512',
      quantity: 8,
      status: 'sold',
      cost: 900,
      sellingPrice: 1299,
      soldPrice: 1250,
      paymentMethod: 'stripe',
      receivingAmount: 1250,
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      brand: 'Google',
      productName: 'Pixel 8 Pro',
      codeInternal: 'GOOG-P8P-128',
      quantity: 0,
      status: 'auction',
      cost: 700,
      sellingPrice: 999,
      soldPrice: 950,
      paymentMethod: 'tabby',
      receivingAmount: 950,
      lastUpdated: '2024-01-13'
    },
    {
      id: '4',
      brand: 'OnePlus',
      productName: '12 Pro',
      codeInternal: 'OP-12P-256',
      quantity: 25,
      status: 'available',
      cost: 650,
      sellingPrice: 899,
      lastUpdated: '2024-01-16'
    },
    {
      id: '5',
      brand: 'Xiaomi',
      productName: '14 Ultra',
      codeInternal: 'XM-14U-512',
      quantity: 3,
      status: 'sold',
      cost: 750,
      sellingPrice: 1099,
      soldPrice: 1050,
      paymentMethod: 'mamo',
      receivingAmount: 1050,
      lastUpdated: '2024-01-12'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingStatus, setEditingStatus] = useState(null);
  const fileInputRef = useRef(null);

  const brands = [...new Set(inventory.map(item => item.brand))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codeInternal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const sortedInventory = React.useMemo(() => {
    if (!sortConfig.key) return filteredInventory;

    return [...filteredInventory].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredInventory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const stats = {
    totalItems: inventory.length,
    available: inventory.filter(item => item.status === 'available').length,
    sold: inventory.filter(item => item.status === 'sold').length,
    auction: inventory.filter(item => item.status === 'auction').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.cost * item.quantity), 0),
    totalRevenue: inventory
      .filter(item => item.status === 'sold' || item.status === 'auction')
      .reduce((sum, item) => sum + (item.receivingAmount || 0), 0),
    lowStock: inventory.filter(item => item.quantity > 0 && item.quantity <= 5).length
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      showNotification(`File "${file.name}" uploaded successfully!`, 'success');
      console.log('File uploaded:', file.name);
    }
  };

  const exportToExcel = () => {
    showNotification('Exporting data to Excel...', 'info');
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-export.json';
    link.click();
  };

  const handleAddItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [...prev, newItem]);
    setShowAddModal(false);
    showNotification('Item added successfully!', 'success');
  };

  const handleDeleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
      showNotification('Item deleted successfully!', 'success');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    setEditingStatus(null);
    showNotification(`Status updated to ${newStatus}`, 'success');
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedItems.size > 0) {
      switch (bulkAction) {
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
            setInventory(prev => prev.filter(item => !selectedItems.has(item.id)));
            setSelectedItems(new Set());
            showNotification(`${selectedItems.size} items deleted successfully!`, 'success');
          }
          break;
        case 'mark_sold':
          setInventory(prev => prev.map(item => 
            selectedItems.has(item.id) ? { ...item, status: 'sold' } : item
          ));
          showNotification(`${selectedItems.size} items marked as sold!`, 'success');
          break;
        default:
          break;
      }
      setBulkAction('');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === sortedInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedInventory.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auction': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'stripe': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tabby': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'chrono': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'mamo': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cash': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getQuantityColor = (quantity) => {
    if (quantity > 10) return 'bg-green-100 text-green-800 border-green-200';
    if (quantity > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatCurrency = (amount) => {
    return (
      <div className="flex items-center gap-1">
        <img src={newCurrency.src} alt="Currency" className="w-3 h-3" />
        {amount?.toLocaleString() || '0'}
      </div>
    );
  };

  const SortableHeader = ({ children, sortKey, className = '' }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap">{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUpIcon className="w-3 h-3" /> : 
            <ChevronDownIcon className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
          notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
          'bg-blue-50 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{notification.message}</div>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inventory Stock Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your store's current stock and sales</p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-xs md:text-sm text-gray-500">Total Items</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-xs md:text-sm text-gray-500">Available</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.sold}</div>
          <div className="text-xs md:text-sm text-gray-500">Sold</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.auction}</div>
          <div className="text-xs md:text-sm text-gray-500">Auction</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-orange-600">{stats.lowStock}</div>
          <div className="text-xs md:text-sm text-gray-500">Low Stock</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-1">
            {formatCurrency(stats.totalValue)}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Total Value</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="text-lg md:text-2xl font-bold text-green-600 flex items-center gap-1">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Toggle Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, codes..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm flex-1 sm:flex-none justify-center"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-sm text-sm flex-1 sm:flex-none justify-center"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import
            </button>
            
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm text-sm flex-1 sm:flex-none justify-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="auction">Auction</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Filter</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Stock Levels</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock (1-5)</option>
                  <option value="medium">Medium Stock (6-15)</option>
                  <option value="high">High Stock (16+)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-blue-700 font-medium text-sm">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk Actions</option>
                <option value="mark_sold">Mark as Sold</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                disabled={!bulkAction}
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === sortedInventory.length && sortedInventory.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </th>
                <SortableHeader sortKey="brand">BRAND/PRODUCT</SortableHeader>
                <SortableHeader sortKey="codeInternal">CODE</SortableHeader>
                <SortableHeader sortKey="quantity">QTY</SortableHeader>
                <SortableHeader sortKey="status">STATUS</SortableHeader>
                <SortableHeader sortKey="cost">COST</SortableHeader>
                <SortableHeader sortKey="sellingPrice">SELLING PRICE</SortableHeader>
                <SortableHeader sortKey="soldPrice">SOLD PRICE</SortableHeader>
                <SortableHeader sortKey="paymentMethod">PAYMENT</SortableHeader>
                <SortableHeader sortKey="receivingAmount">RECEIVED</SortableHeader>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedInventory.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedItems.has(item.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.brand}</div>
                      <div className="text-xs text-gray-500">{item.productName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {item.codeInternal}
                    </code>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getQuantityColor(item.quantity)}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {editingStatus === item.id ? (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onBlur={() => setEditingStatus(null)}
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="auction">Auction</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(item.id)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)} hover:opacity-80 transition-opacity`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                      {formatCurrency(item.cost)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      {formatCurrency(item.sellingPrice)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      {item.soldPrice ? formatCurrency(item.soldPrice) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {item.paymentMethod && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPaymentMethodColor(item.paymentMethod)}`}>
                        {item.paymentMethod}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                      {item.receivingAmount ? formatCurrency(item.receivingAmount) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </button>
                      <button 
                        className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedInventory.length === 0 && (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No inventory items found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
          brands={brands}
        />
      )}
    </div>
  );
};

// Add Item Modal Component
const AddItemModal = ({ onClose, onSave, brands }) => {
  const [formData, setFormData] = useState({
    brand: '',
    productName: '',
    codeInternal: '',
    quantity: 0,
    status: 'available',
    cost: 0,
    sellingPrice: 0,
    soldPrice: 0,
    paymentMethod: '',
    receivingAmount: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add New Inventory Item</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <select
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            {/* Internal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Code *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.codeInternal}
                onChange={(e) => handleChange('codeInternal', e.target.value)}
                placeholder="e.g., APL-IP15P-256"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="auction">Auction</option>
              </select>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Conditional fields for sold/auction items */}
            {formData.status !== 'available' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sold Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.soldPrice}
                    onChange={(e) => handleChange('soldPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  >
                    <option value="">Select method</option>
                    <option value="stripe">Stripe</option>
                    <option value="tabby">Tabby</option>
                    <option value="chrono">Chrono</option>
                    <option value="mamo">Mamo Pay</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.receivingAmount}
                    onChange={(e) => handleChange('receivingAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryStockManagement;