"use client";
import React, { useState, useEffect } from "react";
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
  BarChart3,
  Calendar,
  ChevronDown,
  Eye,
  Trash2,
  Send,
  X,
  RefreshCw,
  Loader,
  ExternalLink,
  Package,
  MailCheck,
} from "lucide-react";

const BackInStockSubscribers = () => {
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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    expired: 0,
  });

  // API endpoint
  const API_URL = "https://api.montres.ae/api/products/restock/subscribers";

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status", icon: <Users size={16} /> },
    {
      value: "pending",
      label: "Pending",
      icon: <Clock size={16} />,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "notified",
      label: "Notified",
      icon: <CheckCircle size={16} />,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "expired",
      label: "Expired",
      icon: <AlertCircle size={16} />,
      color: "bg-red-100 text-red-800",
    },
  ];

  // Fetch subscribers from API
  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);

      if (response.data.success) {
        // Transform API data to match our format
        const transformedData = response.data.subscribers.map((subscriber) => ({
          id: subscriber._id,
          email: subscriber.email,
          product: subscriber.productName,
          productId: subscriber.productId,
          date: new Date(subscriber.createdAt).toISOString().split("T")[0],
          status: subscriber.status,
          notified: subscriber.notified,
          category: subscriber.category,
          createdAt: subscriber.createdAt,
          rawData: subscriber, // Keep original data
        }));

        setSubscribers(transformedData);
        calculateStats(transformedData);
      } else {
        setError("Failed to fetch subscribers");
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError(
        `Error: ${err.message}. Please check if the server is running at ${API_URL}`
      );
    
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

// 

  // Filter subscribers based on search term, status, and category
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.productId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || subscriber.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" || subscriber.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories from subscribers
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
      setSelectedRows(filteredSubscribers.map((subscriber) => subscriber.id));
    }
  };

  // Handle status change
  const updateSubscriberStatus = async (id, newStatus) => {
    try {
      // In a real app, you would make an API call here
      // For now, update locally
      setSubscribers(
        subscribers.map((subscriber) =>
          subscriber.id === id
            ? {
                ...subscriber,
                status: newStatus,
                notified: newStatus === "notified",
              }
            : subscriber
        )
      );

      // Recalculate stats
      calculateStats(
        subscribers.map((subscriber) =>
          subscriber.id === id
            ? {
                ...subscriber,
                status: newStatus,
                notified: newStatus === "notified",
              }
            : subscriber
        )
      );

      alert(`Status updated to ${newStatus} for subscriber ${id}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // Handle delete
  const deleteSubscriber = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      try {
        // In a real app, you would make an API DELETE call here
        // For now, update locally
        setSubscribers(
          subscribers.filter((subscriber) => subscriber.id !== id)
        );
        setSelectedRows(selectedRows.filter((rowId) => rowId !== id));

        // Recalculate stats
        calculateStats(
          subscribers.filter((subscriber) => subscriber.id !== id)
        );

        alert("Subscriber deleted successfully");
      } catch (err) {
        console.error("Error deleting subscriber:", err);
        alert("Failed to delete subscriber");
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.length} subscriber(s)?`
      )
    ) {
      try {
        // In a real app, you would make an API call here
        setSubscribers(
          subscribers.filter(
            (subscriber) => !selectedRows.includes(subscriber.id)
          )
        );
        setSelectedRows([]);

        // Recalculate stats
        calculateStats(
          subscribers.filter(
            (subscriber) => !selectedRows.includes(subscriber.id)
          )
        );

        alert(`${selectedRows.length} subscriber(s) deleted successfully`);
      } catch (err) {
        console.error("Error deleting subscribers:", err);
        alert("Failed to delete subscribers");
      }
    }
  };

  // Handle send notification
  const handleSendNotification = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one subscriber to notify");
      return;
    }

    setShowNotificationModal(true);
  };

  // Handle confirm notification
  const confirmSendNotification = async () => {
    try {
      // In a real app, this would send an API request
      // For now, simulate API call
      setSubscribers(
        subscribers.map((subscriber) =>
          selectedRows.includes(subscriber.id)
            ? { ...subscriber, status: "notified", notified: true }
            : subscriber
        )
      );

      // Recalculate stats
      calculateStats(
        subscribers.map((subscriber) =>
          selectedRows.includes(subscriber.id)
            ? { ...subscriber, status: "notified", notified: true }
            : subscriber
        )
      );

      alert(`Notification sent to ${selectedRows.length} subscriber(s)!`);

      setSelectedRows([]);
      setNotificationMessage("");
      setShowNotificationModal(false);
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Failed to send notification");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusOption?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="flex items-center gap-1">
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
    });
  };

  // Calculate days since creation
  const getDaysSince = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Back-in-Stock Subscribers
            </h1>
            <p className="text-gray-600 mt-2">
              Manage customers waiting for products to be back in stock
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <div className="text-sm text-gray-500">
              API:{" "}
              <span
                className={`font-mono ${
                  error ? "text-red-500" : "text-green-500"
                }`}
              >
                {error ? "Disconnected" : "Connected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader
              className="animate-spin mx-auto mb-4 text-blue-600"
              size={48}
            />
            <p className="text-gray-600">Loading subscribers data...</p>
            <p className="text-gray-500 text-sm mt-2">
              Fetching from {API_URL}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-700 text-sm mt-1">
                Showing demo data. Make sure your server is running at
                http://localhost:9000
              </p>
            </div>
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
                  <p className="text-gray-500 text-sm">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-green-600">
                  +{stats.notified} notified
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Notifications</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {stats.pending}
                  </p>
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
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.notified}
                  </p>
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
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.expired}
                  </p>
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
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search subscribers by email, product or ID..."
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
                  {showFilters ? (
                    <ChevronDown className="rotate-180" size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={() => {
                    // Export functionality
                    const dataStr = JSON.stringify(subscribers, null, 2);
                    const dataUri =
                      "data:application/json;charset=utf-8," +
                      encodeURIComponent(dataStr);
                    const exportFileDefaultName =
                      "back-in-stock-subscribers.json";

                    const linkElement = document.createElement("a");
                    linkElement.setAttribute("href", dataUri);
                    linkElement.setAttribute("download", exportFileDefaultName);
                    linkElement.click();
                  }}
                >
                  <Download size={18} />
                  Export JSON
                </button>

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
                  {/* Status Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
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

                  {/* Category Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getUniqueCategories().map((category) => (
                        <button
                          key={category}
                          className={`px-3 py-2 rounded-lg ${
                            selectedCategory === category.toLowerCase()
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                          onClick={() =>
                            setSelectedCategory(
                              category === "All"
                                ? "all"
                                : category.toLowerCase()
                            )
                          }
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

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={
                          selectedRows.length === filteredSubscribers.length &&
                          filteredSubscribers.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscriber
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Users size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg">No subscribers found</p>
                          <p className="text-gray-500">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedRows.includes(subscriber.id)}
                            onChange={() => toggleRowSelection(subscriber.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Mail className="text-blue-600" size={18} />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] md:max-w-none">
                                {subscriber.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Package size={12} />
                                {subscriber.productId}
                              </div>
                            </div>
                          </div>
                          {/* Mobile view: Product info */}
                          <div className="md:hidden mt-2">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {subscriber.product}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscriber.category} •{" "}
                              {formatDate(subscriber.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {subscriber.product}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscriber.category}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {formatDate(subscriber.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {getDaysSince(subscriber.createdAt)} days ago
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(subscriber.status)}
                          {subscriber.notified && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <MailCheck size={12} />
                              Notified
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1"
                              onClick={() =>
                                updateSubscriberStatus(
                                  subscriber.id,
                                  "notified"
                                )
                              }
                              title="Mark as notified"
                              disabled={subscriber.status === "notified"}
                            >
                              <CheckCircle
                                size={18}
                                className={
                                  subscriber.status === "notified"
                                    ? "opacity-50"
                                    : ""
                                }
                              />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1"
                              onClick={() => {
                                // Show subscriber details
                                alert(`
Subscriber Details:
Email: ${subscriber.email}
Product: ${subscriber.product}
Product ID: ${subscriber.productId}
Category: ${subscriber.category}
Status: ${subscriber.status}
Date: ${formatDate(subscriber.createdAt)}
Notified: ${subscriber.notified ? "Yes" : "No"}
                                `);
                              }}
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1"
                              onClick={() => deleteSubscriber(subscriber.id)}
                              title="Delete subscriber"
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
                Showing{" "}
                <span className="font-medium">
                  {filteredSubscribers.length}
                </span>{" "}
                of <span className="font-medium">{subscribers.length}</span>{" "}
                subscribers
                {searchTerm && (
                  <span className="ml-2 text-blue-600">
                    (Search: "{searchTerm}")
                  </span>
                )}
              </div>

              {/* Mobile actions */}
              <div className="md:hidden mt-3">
                <div className="flex flex-wrap gap-2">
                  {selectedRows.length > 0 && (
                    <>
                      <button
                        className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded text-sm"
                        onClick={handleSendNotification}
                      >
                        Notify ({selectedRows.length})
                      </button>
                      <button
                        className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded text-sm"
                        onClick={handleBulkDelete}
                      >
                        Delete ({selectedRows.length})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <button
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 hidden sm:inline-block">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 hidden md:inline-block">
                  3
                </button>
                <button
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Notification Modal */}
          {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Send Back-in-Stock Notification
                    </h3>
                    <button onClick={() => setShowNotificationModal(false)}>
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Send size={16} />
                      <span className="font-medium">
                        You are about to notify {selectedRows.length}{" "}
                        subscriber(s)
                      </span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      They will receive an email that the product is back in
                      stock.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Add a custom message to include in the notification..."
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default message: "Great news! The product you were waiting
                      for is back in stock."
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

export default BackInStockSubscribers;
