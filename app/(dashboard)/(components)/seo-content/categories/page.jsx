"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorySeoAdmin = () => {
  // State for managing SEO pages
  const [seoPages, setSeoPages] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    seoTitle: '',
    metaDescription: '',
    slug: '',
    pageContent: '',
    isActive: true,
    keywordRank: 0,
    views: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [notification, setNotification] = useState({ message: '', type: '' });

  // API base URL
  const API_URL = 'http://localhost:5000/api/seo-pages';

  // Fetch SEO pages on component mount
  useEffect(() => {
    fetchSeoPages();
  }, []);

  // Fetch all SEO pages
  const fetchSeoPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setSeoPages(response.data);
      setNotification({ message: '', type: '' });
    } catch (error) {
      showNotification('Error fetching SEO pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPage(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing page
        await axios.put(`${API_URL}/${editingId}`, currentPage);
        showNotification('SEO page updated successfully!', 'success');
      } else {
        // Create new page
        await axios.post(API_URL, currentPage);
        showNotification('SEO page created successfully!', 'success');
      }

      resetForm();
      fetchSeoPages();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving page', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit an existing page
  const handleEdit = (page) => {
    setCurrentPage({
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
      slug: page.slug,
      pageContent: page.pageContent,
      isActive: page.isActive,
      keywordRank: page.keywordRank,
      views: page.views
    });
    setEditingId(page._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a page
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SEO page?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      showNotification('SEO page deleted successfully!', 'success');
      fetchSeoPages();
    } catch (error) {
      showNotification('Error deleting page', 'error');
    }
  };

  // Toggle page active status
  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { isActive: !currentStatus });
      showNotification(`Page ${currentStatus ? 'deactivated' : 'activated'}!`, 'success');
      fetchSeoPages();
    } catch (error) {
      showNotification('Error updating status', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentPage({
      seoTitle: '',
      metaDescription: '',
      slug: '',
      pageContent: '',
      isActive: true,
      keywordRank: 0,
      views: 0
    });
    setEditingId(null);
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Filter pages based on search and active status
  const filteredPages = seoPages.filter(page => {
    const matchesSearch = page.seoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.metaDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterActive === 'all') return matchesSearch;
    if (filterActive === 'active') return matchesSearch && page.isActive;
    if (filterActive === 'inactive') return matchesSearch && !page.isActive;
    
    return matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: seoPages.length,
    active: seoPages.filter(p => p.isActive).length,
    inactive: seoPages.filter(p => !p.isActive).length,
    totalViews: seoPages.reduce((sum, page) => sum + (page.views || 0), 0),
    avgRank: seoPages.length > 0 
      ? (seoPages.reduce((sum, page) => sum + (page.keywordRank || 0), 0) / seoPages.length).toFixed(1)
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 
          'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Category Pages SEO Manager</h1>
          <p className="text-gray-600 mt-2">Manage SEO metadata and content for category pages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Pages</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Active Pages</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Views</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Avg. Rank</div>
            <div className="text-2xl font-bold text-purple-600">{stats.avgRank}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingId ? 'Edit SEO Page' : 'Create New SEO Page'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SEO Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title *
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={currentPage.seoTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter SEO title (60-70 characters)"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {currentPage.seoTitle.length}/70 characters
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                      /category/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={currentPage.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="page-slug"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description *
                  </label>
                  <textarea
                    name="metaDescription"
                    value={currentPage.metaDescription}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    maxLength="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meta description (max 300 characters)"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {currentPage.metaDescription.length}/300 characters
                  </div>
                </div>

                {/* Page Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Content
                  </label>
                  <textarea
                    name="pageContent"
                    value={currentPage.pageContent}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter HTML/content for the page"
                  />
                </div>

                {/* Keyword Rank */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keyword Rank
                  </label>
                  <input
                    type="number"
                    name="keywordRank"
                    value={currentPage.keywordRank}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">0 = poor, 100 = excellent</div>
                </div>

                {/* Views */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Views
                  </label>
                  <input
                    type="number"
                    name="views"
                    value={currentPage.views}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={currentPage.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (Published)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Page' : 'Create Page'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Search and Filter */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:mr-4">
                    <input
                      type="text"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                    <button
                      onClick={fetchSeoPages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Pages List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Loading pages...</p>
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No SEO pages found. Create your first one!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views/Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPages.map((page) => (
                        <tr key={page._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleActive(page._id, page.isActive)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                page.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {page.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{page.seoTitle}</div>
                              <div className="text-sm text-gray-500">/{page.slug}</div>
                              <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                {page.metaDescription}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {page.views || 0}
                              </div>
                              <div className="flex items-center mt-1">
                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Rank: {page.keywordRank || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(page)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(page._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                              <a
                                href={`/category/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                              >
                                View
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Info */}
              {filteredPages.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredPages.length} of {seoPages.length} pages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySeoAdmin;