"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import DashboardBreadcrumb from '../../../../components/layout/dashboard-breadcrumb';
import newcurrencysymbol from '../../../../public/assets/newSymbole.png';

const Page = () => {
  // Static data options - MATCHING SCHEMA ENUMS
  const mainCategoryOptions = [
    'Hand Bag',
    'Wallet',
    'Card Holder', 
    'Belt',
    'Briefcase',
    'Pounch' // Note: Fixed typo from 'Pouch' to match schema
  ];

  const subCategoryOptions = [
    "Tote Bag",
    "Crossbody Bag",
    "shoulder/crossbody bag", // Note: Added to match schema
    "Shoulder Bag",
    "Clutch",
    "Backpack",
    "Passport Holder",
    "Reversible Belt",
    "Executive Case"
  ];

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
    'Vegan Leather (PU)',
    'Leather', // Added to match schema
    'Fabric' // Added to match schema
  ];

  const interiorMaterialOptions = [
    "Fabric",
    "Canvas",
    "Leather",
    "Suede",
    "Microfiber",
    "Textile",
    "Nylon",
    "Polyester",
    "Felt",
    "Satin",
    "Silk",
    "Cotton",
    "Wool Blend",
    "Alcantara"
  ];

  const colorOptions = [
    'Black', 'black/brown', 'White', 'Silver', 'Gold', 'Rose Gold', 'Brown', 
    'Blue', 'Red', 'Green', 'Purple', 'Pink', 'Yellow', 'Orange', 'Gray', 
    'Multi-color', 'Transparent', 'Metallic', 'Chrome', 'Gunmetal', 'Beige'
  ];

  const hardwareColorOptions = [
    "Gold", "Rose Gold", "Silver", "Platinum", "Chrome", "Gunmetal", 
    "Black Metal", "Brass", "Matte Gold", "Matte Silver", "Ruthenium", 
    "Palladium", "Antique Gold", "Antique Silver"
  ];

  const taxStatusOptions = [
    { value: 'taxable', label: 'Taxable' },
    { value: 'shipping', label: 'Shipping only' }, // Fixed to match schema
    { value: 'none', label: 'None' }
  ];

  const accessoriesAndDeliveryOptions = [
    "Original box",
    "Dust bag",
    "Certificate of authenticity",
    "Care instructions",
    "Warranty card",
    "Gift box",
    "User manual",
    "Extra links",
    "Cleaning cloth",
    "Adjustment tools",
    "Only bag" // Added to match schema
  ];

  const scopeOfDeliveryOptions = [
    "Original packaging",
    "With papers",
    "Without papers",
    "Original box only",
    "Generic packaging",
    "Dust bag", // Added to match schema
    "Only bag" // Added to match schema
  ];

  const conditionOptions = [
    "Brand New",
    "Unworn / Like New", 
    "Pre-Owned",
    "Excellent",
    "Not Working / For Parts"
  ];

  const itemConditionOptions = [
    "Excellent",
    "Good", 
    "Fair",
    "Poor / Not Working / For Parts"
  ];

  const genderOptions = [
    "Men/Unisex",
    "Women"
  ];

  const badgesOptions = [
    "Popular",
    "New Arrivals"
  ];

  // Form state - UPDATED TO MATCH SCHEMA
  const [formData, setFormData] = useState({
    // Basic Information - REQUIRED FIELDS
    MainCategory: '',
    SubCategory: '',
    Brand: '',
    
    // Optional Basic Information
    Model: '',
    modelCode: '',
    additionalTitle: '',
    serialNumber: '',
    sku: '',
    
    // Production Year
    productionYear: '',
    approximateYear: false,
    unknownYear: false,
    
    // Gender
    gender: '',
    
    // Materials
    Material: '',
    interiorMaterial: '',
    Color: '',
    hardwareColor: '',
    
    // Condition
    condition: '',
    itemCondition: '',
    conditionNotes: '',
    
    // Dimensions
    size: {
      width: '',
      height: '',
      depth: ''
    },
    strapLength: '',
    
    // Accessories & Delivery
    accessoriesAndDelivery: [],
    scopeOfDeliveryOptions: [],
    
    // Pricing & Inventory
    taxStatus: 'taxable',
    stockQuantity: 1,
    inStock: true,
    retailPrice: '',
    sellingPrice: '',
    
    // Badges
    badges: [],
    
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    
    // Description
    description: ''
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
          ...(name === 'unknownYear' && checked && { productionYear: '' })
        }));
      } else if (name === 'inStock') {
        setFormData(prev => ({
          ...prev,
          inStock: checked
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
        
        const totalFiles = [...coverImages, ...newFiles];
        const totalPreviews = [...coverImagePreviews, ...newPreviews];
        
        if (totalFiles.length <= 15) {
          setCoverImages(totalFiles);
          setCoverImagePreviews(totalPreviews);
        } else {
          setError('Maximum 15 images allowed');
        }
      }
    } else if (name.startsWith('size.')) {
      // Handle nested size object
      const sizeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        size: {
          ...prev.size,
          [sizeField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle multi-select changes for array fields
  const handleMultiSelectChange = (name, value, isChecked) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      
      if (isChecked) {
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  // Handle form submission with Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation - REQUIRED FIELDS
      if (!mainImage) {
        throw new Error('Main image is required');
      }

      if (coverImages.length < 5 || coverImages.length > 15) {
        throw new Error('Please upload between 5 and 15 additional images');
      }

      if (!formData.MainCategory || !formData.Brand) {
        throw new Error('Main Category and Brand are required fields');
      }

      // Prepare form data for submission
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'productionYear' && formData[key] === '') {
          return;
        }
        
        if (key === 'size') {
          // Handle size object
          Object.keys(formData.size).forEach(sizeKey => {
            if (formData.size[sizeKey]) {
              submitData.append(`size[${sizeKey}]`, formData.size[sizeKey]);
            }
          });
        } else if (Array.isArray(formData[key])) {
          formData[key].forEach(item => {
            submitData.append(key, item);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append images
      submitData.append('mainImage', mainImage);
      coverImages.forEach((image) => {
        submitData.append('coverImages', image);
      });

      // API call with Axios
      const response = await axios.post('https://api.montres.ae/api/leather/Add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        // Show success message
        alert('Leather product added successfully!');
        
        // Reset form
        setFormData({
          MainCategory: '',
          SubCategory: '',
          Brand: '',
          Model: '',
          modelCode: '',
          additionalTitle: '',
          serialNumber: '',
          sku: '',
          productionYear: '',
          approximateYear: false,
          unknownYear: false,
          gender: '',
          Material: '',
          interiorMaterial: '',
          Color: '',
          hardwareColor: '',
          condition: '',
          itemCondition: '',
          conditionNotes: '',
          size: { width: '', height: '', depth: '' },
          strapLength: '',
          accessoriesAndDelivery: [],
          scopeOfDeliveryOptions: [],
          taxStatus: 'taxable',
          stockQuantity: 1,
          inStock: true,
          badges: [],
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          retailPrice: '',
          sellingPrice: '',
          description: ''
        });
        setMainImage(null);
        setMainImagePreview('');
        setCoverImages([]);
        setCoverImagePreviews([]);
      } else {
        throw new Error(response.data?.message || 'Failed to add product');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      
      // Show error toast
      if (typeof window !== 'undefined') {
        const Toastify = require('toastify-js');
        Toastify({
          text: errorMessage,
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
        }).showToast();
      }
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                {/* Main Category - REQUIRED */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="MainCategory"
                    value={formData.MainCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Main Category</option>
                    {mainCategoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Category - REQUIRED */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="SubCategory"
                    value={formData.SubCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Sub Category</option>
                    {subCategoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Brand - REQUIRED */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Brand"
                    value={formData.Brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                {/* Model - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    name="Model"
                    value={formData.Model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter model name"
                  />
                </div>

                {/* Model Code - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Model Code</label>
                  <input
                    type="text"
                    name="modelCode"
                    value={formData.modelCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter model code"
                  />
                </div>

                {/* Additional Title - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Additional Title</label>
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
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Unique code"
                  />
                </div>

                {/* Serial Number - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Product serial number"
                  />
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
                  <label className="block text-sm font-medium text-gray-700">Material</label>
                  <select
                    name="Material"
                    value={formData.Material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Material</option>
                    {materialOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Interior Material - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Interior Material</label>
                  <select
                    name="interiorMaterial"
                    value={formData.interiorMaterial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Interior Material</option>
                    {interiorMaterialOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Color - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <select
                    name="Color"
                    value={formData.Color}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Color</option>
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Hardware Color - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Hardware Color</label>
                  <select
                    name="hardwareColor"
                    value={formData.hardwareColor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Hardware Color</option>
                    {hardwareColorOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Condition - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Item Condition - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Item Condition</label>
                  <select
                    name="itemCondition"
                    value={formData.itemCondition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Item Condition</option>
                    {itemConditionOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Gender - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Strap Length - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Strap Length (cm)</label>
                  <input
                    type="number"
                    name="strapLength"
                    value={formData.strapLength}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Strap length in centimeters"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Size Dimensions */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
                  <input
                    type="number"
                    name="size.width"
                    value={formData.size.width}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Width"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    name="size.height"
                    value={formData.size.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Height"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Depth (cm)</label>
                  <input
                    type="number"
                    name="size.depth"
                    value={formData.size.depth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Depth"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Production Year Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Production Year</label>
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="approximateYear"
                      checked={formData.approximateYear}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Approximate Year</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="unknownYear"
                      checked={formData.unknownYear}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Unknown Year</label>
                  </div>
                </div>
              </div>

              {/* Condition Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Condition Notes</label>
                <textarea
                  name="conditionNotes"
                  value={formData.conditionNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="Additional notes about product condition..."
                  rows={3}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
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

            {/* Accessories & Delivery Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Accessories & Delivery
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Included accessories and delivery scope
                </p>
              </div>

              {/* Accessories and Delivery - Multi-select */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Accessories & Delivery</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accessoriesAndDeliveryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`accessory-${option}`}
                        checked={formData.accessoriesAndDelivery.includes(option)}
                        onChange={(e) => handleMultiSelectChange('accessoriesAndDelivery', option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`accessory-${option}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope of Delivery - Multi-select */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Scope of Delivery</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scopeOfDeliveryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`scope-${option}`}
                        checked={formData.scopeOfDeliveryOptions.includes(option)}
                        onChange={(e) => handleMultiSelectChange('scopeOfDeliveryOptions', option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`scope-${option}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges - Multi-select */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Badges</label>
                <div className="flex flex-wrap gap-4">
                  {badgesOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`badge-${option}`}
                        checked={formData.badges.includes(option)}
                        onChange={(e) => handleMultiSelectChange('badges', option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`badge-${option}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
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
                  Price details and stock management
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Retail Price - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Retail Price</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image src={newcurrencysymbol} alt="Currency" width={16} height={16} className="w-4 h-4" />
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
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image src={newcurrencysymbol} alt="Currency" width={16} height={16} className="w-4 h-4" />
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
                  <label className="block text-sm font-medium text-gray-700">Tax Status</label>
                  <select
                    name="taxStatus"
                    value={formData.taxStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    {taxStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Quantity - Optional (has default) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
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

              {/* In Stock Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">In Stock</label>
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
                {/* Main Image Upload - REQUIRED */}
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
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Upload Main Image</span>
                          <p className="text-xs text-gray-500">This will be the primary product image</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Cover Images Upload - REQUIRED (5-15) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Images (5-15 required)
                  </label>

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
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-lg font-medium text-gray-700">Click to upload additional images</span>
                          <p className="text-sm text-gray-500 mt-2">Upload 5-15 product gallery images</p>
                          <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
                          <p className="text-sm text-gray-500">Multiple files allowed (5-15 required)</p>
                        </div>
                        {coverImagePreviews.length > 0 && (
                          <p className={`text-sm font-medium ${
                            coverImagePreviews.length >= 5 && coverImagePreviews.length <= 15
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                            {coverImagePreviews.length} additional image(s) selected
                            {coverImagePreviews.length < 5 && ` - Need ${5 - coverImagePreviews.length} more`}
                            {coverImagePreviews.length > 15 && ` - Maximum 15 allowed`}
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
                  <label className="block text-sm font-medium text-gray-700">SEO Title</label>
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
                    Recommended: 50-60 characters. Current: {formData.seoTitle.length}
                  </p>
                </div>

                {/* SEO Description - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">SEO Description</label>
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
                    Recommended: 150-160 characters. Current: {formData.seoDescription.length}
                  </p>
                </div>

                {/* SEO Keywords - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
                  <input
                    type="text"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Comma-separated keywords (e.g., leather bag, premium, fashion)"
                  />
                  <p className="text-xs text-gray-500">Separate keywords with commas</p>
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
                  !formData.MainCategory ||
                  !formData.Brand
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading || 
                  !mainImage || 
                  coverImages.length < 5 || 
                  coverImages.length > 15 ||
                  !formData.MainCategory ||
                  !formData.Brand
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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