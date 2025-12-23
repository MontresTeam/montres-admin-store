"use client"
import React, { useState } from 'react';
import {
  AlertTriangle,
  Package,
  Trash2,
  DollarSign,
  TrendingDown,
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  BarChart3,
  AlertCircle,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const DeadStockPage = () => {
  // Sample dead stock data
  const [deadStockItems, setDeadStockItems] = useState([
    {
      id: 1,
      name: "Winter Jackets 2022",
      sku: "JKT-WIN-2022",
      category: "Clothing",
      quantity: 120,
      originalValue: 18000,
      currentValue: 3600,
      daysInStock: 425,
      reason: "Seasonal Change",
      status: "critical",
      lastSold: "2023-03-15",
      suggestedAction: "Clearance Sale"
    },
    {
      id: 2,
      name: "Old Model Smartphones",
      sku: "PHN-OLD-XP10",
      category: "Electronics",
      quantity: 45,
      originalValue: 67500,
      currentValue: 13500,
      daysInStock: 380,
      reason: "Model Discontinued",
      status: "high_value",
      lastSold: "2023-05-20",
      suggestedAction: "Bundle Deal"
    },
    {
      id: 3,
      name: "Expired Supplements",
      sku: "SUP-PRO-EXP",
      category: "Health",
      quantity: 200,
      originalValue: 4000,
      currentValue: 0,
      daysInStock: 510,
      reason: "Expired Products",
      status: "dispose",
      lastSold: "2022-12-10",
      suggestedAction: "Dispose Safely"
    },
    {
      id: 4,
      name: "Outdated Textbooks",
      sku: "BOK-EDU-2019",
      category: "Books",
      quantity: 85,
      originalValue: 12750,
      currentValue: 2550,
      daysInStock: 620,
      reason: "Curriculum Update",
      status: "medium",
      lastSold: "2023-01-05",
      suggestedAction: "Donate"
    },
    {
      id: 5,
      name: "Damaged Furniture",
      sku: "FUR-OFF-DMG",
      category: "Furniture",
      quantity: 12,
      originalValue: 9600,
      currentValue: 1920,
      daysInStock: 290,
      reason: "Damaged Goods",
      status: "critical",
      lastSold: "2023-06-30",
      suggestedAction: "Auction"
    },
    {
      id: 6,
      name: "Last Season Shoes",
      sku: "SHO-SUM-2023",
      category: "Footwear",
      quantity: 65,
      originalValue: 9750,
      currentValue: 1950,
      daysInStock: 320,
      reason: "Fashion Change",
      status: "medium",
      lastSold: "2023-07-15",
      suggestedAction: "Discount Sale"
    },
    {
      id: 7,
      name: "Obsolete Cables",
      sku: "CAB-OBS-USB2",
      category: "Electronics",
      quantity: 300,
      originalValue: 1500,
      currentValue: 300,
      daysInStock: 540,
      reason: "Technology Change",
      status: "low_value",
      lastSold: "2022-11-30",
      suggestedAction: "Recycle"
    },
    {
      id: 8,
      name: "Returned Cosmetics",
      sku: "COS-RET-OPEN",
      category: "Beauty",
      quantity: 40,
      originalValue: 8000,
      currentValue: 1600,
      daysInStock: 180,
      reason: "Customer Returns",
      status: "critical",
      lastSold: "2023-08-20",
      suggestedAction: "Staff Discount"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [sortBy, setSortBy] = useState('daysInStock');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState('');

  // Calculate statistics
  const calculateStats = () => {
    const totalValue = deadStockItems.reduce((sum, item) => sum + item.currentValue, 0);
    const originalValue = deadStockItems.reduce((sum, item) => sum + item.originalValue, 0);
    const totalItems = deadStockItems.reduce((sum, item) => sum + item.quantity, 0);
    const criticalItems = deadStockItems.filter(item => item.status === 'critical').length;
    
    const valueLoss = originalValue - totalValue;
    const lossPercentage = originalValue > 0 ? (valueLoss / originalValue * 100).toFixed(1) : 0;

    return {
      totalValue,
      originalValue,
      totalItems,
      criticalItems,
      valueLoss,
      lossPercentage
    };
  };

  const stats = calculateStats();

  // Filter items
  const filteredItems = deadStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesAction = selectedAction === 'all' || item.suggestedAction === selectedAction;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAction;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Get unique values for filters
  const categories = ['all', ...new Set(deadStockItems.map(item => item.category))];
  const statusOptions = ['all', 'critical', 'high_value', 'medium', 'low_value', 'dispose'];
  const actionOptions = ['all', ...new Set(deadStockItems.map(item => item.suggestedAction))];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle item selection
  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Handle bulk action
  const handleBulkAction = (action) => {
    setSelectedActionType(action);
    setShowActionModal(true);
  };

  // Execute action
  const executeAction = () => {
    alert(`Executing ${selectedActionType} for ${selectedItems.length} items`);
    setShowActionModal(false);
    setSelectedItems([]);
  };

  // Quick actions
  const quickActions = [
    { icon: TrendingUp, label: 'Quick Sale', color: 'bg-green-500', action: 'sale' },
    { icon: DollarSign, label: 'Auction', color: 'bg-blue-500', action: 'auction' },
    { icon: Trash2, label: 'Dispose', color: 'bg-red-500', action: 'dispose' },
    { icon: CheckCircle, label: 'Donate', color: 'bg-purple-500', action: 'donate' }
  ];

  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'critical':
        return { color: 'bg-red-100 text-red-800', label: 'Critical', icon: AlertCircle };
      case 'high_value':
        return { color: 'bg-orange-100 text-orange-800', label: 'High Value', icon: AlertTriangle };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium', icon: Clock };
      case 'low_value':
        return { color: 'bg-blue-100 text-blue-800', label: 'Low Value', icon: Package };
      case 'dispose':
        return { color: 'bg-gray-100 text-gray-800', label: 'Dispose', icon: Trash2 };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              Dead Stock Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and liquidate slow-moving or obsolete inventory
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dead Stock Value</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(stats.valueLoss)} value lost ({stats.lossPercentage}%)
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items in Dead Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {deadStockItems.length} different products
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Items</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.criticalItems}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Need immediate attention
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Days in Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(deadStockItems.reduce((sum, item) => sum + item.daysInStock, 0) / deadStockItems.length)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Average days without movement
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedItems.length} items selected
                </p>
                <p className="text-sm text-blue-700">
                  Total value: {formatCurrency(
                    deadStockItems
                      .filter(item => selectedItems.includes(item.id))
                      .reduce((sum, item) => sum + item.currentValue, 0)
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
              {quickActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleBulkAction(action.action)}
                  className={`px-4 py-2 rounded-lg text-white ${action.color.replace('bg-', 'bg-')} hover:opacity-90 transition-opacity`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dead stock items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action}
                </option>
              ))}
            </select>

            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.action}
            onClick={() => handleBulkAction(action.action)}
            className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-3"
          >
            <div className={`p-3 rounded-full ${action.color}`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Dead Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredItems.map(item => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Days</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500">{item.sku}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Reason: {item.reason}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(item.currentValue)}</p>
                        <p className="text-sm text-gray-500 line-through">
                          Was {formatCurrency(item.originalValue)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{item.daysInStock} days</span>
                      </div>
                      <p className="text-xs text-gray-500">Last sold: {item.lastSold}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {item.suggestedAction}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dead stock items found</h3>
            <p className="text-gray-500">
              Great! Your inventory is moving well
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing {sortedItems.length} of {deadStockItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Top Recommendations
          </h3>
          <div className="space-y-4">
            {deadStockItems
              .filter(item => item.status === 'critical')
              .slice(0, 3)
              .map(item => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">Value: {formatCurrency(item.currentValue)}</span>
                        <span className="text-sm text-gray-500">Days: {item.daysInStock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Take Action
                      </button>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Quick Insights
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Top 3 items account for 45% of dead stock value</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Electronics have highest value loss percentage</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Seasonal items should be liquidated before next season</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Consider bundling low-value items for clearance</span>
            </li>
          </ul>
          <button className="w-full mt-6 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Full Analysis
          </button>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {selectedActionType}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                You are about to perform <strong>{selectedActionType}</strong> on {selectedItems.length} items.
              </p>
              <p className="text-sm text-gray-500">
                Total value: {formatCurrency(
                  deadStockItems
                    .filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.currentValue, 0)
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm {selectedActionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadStockPage;