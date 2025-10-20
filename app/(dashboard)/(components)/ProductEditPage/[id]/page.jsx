"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { fetchProduct, updateProduct } from "@/service/productService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// Define initial form state to match AddProduct component
const initialFormData = {
  sku: "",
  name: "",
  salePrice: "",
  regularPrice: "",
  taxStatus: "",
  stockQuantity: "",
  gender: "",
  categorisOne: "",
  subcategory: "",
  description: "",
  visibility: "visible",
  tags: "",
  brands: "",
  discount: "",
  caseDiameter: "",
  movement: "",
  dial: "",
  wristSize: "",
  accessories: "",
  condition: "",
  productionYear: "",
};

const ProductEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  // Helper function to get URL from image object or string
  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image && image.url) return image.url;
    if (image && image.src) return image.src;
    return '';
  };

  // Helper function to check if URL is a blob URL
  const isBlobUrl = (url) => {
    return typeof url === 'string' && url.startsWith('blob:');
  };

  // Load product data
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProduct({ id });
      if (!error && data) {
        console.log("Product data:", data);
        const product = data.product || data;

        // Map the product data to form fields
        setFormData({
          sku: product.sku || "",
          name: product.name || "",
          salePrice: product.salePrice || "",
          regularPrice: product.regularPrice || "",
          taxStatus: product.taxStatus || "",
          stockQuantity: product.stockQuantity || "",
          gender: product.gender || "",
          categorisOne: product.categorisOne || "",
          subcategory: product.subcategory || "",
          description: product.description || "",
          visibility: product.visibility || "visible",
          tags: product.tags || "",
          brands: product.brands || product.metaBrands || "",
          discount: product.discount || "",
          caseDiameter: product.CaseDiameter || "",
          movement: product.Movement || "",
          dial: product.Dial || "",
          wristSize: product.WristSize || "",
          accessories: product.Accessories || "",
          condition: product.Condition || "",
          productionYear: product.ProductionYear || "",
        });

        // Set image previews for existing images
        if (product.images && product.images.length > 0) {
          const previewUrls = product.images.map(img => getImageUrl(img));
          setImagePreviews(previewUrls);
          setImages(product.images); // Store existing images
        }
      } else {
        console.error("❌ Error fetching product:", error);
        setError("Failed to load product data");
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setError("Unexpected error occurred while loading product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProducts();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images" && files && files.length > 0) {
      const newImages = Array.from(files);
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...newImages]);
      setImagePreviews((prev) => [...prev, ...newPreviewUrls]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const removeImage = (index) => {
    // Only revoke URL if it's a blob URL (newly uploaded image)
    const previewUrl = imagePreviews[index];
    if (previewUrl && isBlobUrl(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
    }

    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Product name is required");
      setLoading(false);
      return;
    }

    try {
      const productData = new FormData();

      // Debug: Log form data before sending
      console.log("Form Data:", formData);
      console.log("Images count:", images.length);

      // Append all basic fields
      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== "" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          // Handle array fields
          if (key === "tags" || key === "brands" || key === "subcategory") {
            const arrayValue = formData[key]
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item);
            if (arrayValue.length > 0) {
              // For array fields, append each value separately
              arrayValue.forEach((item) => productData.append(key, item));
            }
          } else {
            productData.append(key, formData[key]);
          }
        }
      });

      // **CRITICAL FIX: Append numeric fields with proper values**
      if (formData.salePrice) {
        productData.set("salePrice", parseFloat(formData.salePrice) || 0);
      }
      if (formData.regularPrice) {
        productData.set("regularPrice", parseFloat(formData.regularPrice) || 0);
      }
      if (formData.stockQuantity) {
        productData.set("stockQuantity", parseInt(formData.stockQuantity) || 0);
      }
      if (formData.caseDiameter) {
        productData.set("caseDiameter", parseFloat(formData.caseDiameter) || 0);
      }
      if (formData.wristSize) {
        productData.set("wristSize", parseFloat(formData.wristSize) || 0);
      }
      if (formData.productionYear) {
        productData.set("productionYear", parseInt(formData.productionYear) || 0);
      }

      // **CRITICAL FIX: Handle image uploads properly**
      // Separate existing images from new files
      const existingImages = images.filter(img => !(img instanceof File));
      const newImageFiles = images.filter(img => img instanceof File);

      if (newImageFiles.length > 0) {
        // First new image as main
        productData.append("main", newImageFiles[0]);
        
        // Remaining new images as covers
        if (newImageFiles.length > 1) {
          newImageFiles.slice(1).forEach((file) => {
            productData.append("covers", file);
          });
        }
      }

      // Append existing images if any
      if (existingImages.length > 0) {
        existingImages.forEach((img) => {
          const imageUrl = getImageUrl(img);
          if (imageUrl) {
            productData.append("existingImages", imageUrl);
          }
        });
      }

      // Set default values for required backend fields
      productData.append("inStock", "true");
      productData.append("published", "true");
      productData.append("featured", "false");
      productData.append("type", "simple");

      // **CRITICAL FIX: Debug FormData contents properly**
      console.log("=== FormData Contents ===");
      for (let [key, value] of productData.entries()) {
        console.log(key + ":", value);
      }
      console.log("=== End FormData Contents ===");

      const { data, error } = await updateProduct(id, productData);

      if (error) {
        throw new Error(error.message || "Failed to update product");
      }

      Toastify({
        text: "Product updated successfully!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      }).showToast();

      console.log("Product updated:", data);
      setSuccess("Product updated successfully!");
      
      // Redirect after success
      setTimeout(() => {
        router.push("/productmanage");
      }, 2000);

    } catch (err) {
      console.error("Error updating product:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product. Please try again.";
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
    // Clean up all blob URLs
    imagePreviews.forEach((url) => {
      if (url && isBlobUrl(url)) {
        URL.revokeObjectURL(url);
      }
    });
    router.push("/productmanage");
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url && isBlobUrl(url)) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  if (loading && !formData.name) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <DashboardBreadcrumb text="Update product information and details" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Product
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your product details, pricing, and inventory information
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
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="SKU-001"
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

                {/* Stock Quantity */}
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
                      value={formData.caseDiameter}
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
                    value={formData.movement}
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
                    value={formData.dial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., Black, Blue, Silver"
                  />
                </div>

                {/* Wrist Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wrist Size (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="wristSize"
                      value={formData.wristSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="e.g., 7.5"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      cm
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
                    value={formData.condition}
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
                    value={formData.productionYear}
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
                  value={formData.accessories}
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
                    Category
                  </label>
                  <input
                    type="text"
                    name="categorisOne"
                    value={formData.categorisOne}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Main category"
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
                    placeholder="Brand name or comma separated brands"
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
                  Product images (first image will be considered as main image)
                </p>
              </div>

              <div className="space-y-6">
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Images ({imagePreviews.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                            <Image
                              src={preview}
                              alt={`Product image ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
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
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    multiple
                    className="hidden"
                    id="images"
                    accept="image/*"
                  />
                  <label htmlFor="images" className="cursor-pointer">
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
                          Click to upload images
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          Upload product images. First image will be used as
                          main image.
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, WEBP up to 5MB each
                        </p>
                        <p className="text-sm text-gray-500">
                          Multiple files allowed
                        </p>
                      </div>
                      {imagePreviews.length > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          {imagePreviews.length} image(s) selected
                        </p>
                      )}
                    </div>
                  </label>
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
                      Updating Product...
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
                      Update Product
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

export default ProductEditPage;