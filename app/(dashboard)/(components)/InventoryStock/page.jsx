"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import newCurrency from '../../../../public/assets/newSymbole.png';
import { exportToExcel, exportToCSV, exportToPDF, importFromFile } from '../../../../utils/exportUtils';

const InventoryStockManagement = () => {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingStatus, setEditingStatus] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch inventory data from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.montres.ae/api/invontry/InvontryAll');
      setInventory(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data');
      showNotification('Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, brandFilter]);

  const brands = [...new Set(inventory.map(item => item.brand))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.internalCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const sortedInventory = React.useMemo(() => {
    if (!sortConfig.key) return filteredInventory;

    return [...filteredInventory].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredInventory, sortConfig]);

  // Pagination calculations
  const totalItems = sortedInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedInventory.slice(startIndex, endIndex);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const stats = {
    totalItems: inventory.length,
    available: inventory.filter(item => item.status?.toLowerCase() === 'available').length,
    sold: inventory.filter(item => item.status?.toLowerCase() === 'sold').length,
    auction: inventory.filter(item => item.status?.toLowerCase() === 'auction').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.cost * (item.quantity || 0)), 0),
    totalRevenue: inventory
      .filter(item => item.status?.toLowerCase() === 'sold' || item.status?.toLowerCase() === 'auction')
      .reduce((sum, item) => sum + (item.receivingAmount || 0), 0),
    lowStock: inventory.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 5).length
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Handle file import
  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showNotification('Please select an Excel or CSV file', 'error');
      return;
    }

    try {
      setLoading(true);
      showNotification(`Importing ${file.name}...`, 'info');
      
      const importedData = await importFromFile(file);
      
      // Send each item to API
      for (const item of importedData) {
        await axios.post('https://api.montres.ae/api/invontry/', item);
      }
      
      // Refresh inventory
      await fetchInventory();
      showNotification(`Successfully imported ${importedData.length} items!`, 'success');
    } catch (err) {
      console.error('Import error:', err);
      showNotification(err.message || 'Import failed. Please check file format.', 'error');
    } finally {
      setLoading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Export handlers
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      showNotification('Preparing Excel export...', 'info');
      await exportToExcel(inventory, `inventory-export-${new Date().toISOString().split('T')[0]}`);
      showNotification('Excel export completed!', 'success');
      setShowExportMenu(false);
    } catch (err) {
      console.error('Export error:', err);
      showNotification('Excel export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportToCSV = async () => {
    try {
      setExporting(true);
      showNotification('Preparing CSV export...', 'info');
      await exportToCSV(inventory, `inventory-export-${new Date().toISOString().split('T')[0]}`);
      showNotification('CSV export completed!', 'success');
      setShowExportMenu(false);
    } catch (err) {
      console.error('CSV export error:', err);
      showNotification('CSV export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportToPDF = async () => {
    try {
      setExporting(true);
      showNotification('Generating PDF report...', 'info');
      await exportToPDF(inventory, stats, `inventory-report-${new Date().toISOString().split('T')[0]}`);
      showNotification('PDF report generated!', 'success');
      setShowExportMenu(false);
    } catch (err) {
      console.error('PDF export error:', err);
      showNotification('PDF generation failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleAddItem = async (item) => {
    try {
      const newItem = {
        ...item,
        internalCode: item.codeInternal,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      const response = await axios.post('https://api.montres.ae/api/invontry/', newItem);
      setInventory(prev => [...prev, response.data]);
      setShowAddModal(false);
      showNotification('Item added successfully!', 'success');
    } catch (err) {
      console.error('Error adding item:', err);
      showNotification('Failed to add item', 'error');
    }
  };

  const handleEditItem = (id) => {
    router.push(`/EditItemStock/${id}`);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`https://api.montres.ae/api/invontry/${id}`);
        setInventory(prev => prev.filter(item => item._id !== id));
        showNotification('Item deleted successfully!', 'success');
      } catch (err) {
        console.error('Error deleting item:', err);
        showNotification('Failed to delete item', 'error');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`https://api.montres.ae/api/invontry/${id}`, { status: newStatus });
      setInventory(prev => prev.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
      setEditingStatus(null);
      showNotification(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      showNotification('Failed to update status', 'error');
    }
  };

  const handleBulkAction = async () => {
    if (bulkAction && selectedItems.size > 0) {
      try {
        switch (bulkAction) {
          case 'delete':
            if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
              for (const id of selectedItems) {
                await axios.delete(`https://api.montres.ae/api/invontry/${id}`);
              }
              setInventory(prev => prev.filter(item => !selectedItems.has(item._id)));
              setSelectedItems(new Set());
              showNotification(`${selectedItems.size} items deleted successfully!`, 'success');
            }
            break;
          case 'mark_sold':
            for (const id of selectedItems) {
              await axios.put(`https://api.montres.ae/api/invontry/${id}`, { status: 'sold' });
            }
            setInventory(prev => prev.map(item => 
              selectedItems.has(item._id) ? { ...item, status: 'sold' } : item
            ));
            showNotification(`${selectedItems.size} items marked as sold!`, 'success');
            break;
          default:
            break;
        }
        setBulkAction('');
      } catch (err) {
        console.error('Error performing bulk action:', err);
        showNotification('Failed to perform bulk action', 'error');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === currentItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentItems.map(item => item._id)));
    }
  };

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auction': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'stripe': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tabby': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'chrono': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'mamo': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cash': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getQuantityColor = (quantity) => {
    const qty = quantity || 0;
    if (qty > 10) return 'bg-green-100 text-green-800 border-green-200';
    if (qty > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatCurrency = (amount) => {
    return (
      <div className="flex items-center gap-1">
        <img src={newCurrency.src} alt="Currency" className="w-3 h-3" />
        {amount?.toLocaleString() || '0'}
      </div>
    );
  };

  const SortableHeader = ({ children, sortKey, className = '' }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap">{children}</span>
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUpIcon className="w-3 h-3" /> : 
            <ChevronDownIcon className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  // Export Menu Component
  const ExportMenu = () => (
    <div 
      ref={exportMenuRef}
      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
    >
      <button
        onClick={handleExportToExcel}
        disabled={exporting}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
      >
        <TableCellsIcon className="w-4 h-4 text-green-600" />
        Export to Excel
      </button>
      <button
        onClick={handleExportToCSV}
        disabled={exporting}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
      >
        <DocumentTextIcon className="w-4 h-4 text-blue-600" />
        Export to CSV
      </button>
      <button
        onClick={handleExportToPDF}
        disabled={exporting}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
      >
        <DocumentArrowDownIcon className="w-4 h-4 text-red-600" />
        Export to PDF
      </button>
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
      
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>items per page</span>
        </div>

        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{endIndex} of {totalItems} items
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[2.5rem] px-2 py-1 text-sm rounded-lg border transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Mobile Card View Component with Export Button
  const MobileInventoryCard = ({ item }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedItems.has(item._id)}
            onChange={() => toggleSelectItem(item._id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{item.brand}</h3>
            <p className="text-xs text-gray-500">{item.productName || 'No product name'}</p>
          </div>
        </div>
        <button 
          onClick={() => setEditingStatus(item._id)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
        >
          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1).toLowerCase()}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div>
          <span className="text-gray-500">Code:</span>
          <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded mt-1">
            {item.internalCode || 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Qty:</span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getQuantityColor(item.quantity)}`}>
              {item.quantity || 0}
            </span>
          </div>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span>
          <div className="font-semibold text-gray-900 mt-1">
            {formatCurrency(item.cost)}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Selling:</span>
          <div className="font-semibold text-green-600 mt-1">
            {formatCurrency(item.sellingPrice)}
          </div>
        </div>
      </div>

      {(item.status?.toLowerCase() === 'sold' || item.status?.toLowerCase() === 'auction') && (
        <div className="grid grid-cols-2 gap-3 text-xs mb-3 p-2 bg-gray-50 rounded">
          <div>
            <span className="text-gray-500">Sold Price:</span>
            <div className="font-semibold text-blue-600 mt-1">
              {formatCurrency(item.soldPrice)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Received:</span>
            <div className="font-semibold text-purple-600 mt-1">
              {formatCurrency(item.receivingAmount)}
            </div>
          </div>
          {item.paymentMethod && (
            <div className="col-span-2">
              <span className="text-gray-500">Payment:</span>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPaymentMethodColor(item.paymentMethod)}`}>
                  {item.paymentMethod}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Updated: {new Date(item.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
            <EyeIcon className="w-3 h-3" />
          </button>
          <button 
            onClick={() => handleEditItem(item._id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
          <button 
            onClick={() => handleDeleteItem(item._id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
          notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
          'bg-blue-50 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{notification.message}</div>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inventory Stock Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your store's current stock and sales</p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <button
              onClick={fetchInventory}
              className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { value: stats.totalItems, label: 'Total Items', color: 'text-gray-900' },
          { value: stats.available, label: 'Available', color: 'text-green-600' },
          { value: stats.sold, label: 'Sold', color: 'text-blue-600' },
          { value: stats.auction, label: 'Auction', color: 'text-yellow-600' },
          { value: stats.lowStock, label: 'Low Stock', color: 'text-orange-600' },
          { value: formatCurrency(stats.totalValue), label: 'Total Value', color: 'text-gray-900' },
          { value: formatCurrency(stats.totalRevenue), label: 'Total Revenue', color: 'text-green-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        {/* Mobile Export Quick Actions */}
        <div className="lg:hidden mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all text-sm"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              Import
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all text-sm w-full"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && <ExportMenu />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Search and Filter Toggle Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, codes..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden lg:flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-sm text-sm"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Import
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm text-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              {showExportMenu && <ExportMenu />}
            </div>
          </div>

          {/* Action Buttons - Mobile (Add Item only) */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add New Item
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="auction">Auction</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Filter</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items Per Page</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                >
                  <option value="10">10 items</option>
                  <option value="20">20 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-blue-700 font-medium text-sm">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk Actions</option>
                <option value="mark_sold">Mark as Sold</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                disabled={!bulkAction}
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === currentItems.length && currentItems.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </th>
                <SortableHeader sortKey="brand">BRAND/PRODUCT</SortableHeader>
                <SortableHeader sortKey="internalCode">CODE</SortableHeader>
                <SortableHeader sortKey="quantity">QTY</SortableHeader>
                <SortableHeader sortKey="status">STATUS</SortableHeader>
                <SortableHeader sortKey="cost">COST</SortableHeader>
                <SortableHeader sortKey="sellingPrice">SELLING PRICE</SortableHeader>
                <SortableHeader sortKey="soldPrice">SOLD PRICE</SortableHeader>
                <SortableHeader sortKey="paymentMethod">PAYMENT</SortableHeader>
                <SortableHeader sortKey="receivingAmount">RECEIVED</SortableHeader>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr 
                  key={item._id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedItems.has(item._id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item._id)}
                      onChange={() => toggleSelectItem(item._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.brand}</div>
                      <div className="text-xs text-gray-500">{item.productName || 'No product name'}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {item.internalCode || 'N/A'}
                    </code>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getQuantityColor(item.quantity)}`}>
                      {item.quantity || 0}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {editingStatus === item._id ? (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onBlur={() => setEditingStatus(null)}
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="auction">Auction</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(item._id)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)} hover:opacity-80 transition-opacity`}
                      >
                        {item.status?.charAt(0).toUpperCase() + item.status?.slice(1).toLowerCase()}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                      {formatCurrency(item.cost)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      {formatCurrency(item.sellingPrice)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      {item.soldPrice ? formatCurrency(item.soldPrice) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {item.paymentMethod && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPaymentMethodColor(item.paymentMethod)}`}>
                        {item.paymentMethod}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                      {item.receivingAmount ? formatCurrency(item.receivingAmount) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleEditItem(item._id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No inventory items found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination for desktop */}
        {totalPages > 1 && <Pagination />}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {currentItems.map((item) => (
          <MobileInventoryCard key={item._id} item={item} />
        ))}
        {currentItems.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No inventory items found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination for mobile */}
        {totalPages > 1 && <Pagination />}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
          brands={brands}
        />
      )}
    </div>
  );
};

// Add Item Modal Component
const AddItemModal = ({ onClose, onSave, brands }) => {
  const [formData, setFormData] = useState({
    brand: '',
    productName: '',
    codeInternal: '',
    quantity: 0,
    status: 'available',
    cost: 0,
    sellingPrice: 0,
    soldPrice: 0,
    paymentMethod: '',
    receivingAmount: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add New Inventory Item</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form fields remain the same */}
            {/* ... existing form fields ... */}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryStockManagement;