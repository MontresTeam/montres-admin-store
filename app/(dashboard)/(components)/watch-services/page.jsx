"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Filter, Eye, Edit, Trash2, Phone, Calendar, Watch,
  User, AlertCircle, CheckCircle, Clock, X, Download,
  Image as ImageIcon, ChevronLeft, ChevronRight, MoreVertical,
  RefreshCw, FileText
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const WatchServiceBookings = () => {
  // State for bookings data
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWatchType, setFilterWatchType] = useState('All');

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });

  // Fetch bookings data
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASEURL}/products/getBooking`);
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error connecting to server");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Derived State: Filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = (
        (booking.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.phoneNumber || '').includes(searchTerm)
      );
      const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
      const matchesType = filterWatchType === 'All' || booking.watchType === filterWatchType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchTerm, filterStatus, filterWatchType]);

  // Derived State: Stats
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    inProgress: bookings.filter(b => b.status === 'In Progress').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length
  }), [bookings]);

  // Derived State: Unique Watch Types
  const watchTypes = useMemo(() =>
    ['All', ...new Set(bookings.map(b => b.watchType).filter(Boolean))],
    [bookings]
  );

  // Actions
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Optimistic update
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASEURL}/products/updateBookingStatus/${id}`,
        { status: newStatus }
      );

      if (!response.data.success) throw new Error(response.data.message);

      // Refresh to ensure sync
      fetchBookings();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
      fetchBookings(); // Revert on failure
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      setBookings(prev => prev.filter(b => b._id !== id)); // Optimistic delete

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASEURL}/products/deleteBooking/${id}`
      );

      if (!response.data.success) throw new Error(response.data.message);
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to delete booking');
      fetchBookings();
    }
  };

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
        fetchBookings();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking');
    }
  };

  const handleExport = () => {
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
  };

  // Helper Functions
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Cancelled': return 'destructive';
      default: return 'warning';
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Completed': return "bg-green-100 text-green-700 border-green-200";
      case 'In Progress': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'Cancelled': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Components
  const StatCard = ({ title, count, icon: Icon, colorClass }) => (
    <Card className={`border-l-4 ${colorClass.includes('green') ? 'border-l-green-500' : colorClass.includes('blue') ? 'border-l-blue-500' : colorClass.includes('yellow') ? 'border-l-yellow-500' : colorClass.includes('red') ? 'border-l-red-500' : 'border-l-gray-500'} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{count}</h3>
        </div>
        <div className={`p-2.5 rounded-full ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-20">
      <DashboardBreadcrumb title="Services" text="Watch Bookings" />

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Service Bookings</h2>
            <p className="text-muted-foreground">Manage watch repair and service requests.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Requests" count={stats.total} icon={FileText} colorClass="bg-gray-100 text-gray-700" />
          <StatCard title="Pending" count={stats.pending} icon={Clock} colorClass="bg-yellow-100 text-yellow-700" />
          <StatCard title="In Progress" count={stats.inProgress} icon={RefreshCw} colorClass="bg-blue-100 text-blue-700" />
          <StatCard title="Completed" count={stats.completed} icon={CheckCircle} colorClass="bg-green-100 text-green-700" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customer, phone or product..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterWatchType} onValueChange={setFilterWatchType}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Watch className="w-4 h-4" />
                    <SelectValue placeholder="Watch Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {watchTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="bg-background rounded-xl border shadow-sm min-h-[400px]">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No bookings found</h3>
              <p className="text-muted-foreground max-w-sm mt-1">
                No service requests match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product / Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking._id} className="group">
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {booking.customerName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{booking.customerName}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {booking.countryCode} {booking.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{booking.productName}</p>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="text-[10px] h-5">{booking.watchType}</Badge>
                              <span>• {booking.selectedService}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {formatDate(booking.createdAt)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 pl-5">
                              {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(booking.status)} className={`font-medium border-0 ${getStatusColorClass(booking.status)}`}>
                            {booking.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => { setSelectedBooking(booking); setIsDetailModalOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setEditForm({ status: booking.status || 'Pending', notes: booking.notes || '' }); setIsEditModalOpen(true); }}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBooking(booking._id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List via Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredBookings.map((booking) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={booking._id}
                  >
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                              {booking.customerName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className="font-semibold">{booking.customerName}</h4>
                              <p className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColorClass(booking.status)} border-0`}>
                            {booking.status || 'Pending'}
                          </Badge>
                        </div>

                        <div className="space-y-1 pt-2 border-t text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Product:</span>
                            <span className="font-medium text-right max-w-[200px] truncate">{booking.productName}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{booking.watchType}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">{booking.selectedService}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" className="flex-1" size="sm" onClick={() => { setSelectedBooking(booking); setIsDetailModalOpen(true); }}>
                            View Details
                          </Button>
                          <Button variant="default" size="sm" onClick={() => { setSelectedBooking(booking); setEditForm({ status: booking.status || 'Pending', notes: booking.notes || '' }); setIsEditModalOpen(true); }}>
                            Update
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Reference ID: #{selectedBooking?._id?.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-2">
              {/* Sections */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                      <User className="w-4 h-4" /> Customer Info
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Full Name</p>
                        <p className="font-medium">{selectedBooking.customerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Phone Number</p>
                        <p className="font-medium">{selectedBooking.countryCode} {selectedBooking.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                      <Clock className="w-4 h-4" /> Status
                    </h3>
                    <div className="space-y-2">
                      <Badge className={`${getStatusColorClass(selectedBooking.status)} w-full justify-center py-1`}>
                        {selectedBooking.status || 'Pending'}
                      </Badge>
                      <p className="text-xs text-center text-muted-foreground">
                        Created on {new Date(selectedBooking.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-lg space-y-3 h-full">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                      <Watch className="w-4 h-4" /> Product Details
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Product Name</p>
                        <p className="font-medium">{selectedBooking.productName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-muted-foreground text-xs">Watch Type</p>
                          <p className="font-medium">{selectedBooking.watchType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Year</p>
                          <p className="font-medium">{selectedBooking.manufactureYear || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Service Request</p>
                        <p className="font-medium bg-background border p-2 rounded text-xs">{selectedBooking.selectedService || 'Standard Service'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedBooking.images && selectedBooking.images.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Attached Images</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedBooking.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity border"
                        onClick={() => { setSelectedImageIndex(idx); setIsImageModalOpen(true); }}
                      >
                        <img src={img.url} alt="Watch" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            <Button onClick={() => { setIsDetailModalOpen(false); setIsEditModalOpen(true); }}>Edit Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Booking</DialogTitle>
            <DialogDescription>Change status or add administration notes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select
                value={editForm.status}
                onValueChange={(val) => setEditForm(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                placeholder="Add internal notes about this service..."
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Viewer Modal */}
      {isImageModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 z-50">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsImageModalOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
              <img
                src={selectedBooking.images[selectedImageIndex]?.url}
                alt="Full view"
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              />

              {selectedBooking.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/40 rounded-full h-12 w-12"
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev > 0 ? prev - 1 : selectedBooking.images.length - 1); }}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/40 rounded-full h-12 w-12"
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev < selectedBooking.images.length - 1 ? prev + 1 : 0); }}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="h-24 bg-black/50 flex items-center justify-center gap-2 p-2 overflow-x-auto">
            {selectedBooking.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchServiceBookings;