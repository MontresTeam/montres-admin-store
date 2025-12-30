"use client"
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  Filter,
  Search,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Download
} from 'lucide-react';

const LowStockPage = () => {
  // Sample low stock data
  const [lowStockItems, setLowStockItems] = useState([
    {
      id: 1,
      name: "Premium Coffee Beans",
      sku: "CB-2023-PRM",
      category: "Beverages",
      currentStock: 8,
      minStock: 20,
      lastRestocked: "2024-01-15",
      supplier: "Bean Suppliers Co.",
      status: "critical"
    },
    {
      id: 2,
      name: "Organic Honey",
      sku: "HNY-ORG-500",
      category: "Condiments",
      currentStock: 15,
      minStock: 30,
      lastRestocked: "2024-01-10",
      supplier: "Nature's Best",
      status: "low"
    },
    {
      id: 3,
      name: "Ceramic Mugs",
      sku: "MUG-CRM-01",
      category: "Tableware",
      currentStock: 12,
      minStock: 25,
      lastRestocked: "2024-01-05",
      supplier: "Homeware Inc.",
      status: "critical"
    },
    {
      id: 4,
      name: "Paper Napkins",
      sku: "NPK-ECO-200",
      category: "Disposables",
      currentStock: 18,
      minStock: 40,
      lastRestocked: "2024-01-12",
      supplier: "Eco Supplies",
      status: "low"
    },
    {
      id: 5,
      name: "Coffee Filters",
      sku: "FLT-V60-100",
      category: "Brewing Supplies",
      currentStock: 22,
      minStock: 50,
      lastRestocked: "2024-01-08",
      supplier: "Brew Masters",
      status: "warning"
    },
    {
      id: 6,
      name: "Sugar Packets",
      sku: "SUG-WHT-500",
      category: "Sweeteners",
      currentStock: 25,
      minStock: 60,
      lastRestocked: "2024-01-03",
      supplier: "Sweet Supply Co.",
      status: "warning"
    },
    {
      id: 7,
      name: "Milk Jugs",
      sku: "JUG-STL-02",
      category: "Containers",
      currentStock: 5,
      minStock: 15,
      lastRestocked: "2023-12-20",
      supplier: "Kitchenware Pro",
      status: "critical"
    },
    {
      id: 8,
      name: "Takeaway Cups",
      sku: "CUP-ECO-12OZ",
      category: "Packaging",
      currentStock: 30,
      minStock: 80,
      lastRestocked: "2024-01-18",
      supplier: "Green Packaging",
      status: "warning"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Calculate statistics
  const criticalItems = lowStockItems.filter(item => item.status === 'critical').length;
  const lowItems = lowStockItems.filter(item => item.status === 'low').length;
  const warningItems = lowStockItems.filter(item => item.status === 'warning').length;
  const totalItems = lowStockItems.length;

  // Filter items based on search and filters
  const filteredItems = lowStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(lowStockItems.map(item => item.category))];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'critical', label: 'Critical', color: 'red' },
    { value: 'low', label: 'Low', color: 'orange' },
    { value: 'warning', label: 'Warning', color: 'yellow' }
  ];

  // Restock function
  const handleRestock = (id) => {
    alert(`Restocking item ${id}`);
    // In a real app, you would update the stock here
  };

  // Export function
  const handleExport = () => {
    alert('Exporting low stock report...');
    // In a real app, you would generate and download a CSV/PDF here
  };

  // Refresh function
  const handleRefresh = () => {
    alert('Refreshing stock data...');
    // In a real app, you would refetch data from API
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              Low Stock Inventory
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage items that need restocking
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
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
                <p className="text-sm text-gray-600">Critical Items</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{criticalItems}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Items below 25% of minimum stock
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Items</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{lowItems}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Items below 50% of minimum stock
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warning Items</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{warningItems}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Package className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Items below 75% of minimum stock
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Filter className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All items requiring attention
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or category..."
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Stock Level</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Last Restocked</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.sku}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">
                        {item.currentStock} / {item.minStock}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'critical' ? 'bg-red-500' :
                            item.status === 'low' ? 'bg-orange-500' :
                            'bg-amber-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (item.currentStock / item.minStock) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <p className="text-gray-700">{item.lastRestocked}</p>
                    <p className="text-sm text-gray-500">Supplier: {item.supplier}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'critical' 
                        ? 'bg-red-100 text-red-800'
                        : item.status === 'low'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'critical' ? 'Critical' :
                       item.status === 'low' ? 'Low' : 'Warning'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Restock
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing {filteredItems.length} of {lowStockItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
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

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">Quick Restock Suggestions</h3>
          <ul className="space-y-2">
            {lowStockItems
              .filter(item => item.status === 'critical')
              .slice(0, 3)
              .map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Order Now →
                  </button>
                </li>
              ))}
          </ul>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-medium text-amber-900 mb-2">Supplier Contacts</h3>
          <p className="text-sm text-amber-800 mb-3">
            Contact suppliers for urgent restocking needs
          </p>
          <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            View Supplier List
          </button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-medium text-green-900 mb-2">Auto-Restock Setup</h3>
          <p className="text-sm text-green-800 mb-3">
            Configure automatic ordering for low stock items
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Configure Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockPage;