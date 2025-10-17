"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import React, { useState } from "react";
import { addProduct } from "@/service/productService";
import Image from "next/image";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    salePrice: "",
    regularPrice: "",
    taxStatus: "",
    stockQuantity: "",
    gender: "",
    categoriesOne: "",
    subcategory: "",
    description: "",
    visibility: "visible",
    tags: "",
    images: {
      main: null,
      covers: []
    },
    brands: "",
    discount: "",
    CaseDiameter: "",
    Movement: "",
    Dial: "",
    WristSize: "",
    Accessories: "",
    Condition: "",
    ProductionYear: ""
  });

  const [imagePreviews, setImagePreviews] = useState({
    main: null,
    covers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      if (name === "mainImage") {
        const file = files[0];
        const previewUrl = URL.createObjectURL(file);
        
        setImagePreviews(prev => ({ ...prev, main: previewUrl }));
        setFormData(prev => ({
          ...prev,
          images: { ...prev.images, main: file }
        }));
      } else if (name === "coverImages") {
        const newImages = Array.from(files);
        const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));

        setImagePreviews(prev => ({
          ...prev,
          covers: [...prev.covers, ...newPreviewUrls]
        }));
        setFormData(prev => ({
          ...prev,
          images: {
            ...prev.images,
            covers: [...prev.images.covers, ...newImages]
          }
        }));
      }
    } else {
      // Handle camelCase field names to match backend
      const fieldName = name === "caseDiameter" ? "CaseDiameter" : 
                       name === "movement" ? "Movement" :
                       name === "dial" ? "Dial" :
                       name === "wristSize" ? "WristSize" :
                       name === "accessories" ? "Accessories" :
                       name === "condition" ? "Condition" :
                       name === "productionYear" ? "ProductionYear" : name;
      
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const removeMainImage = () => {
    if (imagePreviews.main) {
      URL.revokeObjectURL(imagePreviews.main);
    }
    setImagePreviews(prev => ({ ...prev, main: null }));
    setFormData(prev => ({
      ...prev,
      images: { ...prev.images, main: null }
    }));
  };

  const removeCoverImage = (index) => {
    URL.revokeObjectURL(imagePreviews.covers[index]);
    const newPreviews = imagePreviews.covers.filter((_, i) => i !== index);
    const newImages = formData.images.covers.filter((_, i) => i !== index);
    
    setImagePreviews(prev => ({ ...prev, covers: newPreviews }));
    setFormData(prev => ({
      ...prev,
      images: { ...prev.images, covers: newImages }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const productData = new FormData();

      // Append basic fields
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          // Handle images separately
          if (formData.images.main) {
            productData.append("images[main]", formData.images.main);
          }
          if (formData.images.covers.length > 0) {
            formData.images.covers.forEach((file, index) => {
              productData.append(`images[covers][${index}]`, file);
            });
          }
        } else if (
          formData[key] !== "" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          productData.append(key, formData[key]);
        }
      });

      // Convert numeric fields
      if (formData.salePrice)
        productData.set("salePrice", parseFloat(formData.salePrice));
      if (formData.regularPrice)
        productData.set("regularPrice", parseFloat(formData.regularPrice));
      if (formData.stockQuantity)
        productData.set("stockQuantity", parseInt(formData.stockQuantity));
      if (formData.discount)
        productData.set("discount", parseFloat(formData.discount));
      if (formData.CaseDiameter)
        productData.set("CaseDiameter", parseFloat(formData.CaseDiameter));
      if (formData.ProductionYear)
        productData.set("ProductionYear", parseInt(formData.ProductionYear));

      const response = await addProduct(productData);

      Toastify({
        text: "Product added successfully!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();

      console.log("Product created:", response);

      setTimeout(() => {
        handleCancel();
      }, 2000);
    } catch (err) {
      console.error("Error adding product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setLoading(false);
      // Clean up object URLs
      if (imagePreviews.main) URL.revokeObjectURL(imagePreviews.main);
      imagePreviews.covers.forEach(url => URL.revokeObjectURL(url));
    }
  };

  const handleCancel = () => {
    // Clean up all object URLs
    if (imagePreviews.main) URL.revokeObjectURL(imagePreviews.main);
    imagePreviews.covers.forEach(url => URL.revokeObjectURL(url));
    
    setFormData({
      sku: "",
      name: "",
      salePrice: "",
      regularPrice: "",
      taxStatus: "",
      stockQuantity: "",
      gender: "",
      categoriesOne: "",
      subcategory: "",
      description: "",
      visibility: "visible",
      tags: "",
      images: {
        main: null,
        covers: []
      },
      brands: "",
      discount: "",
      CaseDiameter: "",
      Movement: "",
      Dial: "",
      WristSize: "",
      Accessories: "",
      Condition: "",
      ProductionYear: ""
    });
    setImagePreviews({
      main: null,
      covers: []
    });
    setError("");
    setSuccess("");
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
                Add New Product
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Add a new product to your store with details, pricing, and
                inventory information
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
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

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Success:</span>
              <span>{success}</span>
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
                {/* SKU */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="SKU-001"
                    required
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Pricing & Inventory
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Price details and stock management
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Regular Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Regular Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Sale Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sale Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax Status */}
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
                    <option value="">Select Tax Status</option>
                    <option value="taxable">Taxable</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Specifications Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  Product Specifications
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed product specifications and features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Case Diameter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Case Diameter (mm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="caseDiameter"
                      value={formData.CaseDiameter}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="e.g., 42"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      mm
                    </span>
                  </div>
                </div>

                {/* Movement */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Movement Type
                  </label>
                  <select
                    name="movement"
                    value={formData.Movement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Movement</option>
                    <option value="automatic">Automatic</option>
                    <option value="quartz">Quartz</option>
                    <option value="manual">Manual</option>
                    <option value="solar">Solar</option>
                    <option value="kinetic">Kinetic</option>
                  </select>
                </div>

                {/* Dial */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dial Type
                  </label>
                  <input
                    type="text"
                    name="dial"
                    value={formData.Dial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., Black, Blue, Silver"
                  />
                </div>

                {/* Wrist Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wrist Size (inches)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="wristSize"
                      value={formData.WristSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="e.g., 7.5"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      inches
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.Condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="excellent">Excellent</option>
                    <option value="very-good">Very Good</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                {/* Production Year */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Production Year
                  </label>
                  <input
                    type="number"
                    name="productionYear"
                    value={formData.ProductionYear}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., 2023"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Accessories */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Accessories Included
                </label>
                <textarea
                  name="accessories"
                  value={formData.Accessories}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="e.g., Original box, warranty card, extra links, manual..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  List all accessories included with the product
                </p>
              </div>
            </div>

            {/* Category & Classification Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Category & Classification
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product categorization and targeting
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="men">Male</option>
                    <option value="women">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="categoriesOne"
                    value={formData.categoriesOne}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Main category"
                    required
                  />
                </div>

                {/* Subcategory */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Subcategory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brands */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brands"
                    value={formData.brands}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Brand name"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Comma separated tags"
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
                  Product main image and cover images
                </p>
              </div>

              <div className="space-y-8">
                {/* Main Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Image <span className="text-red-500">*</span>
                  </label>
                  
                  {imagePreviews.main ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-green-600">
                        Main Image Preview
                      </label>
                      <div className="flex flex-col items-start gap-4">
                        <div className="relative group">
                          <div className="w-64 h-64 rounded-lg border-2 border-blue-500 overflow-hidden bg-gray-100">
                            <Image
                              src={imagePreviews.main}
                              alt="Main product image"
                              width={256}
                              height={256}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeMainImage}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <svg
                              className="w-4 h-4"
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
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Main Image
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <input
                        type="file"
                        name="mainImage"
                        onChange={handleChange}
                        className="hidden"
                        id="mainImage"
                        accept="image/*"
                        required
                      />
                      <label htmlFor="mainImage" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-3">
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
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Click to upload main image
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              This will be the primary product image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Cover Images */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Images
                  </label>

                  {/* Cover Image Previews */}
                  {imagePreviews.covers.length > 0 && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">
                        Cover Images ({imagePreviews.covers.length} images)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.covers.map((preview, index) => (
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
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Cover Image
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors duration-200">
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
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
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
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Click to upload cover images
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Additional product images for gallery
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 5MB each
                          </p>
                          <p className="text-xs text-gray-500">
                            Multiple files allowed
                          </p>
                        </div>
                        {imagePreviews.covers.length > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            {imagePreviews.covers.length} cover image(s) selected
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  Description
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product descriptions and details
                </p>
              </div>

              <div className="space-y-6">
                {/* Full Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    placeholder="Detailed product description..."
                    rows={6}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
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

export default AddProduct;