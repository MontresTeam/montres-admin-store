"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  ChevronDown,
  Eye,
  Trash2,
  Send,
  X,
  RefreshCw,
  Loader,
  Package,
  MailCheck,
  User,
  Phone,
  Tag,
  ShoppingBag,
  FileText,
  FileSpreadsheet,
  File,
  Copy,
  ExternalLink,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";

const ProductRestockWaitlist = () => {
  // State management
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    expired: 0,
  });

  // API endpoint
  const API_URL = "http://localhost:9000/api/products/restock/subscribers";
  const exportMenuRef = useRef(null);

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status", icon: <Users size={16} /> },
    {
      value: "pending",
      label: "Pending",
      icon: <Clock size={16} />,
      color: "bg-yellow-100 text-yellow-800",
      badgeColor: "bg-yellow-500",
    },
    {
      value: "notified",
      label: "Notified",
      icon: <CheckCircle size={16} />,
      color: "bg-green-100 text-green-800",
      badgeColor: "bg-green-500",
    },
    {
      value: "expired",
      label: "Expired",
      icon: <AlertCircle size={16} />,
      color: "bg-red-100 text-red-800",
      badgeColor: "bg-red-500",
    },
  ];

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch subscribers from API
  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        const data = response.data.subscribers;
        // Process subscribers to ensure we have product image
        const processedData = data.map(subscriber => ({
          ...subscriber,
          productImage: subscriber.productImage || 
                      (subscriber.productId?.images?.[0] || {}),
          productName: subscriber.productName || subscriber.productId?.name,
          productSKU: subscriber.productSKU || subscriber.productId?.sku,
          category: subscriber.category || subscriber.productId?.category
        }));
        setSubscribers(processedData);
        calculateStats(processedData);
      } else {
        setError("Failed to fetch subscribers");
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter((s) => s.status === "pending").length;
    const notified = data.filter((s) => s.status === "notified").length;
    const expired = data.filter((s) => s.status === "expired").length;
    setStats({ total, pending, notified, expired });
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.productSKU?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || subscriber.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" || subscriber.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = subscribers.map((s) => s.category).filter(Boolean);
    return ["All", ...new Set(categories)];
  };

  // Handle row selection
  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredSubscribers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredSubscribers.map((subscriber) => subscriber._id));
    }
  };

  // Update subscriber status
  const updateSubscriberStatus = async (id, newStatus) => {
    try {
      const updatedSubscribers = subscribers.map((subscriber) =>
        subscriber._id === id
          ? { ...subscriber, status: newStatus, notified: newStatus === "notified" }
          : subscriber
      );
      setSubscribers(updatedSubscribers);
      calculateStats(updatedSubscribers);
      alert(`Status updated to ${newStatus} for subscriber`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // Delete subscriber
  const deleteSubscriber = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      try {
        const updatedSubscribers = subscribers.filter((subscriber) => subscriber._id !== id);
        setSubscribers(updatedSubscribers);
        setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        calculateStats(updatedSubscribers);
        alert("Subscriber deleted successfully");
      } catch (err) {
        console.error("Error deleting subscriber:", err);
        alert("Failed to delete subscriber");
      }
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} subscriber(s)?`)) {
      try {
        const updatedSubscribers = subscribers.filter(
          (subscriber) => !selectedRows.includes(subscriber._id)
        );
        setSubscribers(updatedSubscribers);
        setSelectedRows([]);
        calculateStats(updatedSubscribers);
        alert(`${selectedRows.length} subscriber(s) deleted successfully`);
      } catch (err) {
        console.error("Error deleting subscribers:", err);
        alert("Failed to delete subscribers");
      }
    }
  };

  // Send notification
  const handleSendNotification = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one subscriber to notify");
      return;
    }
    setShowNotificationModal(true);
  };

  // Confirm notification
  const confirmSendNotification = async () => {
    try {
      const updatedSubscribers = subscribers.map((subscriber) =>
        selectedRows.includes(subscriber._id)
          ? { ...subscriber, status: "notified", notified: true }
          : subscriber
      );
      setSubscribers(updatedSubscribers);
      calculateStats(updatedSubscribers);
      alert(`Notification sent to ${selectedRows.length} subscriber(s)!`);
      setSelectedRows([]);
      setNotificationMessage("");
      setShowNotificationModal(false);
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Failed to send notification");
    }
  };

  // Show subscriber details
  const showSubscriberDetails = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find((option) => option.value === status);
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusOption?.color || "bg-gray-100 text-gray-800"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusOption?.badgeColor || "bg-gray-400"}`}></div>
          {statusOption?.icon}
          {statusOption?.label}
        </div>
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate days since creation
  const getDaysSince = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get product image URL - FIXED VERSION
  const getProductImageUrl = (subscriber) => {
    if (!subscriber) return null;
    
    // Check in priority order
    const imageUrl = 
      subscriber?.productImage?.url ||
      subscriber?.productId?.images?.[0]?.url ||
      null;
    
    return imageUrl;
  };

  console.log(getProductImageUrl,"getProductImageUrl");
  

  // Render product image with proper handling
  const ProductImage = ({ subscriber, className = "", width = 48, height = 48 }) => {
    const imageUrl = getProductImageUrl(subscriber);

    
  console.log(imageUrl,"getProductImageUrl");
  
    
    if (imageUrl) {
      return (
        <div className={`relative ${className}`}>
          <Image
            src={imageUrl}
            alt={subscriber.productName || "Product image"}
            width={width}
            height={height}
            className="object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              // Show fallback icon
              const parent = e.target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center bg-gray-100 rounded-lg';
                fallback.innerHTML = `<Package size={20} className="text-gray-400" />`;
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
      );
    }
    
    // Fallback when no image
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <Package size={Math.min(width, height) / 2} className="text-gray-400" />
      </div>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const dataToExport = filteredSubscribers.map((sub) => ({
        "Customer Name": sub.customerName,
        "Email": sub.email,
        "Phone": sub.phone,
        "Product Name": sub.productName,
        "SKU": sub.productSKU,
        "Category": sub.category,
        "Status": sub.status,
        "Date Created": formatDate(sub.createdAt),
        "Notified": sub.notified ? "Yes" : "No",
        "Product ID": sub.productId?._id || sub.productId,
        "Product Image URL": getProductImageUrl(sub) || "No image",
      }));

      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `product-restock-waitlist-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportMenu(false);
      alert("CSV exported successfully!");
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    setExporting(true);
    try {
      const dataToExport = filteredSubscribers.map((sub) => ({
        "Customer Name": sub.customerName,
        "Email": sub.email,
        "Phone": sub.phone,
        "Product Name": sub.productName,
        "SKU": sub.productSKU,
        "Category": sub.category,
        "Status": sub.status,
        "Date Created": formatDate(sub.createdAt),
        "Notified": sub.notified ? "Yes" : "No",
        "Request Type": sub.requestType,
        "Product ID": sub.productId?._id || sub.productId,
        "Product Image URL": getProductImageUrl(sub) || "No image",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Waitlist Subscribers");
      
      // Set column widths
      const wscols = [
        {wch: 20}, // Customer Name
        {wch: 30}, // Email
        {wch: 15}, // Phone
        {wch: 30}, // Product Name
        {wch: 15}, // SKU
        {wch: 15}, // Category
        {wch: 12}, // Status
        {wch: 20}, // Date Created
        {wch: 10}, // Notified
        {wch: 12}, // Request Type
        {wch: 25}, // Product ID
        {wch: 50}, // Product Image URL
      ];
      worksheet["!cols"] = wscols;
      
      XLSX.writeFile(workbook, `product-restock-waitlist-${new Date().toISOString().split("T")[0]}.xlsx`);
      
      setShowExportMenu(false);
      alert("Excel file exported successfully!");
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Failed to export Excel file");
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF('landscape');
      const title = "Product Restock Waitlist Report";
      const date = new Date().toLocaleDateString();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${date}`, 14, 22);
      doc.text(`Total Subscribers: ${filteredSubscribers.length}`, 14, 29);

      // Table data
      const tableData = filteredSubscribers.map((sub) => [
        sub.customerName,
        sub.email,
        sub.phone,
        sub.productName,
        sub.productSKU,
        sub.status,
        formatDate(sub.createdAt),
        sub.notified ? 'Yes' : 'No'
      ]);

      // Add table
      doc.autoTable({
        head: [['Customer', 'Email', 'Phone', 'Product', 'SKU', 'Status', 'Date Created', 'Notified']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 30 },
          7: { cellWidth: 15 }
        },
        margin: { top: 40 }
      });

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      doc.save(`product-restock-waitlist-${new Date().toISOString().split("T")[0]}.pdf`);
      
      setShowExportMenu(false);
      alert("PDF exported successfully!");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  // Copy to clipboard
  const copyDetailsToClipboard = () => {
    if (!selectedSubscriber) return;
    
    const details = `
Customer: ${selectedSubscriber.customerName}
Email: ${selectedSubscriber.email}
Phone: ${selectedSubscriber.phone}
Product: ${selectedSubscriber.productName}
SKU: ${selectedSubscriber.productSKU}
Status: ${selectedSubscriber.status}
Created: ${formatDate(selectedSubscriber.createdAt)}
Product Image: ${getProductImageUrl(selectedSubscriber) || "No image"}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      alert("Details copied to clipboard!");
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Restock Waitlist Manager</h1>
            <p className="text-gray-600 mt-2">Track and manage customers waiting for products to be restocked</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-700 text-sm mt-1">Failed to load data. Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
            <p className="text-gray-600">Loading waitlist subscribers...</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Waitlist</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-green-600">+{stats.notified} notified</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Notifications</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedStatus("pending")}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  View all pending
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Notified</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.notified}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedStatus("notified")}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  View all notified
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Expired</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.expired}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-full">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedStatus("expired")}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  View all expired
                </button>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow mb-6 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by email, name, phone, product, SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendNotification}
                  disabled={selectedRows.length === 0}
                >
                  <Send size={18} />
                  Notify ({selectedRows.length})
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                  Filters
                  {showFilters ? <ChevronDown className="rotate-180" size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Export Dropdown */}
                <div className="relative" ref={exportMenuRef}>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting}
                  >
                    {exporting ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                    Export
                    <ChevronDown size={16} />
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={exportToCSV}
                          disabled={exporting || filteredSubscribers.length === 0}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileText size={16} className="text-green-600" />
                          <div className="text-left">
                            <p className="font-medium">Export as CSV</p>
                            <p className="text-xs text-gray-500">Comma separated values</p>
                          </div>
                        </button>
                        
                        <button
                          onClick={exportToExcel}
                          disabled={exporting || filteredSubscribers.length === 0}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileSpreadsheet size={16} className="text-green-600" />
                          <div className="text-left">
                            <p className="font-medium">Export as Excel</p>
                            <p className="text-xs text-gray-500">Microsoft Excel format</p>
                          </div>
                        </button>
                        
                        <button
                          onClick={exportToPDF}
                          disabled={exporting || filteredSubscribers.length === 0}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <File size={16} className="text-green-600" />
                          <div className="text-left">
                            <p className="font-medium">Export as PDF</p>
                            <p className="text-xs text-gray-500">Portable Document Format</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedRows.length > 0 && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={18} />
                    Delete ({selectedRows.length})
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            selectedStatus === option.value
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                          onClick={() => setSelectedStatus(option.value)}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {getUniqueCategories().map((category) => (
                        <button
                          key={category}
                          className={`px-3 py-2 rounded-lg ${
                            selectedCategory === category.toLowerCase()
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                          onClick={() => setSelectedCategory(category === "All" ? "all" : category.toLowerCase())}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile View Cards */}
          <div className="lg:hidden space-y-4 mb-6">
            {filteredSubscribers.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">No subscribers found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <div key={subscriber._id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          checked={selectedRows.includes(subscriber._id)}
                          onChange={() => toggleRowSelection(subscriber._id)}
                        />
                        <div className="flex items-center gap-3">
                          <ProductImage subscriber={subscriber} width={48} height={48} />
                          <div>
                            <div className="flex items-center gap-2">
                              <ShoppingBag size={16} className="text-blue-600" />
                              <h3 className="font-medium text-gray-900">{subscriber.productName}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-500">{subscriber.productSKU}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(subscriber.status)}
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{subscriber.customerName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={14} className="text-gray-400" />
                            <a
                              href={`mailto:${subscriber.email}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {subscriber.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{subscriber.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{formatDate(subscriber.createdAt)}</span>
                        <span className="text-xs text-gray-500 ml-auto">{getDaysSince(subscriber.createdAt)} days ago</span>
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        onClick={() => showSubscriberDetails(subscriber)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                          onClick={() => updateSubscriberStatus(subscriber._id, "notified")}
                          disabled={subscriber.status === "notified"}
                          title="Mark as notified"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-800"
                          onClick={() => deleteSubscriber(subscriber._id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedRows.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Users size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg">No subscribers found</p>
                          <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedRows.includes(subscriber._id)}
                            onChange={() => toggleRowSelection(subscriber._id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <ProductImage subscriber={subscriber} width={48} height={48} className="flex-shrink-0" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{subscriber.productName}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Tag size={12} />
                                {subscriber.productSKU}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{subscriber.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{subscriber.customerName}</div>
                          <div className="text-xs text-gray-500">ID: {subscriber._id.slice(-8)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail size={14} className="text-gray-400" />
                              <a href={`mailto:${subscriber.email}`} className="text-blue-600 hover:underline">
                                {subscriber.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <span>{subscriber.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(subscriber.status)}
                          {subscriber.notified && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <MailCheck size={12} />
                              Notified
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(subscriber.createdAt)}</div>
                          <div className="text-xs text-gray-500">{getDaysSince(subscriber.createdAt)} days ago</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                              onClick={() => showSubscriberDetails(subscriber)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                              onClick={() => updateSubscriberStatus(subscriber._id, "notified")}
                              disabled={subscriber.status === "notified"}
                              title="Mark as notified"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:text-red-800"
                              onClick={() => deleteSubscriber(subscriber._id)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                Showing <span className="font-medium">{filteredSubscribers.length}</span> of{" "}
                <span className="font-medium">{subscribers.length}</span> subscribers
                {searchTerm && (
                  <span className="ml-2 text-blue-600">(Search: "{searchTerm}")</span>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedSubscriber && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Subscriber Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Complete information about the waitlist entry</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {/* Customer Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Customer Information
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedSubscriber.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{selectedSubscriber.customerName}</p>
                              <p className="text-sm text-gray-500">Customer ID: {selectedSubscriber._id.slice(-8)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Mail size={18} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email Address</p>
                              <a href={`mailto:${selectedSubscriber.email}`} className="text-blue-600 hover:underline font-medium">
                                {selectedSubscriber.email}
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Phone size={18} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone Number</p>
                              <p className="font-medium text-gray-900">{selectedSubscriber.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Request Timeline</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Date Created:</span>
                              <span className="text-sm font-medium">{formatDate(selectedSubscriber.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Days Since Request:</span>
                              <span className="text-sm font-medium text-blue-600">{getDaysSince(selectedSubscriber.createdAt)} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Notification Status:</span>
                              <span className={`text-sm font-medium ${selectedSubscriber.notified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {selectedSubscriber.notified ? 'Notified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Request Type:</span>
                              <span className="text-sm font-medium">{selectedSubscriber.requestType || 'Back in Stock'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Exported to CSV:</span>
                              <span className="text-sm font-medium">{selectedSubscriber.exportedToCSV ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-green-600" />
                      Product Information
                    </h4>
                    
                    <div className="bg-green-50 rounded-lg p-5">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <ProductImage subscriber={selectedSubscriber} width={160} height={160} className="w-40 h-40" />
                        
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 text-lg mb-2">{selectedSubscriber.productName}</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Product SKU</p>
                              <div className="flex items-center gap-2">
                                <Tag size={14} className="text-gray-400" />
                                <p className="font-mono font-medium text-gray-900">{selectedSubscriber.productSKU}</p>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Category</p>
                              <p className="font-medium text-gray-900">{selectedSubscriber.category || 'Uncategorized'}</p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Product ID</p>
                              <p className="font-mono text-sm text-gray-900 truncate">
                                {selectedSubscriber.productId?._id || selectedSubscriber.productId}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Product Image URL</p>
                            <div className="flex items-center gap-2">
                              <ImageIcon size={14} className="text-gray-400" />
                              <p className="text-sm text-gray-900 truncate">
                                {getProductImageUrl(selectedSubscriber) || "No image available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 -mb-6 p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={copyDetailsToClipboard}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <Copy size={18} />
                        Copy Details
                      </button>
                      
                      <button
                        onClick={() => {
                          updateSubscriberStatus(selectedSubscriber._id, "notified");
                          setShowDetailModal(false);
                        }}
                        disabled={selectedSubscriber.status === "notified"}
                        className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                          selectedSubscriber.status === "notified"
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        <CheckCircle size={18} />
                        {selectedSubscriber.status === "notified" ? "Already Notified" : "Mark as Notified"}
                      </button>
                      
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={18} />
                        Close Details
                      </button>
                    </div>
                    
                    {selectedSubscriber.status === "pending" && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <Info size={16} className="text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800">
                            This subscriber hasn't been notified yet. Click "Mark as Notified" to send them an email.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Modal */}
          {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Send Restock Notification</h3>
                    <button onClick={() => setShowNotificationModal(false)}>
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Send size={16} />
                      <span className="font-medium">You are about to notify {selectedRows.length} subscriber(s)</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">They will receive an email that the product is back in stock.</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (Optional)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Add a custom message to include in the notification..."
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default message: "Great news! The product you were waiting for is back in stock."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowNotificationModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      onClick={confirmSendNotification}
                    >
                      <Send size={18} />
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductRestockWaitlist;