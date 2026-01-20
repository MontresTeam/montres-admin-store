"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Search,
  Edit,
  Save,
  Trash2,
  Plus,
  Globe,
  CheckCircle,
  Loader2,
  X,
  Menu,
  ChevronRight,
  FileText,
  Link2,
  Type,
  AlignLeft,
  Eye,
  Layout
} from 'lucide-react'
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// API base URL
const API_BASE_URL = 'http://localhost:9000/api/seo-pages'

const Page = () => {
  const [pages, setPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({
    pageTitle: '',
    seoTitle: '',
    metaDescription: '',
    slug: '',
    pageContent: '',
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Toastify notification helper
  const showToast = (message, type = 'success') => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: type === 'success' ? "#10b981" : "#ef4444",
      className: "text-sm font-medium",
      stopOnFocus: true,
    }).showToast();
  }

  // Fetch all pages on component mount
  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/Allpages`);

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        setPages(
          response.data.data.map(page => ({
            ...page,
            _id: page._id,
            id: page._id,
            pageTitle: page.pageTitle || "",
            seoTitle: page.seoTitle || "",
            metaDescription: page.metaDescription || "",
            slug: page.slug || "",
            isActive: page.isActive !== undefined ? page.isActive : true,
            lastEdited: page.updatedAt
              ? new Date(page.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              : new Date().toISOString().split('T')[0],
          }))
        );
      } else {
        setError("Unexpected API response format");
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
      setError("Failed to load pages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new page
  const handleAddNew = async () => {
    const newPage = {
      _id: `new-${Date.now()}`,
      id: `new-${Date.now()}`,
      pageTitle: '',
      seoTitle: '',
      metaDescription: '',
      slug: '',
      pageContent: '',
      isActive: false,
      lastEdited: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    setSelectedPage(newPage)
    setEditingData({
      pageTitle: '',
      seoTitle: '',
      metaDescription: '',
      slug: '',
      pageContent: '',
      isActive: false
    })
    setIsEditing(true)
    setShowMobileMenu(false)
  }

  // Update page
  const handleSave = async () => {
    if (!selectedPage) return

    // Validation
    if (!editingData.pageTitle || !editingData.seoTitle || !editingData.slug) {
      showToast('Please fill in all required fields (Page Title, SEO Title, Slug)', 'error');
      return;
    }

    const updateData = {
      pageTitle: editingData.pageTitle,
      seoTitle: editingData.seoTitle,
      metaDescription: editingData.metaDescription,
      slug: editingData.slug,
      pageContent: editingData.pageContent,
      isActive: editingData.isActive,
      pageType: 'page'
    }

    try {
      let response;
      setLoading(true);

      if (selectedPage._id.startsWith('new-')) {
        response = await axios.post(`${API_BASE_URL}/Add`, updateData)
        if (response.data) {
          const newPage = {
            ...response.data,
            _id: response.data._id,
            id: response.data._id,
            lastEdited: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }
          setPages([...pages, newPage])
          setSelectedPage(newPage)
          setIsEditing(false)
          showToast('Page created successfully!', 'success')
        }
      } else {
        response = await axios.put(`${API_BASE_URL}/${selectedPage._id}`, updateData)
        if (response.data) {
          const updatedPages = pages.map(p =>
            p._id === selectedPage._id
              ? {
                ...p,
                ...updateData,
                lastEdited: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              }
              : p
          )
          setPages(updatedPages)
          setSelectedPage(updatedPages.find(p => p._id === selectedPage._id))
          setIsEditing(false)
          showToast('Page updated successfully!', 'success')
        }
      }
    } catch (err) {
      console.error('Error saving page:', err)
      const errorMsg = err.response?.data?.message || 'Failed to save page';
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false);
    }
  }

  // Delete page
  const handleDelete = async (_id, slug) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/${_id}`)
      const updatedPages = pages.filter(page => page._id !== _id)
      setPages(updatedPages)
      if (selectedPage && selectedPage._id === _id) {
        setSelectedPage(null)
        setIsEditing(false)
      }
      showToast('Page deleted successfully!', 'success')
    } catch (err) {
      console.error('Error deleting page:', err)
      showToast('Failed to delete page', 'error')
    } finally {
      setLoading(false);
    }
  }

  // Handle edit click
  const handleEdit = (page) => {
    setSelectedPage(page)
    setEditingData({
      pageTitle: page.pageTitle || '',
      seoTitle: page.seoTitle || '',
      metaDescription: page.metaDescription || '',
      slug: page.slug || '',
      pageContent: page.pageContent || '',
      isActive: page.isActive !== undefined ? page.isActive : true
    })
    setIsEditing(true)
    setShowMobileMenu(false)
  }

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.pageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.seoTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && page.isActive) ||
      (statusFilter === 'draft' && !page.isActive)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-amber-100 text-amber-700 border border-amber-200'
  }

  const getStatusText = (isActive) => {
    return isActive ? 'Published' : 'Draft'
  }

  const getStatusIcon = (isActive) => {
    return isActive ?
      <CheckCircle className="w-3.5 h-3.5" /> :
      <Edit className="w-3.5 h-3.5" />
  }

  const handleEditField = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate stats
  const totalPages = pages.length
  const publishedPages = pages.filter(p => p.isActive).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 md:p-6 pb-24 md:pb-6">
      {/* Premium Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Globe className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                SEO Content Manager
              </h1>
              <p className="text-gray-600 text-xs md:text-sm mt-0.5">
                Manage all page SEO metadata and content
              </p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2.5 rounded-xl bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-lg"
          >
            {showMobileMenu ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Search Pages</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile Status Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Mobile Add Button */}
            <button
              onClick={() => {
                handleAddNew()
                setShowMobileMenu(false)
              }}
              disabled={loading}
              className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add New Page
            </button>

            {/* Mobile Pages List */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages ({filteredPages.length})</p>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredPages.map(page => (
                  <div
                    key={page._id}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedPage?._id === page._id
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    onClick={() => {
                      setSelectedPage(page)
                      setShowMobileMenu(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{page.pageTitle}</div>
                        <div className="text-xs text-gray-500 truncate mt-1">{page.slug}</div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.isActive)}`}>
                            {getStatusIcon(page.isActive)}
                            {getStatusText(page.isActive)}
                          </span>
                          <div className="text-xs text-gray-400">{page.lastEdited}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}

                {filteredPages.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {searchTerm || statusFilter !== 'all' ? 'No pages found' : 'No pages available'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 md:gap-6">
        {/* Left Panel - Pages List */}
        <div className="lg:w-1/2">
          {/* Premium Stats Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Layout className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalPages}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1">Live</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-600">{publishedPages}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Edit className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 mb-1">Draft</p>
                <p className="text-xl md:text-2xl font-bold text-amber-600">{totalPages - publishedPages}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar - Desktop */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 md:mb-6 shadow-sm hidden lg:block">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search pages by title or SEO title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                <button
                  onClick={handleAddNew}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Page
                </button>
              </div>
            </div>
          </div>

          {/* Pages List - Desktop */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hidden lg:block">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-sm text-gray-500 font-medium">Loading pages...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Page Details</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Edited</th>
                        <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPages.map((page) => (
                        <tr
                          key={page._id}
                          className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedPage && selectedPage._id === page._id ? 'bg-blue-50' : ''
                            }`}
                          onClick={() => setSelectedPage(page)}
                        >
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-semibold text-sm text-gray-900 truncate max-w-xs">{page.pageTitle}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-1">{page.slug}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(page.isActive)}`}>
                              {getStatusIcon(page.isActive)}
                              {getStatusText(page.isActive)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">{page.lastEdited}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(page)
                                }}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`Delete "${page.pageTitle}"?`)) {
                                    handleDelete(page._id, page.slug)
                                  }
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPages.length === 0 && (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      {searchTerm || statusFilter !== 'all' ? 'No pages found matching your criteria' : 'No pages available'}
                    </p>
                    <p className="text-gray-400 text-xs mb-4">Get started by creating your first page</p>
                    <button
                      onClick={handleAddNew}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      + Create your first page
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="lg:w-1/2">
          {selectedPage ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 lg:sticky lg:top-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {isEditing ? (selectedPage._id.startsWith('new-') ? 'Create New Page' : 'Edit Page') : 'Page Details'}
                  </h2>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">
                    {isEditing ? 'Edit SEO content and details' : 'View and manage page SEO'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          if (selectedPage._id.startsWith('new-')) {
                            setSelectedPage(null)
                          }
                        }}
                        className="px-3 md:px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 md:px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 flex items-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {selectedPage._id.startsWith('new-') ? 'Create' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(selectedPage)}
                      className="px-3 md:px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {/* Form Fields with Icons */}
                <div className="space-y-5">

                  {/* Page Title Field - ADDED */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Page Title <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.pageTitle}
                        onChange={(e) => handleEditField('pageTitle', e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter page title (e.g., About Us)"
                        required
                      />
                    ) : (
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg font-medium border border-gray-100">{selectedPage.pageTitle || 'No page title'}</div>
                    )}
                  </div>

                  {/* SEO Title Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Type className="w-4 h-4 text-gray-500" />
                      SEO Title <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingData.seoTitle}
                          onChange={(e) => handleEditField('seoTitle', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter SEO title (max 60 characters)"
                          maxLength={60}
                          required
                        />
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-xs text-gray-500">Optimal: 50-60 characters</span>
                          <span className={`text-xs font-medium ${editingData.seoTitle?.length > 60 ? 'text-red-600' : 'text-gray-600'}`}>
                            {editingData.seoTitle?.length || 0}/60
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-100">{selectedPage.seoTitle || 'No SEO title'}</div>
                    )}
                  </div>

                  {/* Meta Description Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <AlignLeft className="w-4 h-4 text-gray-500" />
                      Meta Description <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editingData.metaDescription}
                          onChange={(e) => handleEditField('metaDescription', e.target.value)}
                          rows={3}
                          className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                          placeholder="Enter meta description (max 300 characters)"
                          maxLength={300}
                          required
                        />
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-xs text-gray-500">Optimal: 150-160 characters (Max: 300)</span>
                          <span className={`text-xs font-medium ${editingData.metaDescription?.length > 160 ? 'text-orange-500' : 'text-gray-600'}`}>
                            {editingData.metaDescription?.length || 0}/300
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap border border-gray-100">{selectedPage.metaDescription || 'No meta description'}</div>
                    )}
                  </div>

                  {/* Slug Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Link2 className="w-4 h-4 text-gray-500" />
                      Slug <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingData.slug}
                          onChange={(e) => handleEditField('slug', e.target.value)}
                          className="w-full text-sm font-mono border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter slug (e.g., /about-us)"
                          required
                        />
                        <div className="text-xs text-emerald-700 mt-1.5 bg-emerald-50 p-2 rounded border border-emerald-200">
                          <span className="font-medium">Preview:</span> https://montres.ae{editingData.slug ? (editingData.slug.startsWith('/') ? editingData.slug : `/${editingData.slug}`) : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-900 font-mono p-3 bg-gray-50 rounded-lg break-all border border-gray-100">{selectedPage.slug || 'No slug'}</div>
                        <div className="text-xs text-gray-500 mt-1.5">
                          https://montres.ae{selectedPage.slug ? (selectedPage.slug.startsWith('/') ? selectedPage.slug : `/${selectedPage.slug}`) : ''}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Content Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Page Content
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editingData.pageContent}
                          onChange={(e) => handleEditField('pageContent', e.target.value)}
                          rows={8}
                          className="w-full text-sm font-mono border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y transition-all"
                          placeholder="Enter content (HTML tags supported, e.g. <p>Content</p>)"
                        />
                        <p className="text-xs text-gray-400 mt-1">Supports HTML tags (p, h1-h6, ul, li, etc.)</p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 font-sans bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto max-h-96 overflow-y-auto prose prose-sm max-w-none">
                        {selectedPage.pageContent ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedPage.pageContent }} />
                        ) : (
                          <span className="text-gray-400 italic">No content available</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Field */}
                  {isEditing && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        Publication Status
                      </label>
                      <select
                        value={editingData.isActive ? 'published' : 'draft'}
                        onChange={(e) => handleEditField('isActive', e.target.value === 'published')}
                        className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="draft">Draft (Not visible to public)</option>
                        <option value="published">Published (Live on website)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SEO Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Google Search Preview</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="text-blue-700 text-base font-medium truncate hover:underline cursor-pointer">
                      {isEditing ? (editingData.seoTitle || 'SEO Title Preview') : (selectedPage.seoTitle || 'No SEO title')}
                    </div>
                    <div className="text-emerald-700 text-sm break-all">
                      https://www.montres.ae{isEditing ? (editingData.slug ? (editingData.slug.startsWith('/') ? editingData.slug : `/${editingData.slug}`) : '/page-slug') : (selectedPage.slug ? (selectedPage.slug.startsWith('/') ? selectedPage.slug : `/${selectedPage.slug}`) : '/page-slug')}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {isEditing ? (editingData.metaDescription || 'Meta description preview will appear here...') : (selectedPage.metaDescription || 'No meta description')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 md:p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Globe className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No Page Selected</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Select a page from the list to view and edit SEO content, or create a new page to get started.
                </p>
                <button
                  onClick={handleAddNew}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Create New Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-2xl z-40">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-medium">Selected Page</div>
            <div className="text-sm font-semibold text-gray-900 truncate">
              {selectedPage?.pageTitle || 'No page selected'}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPage && !isEditing && (
              <>
                <button
                  onClick={() => handleEdit(selectedPage)}
                  className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${selectedPage.pageTitle}"?`)) {
                      handleDelete(selectedPage._id, selectedPage.slug)
                    }
                  }}
                  className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page