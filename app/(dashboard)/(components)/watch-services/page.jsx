"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Eye, Edit, Trash2, Phone, Calendar, Watch, 
  User, AlertCircle, CheckCircle, Clock, X, Download, 
  Image as ImageIcon, ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import axios from 'axios';

const AdminPanel = () => {
  // State for bookings data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWatchType, setFilterWatchType] = useState('All');
  
  // State for modals and selected booking
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for editing booking
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });

  // Fetch bookings data
  useEffect(() => {
    fetchBookings();
  }, []);

const fetchBookings = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASEURL}/products/getBooking`
    );

    const data = response.data;

    if (data.success) {
      setBookings(data.data);
      setFilteredBookings(data.data);
    } else {
      setError(data.message || "Failed to fetch bookings");
    }
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Error connecting to server");
    console.error("Error fetching bookings:", err);
  } finally {
    setLoading(false);
  }
}, []);

  // Apply filters and search
  useEffect(() => {
    let result = bookings;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(booking =>
        (booking.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.phoneNumber || '').includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      result = result.filter(booking => booking.status === filterStatus);
    }

    // Apply watch type filter
    if (filterWatchType !== 'All') {
      result = result.filter(booking => booking.watchType === filterWatchType);
    }

    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterStatus, filterWatchType, bookings]);

 // Handle status update
const handleStatusUpdate = async (id, newStatus) => {
  try {
    // Make API call to update status
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASEURL}/products/updateBookingStatus/${id}`,
      { status: newStatus }
    );

    if (response.data.success) {
      // Update local state
      const updatedBookings = bookings.map(booking =>
        booking._id === id ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);

      alert(`Status updated to ${newStatus}`);
    } else {
      throw new Error(response.data.message || 'Failed to update status');
    }
  } catch (err) {
    console.error('Error updating status:', err);
    alert(err.response?.data?.message || err.message || 'Failed to update status');
  }
};


  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

// Handle edit submission
const handleEditSubmit = async (e) => {
  e.preventDefault();
  if (!selectedBooking) return;

  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASEURL}/products/updateBooking/${selectedBooking._id}`,
      editForm
    );

    if (response.data.success) {
      setIsEditModalOpen(false);
      alert('Booking updated successfully');
      fetchBookings(); // Refresh data
    } else {
      throw new Error(response.data.message || 'Failed to update booking');
    }
  } catch (err) {
    console.error('Error updating booking:', err);
    alert(err.response?.data?.message || err.message || 'Failed to update booking');
  }
};

// Handle delete booking
const handleDeleteBooking = async (id) => {
  if (!window.confirm('Are you sure you want to delete this booking?')) return;

  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASEURL}/products/deleteBooking/${id}`
    );

    if (response.data.success) {
      const updatedBookings = bookings.filter(booking => booking._id !== id);
      setBookings(updatedBookings);
      alert('Booking deleted successfully');
    } else {
      throw new Error(response.data.message || 'Failed to delete booking');
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
    alert(err.response?.data?.message || err.message || 'Failed to delete booking');
  }
};


  // View booking details
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status || 'Pending',
      notes: booking.notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Open image modal
  const openImageModal = (booking, index = 0) => {
    setSelectedBooking(booking);
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Get unique watch types for filter
  const watchTypes = ['All', ...new Set(bookings.map(b => b.watchType).filter(Boolean))];
  
  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">⌚ Watch Service Bookings</h1>
            <p className="text-gray-600 mt-1">Manage customer service requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Refresh
            </button>
            <button 
              onClick={() => {
                // Export functionality
                const dataStr = JSON.stringify(bookings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bookings-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookings.filter(b => b.status === 'Pending').length}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookings.filter(b => b.status === 'In Progress').length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookings.filter(b => b.status === 'Completed').length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, phone, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
              >
                <option value="All">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <select
              value={filterWatchType}
              onChange={(e) => setFilterWatchType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
            >
              {watchTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Bookings ({filteredBookings.length})
          </h2>
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length}
          </span>
        </div>

        <div className="p-4">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No bookings found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-4">
                {currentBookings.map((booking) => (
                  <div key={booking._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-800">{booking.customerName}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{booking.countryCode} {booking.phoneNumber}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status || 'Pending')}`}>
                        {getStatusIcon(booking.status || 'Pending')}
                        <span>{booking.status || 'Pending'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Watch className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{booking.productName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Year: {booking.manufactureYear || 'N/A'}</span>
                        <span className="mx-1">•</span>
                        <span>Type: {booking.watchType || 'N/A'}</span>
                      </div>
                      <div className="text-gray-600">
                        Service: {booking.selectedService}
                      </div>
                      {booking.images && booking.images.length > 0 && (
                        <div className="pt-2">
                          <div className="flex gap-2">
                            {booking.images.slice(0, 2).map((img, idx) => (
                              <div key={img._id} className="relative">
                                <img
                                  src={img.url}
                                  alt={img.alt || `Image ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-300"
                                />
                                {booking.images.length > 2 && idx === 1 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded text-white text-xs">
                                    +{booking.images.length - 2}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => viewBookingDetails(booking)}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(booking)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Images</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{booking.customerName}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {booking.countryCode} {booking.phoneNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{booking.productName}</div>
                            <div className="text-sm text-gray-500">
                              {booking.watchType || 'N/A'} • {booking.manufactureYear || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-700">{booking.selectedService}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={booking.status || 'Pending'}
                              onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status || 'Pending')} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(booking.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            {booking.images && booking.images.length > 0 ? (
                              <>
                                {booking.images.slice(0, 2).map((img, idx) => (
                                  <button
                                    key={img._id}
                                    onClick={() => openImageModal(booking, idx)}
                                    className="relative group"
                                  >
                                    <img
                                      src={img.url}
                                      alt={img.alt || `Image ${idx + 1}`}
                                      className="w-10 h-10 object-cover rounded border border-gray-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </button>
                                ))}
                                {booking.images.length > 2 && (
                                  <button
                                    onClick={() => openImageModal(booking, 2)}
                                    className="w-10 h-10 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200"
                                  >
                                    +{booking.images.length - 2}
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">No images</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewBookingDetails(booking)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(booking)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {filteredBookings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg min-w-[40px] ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Booking Details</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedBooking.countryCode} {selectedBooking.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Watch className="h-4 w-4" />
                  Product Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="font-medium">{selectedBooking.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manufacture Year</p>
                    <p className="font-medium">{selectedBooking.manufactureYear || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Watch Type</p>
                    <p className="font-medium">{selectedBooking.watchType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Requested</p>
                    <p className="font-medium">{selectedBooking.selectedService}</p>
                  </div>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Status & Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(selectedBooking.status || 'Pending')}`}>
                      {getStatusIcon(selectedBooking.status || 'Pending')}
                      <span className="font-medium">{selectedBooking.status || 'Pending'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedBooking.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {selectedBooking.images && selectedBooking.images.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images ({selectedBooking.images.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedBooking.images.map((image, index) => (
                      <div key={image._id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt || `Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setIsImageModalOpen(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openEditModal(selectedBooking);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Edit Booking
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Edit Booking</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes here..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Update Booking
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedBooking && selectedBooking.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white">
                Image {selectedImageIndex + 1} of {selectedBooking.images.length}
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedBooking.images[selectedImageIndex].url}
                alt={selectedBooking.images[selectedImageIndex].alt || `Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            
            {selectedBooking.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setSelectedImageIndex(prev => Math.max(prev - 1, 0))}
                  disabled={selectedImageIndex === 0}
                  className="p-2 text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="flex gap-2">
                  {selectedBooking.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-3 h-3 rounded-full ${selectedImageIndex === idx ? 'bg-white' : 'bg-gray-500'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setSelectedImageIndex(prev => Math.min(prev + 1, selectedBooking.images.length - 1))}
                  disabled={selectedImageIndex === selectedBooking.images.length - 1}
                  className="p-2 text-white disabled:opacity-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-gray-500">
        <p>Watch Service Booking Admin Panel • {new Date().getFullYear()}</p>
        <p className="text-xs mt-1">Total: {bookings.length} bookings • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </footer>
    </div>
  );
};

export default AdminPanel;