"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

import DashboardBreadcrumb from "../../../../../components/layout/dashboard-breadcrumb";
import newcurrencysymbol from "../../../../../public/assets/newSymbole.png";
import { fetchProduct } from "@/service/productService";

const EditAccessories = () => {
  const { id } = useParams();
  const router = useRouter();

  const [isAllowed, setIsAllowed] = useState(false);
  const [checked, setChecked] = useState(false); // to prevent flash

  useEffect(() => {
    // Get adminData from localStorage
    const adminDataJSON = localStorage.getItem("adminData");
    const adminData = adminDataJSON ? JSON.parse(adminDataJSON) : null;

    // Allowed roles
    const allowedRoles = ["ceo", "sales", "developer"];

    if (!adminData || !allowedRoles.includes(adminData.role)) {
      router.replace("/admin/login"); // redirect unauthorized users
    } else {
      setIsAllowed(true); // user is allowed
    }

    setChecked(true); // check complete
  }, [router]);

  // Static data options
  const categoryOptions = [
    "Writing Instruments",
    "Cufflinks",
    "Bracelets",
    "Keychains & Charms",
    "Travel & Lifestyle",
    "Home Accessories",
    "Sunglasses / Eyewear Accessories",
  ];

  const subCategoryMapping = {
    "Writing Instruments": [
      "Fountain Pens",
      "Ballpoint Pens",
      "Rollerball Pens",
      "Mechanical Pencils",
      "Pen Sets",
    ],
    Cufflinks: ["Metal Cufflinks", "Enamel Cufflinks"],
    Bracelets: [
      "Leather Bracelets",
      "Metal Bracelets",
      "Beaded Bracelets",
      "Chain Bracelets",
      "Charm Bracelets",
    ],
    "Keychains & Charms": [
      "Keychains",
      "Bag Charms",
      "Luggage Tags",
      "Carabiners",
    ],
    "Travel & Lifestyle": [
      "Travel Wallets",
      "Passport Covers",
      "Luggage Straps",
      "Tech Organizers",
      "Portable Ashtrays",
    ],
    "Home Accessories": [
      "Desk Organizers",
      "Bookends",
      "Candle Holders",
      "Decorative Trays",
      "Coasters",
    ],
    "Sunglasses / Eyewear Accessories": [
      "Sunglasses",
      "Eyeglass Chains",
      "Eyeglass Cases",
      "Lens Cleaning Kits",
    ],
  };

  const materialOptions = [
    "Stainless Steel",
    "Leather",
    "Resin",
    "Silver",
    "Gold",
    "Platinum",
    "Titanium",
    "Brass",
    "Copper",
    "Ceramic",
    "Wood",
    "Fabric",
    "Plastic",
    "Crystal",
    "Pearl",
    "Enamel",
  ];

  const colorOptions = [
    "Black",
    "White",
    "Silver",
    "Gold",
    "Rose Gold",
    "Brown",
    "Blue",
    "Red",
    "Green",
    "Purple",
    "Pink",
    "Yellow",
    "Orange",
    "Gray",
    "Multi-color",
    "Transparent",
    "Metallic",
    "Chrome",
    "Gunmetal",
  ];

  const conditionOptions = [
    "Brand New",
    "Unworn / Like New",
    "Pre-Owned",
    "Excellent",
    "Not Working / For Parts",
  ];

  const itemConditionOptions = [
    "Excellent",
    "Good",
    "Fair",
    "Poor / Not Working / For Parts",
  ];

  const genderOptions = ["Men/Unisex", "Women"];

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
  ];

  const scopeOfDeliveryOptions = [
    "Original packaging",
    "With papers",
    "Without papers",
    "Original box only",
    "Generic packaging",
  ];

  const taxStatusOptions = [
    { value: "taxable", label: "Taxable" },
    { value: "shipping", label: "Shipping only" },
    { value: "none", label: "None" },
  ];

  const badgesOptions = ["Popular", "New Arrivals"];

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information - REQUIRED FIELDS
    brand: "",
    model: "",

    // Optional Basic Information
    name: "",
    sku: "",
    referenceNumber: "",
    serialNumber: "",
    additionalTitle: "",

    // Category
    accessoryCategory: "",
    accessorySubCategory: "",
    availableSubCategories: [],

    // Production Year
    productionYear: "",
    approximateYear: false,
    unknownYear: false,

    // Condition
    condition: "",
    itemCondition: "",

    // Gender
    gender: "Men/Unisex",

    // Materials and Colors
    accessoryMaterial: [],
    accessoryColor: [],

    // Accessories & Delivery
    accessoryDelivery: [],
    accessoryScopeOfDelivery: [],

    // Pricing & Inventory
    taxStatus: "taxable",
    stockQuantity: "",
    inStock: true,
    regularPrice: "",
    salePrice: "",

    // Badges
    badges: [],

    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",

    // Description
    description: "",

    // Visibility
    visibility: "visible",
    published: true,
    featured: false,
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [coverImages, setCoverImages] = useState([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch product data on component mount
  const loadProducts = async () => {
    try {
      setFetchLoading(true);

      const { data, error } = await fetchProduct({ id });

      if (!error && data) {
        console.log("Product data:", data);
        const productData = data.product || data;
        console.log("Product data:", productData);

        // Set available subcategories based on category
        const subCats = subCategoryMapping[productData.accessoryCategory] || [];

        // Set form data with fetched product data
        setFormData({
          brand: productData.brand || "",
          model: productData.model || "",
          name: productData.name || "",
          sku: productData.sku || "",
          referenceNumber: productData.referenceNumber || "",
          serialNumber: productData.serialNumber || "",
          additionalTitle: productData.additionalTitle || "",
          accessoryCategory: productData.accessoryCategory || "",
          accessorySubCategory: productData.accessorySubCategory || "",
          availableSubCategories: subCats,
          productionYear: productData.productionYear || "",
          approximateYear: productData.approximateYear || false,
          unknownYear: productData.unknownYear || false,
          condition: productData.condition || "",
          itemCondition: productData.itemCondition || "",
          gender: productData.gender || "Men/Unisex",
          accessoryMaterial: productData.accessoryMaterial || [],
          accessoryColor: productData.accessoryColor || [],
          accessoryDelivery: productData.accessoryDelivery || [],
          accessoryScopeOfDelivery: productData.accessoryScopeOfDelivery || [],
          taxStatus: productData.taxStatus || "taxable",
          stockQuantity: productData.stockQuantity || "",
          inStock:
            productData.inStock !== undefined ? productData.inStock : true,
          regularPrice: productData.regularPrice || "",
          salePrice: productData.salePrice || "",
          badges: productData.badges || [],
          seoTitle: productData.seoTitle || "",
          seoDescription: productData.seoDescription || "",
          seoKeywords: productData.seoKeywords || "",
          description: productData.description || "",
          visibility: productData.visibility || "visible",
          published:
            productData.published !== undefined ? productData.published : true,
          featured: productData.featured || false,
        });

        // Set existing images if available
        if (productData.images?.length > 0) {
          setExistingImages(productData.images);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to fetch product data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Separate useEffect for loadProducts
  useEffect(() => {
    if (id) loadProducts();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "approximateYear" || name === "unknownYear") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
          ...(name === "unknownYear" && checked && { productionYear: "" }),
        }));
      } else if (
        name === "inStock" ||
        name === "published" ||
        name === "featured"
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else if (
        [
          "accessoryMaterial",
          "accessoryColor",
          "accessoryDelivery",
          "accessoryScopeOfDelivery",
          "badges",
        ].includes(name)
      ) {
        // Handle checkbox arrays
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      }
    } else if (type === "file") {
      if (name === "mainImage" && files.length > 0) {
        const file = files[0];
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
      } else if (name === "coverImages" && files.length > 0) {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

        const totalFiles = [...coverImages, ...newFiles];
        const totalPreviews = [...coverImagePreviews, ...newPreviews];

        if (totalFiles.length <= 15) {
          setCoverImages(totalFiles);
          setCoverImagePreviews(totalPreviews);
        } else {
          setError("Maximum 15 images allowed");
        }
      }
    } else if (name === "accessoryCategory") {
      // Handle category change
      const subCats = subCategoryMapping[value] || [];
      setFormData((prev) => ({
        ...prev,
        accessoryCategory: value,
        accessorySubCategory: "",
        availableSubCategories: subCats,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle multi-select changes for array fields
  const handleMultiSelectChange = (name, value, isChecked) => {
    setFormData((prev) => {
      const currentArray = prev[name] || [];

      if (isChecked) {
        return {
          ...prev,
          [name]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  // Prepare FormData for submission
  const prepareFormData = () => {
    // Handle production year based on checkboxes
    let productionYearValue = formData.productionYear || "";
    let unknownYearValue = formData.unknownYear;

    if (formData.unknownYear) {
      productionYearValue = "Unknown";
    } else if (formData.approximateYear && productionYearValue) {
      productionYearValue = `Approx. ${productionYearValue}`;
    }

    // Handle SEO keywords
    let seoKeywordsArray = [];
    if (formData.seoKeywords) {
      if (typeof formData.seoKeywords === "string") {
        seoKeywordsArray = formData.seoKeywords
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw.length > 0);
      } else if (Array.isArray(formData.seoKeywords)) {
        seoKeywordsArray = formData.seoKeywords;
      }
    }

    // Auto-generate name if not provided
    const productName =
      formData.name || `${formData.brand} ${formData.model}`.trim();

    return {
      // Basic info
      brand: formData.brand || "",
      model: formData.model || "",
      name: productName || "",
      sku: formData.sku || "",
      referenceNumber: formData.referenceNumber || "",
      serialNumber: formData.serialNumber || "",
      additionalTitle: formData.additionalTitle || "",

      // Category info
      accessoryCategory: formData.accessoryCategory || "",
      accessorySubCategory: formData.accessorySubCategory || "",

      // Year info
      productionYear: productionYearValue,
      approximateYear: Boolean(formData.approximateYear),
      unknownYear: Boolean(formData.unknownYear),

      // Condition info
      condition: formData.condition || "",
      itemCondition: formData.itemCondition || "",

      // Specifications
      accessoryMaterial: Array.isArray(formData.accessoryMaterial)
        ? formData.accessoryMaterial
        : [],
      accessoryColor: Array.isArray(formData.accessoryColor)
        ? formData.accessoryColor
        : [],
      gender: formData.gender || "Men/Unisex",

      // Delivery & Accessories
      accessoryDelivery: Array.isArray(formData.accessoryDelivery)
        ? formData.accessoryDelivery
        : [],
      accessoryScopeOfDelivery: Array.isArray(formData.accessoryScopeOfDelivery)
        ? formData.accessoryScopeOfDelivery
        : [],

      // Pricing
      regularPrice: formData.regularPrice
        ? parseFloat(formData.regularPrice)
        : 0,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
      taxStatus: formData.taxStatus || "taxable",

      // Inventory
      stockQuantity: parseInt(formData.stockQuantity) || 1,
      inStock: Boolean(formData.inStock),

      // Marketing
      badges: Array.isArray(formData.badges) ? formData.badges : [],

      // Featured
      featured: Boolean(formData.featured),

      // SEO
      seoTitle: formData.seoTitle || productName,
      seoDescription:
        formData.seoDescription ||
        `Buy ${productName} - Premium ${
          formData.accessoryCategory || "Accessory"
        }`,
      seoKeywords: seoKeywordsArray,

      // Content
      description:
        formData.description ||
        `Premium ${formData.accessoryCategory || "Accessory"}`,

      // Visibility
      visibility: formData.visibility || "visible",
      published: Boolean(formData.published),

      // Category for backend
      category: "Accessories",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation - REQUIRED FIELDS
      if (!formData.brand || !formData.model) {
        throw new Error("Brand and Model are required fields");
      }

      if (!formData.accessoryCategory) {
        throw new Error("Category is required");
      }

      // 1. Prepare the JSON payload
      const payload = prepareFormData();

      // 2. Create FormData for file uploads and JSON payload
      const formDataToSubmit = new FormData();

      // Append JSON payload as a string
      formDataToSubmit.append("data", JSON.stringify(payload));

      // Append main image with field name 'main'
      if (mainImage) {
        formDataToSubmit.append("main", mainImage);
      }

      // Append cover images with field name 'covers'
      if (coverImages.length > 0) {
        coverImages.forEach((file) => {
          formDataToSubmit.append("covers", file);
        });
      }

      // Debug: log the payload
      console.log("Update payload:", payload);

      // API call to update accessory
      const response = await axios.put(
        `http://localhost:9000/api/accessories/UpdatedAccessories/${id}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        setSuccess("Accessory updated successfully!");

        // Show success toast
        if (typeof window !== "undefined") {
          const Toastify = require("toastify-js");
          Toastify({
            text: "Accessory updated successfully!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
        }

        // Redirect after success
        setTimeout(() => {
          router.push("/productmanage");
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating accessory:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Failed to update accessory";
      setError(errorMessage);

      // Show error toast
      if (typeof window !== "undefined") {
        const Toastify = require("toastify-js");
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
    setMainImagePreview("");
  };

  // Remove cover image
  const removeCoverImage = (index) => {
    setCoverImages((prev) => prev.filter((_, i) => i !== index));
    setCoverImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      )
    ) {
      router.back();
    }
  };

  // Auto-generate SEO fields
  useEffect(() => {
    // Auto-generate SEO title if not manually set
    if (
      !formData.seoTitle &&
      (formData.brand || formData.name || formData.model)
    ) {
      const titleParts = [];
      if (formData.brand) titleParts.push(formData.brand);
      if (formData.model) titleParts.push(formData.model);
      if (formData.name) titleParts.push(formData.name);
      if (titleParts.length > 0) {
        const generatedTitle = `${titleParts.join(" ")} | Luxury Accessories`;
        setFormData((prev) => ({ ...prev, seoTitle: generatedTitle }));
      }
    }

    // Auto-generate SEO description if not manually set
    if (
      !formData.seoDescription &&
      (formData.brand || formData.name || formData.description)
    ) {
      let description = "";
      if (formData.brand && formData.model) {
        description = `${formData.brand} ${formData.model} - `;
      } else if (formData.brand) {
        description = `${formData.brand} - `;
      } else if (formData.name) {
        description = `${formData.name} - `;
      }

      if (formData.description) {
        description += formData.description.substring(0, 140);
      } else {
        description +=
          "Premium luxury accessory. High quality materials and craftsmanship.";
      }

      if (description.length > 160) {
        description = description.substring(0, 157) + "...";
      }

      setFormData((prev) => ({ ...prev, seoDescription: description }));
    }

    // Auto-generate name from brand and model
    if (!formData.name && formData.brand && formData.model) {
      setFormData((prev) => ({
        ...prev,
        name: `${formData.brand} ${formData.model}`.trim(),
      }));
    }
  }, [formData.brand, formData.model, formData.name, formData.description]);

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accessory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <DashboardBreadcrumb text="Edit accessory product" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Accessories
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Update fashion accessory details
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
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
                {/* Brand - REQUIRED */}
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

                {/* Model - REQUIRED */}
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

                {/* Name - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Product name (auto-generated from brand + model)"
                  />
                  {!formData.name && formData.brand && formData.model && (
                    <p className="text-xs text-gray-500">
                      Auto-generated: {formData.brand} {formData.model}
                    </p>
                  )}
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
                    placeholder="Enter SKU number"
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
                    placeholder="Enter reference number"
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
                    placeholder="Enter serial number"
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

                {/* Accessory Category - REQUIRED */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accessoryCategory"
                    value={formData.accessoryCategory}
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

                {/* Accessory Sub Category - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Category
                  </label>
                  <select
                    name="accessorySubCategory"
                    value={formData.accessorySubCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={!formData.accessoryCategory}
                  >
                    <option value="">Select Sub Category</option>
                    {formData.availableSubCategories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender - Optional */}
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
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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
                  <label className="text-sm font-medium text-gray-700">
                    In Stock
                  </label>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Featured
                  </label>
                </div>
              </div>
            </div>

            {/* Year Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Year Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Production year details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Production Year - Optional */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Production Year
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="productionYear"
                      value={formData.productionYear}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        formData.unknownYear
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder={
                        formData.unknownYear ? "Unknown" : "e.g., 2023"
                      }
                      min="1900"
                      max="2030"
                      disabled={formData.unknownYear}
                    />
                    {formData.unknownYear && (
                      <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center px-4 text-gray-500">
                        Unknown
                      </div>
                    )}
                  </div>
                </div>

                {/* Approximate Year - Optional */}
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="approximateYear"
                      checked={formData.approximateYear}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={formData.unknownYear}
                    />
                    <label
                      className={`text-sm font-medium ${
                        formData.unknownYear ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      Approximate Year
                    </label>
                  </div>
                </div>

                {/* Unknown Year - Optional */}
                <div className="space-y-2 flex items-end">
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

              {/* Year Information Note */}
              {formData.unknownYear && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Production year is set to "Unknown". The year field will be
                    disabled.
                  </p>
                </div>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Description */}
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

              {/* Materials - Optional (multiple select) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Materials
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {materialOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="accessoryMaterial"
                        value={option}
                        checked={formData.accessoryMaterial.includes(option)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors - Optional (multiple select) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Colors
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {colorOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="accessoryColor"
                        value={option}
                        checked={formData.accessoryColor.includes(option)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">{option}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Accessories & Delivery Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  Accessories & Delivery
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Included accessories and delivery scope
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Included Accessories - Optional */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Included Accessories
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                    {accessoriesAndDeliveryOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="accessoryDelivery"
                          value={option}
                          checked={formData.accessoryDelivery.includes(option)}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scope of Delivery - Optional */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Scope of Delivery
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                    {scopeOfDeliveryOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="accessoryScopeOfDelivery"
                          value={option}
                          checked={formData.accessoryScopeOfDelivery.includes(
                            option
                          )}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700">
                          {option}
                        </label>
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

              {/* Badges - Optional */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Badges
                </label>
                <div className="flex flex-wrap gap-4">
                  {badgesOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="badges"
                        value={option}
                        checked={formData.badges.includes(option)}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700">{option}</label>
                    </div>
                  ))}
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
                  Product images - update main image or add additional images
                </p>
              </div>

              <div className="space-y-6">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Existing Images
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                            <Image
                              src={image.url || image}
                              alt={`Existing image ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
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

                {/* Main Image Upload - Optional for update */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Update Main Image
                  </label>
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <div className="w-48 h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                        <Image
                          src={mainImagePreview}
                          alt="New main product image"
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
                            Update Main Image
                          </span>
                          <p className="text-xs text-gray-500">
                            Optional - upload new main image
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Cover Images Upload - Optional for update */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Additional Images
                  </label>

                  {/* Cover Image Previews */}
                  {coverImagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {coverImagePreviews.length} new images selected
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                              <Image
                                src={preview}
                                alt={`New cover image ${index + 1}`}
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
                            Click to add more images
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            Upload additional product gallery images
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, WEBP up to 5MB each
                          </p>
                        </div>
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
                    placeholder="Comma-separated keywords (e.g., luxury accessories, fashion, gift)"
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
                  !formData.brand ||
                  !formData.model ||
                  !formData.accessoryCategory
                }
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading ||
                  !formData.brand ||
                  !formData.model ||
                  !formData.accessoryCategory
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
                      Updating Accessory...
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Accessory
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

export default EditAccessories;
