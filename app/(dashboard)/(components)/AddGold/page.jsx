"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import DashboardBreadcrumb from '../../../../components/layout/dashboard-breadcrumb';
import newcurrencysymbol from '../../../../public/assets/newSymbole.png';

const Page = () => {
  // Static data options
  const mainCategoryOptions = [
    'Gold Bars',
    'Gold Coins'
  ];

  const subCategoryOptions = {
    'Gold Bars': [
      '1g Gold Bar',
      '5g Gold Bar', 
      '10g Gold Bar',
      '20g Gold Bar',
      '50g Gold Bar',
      '100g Gold Bar',
      '1oz Gold Bar',
      '250g Gold Bar',
      '500g Gold Bar',
      '1kg Gold Bar'
    ],
    'Gold Coins': [
      '1g Gold Coin',
      '2.5g Gold Coin',
      '5g Gold Coin',
      '8g Gold Coin',
      '10g Gold Coin',
      '20g Gold Coin',
      '1oz Gold Coin',
      '50g Gold Coin',
      '100g Gold Coin',
      'Commemorative Coins',
      'Bullion Coins',
      'Collector Coins'
    ]
  };

  const conditionOptions = [
    'New',
    'Pre-owned',
    'Mint Condition',
    'Excellent',
    'Very Good',
    'Good',
    'Fair'
  ];

  const itemConditionOptions = [
    'Grade A+',
    'Grade A',
    'Grade B+', 
    'Grade B',
    'Grade C',
    'Uncirculated',
    'Brilliant Uncirculated',
    'Proof Quality'
  ];

  const purityOptions = [
    '24K',
    '22K', 
    '21K',
    '18K',
    '14K',
    '10K'
  ];

  const weightOptions = [
    '1g',
    '2.5g',
    '5g',
    '8g',
    '10g',
    '20g',
    '50g',
    '100g',
    '1oz',
    '250g',
    '500g',
    '1kg',
    'Custom weight'
  ];

  const certificationOptions = [
    'LBMA',
    'DMCC Certified',
    'ISO Certified',
    'Hallmark Certified',
    'None',
    'Others'
  ];

  const originOptions = [
    'Switzerland',
    'UAE',
    'USA',
    'Canada',
    'Australia',
    'UK',
    'Germany',
    'South Africa',
    'China',
    'India',
    'Singapore',
    'Others'
  ];

  const colorOptions = [
    'Yellow Gold',
    'White Gold',
    'Rose Gold',
    'Green Gold',
    'Black Gold'
  ];

  const taxStatusOptions = [
    { value: 'taxable', label: 'Taxable' },
    { value: 'non-taxable', label: 'Non-Taxable' },
    { value: 'vat_exempt', label: 'VAT Exempt' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Core Product Info
    mainCategory: '',
    subCategory: '',
    brand: '',
    model: '',
    additionalTitle: '',
    productName: '',
    condition: '',
    itemCondition: '',
    description: '',

    // Pricing & Inventory
    retailPrice: '',
    sellingPrice: '',
    stockQuantity: 1,
    pricePerGram: '',
    taxStatus: 'taxable',
    sku: '',
    referenceNumber: '',

    // Gold Specifications
    purity: '',
    weight: '',
    customWeight: '',
    certification: '',
    origin: '',
    color: '',

    // SEO Fields
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',

    // System / Auto Fields
    uploadDate: new Date().toISOString().split('T')[0],
    createdBy: '',
    updatedDate: new Date().toISOString()
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (name === 'mainImage' && files.length > 0) {
        const file = files[0];
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
      } else if (name === 'coverImage' && files.length > 0) {
        const file = files[0];
        setCoverImage(file);
        setCoverImagePreview(URL.createObjectURL(file));
      } else if (name === 'galleryImages' && files.length > 0) {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        
        // Limit to 15 images maximum
        const totalFiles = [...galleryImages, ...newFiles];
        const totalPreviews = [...galleryImagePreviews, ...newPreviews];
        
        if (totalFiles.length <= 15) {
          setGalleryImages(totalFiles);
          setGalleryImagePreviews(totalPreviews);
        } else {
          setError('Maximum 15 gallery images allowed');
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

      if (galleryImages.length < 5 || galleryImages.length > 15) {
        throw new Error('Please upload between 5 and 15 gallery images');
      }

      if (!formData.mainCategory || !formData.productName || !formData.purity) {
        throw new Error('Main Category, Product Name, and Purity are required fields');
      }

      // Prepare form data for submission
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Append images
      submitData.append('mainImage', mainImage);
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }
      galleryImages.forEach((image) => {
        submitData.append(`galleryImages`, image);
      });

      // Here you would typically send to your API
      console.log('Form data:', formData);
      console.log('Main image:', mainImage);
      console.log('Cover image:', coverImage);
      console.log('Gallery images:', galleryImages);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Gold product added successfully!');
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
  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  // Remove gallery image
  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      window.history.back();
    }
  };

  // Get available subcategories based on selected main category
  const availableSubCategories = formData.mainCategory ? subCategoryOptions[formData.mainCategory] || [] : [];

  // Check if custom weight input should be shown
  const showCustomWeight = formData.weight === 'Custom weight';

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <DashboardBreadcrumb text="Add new product to your store" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add Gold (Gold Products Items)
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Add a new gold product to your inventory with detailed specifications and pricing
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
            {/* Core Product Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Core Product Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Basic gold product details and categorization
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

                {/* Product Name - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter product name"
                    required
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
                    placeholder="e.g., Limited Edition, Collector's Item"
                  />
                </div>

                {/* Condition - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Condition - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Item Condition
                  </label>
                  <select
                    name="itemCondition"
                    value={formData.itemCondition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Item Condition</option>
                    {itemConditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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

            {/* Gold Specifications Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Gold Specifications
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed gold specifications and characteristics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Purity - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Purity <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="purity"
                    value={formData.purity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Purity</option>
                    {purityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Weight</option>
                    {weightOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Weight - Conditional */}
                {showCustomWeight && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Weight (grams)
                    </label>
                    <input
                      type="number"
                      name="customWeight"
                      value={formData.customWeight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter weight in grams"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {/* Certification - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Certification
                  </label>
                  <select
                    name="certification"
                    value={formData.certification}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Certification</option>
                    {certificationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origin - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Origin
                  </label>
                  <select
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Origin</option>
                    {originOptions.map((option) => (
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
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  Pricing & Inventory
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Price details, market pricing, and stock management
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Price Per Gram - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price Per Gram
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
                      name="pricePerGram"
                      value={formData.pricePerGram}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Market price per gram"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Real-time market-linked price</p>
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
                    placeholder="Unique identifier"
                  />
                </div>

                {/* Reference Number - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Internal catalog number"
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
                  Product images - main image is required, 5-15 gallery images
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
                            Primary display image for the product
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Cover Image Upload - Optional */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Image (Optional)
                  </label>
                  {coverImagePreview ? (
                    <div className="relative inline-block">
                      <div className="w-48 h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                        <Image
                          src={coverImagePreview}
                          alt="Cover image"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeCoverImage}
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
                        name="coverImage"
                        onChange={handleChange}
                        className="hidden"
                        id="coverImage"
                        accept="image/*"
                      />
                      <label htmlFor="coverImage" className="cursor-pointer">
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
                            Upload Cover Image
                          </span>
                          <p className="text-xs text-gray-500">
                            Banner or featured image (optional)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Gallery Images Upload - Required (5-15) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Gallery Images (5-15 required)
                  </label>

                  {/* Gallery Image Previews */}
                  {galleryImagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {galleryImagePreviews.length} images selected (min: 5, max: 15)
                        </p>
                        {galleryImagePreviews.length < 5 && (
                          <p className="text-sm text-red-600 font-medium">
                            Please add {5 - galleryImagePreviews.length} more images
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                              <Image
                                src={preview}
                                alt={`Gallery image ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
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

                  {/* Gallery Images File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <input
                      type="file"
                      name="galleryImages"
                      onChange={handleChange}
                      multiple
                      className="hidden"
                      id="galleryImages"
                      accept="image/*"
                    />
                    <label htmlFor="galleryImages" className="cursor-pointer">
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
                            Click to upload gallery images
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
                        {galleryImagePreviews.length > 0 && (
                          <p
                            className={`text-sm font-medium ${
                              galleryImagePreviews.length >= 5 &&
                              galleryImagePreviews.length <= 15
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {galleryImagePreviews.length} gallery image(s) selected
                            {galleryImagePreviews.length < 5 &&
                              ` - Need ${5 - galleryImagePreviews.length} more`}
                            {galleryImagePreviews.length > 15 &&
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
                    placeholder="Comma-separated keywords (e.g., gold bars, investment gold, bullion)"
                  />
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </div>

            {/* System Fields Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  System Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Auto-generated system fields
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Date - Auto */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Date
                  </label>
                  <input
                    type="text"
                    value={formData.uploadDate}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-500">Auto-generated</p>
                </div>

                {/* Created By - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Created By
                  </label>
                  <input
                    type="text"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="User/admin name"
                  />
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
                  galleryImages.length < 5 || 
                  galleryImages.length > 15 ||
                  !formData.mainCategory ||
                  !formData.productName ||
                  !formData.purity
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading || 
                  !mainImage || 
                  galleryImages.length < 5 || 
                  galleryImages.length > 15 ||
                  !formData.mainCategory ||
                  !formData.productName ||
                  !formData.purity
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
                      Adding Gold Product...
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
                      Add New Gold Product
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