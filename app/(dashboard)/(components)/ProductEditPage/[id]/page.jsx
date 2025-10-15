"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useState } from "react";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiDollarSign, FiPackage, FiImage, FiTag } from "react-icons/fi";

const ProductEditPage = () => {
  const [product, setProduct] = useState({
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
    category: "electronics",
    image: "https://via.placeholder.com/300",
    regularPrice: 199.99,
    salePrice: 149.99,
    stock: 25,
    sku: "WBH-2024-001",
    status: "active",
    tags: ["wireless", "bluetooth", "audio"]
  });

  const [newTag, setNewTag] = useState("");
  const [imagePreview, setImagePreview] = useState(product.image);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate image upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setProduct(prev => ({ ...prev, image: e.target.result }));
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !product.tags.includes(newTag.trim())) {
      setProduct(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Product updated:", product);
    alert("Product updated successfully!");
  };

  const handleSaveDraft = () => {
    console.log("Product saved as draft:", product);
    alert("Product saved as draft!");
  };



  return (
    <>
    <DashboardBreadcrumb title="Colors" text="Colors" />
    <div className="min-h-screen  py-8">    
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <FiArrowLeft className="mr-2" />
              Back to Products
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">Update product information and inventory details</p>
            </div>
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSave className="mr-2" />
                Update Product
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={product.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports</option>
                      <option value="books">Books</option>
                    </select>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      value={product.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter SKU"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Regular Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiDollarSign className="inline mr-1" />
                      Regular Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.regularPrice}
                      onChange={(e) => handleInputChange('regularPrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      min="0"
                      required
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiTag className="inline mr-1" />
                      Sale Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.salePrice}
                      onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      min="0"
                    />
                    
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  <FiPackage className="inline mr-2" />
                  Inventory
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter stock quantity"
                    min="0"
                    required
                  />
                  <div className="flex items-center gap-4 mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 20 
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 20 ? 'In Stock' : product.stock > 5 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stock} units available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image & Tags */}
            <div className="space-y-6">
              {/* Image Upload Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  <FiImage className="inline mr-2" />
                  Product Image
                </h2>

                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    {isUploading ? (
                      <div className="py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-48 object-cover rounded-lg mx-auto mb-4"
                        />
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiUpload className="mr-2" />
                          Change Image
                        </label>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Recommended: 800x800px PNG or JPG
                  </p>
                </div>
              </div>

              {/* Tags Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Tags</h2>

                <div className="space-y-4">
                  {/* Add Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Tags List */}
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900 transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Status</h2>

                <select
                  value={product.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Active:</strong> Product is visible to customers<br />
                    <strong>Draft:</strong> Product is hidden from customers<br />
                    <strong>Archived:</strong> Product is no longer available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default ProductEditPage;