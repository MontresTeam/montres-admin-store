"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import DashboardBreadcrumb from '../../../../components/layout/dashboard-breadcrumb';
import newcurrencysymbol from '../../../../public/assets/newSymbole.png';

const Page = () => {
  // Static data options
  const mainCategoryOptions = [
    'Hand Bag',
    'Wallet',
    'Card Holder', 
    'Belt',
    'Briefcase',
    'Pouch'
  ];

  const subCategoryOptions = {
    'Hand Bag': ['Tote Bag', 'Crossbody Bag', 'Shoulder Bag', 'Clutch', 'Backpack', 'Hobo Bag', 'Satchel'],
    'Wallet': ['Bifold Wallet', 'Trifold Wallet', 'Cardholder Wallet', 'Money Clip Wallet', 'Travel Wallet'],
    'Card Holder': ['Slim Card Holder', 'Multi-card Holder', 'Card Case', 'Passport Holder'],
    'Belt': ['Dress Belt', 'Casual Belt', 'Reversible Belt', 'Designer Belt'],
    'Briefcase': ['Laptop Briefcase', 'Messenger Bag', 'Attache Case', 'Executive Case'],
    'Pouch': ['Cosmetic Pouch', 'Travel Pouch', 'Document Pouch', 'Electronic Accessories Pouch']
  };

  const materialOptions = [
    'Full-grain leather',
    'Top-grain leather',
    'Genuine leather',
    'Suede',
    'Patent leather',
    'Saffiano leather',
    'Croc-embossed',
    'Pebble leather',
    'Canvas + Leather mix',
    'Vegan Leather (PU)'
  ];

  const colorOptions = [
    'Black', 'Brown', 'Dark Brown', 'Tan', 'Camel', 'Beige', 'Cream', 'White',
    'Grey', 'Navy Blue', 'Blue', 'Dark Green', 'Olive Green', 'Green', 'Burgundy',
    'Maroon', 'Red', 'Pink', 'Baby Pink', 'Purple', 'Orange', 'Yellow', 'Gold',
    'Silver', 'Champagne', 'Bronze', 'Multi-color', 'Others'
  ];

  const availabilityOptions = ['available', 'soldout'];

  const taxStatusOptions = [
    { value: 'taxable', label: 'Taxable' },
    { value: 'shipping_only', label: 'Shipping only' },
    { value: 'none', label: 'None' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    mainCategory: '',
    subCategory: '',
    brand: '',
    model: '',
    additionalTitle: '',
    sku: '',
    availability: 'available',
    
    // Product Details
    material: '',
    color: '',
    description: '',
    
    // Production Year
    productionYear: '',
    approximateYear: false,
    unknownYear: false,
    
    // Pricing
    retailPrice: '',
    sellingPrice: '',
    
    // Inventory
    taxStatus: 'taxable',
    stockQuantity: 1,
    
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    
    // Auto fields
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'approximateYear' || name === 'unknownYear') {
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          // If unknown year is checked, disable production year field
          ...(name === 'unknownYear' && checked && { productionYear: '' })
        }));
      }
    } else if (type === 'file') {
      if (name === 'mainImage' && files.length > 0) {
        const file = files[0];
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
      } else if (name === 'coverImages' && files.length > 0) {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        
        // Limit to 15 images maximum
        const totalFiles = [...coverImages, ...newFiles];
        const totalPreviews = [...coverImagePreviews, ...newPreviews];
        
        if (totalFiles.length <= 15) {
          setCoverImages(totalFiles);
          setCoverImagePreviews(totalPreviews);
        } else {
          setError('Maximum 15 images allowed');
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!mainImage) {
        throw new Error('Main image is required');
      }

      if (coverImages.length < 5 || coverImages.length > 15) {
        throw new Error('Please upload between 5 and 15 additional images');
      }

      if (!formData.brand || !formData.mainCategory) {
        throw new Error('Brand and Main Category are required fields');
      }

      // Prepare form data for submission
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Append images
      submitData.append('mainImage', mainImage);
      coverImages.forEach((image) => {
        submitData.append(`coverImages`, image);
      });

      // Here you would typically send to your API
      console.log('Form data:', formData);
      console.log('Main image:', mainImage);
      console.log('Cover images:', coverImages);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Leather product added successfully!');
      // Reset form or redirect
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove main image
  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview('');
  };

  // Remove cover image
  const removeCoverImage = (index) => {
    setCoverImages(prev => prev.filter((_, i) => i !== index));
    setCoverImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      window.history.back();
    }
  };

  // Get available subcategories based on selected main category
  const availableSubCategories = formData.mainCategory ? subCategoryOptions[formData.mainCategory] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <DashboardBreadcrumb text="Add new product to your store" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add Leather Goods (Premium Leather Products)
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Add a new premium leather product to your store with details, pricing, and inventory information
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Basic Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product identity and core details
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Category - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mainCategory"
                    value={formData.mainCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Main Category</option>
                    {mainCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                    disabled={!formData.mainCategory}
                  >
                    <option value="">Select Sub Category</option>
                    {availableSubCategories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                {/* Model - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter model name"
                  />
                </div>

                {/* Additional Title - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Title
                  </label>
                  <input
                    type="text"
                    name="additionalTitle"
                    value={formData.additionalTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Additional title or description"
                  />
                </div>

                {/* SKU - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Unique code"
                  />
                </div>

                {/* Availability - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Product Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Material, color, and specifications
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Material - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Material
                  </label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Material</option>
                    {materialOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Color</option>
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Production Year Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Production Year - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Production Year
                  </label>
                  <input
                    type="number"
                    name="productionYear"
                    value={formData.productionYear}
                    onChange={handleChange}
                    disabled={formData.unknownYear}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      formData.unknownYear ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder={formData.unknownYear ? "Unknown" : "e.g., 2023"}
                    min="1900"
                    max="2030"
                  />
                </div>

                {/* Year Checkboxes */}
                <div className="flex flex-col gap-3 justify-center">
                  {/* Approximate Year Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="approximateYear"
                      checked={formData.approximateYear}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Approximate Year
                    </label>
                  </div>

                  {/* Unknown Year Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="unknownYear"
                      checked={formData.unknownYear}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Unknown Year
                    </label>
                  </div>
                </div>
              </div>

              {/* Description - Optional */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="Detailed product description..."
                  rows={4}
                />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  Pricing & Inventory
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Price details and stock management
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Retail Price - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Retail Price
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image
                        src={newcurrencysymbol}
                        alt="Currency"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <input
                      type="number"
                      name="retailPrice"
                      value={formData.retailPrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Selling Price - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selling Price
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image
                        src={newcurrencysymbol}
                        alt="Currency"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Tax Status - Optional (has default) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Status
                  </label>
                  <select
                    name="taxStatus"
                    value={formData.taxStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    {taxStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Quantity - Optional (has default) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  Media
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product images - main image is required, 5-15 additional images
                </p>
              </div>

              <div className="space-y-6">
                {/* Main Image Upload - Required */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Image <span className="text-red-500">*</span>
                  </label>
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <div className="w-48 h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                        <Image
                          src={mainImagePreview}
                          alt="Main product image"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 max-w-md">
                      <input
                        type="file"
                        name="mainImage"
                        onChange={handleChange}
                        className="hidden"
                        id="mainImage"
                        accept="image/*"
                      />
                      <label htmlFor="mainImage" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Upload Main Image
                          </span>
                          <p className="text-xs text-gray-500">
                            This will be the primary product image
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Cover Images Upload - Required (5-15) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Images (5-15 required)
                  </label>

                  {/* Cover Image Previews */}
                  {coverImagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {coverImagePreviews.length} images selected (min: 5, max: 15)
                        </p>
                        {coverImagePreviews.length < 5 && (
                          <p className="text-sm text-red-600 font-medium">
                            Please add {5 - coverImagePreviews.length} more images
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                              <Image
                                src={preview}
                                alt={`Cover image ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCoverImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Images File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <input
                      type="file"
                      name="coverImages"
                      onChange={handleChange}
                      multiple
                      className="hidden"
                      id="coverImages"
                      accept="image/*"
                    />
                    <label htmlFor="coverImages" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="text-lg font-medium text-gray-700">
                            Click to upload additional images
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            Upload 5-15 product gallery images
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, WEBP up to 5MB each
                          </p>
                          <p className="text-sm text-gray-500">
                            Multiple files allowed (5-15 required)
                          </p>
                        </div>
                        {coverImagePreviews.length > 0 && (
                          <p
                            className={`text-sm font-medium ${
                              coverImagePreviews.length >= 5 &&
                              coverImagePreviews.length <= 15
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {coverImagePreviews.length} additional image(s) selected
                            {coverImagePreviews.length < 5 &&
                              ` - Need ${5 - coverImagePreviews.length} more`}
                            {coverImagePreviews.length > 15 &&
                              ` - Maximum 15 allowed`}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  SEO Settings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Search engine optimization settings
                </p>
              </div>

              <div className="space-y-6">
                {/* SEO Title - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="SEO title for search engines"
                    maxLength="60"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 50-60 characters. Current:{" "}
                    {formData.seoTitle.length}
                  </p>
                </div>

                {/* SEO Description - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    placeholder="SEO description for search engines"
                    rows="3"
                    maxLength="160"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 150-160 characters. Current:{" "}
                    {formData.seoDescription.length}
                  </p>
                </div>

                {/* SEO Keywords - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Comma-separated keywords (e.g., leather bag, premium, fashion)"
                  />
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  loading || 
                  !mainImage || 
                  coverImages.length < 5 || 
                  coverImages.length > 15 ||
                  !formData.brand ||
                  !formData.mainCategory
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading || 
                  !mainImage || 
                  coverImages.length < 5 || 
                  coverImages.length > 15 ||
                  !formData.brand ||
                  !formData.mainCategory
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add New Product
                    </>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={`px-6 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;