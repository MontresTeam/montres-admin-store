"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Search, 
  Edit, 
  Save, 
  Trash2, 
  Eye, 
  Plus,
  BarChart,
  Globe,
  Calendar,
  CheckCircle,
  Loader2,
  X,
  Menu
} from 'lucide-react'

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

  // Fetch all pages on component mount
  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/Allpages`);

      console.log("API response:", response);

      if (response.status === 200 && Array.isArray(response.data?.data)) {
        setPages(
          response.data.data.map(page => ({
            ...page,
            _id: page._id, // MongoDB uses _id
            id: page._id, // Create id alias for easier use
            pageTitle: page.pageTitle || "",
            seoTitle: page.seoTitle || "",
            metaDescription: page.metaDescription || "",
            slug: page.slug || "",
            isActive: page.isActive !== undefined ? page.isActive : true,
            status: page.isActive ? 'published' : 'draft', // Map isActive to status for UI
            lastEdited: page.updatedAt 
              ? new Date(page.updatedAt).toLocaleDateString()
              : new Date().toISOString().split('T')[0],
            views: '0', // Default value since not in schema
            keywordRank: 0 // Default value since not in schema
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

  // Fetch single page by slug
  const fetchPageBySlug = async (slug) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/${slug}`)
      if (response.data) {
        setSelectedPage(response.data)
      }
    } catch (err) {
      console.error('Error fetching page:', err)
      setError('Failed to load page details.')
    } finally {
      setLoading(false)
    }
  }

  // Add new page
  const handleAddNew = async () => {
    const newPageData = {
      pageTitle: 'New Page',
      seoTitle: 'New Page Title',
      metaDescription: 'New page description',
      slug: '/new-page-' + Date.now(), // Unique slug
      pageContent: '<h1>Welcome to New Page</h1>',
      isActive: false // Default to draft
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/Add`, newPageData)
      if (response.data) {
        // Add the new page to local state
        const newPage = {
          ...response.data,
          _id: response.data._id,
          id: response.data._id,
          pageTitle: response.data.pageTitle,
          status: response.data.isActive ? 'published' : 'draft',
          lastEdited: new Date().toLocaleDateString(),
          views: '0',
          keywordRank: 0
        }
        setPages([...pages, newPage])
        setSelectedPage(newPage)
        setIsEditing(true)
        setEditingData({
          pageTitle: newPage.pageTitle,
          seoTitle: newPage.seoTitle,
          metaDescription: newPage.metaDescription,
          slug: newPage.slug,
          pageContent: newPage.pageContent || '<h1>Welcome to New Page</h1>',
          isActive: newPage.isActive
        })
      }
    } catch (err) {
      console.error('Error adding page:', err)
      setError('Failed to add new page.')
    }
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
      const response = await axios.put(`${API_BASE_URL}/${selectedPage._id}`, updateData)
      if (response.data) {
        const updatedPages = pages.map(p => 
          p._id === selectedPage._id 
            ? { 
                ...p, 
                ...updateData,
                status: updateData.isActive ? 'published' : 'draft',
                lastEdited: new Date().toLocaleDateString()
              }
            : p
        )
        setPages(updatedPages)
        setSelectedPage(updatedPages.find(p => p._id === selectedPage._id))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Error updating page:', err)
      setError('Failed to update page.')
    }
  }

  // Delete page
  const handleDelete = async (_id, slug) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return

    try {
      await axios.delete(`${API_BASE_URL}/${_id}`)
      const updatedPages = pages.filter(page => page._id !== _id)
      setPages(updatedPages)
      if (selectedPage && selectedPage._id === _id) {
        setSelectedPage(null)
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Error deleting page:', err)
      setError('Failed to delete page.')
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
    setShowMobileMenu(false) // Close mobile menu on edit
  }

  // Filter pages based on search and status
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.pageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.seoTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      default: return null
    }
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
  const avgRank = 0 // Since not in schema

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
      {/* Header with Mobile Menu Button */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              All Pages – SEO Content Editor
            </h1>
            <p className="text-gray-600 mt-2">
              Manage SEO titles, meta descriptions, and page content
            </p>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-gray-200"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Mobile Status Filter */}
            <div className="mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Mobile Stats */}
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Total Pages</p>
                <p className="text-xl font-bold text-gray-800">{totalPages}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-xl font-bold text-green-600">{publishedPages}</p>
              </div>
            </div>

            {/* Mobile Pages List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPages.map(page => (
                <div
                  key={page._id || page.id} // Use _id as key
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedPage?._id === page._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedPage(page)
                    setShowMobileMenu(false)
                  }}
                >
                  <div className="font-medium text-gray-800">{page.pageTitle}</div>
                  <div className="text-sm text-gray-500">{page.slug}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(page.status)}`}>
                      {getStatusIcon(page.status)}
                      {page.status?.charAt(0).toUpperCase() + page.status?.slice(1)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(page)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(page._id, page.slug)
                        }}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Pages List */}
        <div className="lg:w-1/2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Pages</p>
                  <p className="text-2xl font-bold text-gray-800">{totalPages}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-2xl font-bold text-green-600">{publishedPages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Rank</p>
                  <p className="text-2xl font-bold text-purple-600">{avgRank}</p>
                </div>
                <BarChart className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 hidden lg:block">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                
                <button
                  onClick={handleAddNew}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span className="hidden sm:inline">Add Page</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pages List */}
          <div className="bg-white rounded-lg shadow overflow-hidden hidden lg:block">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Page Title</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 hidden xl:table-cell">Last Edited</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPages.map((page) => (
                        <tr 
                          key={page._id || page.id} // Use _id as key
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedPage && selectedPage._id === page._id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedPage(page)}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-800 truncate max-w-xs">{page.pageTitle}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{page.slug}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                              {getStatusIcon(page.status)}
                              {page.status?.charAt(0).toUpperCase() + page.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 hidden xl:table-cell">{page.lastEdited}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(page)
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(page._id, page.slug)
                                }}
                                className="p-1 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredPages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No pages found matching your criteria' : 'No pages available'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="lg:w-1/2">
          {selectedPage ? (
            <div className="bg-white rounded-lg shadow p-4 md:p-6 lg:sticky lg:top-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditing ? 'Edit Page' : 'Page Details'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {isEditing ? 'Edit SEO content and details' : 'View and manage page SEO'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(selectedPage)}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Page URL Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page URL
                  </label>
                  <div className="text-gray-800 font-mono text-sm break-all">
                    https://montres.ae/{selectedPage.slug}
                  </div>
                </div>

                {/* SEO Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800">{selectedPage.views}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Views</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800">#{selectedPage.keywordRank || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Rank</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800">{selectedPage.lastEdited}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Last Edited</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">{selectedPage.status}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Status</div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.pageTitle}
                        onChange={(e) => handleEditField('pageTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <div className="text-gray-800 font-medium">{selectedPage.pageTitle}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editingData.seoTitle}
                          onChange={(e) => handleEditField('seoTitle', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          maxLength={60}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {editingData.seoTitle?.length}/60 characters
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-800">{selectedPage.seoTitle}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editingData.metaDescription}
                          onChange={(e) => handleEditField('metaDescription', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          maxLength={300} // Match your schema maxlength
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {editingData.metaDescription?.length}/300 characters
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600">{selectedPage.metaDescription}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Content
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editingData.pageContent}
                        onChange={(e) => handleEditField('pageContent', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      />
                    ) : (
                      <div className="text-gray-600 font-mono text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
                        {selectedPage.pageContent || 'No content available'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingData.slug}
                        onChange={(e) => handleEditField('slug', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <div className="text-gray-800 font-mono text-sm break-all">{selectedPage.slug}</div>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select 
                        value={editingData.isActive ? 'published' : 'draft'}
                        onChange={(e) => handleEditField('isActive', e.target.value === 'published')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SEO Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3">SEO Preview</h3>
                  <div className="space-y-2">
                    <div className="text-blue-800 text-lg font-medium truncate">
                      {isEditing ? editingData.seoTitle : selectedPage.seoTitle}
                    </div>
                    <div className="text-green-700 text-sm break-all">
                      hhttps://www.montres.ae/{isEditing ? editingData.slug : selectedPage.slug}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                      {isEditing ? editingData.metaDescription : selectedPage.metaDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
              <Globe className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-medium text-gray-800 mb-2">No Page Selected</h3>
              <p className="text-gray-600 mb-6">
                Select a page from the list to view and edit SEO content
              </p>
              <button
                onClick={handleAddNew}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create New Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredPages.length} pages
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={handleAddNew}
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page