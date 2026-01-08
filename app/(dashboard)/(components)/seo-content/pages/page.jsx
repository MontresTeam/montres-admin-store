"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Search, 
  Edit, 
  Save, 
  Trash2, 
  Plus,
  BarChart,
  Globe,
  CheckCircle,
  Loader2,
  X,
  Menu,
  ChevronRight
} from 'lucide-react'
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// API base URL
const API_BASE_URL = 'https://api.montres.ae/api/seo-pages'

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
    // Directly go to edit mode with empty form
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

    const updateData = {
      pageTitle: editingData.pageTitle,
      seoTitle: editingData.seoTitle,
      metaDescription: editingData.metaDescription,
      slug: editingData.slug,
      pageContent: editingData.pageContent,
      isActive: editingData.isActive
    }

    try {
      let response;
      
      // Check if it's a new page or existing page
      if (selectedPage._id.startsWith('new-')) {
        // Create new page
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
        // Update existing page
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
      showToast('Failed to save page', 'error')
    }
  }

  // Delete page
  const handleDelete = async (_id, slug) => {
    // Show custom confirmation instead of browser alert
       {
      try {
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
      }
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

  // Filter pages based on search and status
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
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
      {/* Header with Mobile Menu Button */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              All Pages – SEO Content Editor
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage SEO titles, meta descriptions, and page content
            </p>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Mobile Status Filter */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add New Page
            </button>

            {/* Mobile Pages List */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pages ({filteredPages.length})</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPages.map(page => (
                  <div
                    key={page._id}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedPage?._id === page._id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedPage(page)
                      setShowMobileMenu(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{page.pageTitle}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{page.slug}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.isActive)}`}>
                            {getStatusIcon(page.isActive)}
                            {getStatusText(page.isActive)}
                          </span>
                          <div className="text-xs text-gray-400">{page.lastEdited}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    </div>
                  </div>
                ))}
                
                {filteredPages.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    {searchTerm || statusFilter !== 'all' ? 'No pages found' : 'No pages available'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Pages List */}
        <div className="lg:w-1/2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Pages</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{totalPages}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500 opacity-80" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Published</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{publishedPages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Draft</p>
                  <p className="text-xl font-bold text-yellow-600 mt-1">{totalPages - publishedPages}</p>
                </div>
                <Edit className="w-8 h-8 text-yellow-500 opacity-80" />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 hidden lg:block">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search pages by title or SEO title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white pr-8"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                
                <button
                  onClick={handleAddNew}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Page
                </button>
              </div>
            </div>
          </div>

          {/* Pages List - Desktop */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hidden lg:block">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-sm text-gray-500">Loading pages...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Page Details</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Edited</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPages.map((page) => (
                        <tr 
                          key={page._id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedPage && selectedPage._id === page._id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedPage(page)}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-sm text-gray-900 truncate max-w-xs">{page.pageTitle}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{page.slug}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(page.isActive)}`}>
                              {getStatusIcon(page.isActive)}
                              {getStatusText(page.isActive)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">{page.lastEdited}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(page)
                                }}
                                className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(page._id, page.slug)
                                }}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-500 hover:text-red-700"
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
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {searchTerm || statusFilter !== 'all' ? 'No pages found matching your criteria' : 'No pages available'}
                    </p>
                    <button
                      onClick={handleAddNew}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 lg:sticky lg:top-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {isEditing ? (selectedPage._id.startsWith('new-') ? 'Create New Page' : 'Edit Page') : 'Page Details'}
                  </h2>
                  <p className="text-gray-600 text-xs md:text-sm mt-0.5">
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
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {selectedPage._id.startsWith('new-') ? 'Create' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(selectedPage)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {/* Form Fields */}
                <div className="space-y-4">
                  

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      SEO Title *
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingData.seoTitle}
                          onChange={(e) => handleEditField('seoTitle', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Enter SEO title (max 60 characters)"
                          maxLength={60}
                          required
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {editingData.seoTitle?.length || 0}/60 characters
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded-lg">{selectedPage.seoTitle || 'No SEO title'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Meta Description *
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editingData.metaDescription}
                          onChange={(e) => handleEditField('metaDescription', e.target.value)}
                          rows={3}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                          placeholder="Enter meta description (max 300 characters)"
                          maxLength={300}
                          required
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {editingData.metaDescription?.length || 0}/300 characters
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedPage.metaDescription || 'No meta description'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Page Content
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editingData.pageContent}
                        onChange={(e) => handleEditField('pageContent', e.target.value)}
                        rows={4}
                        className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Enter content for the page"
                      />
                    ) : (
                      <div className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto max-h-60 overflow-y-auto">
                        {selectedPage.pageContent || 'No content available'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Slug *
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingData.slug}
                          onChange={(e) => handleEditField('slug', e.target.value)}
                          className="w-full text-sm font-mono border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Enter slug (e.g., /about-us)"
                          required
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Full URL: https://montres.ae{editingData.slug ? (editingData.slug.startsWith('/') ? editingData.slug : `/${editingData.slug}`) : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-900 font-mono p-2 bg-gray-50 rounded-lg break-all">{selectedPage.slug || 'No slug'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Full URL: https://montres.ae{selectedPage.slug ? (selectedPage.slug.startsWith('/') ? selectedPage.slug : `/${selectedPage.slug}`) : ''}
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select 
                        value={editingData.isActive ? 'published' : 'draft'}
                        onChange={(e) => handleEditField('isActive', e.target.value === 'published')}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SEO Preview */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wider">SEO Preview</h3>
                  <div className="space-y-1.5">
                    <div className="text-blue-800 text-sm font-medium truncate">
                      {isEditing ? (editingData.seoTitle || 'SEO Title Preview') : (selectedPage.seoTitle || 'No SEO title')}
                    </div>
                    <div className="text-green-700 text-xs break-all">
                      https://www.montres.ae{isEditing ? (editingData.slug ? (editingData.slug.startsWith('/') ? editingData.slug : `/${editingData.slug}`) : '/page-slug') : (selectedPage.slug ? (selectedPage.slug.startsWith('/') ? selectedPage.slug : `/${selectedPage.slug}`) : '/page-slug')}
                    </div>
                    <div className="text-gray-600 text-xs line-clamp-2">
                      {isEditing ? (editingData.metaDescription || 'Meta description preview will appear here...') : (selectedPage.metaDescription || 'No meta description')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 text-center">
              <Globe className="w-12 h-12 md:w-14 md:h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Page Selected</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                Select a page from the list to view and edit SEO content, or create a new page to get started.
              </p>
              <button
                onClick={handleAddNew}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Create New Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-40">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Selected</div>
            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {selectedPage?.pageTitle || 'No page'}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPage && !isEditing && (
              <>
                <button
                  onClick={() => handleEdit(selectedPage)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(selectedPage._id, selectedPage.slug)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="p-3 bg-blue-600 text-white rounded-full shadow-lg disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page