"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import React, { useState } from "react";
import { addProduct } from "@/service/productService";
import Image from "next/image";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import newCurrency from "../../../../public/assets/newSymbole.png";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    // Basic Info - Required: brand, model, category, watchType
    brand: "",
    model: "",
    referenceNumber: "",
    sku: "",
    serialNumber: "",
    additionalTitle: "",
    watchType: "",
    watchStyle: "",
    scopeOfDelivery: "",
    includedAccessories: "",
    category: "",

    // Item Features
    productionYear: "",
    approximateYear: false,
    unknownYear: false,
    gender: "Men/Unisex",
    movement: "",
    dialColor: "",
    caseMaterial: "",
    strapMaterial: "",

    // Additional Info
    strapColor: "",
    strapSize: "",
    caseSize: "",
    caseColor: "",
    crystal: "",
    bezelMaterial: "",
    dialNumerals: "",
    caliber: "",
    powerReserve: "",
    jewels: "",

    // Functions
    functions: [],

    // Condition
    condition: "",
    itemCondition: "",
    replacementParts: [],

    // Pricing & Inventory - regularPrice is optional
    regularPrice: "",
    salePrice: "",
    taxStatus: "taxable",
    stockQuantity: "",

    // Category & Classification
    collection: "None",

    // Description & Meta
    description: "",
    visibility: "visible",

    // Tags
    tags: "",

    // SEO Fields
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Options data
  const scopeOfDeliveryOptions = [
    "Full Set (Watch + Original Box + Original Papers)",
    "Watch with Original Papers",
    "Watch with Original Box",
    "Watch with Montres Safe Box",
    "Watch Only"
  ];

  const watchStyles = [
    "luxury watch",
    "Classic watch",
    "Sports watch",
    "Vintage watch",
    "Dress watch",
    "Drivers watch",
    "pilot watch",
    "Racing watch"
  ];

  const watchTypes = [
    "Wrist Watch",
    "Pocket Watch", 
    "Clocks",
    "Stopwatch",
    "Smart Watch",
  ];

  const categoryOptions = [
    "Watch",
    "Jewellery",
    "Gold",
    "Accessories",
    "Home Accessories",
    "Personal Accessories",
    "Pens",
  ];

  const includedAccessoriesOptions = [
    "Extra Strap",
    "Original Strap", 
    "Warranty Card",
    "Certificate",
    "Travel Case",
    "Bezel Protector",
    "Cleaning Cloth",
    "Other Accessories"
  ];

  const genders = ["Men/Unisex", "Women"];

  const movements = [
    "Automatic",
    "Quartz",
    "Manual",
    "Solar",
    "Kinetic",
    "Mechanical",
  ];

  const colors = [
    "Black",
    "White",
    "Silver",
    "Gold",
    "Rose Gold",
    "Blue",
    "Green",
    "Red",
    "Brown",
    "Gray",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
    "Champagne",
    "Gold/Silver",
  ];

  const materials = [
    "Stainless Steel",
    "Gold/Steel",
    "Gold",
    "Steel",
    "Rose Gold",
    "Platinum",
    "Titanium",
    "Ceramic",
    "Carbon Fiber",
    "Brass",
    "Bronze",
    "Aluminum",
  ];

  const strapMaterials = [
  "Alligator",
  "Canvas",
  "Crocodile",
  "Fabric",
  "Gold",
  "Gold/Steel",
  "Leather",
  "Metal Bracelet",
  "Nylon",
  "Rubber",
  "Silicone",
  "Suede",
  "Steel",
  "18k White Gold"
  ];

  const crystals = ["Sapphire", "Mineral", "Acrylic", "Hardlex", "Plexiglass"];

  const bezelMaterials = [
  "Aluminum",
  "Ceramic",
  "Gold",
  "18k Yellow Gold",
  "Gold Plated",
  "Rubber",
  "Stainless Steel",
  "Titanium",
  "Tungsten"
  ];

  const DIALNUMERALS = [
    "Arabic Numerals",
    "Roman Numerals",
    "No Numerals",
    "Lines",
    "Gemstone",
    "Dot/round marker"
  ];

  const itemConditions = [
    "Excellent",
    "Good", 
    "Fair",
    "Poor / Not Working / For Parts"
  ];

  const conditions = [
    "Brand New",
    "Unworn / Like New",
    "Pre-Owned",
    "Excellent",
    "Not Working / For Parts"
  ];

  const taxStatusOptions = [
    { value: "taxable", label: "Taxable" },
    { value: "shipping", label: "Shipping" },
    { value: "none", label: "None" },
  ];

  // Functions from the images
  const functionCategories = {
    "Functions Set 1": [
      "Search",
      "Our suggestion",
      "Date Suggestion",
      "Moon phase",
      "Minute repeater",
      "Chronograph",
      "Double chronograph",
      "Flyback",
      "Panorama date",
      "Chiming clock",
      "Repeater",
      "Tourbillon",
      "Weekday",
      "Month",
      "Year",
      "Annual calendar",
      "4-year calendar",
      "Perpetual calendar",
    ],
    "Functions Set 2": [
      "Continuous hands",
      "Tempered blue hands",
      "Genevian Seal",
      "Chronometer",
      "Power Reserve Display",
      "Rotating Bezel",
      "Limited Edition",
      "Crown Left",
      "Screw-Down Crown",
      "Helium Valve",
      "Quick Set",
      "Screw-Down Push-Buttons",
      "Only Original Parts",
      "Luminous indices",
      "PVD/DLC coating",
      "World time watch",
      "Master Chronometer",
      "Smartwatch",
    ],
    "Functions Set 3": ["Solar watch", "One-hand watches", "Vintage"],
    "Functions Set 4": [
      "Alarm",
      "GMT",
      "Equation of time",
      "Jumping hour",
      "Tachymeter",
    ],
  };

  const replacementParts = [
    "Dial",
    "Crown",
    "Clasp",
    "Leather strap",
    "Bezel",
    "Hands",
    "Pusher",
    "Crystal",
    "Coating",
    "Diamond finishing",
    "Metal bracelet",
    "Case back",
    "Movement replacement parts",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "approximateYear" || name === "unknownYear") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
          ...(name === "unknownYear" && checked && { productionYear: "" })
        }));
      } else if (name === "functions") {
        setFormData((prev) => ({
          ...prev,
          functions: checked
            ? [...prev.functions, value]
            : prev.functions.filter((item) => item !== value),
        }));
      } else if (name === "replacementParts") {
        setFormData((prev) => ({
          ...prev,
          replacementParts: checked
            ? [...prev.replacementParts, value]
            : prev.replacementParts.filter((item) => item !== value),
        }));
      }
    } else if (name === "mainImage" && files && files.length > 0) {
      const file = files[0];
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    } else if (name === "coverImages" && files && files.length > 0) {
      const newImages = Array.from(files);
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));

      setCoverImages((prev) => [...prev, ...newImages]);
      setCoverImagePreviews((prev) => [...prev, ...newPreviewUrls]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const removeMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImage(null);
    setMainImagePreview("");
  };

  const removeCoverImage = (index) => {
    URL.revokeObjectURL(coverImagePreviews[index]);

    const newImages = coverImages.filter((_, i) => i !== index);
    const newPreviews = coverImagePreviews.filter((_, i) => i !== index);

    setCoverImages(newImages);
    setCoverImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields based on schema
    if (!formData.brand.trim() || !formData.model.trim() || !formData.category.trim() || !formData.watchType.trim()) {
      setError("Brand, Model, Category, and Watch Type are required fields");
      setLoading(false);
      return;
    }

    if (!mainImage) {
      setError("Main image is required");
      setLoading(false);
      return;
    }

    // Validate cover images count (5-10)
    if (coverImages.length < 5 || coverImages.length > 10) {
      setError("Please upload between 5 to 10 additional images");
      setLoading(false);
      return;
    }

    try {
      const productData = new FormData();

      // Append all basic fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        if (value !== "" && value !== null && value !== undefined) {
          // Handle array fields
          if (Array.isArray(value)) {
            value.forEach((item) => productData.append(key, item));
          }
          // Handle numeric fields - regularPrice is optional
          else if (
            [
              "salePrice",
              "stockQuantity",
              "powerReserve",
              "jewels",
              "strapSize",
              "caseSize",
            ].includes(key)
          ) {
            const numValue = parseFloat(value) || 0;
            productData.append(key, numValue.toString());
          }
          // Handle regularPrice separately since it's optional
          else if (key === "regularPrice") {
            if (value !== "") {
              const numValue = parseFloat(value) || 0;
              productData.append(key, numValue.toString());
            }
          }
          // Handle boolean fields
          else if (typeof value === "boolean") {
            productData.append(key, value.toString());
          }
          // Handle all other fields
          else {
            productData.append(key, value);
          }
        }
      });

      // Set default values for required backend fields
      productData.append("published", "true");
      productData.append("featured", "false");
      productData.append("inStock", "true");

      // Handle image uploads
      if (mainImage) {
        productData.append("main", mainImage);
      }

      if (coverImages.length > 0) {
        coverImages.forEach((file) => {
          productData.append("covers", file);
        });
      }

      const response = await addProduct(productData);

      Toastify({
        text: "Product added successfully!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      }).showToast();

      console.log("Product created:", response);
      handleCancel();
    } catch (err) {
      console.error("Error adding product:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add product. Please try again.";
      setError(errorMessage);

      Toastify({
        text: errorMessage,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" },
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clean up all object URLs
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    coverImagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setFormData({
      brand: "",
      model: "",
      referenceNumber: "",
      sku: "",
      serialNumber: "",
      additionalTitle: "",
      watchType: "",
      watchStyle: "",
      scopeOfDelivery: "",
      includedAccessories: "",
      productionYear: "",
      approximateYear: false,
      unknownYear: false,
      gender: "Men/Unisex",
      movement: "",
      dialColor: "",
      caseMaterial: "",
      strapMaterial: "",
      strapColor: "",
      strapSize: "",
      caseSize: "",
      caseColor: "",
      crystal: "",
      bezelMaterial: "",
      dialNumerals: "",
      caliber: "",
      powerReserve: "",
      jewels: "",
      functions: [],
      condition: "",
      itemCondition: "",
      replacementParts: [],
      regularPrice: "",
      salePrice: "",
      taxStatus: "taxable",
      stockQuantity: "",
      category: "",
      collection: "None",
      description: "",
      visibility: "visible",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setMainImage(null);
    setMainImagePreview("");
    setCoverImages([]);
    setCoverImagePreviews([]);
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

                {/* Model - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter model name"
                    required
                  />
                </div>

                {/* Category - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Watch Type - Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Watch Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="watchType"
                    value={formData.watchType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Watch Type</option>
                    {watchTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Reference number"
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

                {/* Serial Number - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Serial number"
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

                {/* Watch Style - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    watchStyle category
                  </label>
                  <select
                    name="watchStyle"
                    value={formData.watchStyle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Watch Style</option>
                    {watchStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scope of Delivery - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Scope of Delivery
                  </label>
                  <select
                    name="scopeOfDelivery"
                    value={formData.scopeOfDelivery}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Scope of Delivery</option>
                    {scopeOfDeliveryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Included Accessories - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Included Accessories
                  </label>
                  <select
                    name="includedAccessories"
                    value={formData.includedAccessories}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Included Accessories</option>
                    {includedAccessoriesOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Item Features Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Item Features
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product specifications and features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Production Year - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year of Production
                  </label>
                  <input
                    type="text"
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

                {/* Approximate Year Checkbox - Optional */}
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

                {/* Unknown Year Checkbox - Optional */}
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

                {/* Gender - Optional (has default) */}
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
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Movement - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Movement
                  </label>
                  <select
                    name="movement"
                    value={formData.movement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Movement</option>
                    {movements.map((movement) => (
                      <option key={movement} value={movement}>
                        {movement}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dial Color - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dial Color
                  </label>
                  <select
                    name="dialColor"
                    value={formData.dialColor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Dial Color</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Case Material - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Case Material
                  </label>
                  <select
                    name="caseMaterial"
                    value={formData.caseMaterial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Case Material</option>
                    {materials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Strap Material - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Strap Material
                  </label>
                  <select
                    name="strapMaterial"
                    value={formData.strapMaterial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select Strap Material</option>
                    {strapMaterials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  Additional Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed specifications and measurements
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Strap Information */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Strap Information
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Strap Color
                    </label>
                    <select
                      name="strapColor"
                      value={formData.strapColor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Color</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Wrist Size (cm)
                    </label>
                    <input
                      type="number"
                      name="strapSize"
                      value={formData.strapSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 20"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Case Information */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Case Information
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Case Size (mm)
                    </label>
                    <input
                      type="number"
                      name="caseSize"
                      value={formData.caseSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 42"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Case Color
                    </label>
                    <select
                      name="caseColor"
                      value={formData.caseColor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Color</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Crystal
                    </label>
                    <select
                      name="crystal"
                      value={formData.crystal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Crystal</option>
                      {crystals.map((crystal) => (
                        <option key={crystal} value={crystal}>
                          {crystal}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bezel Material
                    </label>
                    <select
                      name="bezelMaterial"
                      value={formData.bezelMaterial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Material</option>
                      {bezelMaterials.map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dial Numerals
                    </label>
                    <select
                      name="dialNumerals"
                      value={formData.dialNumerals}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Dial Numerals</option>
                      {DIALNUMERALS.map((numeral) => (
                        <option key={numeral} value={numeral}>
                          {numeral}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Movement Details */}
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Movement Details
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Caliber
                    </label>
                    <input
                      type="text"
                      name="caliber"
                      value={formData.caliber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ETA 2824-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Power Reserve (hours)
                    </label>
                    <input
                      type="number"
                      name="powerReserve"
                      value={formData.powerReserve}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 48"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Jewels
                    </label>
                    <input
                      type="number"
                      name="jewels"
                      value={formData.jewels}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 25"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Functions Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Functions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select all applicable watch functions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(functionCategories).map(
                  ([category, functions]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {functions.map((func) => (
                          <div
                            key={func}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              name="functions"
                              value={func}
                              checked={formData.functions.includes(func)}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm text-gray-700">
                              {func}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Condition Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Condition
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product condition and replacement parts
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
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
                    {itemConditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Replacement Parts - Optional */}
                <div className="space-y-3 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Replacement Parts & Customization
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Please indicate which watch components have been replaced or
                    customized. Replacement parts cannot bear any original
                    manufacturer trademarks or logos.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                    {replacementParts.map((part) => (
                      <div key={part} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="replacementParts"
                          value={part}
                          checked={formData.replacementParts.includes(part)}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700">{part}</label>
                      </div>
                    ))}
                  </div>
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
                {/* Regular Price - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Retail Price
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image
                        src={newCurrency}
                        alt="Currency"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <input
                      type="number"
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Sale Price - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selling Price
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Image
                        src={newCurrency}
                        alt="Currency"
                        unoptimized
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
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
                  Product images - main image is required, 5-10 additional
                  images
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
                          unoptimized
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

                {/* Cover Images Upload - Required (5-10) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Images (5-10 required)
                  </label>

                  {/* Cover Image Previews */}
                  {coverImagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {coverImagePreviews.length} images selected (min: 5,
                          max: 10)
                        </p>
                        {coverImagePreviews.length < 5 && (
                          <p className="text-sm text-red-600 font-medium">
                            Please add {5 - coverImagePreviews.length} more
                            images
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
                                unoptimized
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
                            Upload 5-10 product gallery images
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, WEBP up to 5MB each
                          </p>
                          <p className="text-sm text-gray-500">
                            Multiple files allowed (5-10 required)
                          </p>
                        </div>
                        {coverImagePreviews.length > 0 && (
                          <p
                            className={`text-sm font-medium ${
                              coverImagePreviews.length >= 5 &&
                              coverImagePreviews.length <= 10
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {coverImagePreviews.length} additional image(s)
                            selected
                            {coverImagePreviews.length < 5 &&
                              ` - Need ${5 - coverImagePreviews.length} more`}
                            {coverImagePreviews.length > 10 &&
                              ` - Maximum 10 allowed`}
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
                    placeholder="Comma-separated keywords (e.g., luxury watch, automatic, men's watch)"
                  />
                  <p className="text-xs text-gray-500">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  Description
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Product descriptions and details
                </p>
              </div>

              <div className="space-y-6">
                {/* Full Description - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    placeholder="Detailed product description..."
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  loading || coverImages.length < 5 || coverImages.length > 10
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading || coverImages.length < 5 || coverImages.length > 10
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

export default AddProduct;