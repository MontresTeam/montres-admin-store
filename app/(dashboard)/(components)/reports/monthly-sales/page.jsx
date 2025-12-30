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

const generatePDF = async () => {
  setGeneratingPDF(true);
  const toastId = toast.loading('Generating professional PDF report...');
  
  try {
    // Create a new PDF document with better settings
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
      compress: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (2 * margin);
    
    // Company/Report Header with styling
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Company Name/Logo area
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('INVENTORY PRO', pageWidth / 2, 50, { align: 'center' });
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `MONTHLY SALES REPORT - ${months[selectedMonth - 1].toUpperCase()} ${selectedYear}`,
      pageWidth / 2,
      120,
      { align: 'center' }
    );
    
    // Report metadata in a styled box
    const metaBoxTop = 140;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, metaBoxTop, contentWidth, 80, 5, 5, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    
    const metaData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Report Period', value: `${months[selectedMonth - 1]} 1, ${selectedYear} - ${months[selectedMonth - 1]} ${new Date(selectedYear, selectedMonth, 0).getDate()}, ${selectedYear}` },
      { label: 'Category Filter', value: selectedCategory },
      { label: 'Total Items', value: filteredData.length.toString() }
    ];
    
    const metaColWidth = contentWidth / 4;
    metaData.forEach((item, index) => {
      const x = margin + (index * metaColWidth) + 15;
      doc.text(item.label.toUpperCase(), x, metaBoxTop + 25);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(item.value, x, metaBoxTop + 45);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
    });
    
    // KPI Cards Section - Fixed AED currency and better visibility
    const kpiTop = metaBoxTop + 100;
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('KEY PERFORMANCE INDICATORS', margin, kpiTop);
    
    // Calculate average order value properly
    const avgOrderValue = totals.totalUnits > 0 ? (totals.totalSales / totals.totalUnits) : 0;
    
    // Ensure profitMargin is a number
    const profitMarginNumber = typeof profitMargin === 'string' 
      ? parseFloat(profitMargin.replace('%', '')) 
      : Number(profitMargin);
    
    const kpis = [
      { 
        label: 'TOTAL REVENUE', 
        value: totals.totalSales,
        icon: '💰',
        color: [59, 130, 246],
        subtext: 'Gross Sales Amount',
        format: 'currency'
      },
      { 
        label: 'TOTAL PROFIT', 
        value: profit,
        icon: '📈',
        color: [34, 197, 94],
        subtext: 'Net Profit After Costs',
        format: 'currency'
      },
      { 
        label: 'PROFIT MARGIN', 
        value: profitMarginNumber, // Use the numeric value
        icon: '🎯',
        color: [168, 85, 247],
        subtext: 'Margin Percentage',
        format: 'percent'
      },
      { 
        label: 'UNITS SOLD', 
        value: totals.totalUnits,
        icon: '📦',
        color: [245, 158, 11],
        subtext: 'Total Items Sold',
        format: 'number'
      },
      { 
        label: 'AVG. ORDER VALUE', 
        value: avgOrderValue,
        icon: '📊',
        color: [239, 68, 68],
        subtext: 'Average Per Unit',
        format: 'currency'
      }
    ];
    
    const kpiCardWidth = (contentWidth - 40) / 3;
    const kpiCardHeight = 90;
    const kpiGap = 20;
    
    kpis.forEach((kpi, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = margin + (col * (kpiCardWidth + kpiGap));
      const y = kpiTop + 30 + (row * (kpiCardHeight + 15));
      
      // KPI Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.roundedRect(x, y, kpiCardWidth, kpiCardHeight, 8, 8, 'FD');
      
      // Format the value based on type - FIXED: Ensure value is a number
      let formattedValue;
      const numericValue = Number(kpi.value);
      
      switch(kpi.format) {
        case 'currency':
          formattedValue = `AED ${numericValue.toLocaleString('en-US', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          })}`;
          break;
        case 'percent':
          formattedValue = `${numericValue.toFixed(1)}%`;
          break;
        case 'number':
          formattedValue = numericValue.toLocaleString('en-US');
          break;
        default:
          formattedValue = numericValue.toString();
      }
      
      // KPI Icon
      doc.setFontSize(20);
      doc.text(kpi.icon, x + 20, y + 30);
      
      // KPI Value - Better visible
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      
      // Calculate text width and center if needed
      const valueWidth = doc.getTextWidth(formattedValue);
      const valueX = Math.min(x + 50, x + (kpiCardWidth - valueWidth) / 2 + 10);
      doc.text(formattedValue, valueX, y + 32);
      
      // KPI Label
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.label, x + 20, y + 55);
      
      // KPI Subtext
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(kpi.subtext, x + 20, y + 70);
    });
    
    // Sales Details Table
    const tableTop = kpiTop + (Math.ceil(kpis.length / 3) * (kpiCardHeight + 15)) + 50;
    
    // Table Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('SALES TRANSACTIONS', margin, tableTop);
    
    // Create table with better structure
    const tableHeaders = [
      { text: 'PRODUCT', width: 180 },
      { text: 'CATEGORY', width: 100 },
      { text: 'DATE', width: 100 },
      { text: 'QUANTITY', width: 80 },
      { text: 'UNIT PRICE', width: 100 },
      { text: 'REVENUE', width: 100 },
      { text: 'PROFIT', width: 100 },
      { text: 'MARGIN', width: 80 }
    ];
    
    const tableStartY = tableTop + 30;
    let currentY = tableStartY;
    
    // Table Header
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'F');
    
    let headerX = margin + 10;
    tableHeaders.forEach(header => {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(header.text, headerX, currentY + 23);
      headerX += header.width;
    });
    
    currentY += 35;
    
    // Table Rows with proper text wrapping
    let pageNumber = 1;
    
    filteredData.forEach((item, index) => {
      // Add new page if needed
      if (currentY > pageHeight - 100 && index < filteredData.length - 1) {
        doc.addPage();
        pageNumber++;
        currentY = margin + 50;
        
        // Add page header
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Sales Transactions - Page ${pageNumber}`, margin, currentY - 20);
      }
      
      // Alternate row background
      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 251);
      doc.rect(margin, currentY, contentWidth, 30, 'F');
      
      // Calculate values
      const quantity = item.quantity || 1;
      const revenue = (item.soldPrice || 0) * quantity;
      const cost = (item.cost || 0) * quantity;
      const itemProfit = revenue - cost;
      const itemMargin = revenue > 0 ? ((itemProfit / revenue) * 100) : 0;
      
      // Format currency values with AED
      const formatAED = (value) => `AED ${Number(value).toFixed(2)}`;
      
      // Prepare row data with proper formatting
      const rowData = [
        { 
          text: item.productName || 'Unnamed Product',
          width: 180,
          style: { fontStyle: 'bold', color: [30, 41, 59] }
        },
        { 
          text: item.category || 'Uncategorized',
          width: 100,
          style: { color: [100, 116, 139] }
        },
        { 
          text: item.soldAt ? new Date(item.soldAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }) : 'N/A',
          width: 100,
          style: { color: [100, 116, 139] }
        },
        { 
          text: quantity.toString(),
          width: 80,
          style: { align: 'center', color: [30, 41, 59] }
        },
        { 
          text: formatAED(item.soldPrice || 0),
          width: 100,
          style: { align: 'right', color: [30, 41, 59] }
        },
        { 
          text: formatAED(revenue),
          width: 100,
          style: { align: 'right', fontStyle: 'bold', color: [30, 41, 59] }
        },
        { 
          text: formatAED(itemProfit),
          width: 100,
          style: { 
            align: 'right', 
            fontStyle: 'bold', 
            color: itemProfit >= 0 ? [34, 197, 94] : [239, 68, 68]
          }
        },
        { 
          text: `${Number(itemMargin).toFixed(1)}%`,
          width: 80,
          style: { 
            align: 'right',
            color: itemMargin >= 20 ? [34, 197, 94] : 
                   itemMargin >= 10 ? [245, 158, 11] : 
                   [239, 68, 68]
          }
        }
      ];
      
      // Draw cell borders and text
      let cellX = margin;
      rowData.forEach(cell => {
        // Cell border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(cellX, currentY, cellX, currentY + 30);
        
        // Set cell text style
        doc.setFontSize(9);
        doc.setFont('helvetica', cell.style.fontStyle || 'normal');
        doc.setTextColor(...cell.style.color);
        
        // Calculate text position
        let textX = cellX + 5;
        if (cell.style.align === 'center') {
          textX = cellX + (cell.width / 2);
        } else if (cell.style.align === 'right') {
          textX = cellX + cell.width - 5;
        }
        
        // Draw text with word wrapping
        const textOptions = {
          align: cell.style.align || 'left',
          maxWidth: cell.width - 10
        };
        
        const lines = doc.splitTextToSize(cell.text, cell.width - 10);
        if (lines.length > 1) {
          // For multi-line text, adjust position
          doc.text(lines, textX, currentY + 12, textOptions);
        } else {
          doc.text(cell.text, textX, currentY + 18, textOptions);
        }
        
        cellX += cell.width;
      });
      
      // Right border
      doc.line(cellX, currentY, cellX, currentY + 30);
      
      // Bottom border
      doc.line(margin, currentY + 30, cellX, currentY + 30);
      
      currentY += 30;
    });
    
    // Category Breakdown Page
    doc.addPage();
    
    // Page Header
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('CATEGORY ANALYSIS', pageWidth / 2, 80, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Revenue Distribution by Product Category', pageWidth / 2, 110, { align: 'center' });
    
    // Calculate category stats
    const categoryStats = categories
      .filter(cat => cat !== 'All')
      .map(cat => {
        const catItems = salesData.filter(item => item.category === cat);
        const catRevenue = catItems.reduce((sum, item) => sum + (item.soldPrice || 0) * (item.quantity || 1), 0);
        const catCost = catItems.reduce((sum, item) => sum + (item.cost || 0) * (item.quantity || 1), 0);
        const catProfit = catRevenue - catCost;
        const catMargin = catRevenue > 0 ? (catProfit / catRevenue) * 100 : 0;
        const percentage = totals.totalSales > 0 ? (catRevenue / totals.totalSales) * 100 : 0;
        
        return {
          category: cat,
          revenue: catRevenue,
          cost: catCost,
          profit: catProfit,
          margin: catMargin,
          items: catItems.length,
          units: catItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
          percentage
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
    
    // Category cards
    const cardStartY = 150;
    const cardWidth = (contentWidth - 40) / 2;
    const cardHeight = 120;
    const cardGap = 40;
    
    categoryStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = margin + (col * (cardWidth + cardGap));
      const y = cardStartY + (row * (cardHeight + 20));
      
      // Category color
      const categoryColors = {
        'watch': [59, 130, 246],
        'accessories': [34, 197, 94],
        'leather goods': [168, 85, 247],
        'default': [245, 158, 11]
      };
      
      const color = categoryColors[stat.category.toLowerCase()] || categoryColors.default;
      
      // Category header
      doc.setFillColor(...color);
      doc.roundedRect(x, y, cardWidth, 30, 5, 5, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.category.toUpperCase(), x + 15, y + 20);
      
      // Category stats
      const statY = y + 55;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      
      // Left column stats
      doc.text('Revenue:', x + 15, statY);
      doc.text('Profit:', x + 15, statY + 18);
      doc.text('Margin:', x + 15, statY + 36);
      
      // Right column stats
      doc.text(`Items: ${stat.items}`, x + cardWidth / 2 + 10, statY);
      doc.text(`Units: ${stat.units}`, x + cardWidth / 2 + 10, statY + 18);
      doc.text(`Share: ${stat.percentage.toFixed(1)}%`, x + cardWidth / 2 + 10, statY + 36);
      
      // Values with AED currency
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`AED ${stat.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, x + 70, statY);
      doc.text(`AED ${stat.profit.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, x + 70, statY + 18);
      doc.text(`${stat.margin.toFixed(1)}%`, x + 70, statY + 36);
      
      // Progress bar
      const barY = y + 90;
      doc.setDrawColor(226, 232, 240);
      doc.rect(x + 15, barY, cardWidth - 30, 8);
      doc.setFillColor(...color);
      doc.rect(x + 15, barY, (cardWidth - 30) * (stat.percentage / 100), 8, 'F');
    });
    
    // Summary section at bottom
    const summaryY = cardStartY + (Math.ceil(categoryStats.length / 2) * (cardHeight + 20)) + 50;
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin, summaryY);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    
    // Use the numeric profit margin for summary
    const profitMarginSummary = profitMarginNumber || 0;
    
    const summaryText = [
      `• The ${months[selectedMonth - 1]} ${selectedYear} sales report shows ${filteredData.length} transactions across ${categoryStats.length} categories.`,
      `• Top performing category: ${categoryStats[0]?.category || 'N/A'} with ${categoryStats[0]?.percentage.toFixed(1)}% revenue share.`,
      `• Overall profit margin of ${profitMarginSummary.toFixed(1)}% indicates ${profitMarginSummary > 20 ? 'strong' : profitMarginSummary > 10 ? 'moderate' : 'weak'} profitability.`,
      `• Report generated for ${selectedCategory === 'All' ? 'all categories' : selectedCategory + ' category'}.`,
      `• Total revenue for the period: AED ${totals.totalSales.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    ];
    
    summaryText.forEach((line, index) => {
      doc.text(line, margin, summaryY + 30 + (index * 20));
    });
    
    // Add professional footer to all pages (removed "Confidential")
    const totalPages = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 60, pageWidth, 60, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(0, pageHeight - 60, pageWidth, pageHeight - 60);
      
      // Footer text
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      
      // Left footer (removed "Confidential")
      doc.text(`Inventory Management System`, margin, pageHeight - 35);
      
      // Center footer
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 35, { align: 'center' });
      
      // Right footer
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${timestamp}`, pageWidth - margin, pageHeight - 35, { align: 'right' });
      
      // Optional: Subtle watermark for internal use
      if (i > 1) {
        doc.setFontSize(40);
        doc.setTextColor(240, 240, 240);
        doc.setFont('helvetica', 'bold');
        doc.text('INTERNAL USE', pageWidth / 2, pageHeight / 2, { 
          align: 'center',
          angle: 45
        });
        doc.setTextColor(100, 116, 139);
      }
    }
    
    // Save the PDF with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const fileName = `Sales_Report_${months[selectedMonth - 1]}_${selectedYear}_${timestamp}.pdf`;
    
    doc.save(fileName);
    
    toast.success(`Professional PDF report generated: ${fileName}`, { 
      id: toastId, 
      duration: 5000 
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report. Please try again.', { 
      id: toastId,
      duration: 3000 
    });
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