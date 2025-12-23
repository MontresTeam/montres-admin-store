"use client"
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingBag,
  BarChart3,
  Download,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const BrandReportPage = () => {
  // Sample brand data
  const [brands, setBrands] = useState([
    {
      id: 1,
      name: "Nike",
      category: "Sportswear",
      totalProducts: 45,
      revenue: 125000,
      growth: 12.5,
      stockValue: 85000,
      status: "active",
      lastUpdated: "2024-01-20",
      customerRating: 4.7,
      salesTrend: "up"
    },
    {
      id: 2,
      name: "Apple",
      category: "Electronics",
      totalProducts: 28,
      revenue: 950000,
      growth: 8.2,
      stockValue: 420000,
      status: "active",
      lastUpdated: "2024-01-19",
      customerRating: 4.9,
      salesTrend: "up"
    },
    {
      id: 3,
      name: "Adidas",
      category: "Sportswear",
      totalProducts: 38,
      revenue: 89000,
      growth: -2.1,
      stockValue: 65000,
      status: "active",
      lastUpdated: "2024-01-18",
      customerRating: 4.5,
      salesTrend: "down"
    },
    {
      id: 4,
      name: "Samsung",
      category: "Electronics",
      totalProducts: 52,
      revenue: 320000,
      growth: 5.8,
      stockValue: 185000,
      status: "active",
      lastUpdated: "2024-01-17",
      customerRating: 4.6,
      salesTrend: "up"
    },
    {
      id: 5,
      name: "Levi's",
      category: "Fashion",
      totalProducts: 32,
      revenue: 45000,
      growth: 15.3,
      stockValue: 38000,
      status: "active",
      lastUpdated: "2024-01-16",
      customerRating: 4.4,
      salesTrend: "up"
    },
    {
      id: 6,
      name: "Sony",
      category: "Electronics",
      totalProducts: 41,
      revenue: 210000,
      growth: -1.2,
      stockValue: 95000,
      status: "inactive",
      lastUpdated: "2024-01-15",
      customerRating: 4.7,
      salesTrend: "down"
    },
    {
      id: 7,
      name: "Puma",
      category: "Sportswear",
      totalProducts: 29,
      revenue: 68000,
      growth: 9.4,
      stockValue: 52000,
      status: "active",
      lastUpdated: "2024-01-14",
      customerRating: 4.3,
      salesTrend: "up"
    },
    {
      id: 8,
      name: "Microsoft",
      category: "Software",
      totalProducts: 35,
      revenue: 280000,
      growth: 11.7,
      stockValue: 120000,
      status: "active",
      lastUpdated: "2024-01-13",
      customerRating: 4.8,
      salesTrend: "up"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timeRange, setTimeRange] = useState('monthly');
  const [expandedBrand, setExpandedBrand] = useState(null);

  // Calculate statistics
  const totalBrands = brands.length;
  const activeBrands = brands.filter(b => b.status === 'active').length;
  const totalRevenue = brands.reduce((sum, brand) => sum + brand.revenue, 0);
  const averageGrowth = brands.reduce((sum, brand) => sum + brand.growth, 0) / brands.length;

  // Filter and sort brands
  const filteredAndSortedBrands = brands
    .filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brand.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || brand.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || brand.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'growth':
          aValue = a.growth;
          bValue = b.growth;
          break;
        case 'products':
          aValue = a.totalProducts;
          bValue = b.totalProducts;
          break;
        default:
          aValue = a.revenue;
          bValue = b.revenue;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // Get unique categories
  const categories = ['all', ...new Set(brands.map(brand => brand.category))];

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Toggle brand details
  const toggleBrandDetails = (brandId) => {
    setExpandedBrand(expandedBrand === brandId ? null : brandId);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Export report
  const handleExport = () => {
    alert('Exporting brand report...');
  };

  // Quick actions
  const quickActions = [
    { icon: BarChart3, label: 'View Analytics', color: 'bg-blue-500' },
    { icon: Users, label: 'Customer Reviews', color: 'bg-green-500' },
    { icon: Package, label: 'Inventory Report', color: 'bg-purple-500' },
    { icon: DollarSign, label: 'Revenue Forecast', color: 'bg-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Brand Performance Report
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of brand performance and metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Date Range</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Brands</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalBrands}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-green-600">+{activeBrands} active</span>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${(activeBrands / totalBrands) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+12.3% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Growth Rate</p>
                <p className={`text-2xl font-bold mt-1 ${averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-500">Monthly average</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length - 1}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Package className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-500">Across all brands</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
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
                placeholder="Search brands or categories..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2"
          >
            <div className={`p-3 rounded-lg ${action.color}`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Brand
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button 
                    onClick={() => handleSort('revenue')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Revenue
                    {sortBy === 'revenue' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">
                  <button 
                    onClick={() => handleSort('growth')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Growth
                    {sortBy === 'growth' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedBrands.map((brand) => (
                <React.Fragment key={brand.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBrandDetails(brand.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedBrand === brand.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-700">
                            {brand.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{brand.name}</p>
                            <p className="text-sm text-gray-500">{brand.totalProducts} products</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {brand.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(brand.revenue)}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          Stock: {formatCurrency(brand.stockValue)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {brand.salesTrend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${brand.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {brand.growth >= 0 ? '+' : ''}{brand.growth}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        brand.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedBrand === brand.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Customer Rating</p>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-gray-900">
                                {brand.customerRating}/5
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(brand.customerRating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Last Updated</p>
                            <p className="text-lg font-medium text-gray-900">{brand.lastUpdated}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Sales Trend</p>
                            <div className="flex items-center gap-2">
                              {brand.salesTrend === 'up' ? (
                                <>
                                  <TrendingUp className="h-5 w-5 text-green-500" />
                                  <span className="font-medium text-green-600">Positive</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="font-medium text-red-600">Negative</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                View Analytics
                              </button>
                              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                Edit Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAndSortedBrands.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing {filteredAndSortedBrands.length} of {brands.length} brands
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
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            {filteredAndSortedBrands.slice(0, 3).map(brand => (
              <div key={brand.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-700">
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-sm text-gray-500">{brand.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(brand.revenue)}</p>
                  <p className={`text-sm ${brand.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {brand.growth >= 0 ? '+' : ''}{brand.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Insights</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Top 3 brands generate 65% of total revenue</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Electronics category shows highest growth</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>Average customer rating: 4.6/5 across all brands</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 bg-white rounded-full mt-2"></div>
              <span>80% of brands are currently active</span>
            </li>
          </ul>
          <button className="w-full mt-6 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandReportPage;