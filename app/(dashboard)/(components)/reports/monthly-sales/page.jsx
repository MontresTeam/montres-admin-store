"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import newcurrency from '../../../../../public/assets/newSymbole.png';
import { toast, Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MonthlySalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'report'

  // Your main categories
  const categories = ['All', 'watch', 'Accessories', 'Leather Goods', 'Leather Bags'];

  // Months for display
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Years for selection
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch data from API
  const fetchMonthlySalesReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('https://api.montres.ae/api/invontry/reports/monthly-sales', {
        params: {
          year: selectedYear,
          month: selectedMonth
        }
      });
      
      if (response.data && response.data.soldItems) {
        setSalesData(response.data.soldItems);
        
      } else {
        setSalesData([]);
        toast.info('No sales data available for selected period');
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
      setError('Failed to load sales data. Please try again.');
      toast.error('Failed to load sales data');
      // Fallback to sample data if API fails
      setSalesData(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  // Sample data for fallback/demo
  const getSampleData = () => {
    const sampleProducts = [
      { name: 'Premium Watch', category: 'watch' },
      { name: 'Classic Watch', category: 'watch' },
      { name: 'Smart Watch', category: 'watch' },
      { name: 'Leather Belt', category: 'Leather Goods' },
      { name: 'Wallet', category: 'Leather Goods' },
      { name: 'Keychain', category: 'Accessories' },
      { name: 'Phone Case', category: 'Accessories' },
      { name: 'Leather Backpack', category: 'Leather Bags' },
      { name: 'Tote Bag', category: 'Leather Bags' },
      { name: 'Briefcase', category: 'Leather Bags' }
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      productName: sampleProducts[i % sampleProducts.length].name,
      category: sampleProducts[i % sampleProducts.length].category,
      soldAt: new Date(selectedYear, selectedMonth - 1, Math.floor(Math.random() * 28) + 1),
      soldPrice: Math.floor(Math.random() * 1000) + 100,
      cost: Math.floor(Math.random() * 600) + 50,
      status: 'SOLD'
    }));
  };

  // Calculate totals from data
  const calculateTotals = (data) => {
    return data.reduce((acc, item) => {
      acc.totalSales += item.soldPrice || 0;
      acc.totalCost += item.cost || 0;
      acc.totalUnits += 1;
      return acc;
    }, { totalSales: 0, totalCost: 0, totalUnits: 0 });
  };

  // Apply category filter
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredData(salesData);
    } else {
      const filtered = salesData.filter(item => item.category === selectedCategory);
      setFilteredData(filtered);
    }
  }, [salesData, selectedCategory]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchMonthlySalesReport();
  }, [selectedMonth, selectedYear]);

  const totals = calculateTotals(filteredData);
  const profit = totals.totalSales - totals.totalCost;
  const profitMargin = totals.totalSales > 0 ? ((profit / totals.totalSales) * 100).toFixed(1) : 0;

  // Generate PDF function
  const generatePDF = async () => {
    setGeneratingPDF(true);
    const toastId = toast.loading('Generating PDF report...');
    
    try {
      // Create a new PDF document
      const doc = new jsPDF('landscape', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add title
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text(`Monthly Sales Report - ${months[selectedMonth - 1]} ${selectedYear}`, pageWidth / 2, 60, { align: 'center' });
      
      // Add report details
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 100);
      doc.text(`Category: ${selectedCategory}`, 50, 120);
      doc.text(`Total Items: ${filteredData.length}`, pageWidth - 150, 100);
      doc.text(`Report Period: ${months[selectedMonth - 1]} ${selectedYear}`, pageWidth - 150, 120);
      
      // Add stats section
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Sales Overview', 50, 160);
      
      doc.setFontSize(12);
      const stats = [
        { label: 'Total Revenue', value: totals.totalSales.toLocaleString(), color: [59, 130, 246] },
        { label: 'Total Profit', value: profit.toLocaleString(), color: [34, 197, 94] },
        { label: 'Total Cost', value: totals.totalCost.toLocaleString(), color: [147, 51, 234] },
        { label: 'Units Sold', value: totals.totalUnits.toString(), color: [245, 158, 11] },
        { label: 'Profit Margin', value: `${profitMargin}%`, color: [239, 68, 68] },
      ];
      
      stats.forEach((stat, index) => {
        const x = 50 + (index % 3) * 180;
        const y = 200 + Math.floor(index / 3) * 40;
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(stat.label, x, y);
        
        doc.setFontSize(12);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value.toString(), x, y + 20);
      });
      
      // Add table header
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Sales Details', 50, 300);
      
      // Create table
      const tableTop = 320;
      const tableHeaders = ['Product', 'Category', 'Date', 'Revenue', 'Profit'];
      const columnWidths = [150, 100, 100, 100, 100];
      let currentX = 50;
      
      // Draw table headers
      doc.setFillColor(248, 250, 252);
      doc.rect(50, tableTop, pageWidth - 100, 30, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.rect(50, tableTop, pageWidth - 100, 30);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      tableHeaders.forEach((header, index) => {
        doc.text(header, currentX + 10, tableTop + 20);
        if (index < tableHeaders.length - 1) {
          doc.line(currentX + columnWidths[index], tableTop, currentX + columnWidths[index], tableTop + 30);
        }
        currentX += columnWidths[index];
      });
      
      // Draw table rows
      let currentY = tableTop + 30;
      filteredData.slice(0, 15).forEach((item, rowIndex) => {
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = 50;
        }
        
        const itemProfit = (item.soldPrice || 0) - (item.cost || 0);
        const rowData = [
          item.productName || 'Product',
          item.category || 'Uncategorized',
          item.soldAt ? new Date(item.soldAt).toLocaleDateString() : 'N/A',
          `$${(item.soldPrice || 0).toLocaleString()}`,
          `$${itemProfit.toLocaleString()}`
        ];
        
        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(50, currentY, pageWidth - 100, 25, 'F');
        }
        
        // Draw row border
        doc.setDrawColor(226, 232, 240);
        doc.rect(50, currentY, pageWidth - 100, 25);
        
        // Add row data
        currentX = 50;
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        
        rowData.forEach((cell, cellIndex) => {
          // Special styling for profit column
          if (cellIndex === 4) {
            doc.setTextColor(itemProfit >= 0 ? 34 : 239, itemProfit >= 0 ? 197 : 68, itemProfit >= 0 ? 94 : 68);
          }
          
          doc.text(cell, currentX + 5, currentY + 17, { maxWidth: columnWidths[cellIndex] - 10 });
          
          if (cellIndex < rowData.length - 1) {
            doc.line(currentX + columnWidths[cellIndex], currentY, currentX + columnWidths[cellIndex], currentY + 25);
          }
          
          doc.setTextColor(30, 41, 59);
          currentX += columnWidths[cellIndex];
        });
        
        currentY += 25;
      });
      
      // Add category breakdown
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Category Breakdown', 50, 60);
      
      let categoryY = 100;
      categories.filter(cat => cat !== 'All').forEach((cat, index) => {
        const catItems = salesData.filter(item => item.category === cat);
        const catTotal = catItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
        const percentage = totals.totalSales > 0 ? ((catTotal / totals.totalSales) * 100).toFixed(1) : 0;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${cat}:`, 50, categoryY);
        
        doc.setTextColor(40, 40, 40);
        doc.text(`$${catTotal.toLocaleString()} (${catItems.length} items)`, 200, categoryY);
        
        doc.text(`${percentage}% of total revenue`, 400, categoryY);
        
        // Draw progress bar
        doc.setDrawColor(200, 200, 200);
        doc.rect(50, categoryY + 10, 300, 8);
        
        const barColor = cat === 'watch' ? [59, 130, 246] :
                        cat === 'Accessories' ? [34, 197, 94] :
                        cat === 'Leather Goods' ? [147, 51, 234] :
                        [245, 158, 11];
        
        doc.setFillColor(barColor[0], barColor[1], barColor[2]);
        doc.rect(50, categoryY + 10, 300 * (percentage / 100), 8, 'F');
        
        categoryY += 40;
      });
      
      // Add footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text('Generated by Inventory Management System', pageWidth / 2, pageHeight - 40, { align: 'center' });
      }
      
      // Save the PDF
      const fileName = `sales-report-${months[selectedMonth - 1].toLowerCase()}-${selectedYear}.pdf`;
      doc.save(fileName);
      
      toast.success(`PDF report generated: ${fileName}`, { id: toastId, duration: 4000 });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report', { id: toastId });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Alternative PDF generation using html2canvas (for capturing the entire report view)
  const generatePDFFromView = async () => {
    setGeneratingPDF(true);
    const toastId = toast.loading('Capturing report view...');
    
    try {
      const reportElement = document.getElementById('report-view');
      if (!reportElement) {
        throw new Error('Report element not found');
      }
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `sales-report-view-${months[selectedMonth - 1].toLowerCase()}-${selectedYear}.pdf`;
      pdf.save(fileName);
      
      toast.success(`PDF report saved: ${fileName}`, { id: toastId, duration: 4000 });
    } catch (error) {
      console.error('Error generating PDF from view:', error);
      toast.error('Failed to capture report view', { id: toastId });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Format currency with custom symbol
  const formatCurrency = (amount) => {
    return (
      <span className="flex items-center">
        <span className="mr-1">
          <Image 
            src={newcurrency} 
            alt="Currency" 
            width={16} 
            height={16} 
            className="inline-block"
          />
        </span>
        {amount.toLocaleString()}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales report...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6" id="report-view">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Monthly Sales Report</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track and analyze monthly sales performance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'report' : 'table')}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 sm:px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={viewMode === 'table' ? 
                    "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" : 
                    "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  }></path>
                </svg>
                <span className="hidden sm:inline">View as {viewMode === 'table' ? 'Report' : 'Table'}</span>
                <span className="sm:hidden">{viewMode === 'table' ? 'Report' : 'Table'}</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={generatePDF}
                  disabled={generatingPDF}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 sm:px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {generatingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span className="hidden sm:inline">Export PDF</span>
                    </>
                  )}
                </button>
                
                {/* Dropdown for PDF options */}
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={generatePDF}
                      disabled={generatingPDF}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Generate Detailed PDF
                    </button>
                    <button
                      onClick={generatePDFFromView}
                      disabled={generatingPDF}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Capture Current View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Sales Overview</h2>
              <p className="text-gray-600 text-sm sm:text-base">Filter and analyze sales data</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 w-full lg:w-auto">
              {/* Month Selector */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              
              {/* Year Selector */}
              <div className="min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Category Filter */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <button
                  onClick={fetchMonthlySalesReport}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-800">Total Revenue</p>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 flex items-center">
                    {formatCurrency(totals.totalSales)}
                  </div>
                </div>
                <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">{filteredData.length} items sold</p>
            </div>

            {/* Total Profit Card */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-800">Total Profit</p>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 flex items-center">
                    {formatCurrency(profit)}
                  </div>
                </div>
                <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">{profitMargin}% profit margin</p>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-800">Total Cost</p>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 flex items-center">
                    {formatCurrency(totals.totalCost)}
                  </div>
                </div>
                <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-2">Inventory cost</p>
            </div>

            {/* Units Sold Card */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800">Units Sold</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-2">{totals.totalUnits}</p>
                </div>
                <div className="bg-amber-500 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-amber-700 mt-2">Total items sold</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Sales Data Table - Conditionally rendered based on view mode */}
          {viewMode === 'table' ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Sales Details</h3>
                <p className="text-sm text-gray-600">
                  Showing {filteredData.length} items for {months[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
              
              {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-gray-500">No sales data found for the selected filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((item) => {
                        const itemProfit = (item.soldPrice || 0) - (item.cost || 0);
                        return (
                          <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-gray-900 text-sm">{item.productName || 'Product'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                                ${item.category === 'watch' ? 'bg-blue-100 text-blue-800' : 
                                  item.category === 'Accessories' ? 'bg-green-100 text-green-800' : 
                                  item.category === 'Leather Goods' ? 'bg-purple-100 text-purple-800' :
                                  item.category === 'Leather Bags' ? 'bg-amber-100 text-amber-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {item.category || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm">
                              {item.soldAt ? formatDate(item.soldAt) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 text-sm">
                              {formatCurrency(item.soldPrice || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-semibold text-sm">
                              <span className={itemProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                                {formatCurrency(itemProfit)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Report View (Condensed)
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium">{months[selectedMonth - 1]} {selectedYear}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(totals.totalSales)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Total Profit:</span>
                      <span className="font-medium text-green-600">{formatCurrency(profit)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="font-medium">{profitMargin}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Category Performance</h4>
                  <div className="space-y-3">
                    {categories.filter(cat => cat !== 'All').map(cat => {
                      const catItems = salesData.filter(item => item.category === cat);
                      const catTotal = catItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
                      return (
                        <div key={cat} className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">{cat}:</span>
                          <span className="font-medium">{catItems.length} items - {formatCurrency(catTotal)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {categories.filter(cat => cat !== 'All').map(cat => {
                const catItems = salesData.filter(item => item.category === cat);
                const catTotal = catItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
                const percentage = totals.totalSales > 0 ? ((catTotal / totals.totalSales) * 100).toFixed(1) : 0;
                
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{cat}</span>
                      <span className="text-sm font-semibold text-gray-900 flex items-center">
                        {formatCurrency(catTotal)}
                        <span className="ml-2 text-xs font-normal text-gray-500">({catItems.length} items)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cat === 'watch' ? 'bg-blue-500' :
                          cat === 'Accessories' ? 'bg-green-500' :
                          cat === 'Leather Goods' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{percentage}% of total revenue</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={generatePDF}
                disabled={generatingPDF}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {generatingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Generate PDF Report
                  </>
                )}
              </button>
              <button 
                onClick={generatePDFFromView}
                disabled={generatingPDF}
                className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export Current View
              </button>
              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Schedule Report
              </button>
            </div>
            
            {/* Report Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Report Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Report Period:</span>
                  <span className="font-medium">{months[selectedMonth - 1]} {selectedYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generated On:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Source:</span>
                  <span className="font-medium">Inventory System</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Ready for Export</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>Report generated on {new Date().toLocaleDateString()} • Data updates in real-time</p>
          <p className="mt-1">For support, contact admin@inventorysystem.com</p>
        </div>
      </div>
    </>
  );
};

export default MonthlySalesReport;