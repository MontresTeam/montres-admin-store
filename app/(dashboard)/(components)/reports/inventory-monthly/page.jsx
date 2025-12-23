"use client"
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calculator,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye,
 ChevronRight ,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  PieChart,
  Layers,
  ShoppingCart,
  X
} from 'lucide-react';
import Image from 'next/image';

const InventoryMonthEndPage = () => {
  // Sample month-end data
  const [monthEndData, setMonthEndData] = useState([
    {
      id: 1,
      month: "January 2024",
      beginningInventory: 1250000,
      purchases: 750000,
      cogs: 950000,
      endingInventory: 1050000,
      variance: 200000,
      accuracy: 98.5,
      status: "completed",
      lastUpdated: "2024-01-31",
      categoryBreakdown: {
        electronics: 350000,
        clothing: 280000,
        furniture: 220000,
        other: 200000
      }
    },
    {
      id: 2,
      month: "December 2023",
      beginningInventory: 1150000,
      purchases: 850000,
      cogs: 850000,
      endingInventory: 1150000,
      variance: 0,
      accuracy: 99.2,
      status: "completed",
      lastUpdated: "2023-12-31",
      categoryBreakdown: {
        electronics: 320000,
        clothing: 300000,
        furniture: 250000,
        other: 280000
      }
    },
    {
      id: 3,
      month: "November 2023",
      beginningInventory: 1200000,
      purchases: 700000,
      cogs: 750000,
      endingInventory: 1150000,
      variance: -50000,
      accuracy: 96.8,
      status: "completed",
      lastUpdated: "2023-11-30",
      categoryBreakdown: {
        electronics: 300000,
        clothing: 290000,
        furniture: 240000,
        other: 320000
      }
    },
    {
      id: 4,
      month: "October 2023",
      beginningInventory: 1100000,
      purchases: 800000,
      cogs: 700000,
      endingInventory: 1200000,
      variance: 100000,
      accuracy: 97.5,
      status: "completed",
      lastUpdated: "2023-10-31",
      categoryBreakdown: {
        electronics: 280000,
        clothing: 310000,
        furniture: 260000,
        other: 350000
      }
    },
    {
      id: 5,
      month: "Current Month",
      beginningInventory: 1050000,
      purchases: 900000,
      cogs: 850000,
      endingInventory: 1100000,
      variance: 50000,
      accuracy: 95.2,
      status: "in_progress",
      lastUpdated: "2024-02-25",
      categoryBreakdown: {
        electronics: 400000,
        clothing: 300000,
        furniture: 200000,
        other: 200000
      }
    }
  ]);

  const [selectedMonth, setSelectedMonth] = useState("Current Month");
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('month');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFormula, setShowFormula] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get current month data
  const currentMonthData = monthEndData.find(item => item.month === selectedMonth) || monthEndData[0];

  // Format currency with custom symbol
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate derived values
  const calculateDerivedValues = (data) => {
    const inventoryTurnover = data.cogs > 0 ? (data.cogs / ((data.beginningInventory + data.endingInventory) / 2)).toFixed(2) : 0;
    const daysInventoryOutstanding = inventoryTurnover > 0 ? (365 / inventoryTurnover).toFixed(1) : 0;
    const grossProfit = (data.beginningInventory + data.purchases - data.endingInventory);
    const grossMargin = grossProfit > 0 ? ((grossProfit / (data.beginningInventory + data.purchases)) * 100).toFixed(1) : 0;

    return {
      inventoryTurnover,
      daysInventoryOutstanding,
      grossProfit,
      grossMargin
    };
  };

  const derivedValues = calculateDerivedValues(currentMonthData);

  // Handle month calculation
  const handleCalculateMonthEnd = () => {
    setIsCalculating(true);
    // Simulate API call
    setTimeout(() => {
      alert('Month-end calculation completed successfully!');
      setIsCalculating(false);
    }, 1500);
  };

  // Generate report
  const handleGenerateReport = () => {
    alert('Generating detailed month-end report...');
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Quick stats
  const quickStats = [
    {
      label: "Inventory Turnover",
      value: derivedValues.inventoryTurnover,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Days Inventory",
      value: derivedValues.daysInventoryOutstanding,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      suffix: " days"
    },
    {
      label: "Gross Margin",
      value: `${derivedValues.grossMargin}%`,
      icon: PieChart,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Variance",
      value: formatCurrency(currentMonthData.variance),
      icon: currentMonthData.variance >= 0 ? TrendingUp : TrendingDown,
      color: currentMonthData.variance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: currentMonthData.variance >= 0 ? "bg-green-50" : "bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-7 w-7 text-blue-600" />
              Inventory Month-End
            </h1>
            <p className="text-gray-600 mt-2">
              Calculate and analyze ending inventory for accounting periods
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
            <button
              onClick={handleCalculateMonthEnd}
              disabled={isCalculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Month-End
                </>
              )}
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selected Month: <span className="text-blue-600">{selectedMonth}</span>
              </h3>
              <p className="text-sm text-gray-600">
                Status: <span className={`font-medium ${currentMonthData.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                  {currentMonthData.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
                <span className="mx-2">•</span>
                Last Updated: {currentMonthData.lastUpdated}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthEndData.map((item) => (
                  <option key={item.id} value={item.month}>
                    {item.month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Formula Section */}
        {showFormula && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Month-End Formula
                </h3>
                <p className="text-gray-700">
                  Ending Inventory = Beginning Inventory + Purchases - Cost of Goods Sold (COGS)
                </p>
              </div>
              <button
                onClick={() => setShowFormula(false)}
                className="p-1 hover:bg-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Beginning Inventory</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonthData.beginningInventory)}</p>
                <p className="text-xs text-gray-500 mt-1">Value at start of period</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-2xl">+</div>
                  <p className="text-sm text-gray-600">Purchases</p>
                  <div className="text-2xl">-</div>
                  <p className="text-sm text-gray-600">COGS</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentMonthData.purchases)} - {formatCurrency(currentMonthData.cogs)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Net additions during period</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-lg text-white">
                <p className="text-sm mb-2">Ending Inventory</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthData.endingInventory)}</p>
                <p className="text-xs mt-1">Value at end of period</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                      {stat.value}
                      {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                {index === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Times inventory sold/replaced</p>
                )}
                {index === 1 && (
                  <p className="text-xs text-gray-500 mt-2">Average days to sell inventory</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Calculation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Category Breakdown
          </h3>
          
          <div className="space-y-4">
            {Object.entries(currentMonthData.categoryBreakdown).map(([category, value]) => {
              const percentage = (value / currentMonthData.endingInventory * 100).toFixed(1);
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900">{formatCurrency(value)}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accuracy Section */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Inventory Accuracy</h4>
                <p className="text-sm text-gray-600">Physical count vs system records</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${currentMonthData.accuracy >= 98 ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {currentMonthData.accuracy >= 98 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{currentMonthData.accuracy}%</p>
                  <p className="text-sm text-gray-500">Accuracy Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Download Report</p>
                  <p className="text-sm text-gray-500">PDF, Excel, CSV formats</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Trends</p>
                  <p className="text-sm text-gray-500">Historical comparison</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Adjust Inventory</p>
                  <p className="text-sm text-gray-500">Make corrections</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Purchase Orders</p>
                  <p className="text-sm text-gray-500">Next month planning</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Insights */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Insights</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                <span>Inventory increased by {((currentMonthData.endingInventory - currentMonthData.beginningInventory) / currentMonthData.beginningInventory * 100).toFixed(1)}% this month</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-1.5"></div>
                <span>Turnover rate indicates healthy inventory movement</span>
              </li>
              {currentMonthData.accuracy < 98 && (
                <li className="flex items-start gap-2 text-sm text-amber-600">
                  <div className="h-1.5 w-1.5 bg-amber-500 rounded-full mt-1.5"></div>
                  <span>Accuracy below target. Consider physical recount</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Historical Month-End Data
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  <button 
                    onClick={() => handleSort('month')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Month
                    {sortBy === 'month' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">
                  Beginning
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">
                  Purchases
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  COGS
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Ending
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Accuracy
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthEndData
                .sort((a, b) => {
                  if (sortBy === 'month') {
                    return sortOrder === 'asc' 
                      ? new Date(a.month) - new Date(b.month)
                      : new Date(b.month) - new Date(a.month);
                  }
                  return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
                })
                .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {item.month === selectedMonth && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.month}</p>
                        <p className="text-sm text-gray-500">Updated: {item.lastUpdated}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-gray-900">{formatCurrency(item.beginningInventory)}</p>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-gray-900">{formatCurrency(item.purchases)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{formatCurrency(item.cogs)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{formatCurrency(item.endingInventory)}</p>
                      {item.variance !== 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${item.variance > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.accuracy >= 98 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${item.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Download className="h-4 w-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">What is Inventory Month-End?</h3>
            <p className="text-gray-300">
              Inventory Month-End refers to the process of calculating the total value of unsold goods (Ending Inventory) a business has at the close of a specific accounting period, usually monthly, using the formula: <span className="font-medium">Beginning Inventory + Purchases - Cost of Goods Sold (COGS)</span>
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Required for financial reporting
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Helps identify inventory issues
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Guides purchasing decisions
              </span>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryMonthEndPage;