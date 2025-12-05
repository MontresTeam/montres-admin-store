"use client"
import React, { useState } from 'react';

const FinancialOverview = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [activeMetric, setActiveMetric] = useState('revenue');

  // Mock financial data
  const financialData = {
    summary: {
      revenue: 1254300,
      expenses: 784500,
      profit: 469800,
      growth: 12.5
    },
    metrics: {
      monthly: {
        revenue: [65, 78, 92, 81, 76, 85, 94, 88, 92, 87, 95, 98],
        expenses: [45, 52, 48, 55, 58, 52, 49, 56, 54, 58, 52, 55],
        profit: [20, 26, 44, 26, 18, 33, 45, 32, 38, 29, 43, 43]
      },
      quarterly: {
        revenue: [235, 248, 272, 295],
        expenses: [145, 156, 161, 172],
        profit: [90, 92, 111, 123]
      },
      yearly: {
        revenue: [890, 956, 1025, 1120, 1254],
        expenses: [620, 654, 712, 745, 784],
        profit: [270, 302, 313, 375, 470]
      }
    },
    transactions: [
      { id: 1, name: 'Client Payment - ABC Corp', amount: 50000, type: 'income', date: '2024-01-15', status: 'completed' },
      { id: 2, name: 'Office Rent', amount: 12000, type: 'expense', date: '2024-01-10', status: 'completed' },
      { id: 3, name: 'Software Subscription', amount: 2500, type: 'expense', date: '2024-01-08', status: 'completed' },
      { id: 4, name: 'Consulting Fee - XYZ Ltd', amount: 35000, type: 'income', date: '2024-01-05', status: 'pending' },
      { id: 5, name: 'Marketing Campaign', amount: 8500, type: 'expense', date: '2024-01-03', status: 'completed' }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getChartData = () => {
    return financialData.metrics[timeRange][activeMetric];
  };

  const ChartBar = ({ value, maxValue, label }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div className="flex flex-col items-center space-y-2 flex-1">
        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
              activeMetric === 'revenue' ? 'bg-gradient-to-t from-green-500 to-green-400' :
              activeMetric === 'expenses' ? 'bg-gradient-to-t from-red-500 to-red-400' :
              'bg-gradient-to-t from-blue-500 to-blue-400'
            }`}
            style={{ height: `${percentage}%` }}
          >
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold">
              {value}k
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
    );
  };

  const MetricCard = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Financial Overview</h1>
            <p className="text-gray-600 mt-2">Monitor your business financial performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <MetricCard
          title="Total Revenue"
          value={financialData.summary.revenue}
          change={12.5}
          color="bg-green-50 text-green-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        <MetricCard
          title="Total Expenses"
          value={financialData.summary.expenses}
          change={-3.2}
          color="bg-red-50 text-red-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
        <MetricCard
          title="Net Profit"
          value={financialData.summary.profit}
          change={8.7}
          color="bg-blue-50 text-blue-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <MetricCard
          title="Growth Rate"
          value={financialData.summary.growth * 10000}
          change={2.1}
          color="bg-purple-50 text-purple-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Financial Performance</h2>
              <div className="flex space-x-2">
                {['revenue', 'expenses', 'profit'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setActiveMetric(metric)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeMetric === metric
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 lg:h-80">
              <div className="flex items-end justify-between h-full space-x-2 lg:space-x-4">
                {getChartData().map((value, index) => (
                  <ChartBar
                    key={index}
                    value={value}
                    maxValue={Math.max(...getChartData())}
                    label={
                      timeRange === 'monthly' 
                        ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]
                        : timeRange === 'quarterly'
                        ? ['Q1', 'Q2', 'Q3', 'Q4'][index]
                        : ['2020', '2021', '2022', '2023', '2024'][index]
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {financialData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCompactCurrency(transaction.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'completed' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-600 mt-1">Collection Rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-sm text-gray-600 mt-1">Avg. Payment Time</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600 mt-1">Active Clients</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600 mt-1">Overdue Invoices</p>
            </div>
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Profit Margin</span>
                <span>37.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '37.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Expense Ratio</span>
                <span>62.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '62.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Cash Flow</span>
                <span>Positive</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;