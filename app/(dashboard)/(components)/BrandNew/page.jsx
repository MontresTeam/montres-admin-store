"use client"
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSync, FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';

const BrandNew = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    brand: '',
    isBrandNew: true // Flag to identify brand new products
  });

  // API Base URL
  const API_BASE = 'https://api.montres.ae/api';

  // Fetch products from API

const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${API_BASE}/products`);
    
    console.log('API Response:', response); // Debug log
    
    // Handle different response structures
    let data = response.data;
    
    // If data is nested in a property (common in APIs)
    if (data && data.products) {
      data = data.products;
    }
    
    // If data is still not an array, default to empty array
    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', typeof data, data);
      data = [];
    }
    
    console.log('Processed data:', data); // Debug log
    
    setProducts(data);
    setFilteredProducts(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Fallback to empty array
    setProducts([]);
    setFilteredProducts([]);
  } finally {
    setLoading(false);
  }
};
  // Add new product
  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          isBrandNew: true,
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const newProduct = await response.json();
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Toggle brand new status
  const toggleBrandNewStatus = async (productId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBrandNew: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      const updatedProduct = await response.json();
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      image: product.images?.[0] || product.image || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      isBrandNew: product.isBrandNew || false
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product._id !== productId));
        alert('Product deleted successfully');
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      category: '',
      brand: '',
      isBrandNew: true
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = await updateProduct(editingProduct._id, formData);
        setProducts(products.map(product =>
          product._id === editingProduct._id ? updatedProduct : product
        ));
        alert('Product updated successfully');
      } else {
        // Add new product
        const newProduct = await addProduct(formData);
        setProducts([...products, newProduct]);
        alert('Product added successfully');
      }
      setShowAddForm(false);
      setFormData({
        name: '',
        price: '',
        image: '',
        description: '',
        category: '',
        brand: '',
        isBrandNew: true
      });
    } catch (error) {
      alert(`Failed to ${editingProduct ? 'update' : 'add'} product`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleBrandNew = async (productId, currentStatus) => {
    try {
      const updatedProduct = await toggleBrandNewStatus(productId, currentStatus);
      setProducts(products.map(product =>
        product._id === productId ? updatedProduct : product
      ));
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  // Count statistics
  const totalProducts = products.length;
  const brandNewProducts = products.filter(p => p.isBrandNew).length;
  const activeProducts = products.filter(p => p.status !== 'inactive').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand New Products</h1>
          <p className="text-gray-600">Manage featured brand new products</p>
        </div>

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Brand New</h3>
            <p className="text-3xl font-bold text-green-600">{brandNewProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Products</h3>
            <p className="text-3xl font-bold text-purple-600">{activeProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={handleAddNew}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
            >
              <FaPlus className="mr-2" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchProducts}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isBrandNew"
                      checked={formData.isBrandNew}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBrandNew: e.target.checked }))}
                      className="mr-2 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Mark as Brand New Product
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 overflow-hidden"
            >
              {/* Product Image */}
            

<div className="relative h-48 bg-gray-100 flex items-center justify-center">
  <Image
    src={
      // Handle different image data structures
      product.images?.[0]?.url || 
      product.image || 
      product.images?.[0] || 
      '/placeholder-image.jpg'
    }
    alt={product.name}
    width={320}
    height={192}
    className="object-cover w-full h-full"
    onError={(e) => {
      // Fallback if image fails to load
      e.target.src = '/placeholder-image.jpg';
    }}
  />
  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
    product.isBrandNew 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }`}>
    {product.isBrandNew ? 'Brand New' : 'Regular'}
  </div>
</div>
              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price}
                  </span>
                  <div className="text-right">
                    {product.category && (
                      <span className="block text-sm text-gray-500">{product.category}</span>
                    )}
                    {product.brand && (
                      <span className="block text-sm text-gray-500">{product.brand}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 border-t pt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm transition duration-300"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleBrandNew(product._id, product.isBrandNew)}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center text-sm transition duration-300 ${
                      product.isBrandNew
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {product.isBrandNew ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                    {product.isBrandNew ? 'Hide' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm transition duration-300"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No products found' : 'No products available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg inline-flex items-center transition duration-300"
            >
              <FaPlus className="mr-2" />
              Add New Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandNew;