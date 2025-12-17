"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";

const ContactMessage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper function to determine if message is new (within last 24 hours)
  const isNewMessage = (createdAt) => {
    const messageDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours < 24;
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get("https://api.montres.ae/api/contact/");
      console.log(response,"response");
      
      const result = response.data;

      if (result.success) {
        const messagesWithStatus = result.data.map((msg) => ({
          ...msg,
          status: isNewMessage(msg.createdAt) ? "new" : "read",
        }));
        setMessages(messagesWithStatus);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      read: { color: "bg-gray-100 text-gray-800", label: "Read" },
      replied: { color: "bg-green-100 text-green-800", label: "Replied" },
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCountryName = (countryCode) => {
    const countryMap = {
      SA: "Saudi Arabia",
      US: "United States",
      CA: "Canada",
      UK: "United Kingdom",
      AE: "United Arab Emirates",
      IN: "India",
    };
    return countryMap[countryCode] || countryCode;
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center w-full max-w-sm">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Error Loading Messages</h3>
            <p className="mb-4 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Messages</h1>
                <p className="mt-1 text-sm text-gray-600">Customer inquiries</p>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Actions Menu */}
            {isMenuOpen && (
              <div className="sm:hidden bg-white rounded-lg shadow-lg p-4 space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Messages:</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {filteredMessages.length} of {messages.length}
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Messages
                </button>
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-3 py-1 rounded-full">
                {filteredMessages.length} of {messages.length} messages
              </span>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:space-x-3 gap-2 sm:gap-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === "all" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("new")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === "new" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
              >
                New
              </button>
              <button
                onClick={() => setStatusFilter("read")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === "read" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
              >
                Read
              </button>
              <button
                onClick={() => setStatusFilter("replied")}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === "replied" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
              >
                Replied
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg._id} 
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{msg.fullName}</div>
                        <div className="text-sm text-gray-500">{msg.email}</div>
                        <div className="text-sm text-gray-500">{msg.phone}</div>
                        <div className="text-xs text-gray-400 mt-1">{getCountryName(msg.country)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{msg.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {msg.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {msg.attachment ? (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(msg.createdAt)}</div>
                      <div className="mt-1">{getStatusBadge(msg.status)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(msg);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        className="text-green-600 hover:text-green-900"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Reply
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards - Enhanced for better mobile experience */}
        <div className="lg:hidden">
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 active:bg-gray-50 active:border-blue-200 transition-colors duration-150"
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{msg.fullName}</h3>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{msg.email}</p>
                  </div>
                </div>
                
                {/* Subject with icon */}
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 line-clamp-2">{msg.subject}</span>
                  </div>
                </div>

                {/* Message preview */}
                <div className="mb-3">
                  <p className="text-xs text-gray-700 line-clamp-2 pl-6">{msg.message}</p>
                </div>

                {/* Quick info row */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{msg.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{getCountryName(msg.country)}</span>
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {msg.attachment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(msg.attachment, '_blank');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMessage(msg);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                    >
                      View
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try changing your search or filters" 
                : "No contact messages have been received yet"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Message Detail Modal - Enhanced for mobile */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div 
              className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Swipe indicator for mobile */}
              <div className="sm:hidden pt-3 pb-1">
                <div className="mx-auto w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Message Details</h2>
                    <p className="text-sm text-gray-600 mt-1">From: {selectedMessage.fullName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Contact info cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Email</label>
                      <p className="mt-1 text-sm text-gray-900 truncate">{selectedMessage.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 truncate">{selectedMessage.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Country</label>
                      <p className="mt-1 text-sm text-gray-900 truncate">{getCountryName(selectedMessage.country)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Date</label>
                      <p className="mt-1 text-sm text-gray-900 truncate">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Attachment */}
                  {selectedMessage.attachment && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Attachment</label>
                      <a
                        href={selectedMessage.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}

                  {/* Actions - Fixed to bottom on mobile */}
                  <div className="sticky sm:static bottom-0 bg-white pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="text-xs text-gray-500">
                        Received: {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="order-2 sm:order-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Close
                        </button>
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="order-1 sm:order-2 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessage;