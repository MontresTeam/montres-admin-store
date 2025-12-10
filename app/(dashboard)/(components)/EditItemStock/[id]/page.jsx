"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import newCurrency from "../../../../../public/assets/newSymbole.png";
import { useRouter, useParams } from "next/navigation";
import { fetchInventory, updateInventory } from '../../../../../service/productService.js';

const EditItemPage = ({ itemId: propItemId, onSave, onCancel }) => {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get item ID from props or URL params
  const itemId = propItemId || params.id;
  
  const [formData, setFormData] = useState({
    brand: "",
    productName: "",
    internalCode: "",
    quantity: 0,
    status: "AVAILABLE",
    cost: 0,
    sellingPrice: 0,
    soldPrice: 0,
    paymentMethod: "",
    receivingAmount: 0,
    notes: "",
  });

  // Brand list (keep your existing brand list)
  const brandList = [
    "Aigner",
    "Akribos Xxiv",
    // ... rest of your brands
  ];

  useEffect(() => {
    if (itemId) {
      fetchItem();
    } else {
      setLoading(false);
      setErrors({ fetch: "No item ID provided" });
    }
  }, [itemId]);

  const splitBrandAndProductName = (combinedString) => {
    if (!combinedString) return { brand: "", productName: "" };
    
    for (const brand of brandList) {
      if (combinedString.toLowerCase().startsWith(brand.toLowerCase())) {
        const brandMatch = combinedString.substring(0, brand.length);
        const productName = combinedString.substring(brand.length).trim();
        
        const exactBrand = brandList.find(b => 
          b.toLowerCase() === brandMatch.toLowerCase()
        );
        
        return {
          brand: exactBrand || brandMatch,
          productName: productName || ""
        };
      }
    }
    
    const words = combinedString.trim().split(" ");
    if (words.length > 1) {
      const firstWord = words[0];
      const restOfString = words.slice(1).join(" ");
      
      const foundBrand = brandList.find(b => 
        b.toLowerCase() === firstWord.toLowerCase()
      );
      
      if (foundBrand) {
        return {
          brand: foundBrand,
          productName: restOfString
        };
      }
      
      return {
        brand: "other",
        productName: combinedString
      };
    }
    
    return {
      brand: "",
      productName: combinedString
    };
  };

  const fetchItem = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      if (!itemId) {
        throw new Error("No item ID provided");
      }
      
      console.log("Fetching item with ID:", itemId);
      
      // Fetch single item by ID
      const result = await fetchInventory({ id: itemId });
      
      console.log("Fetch result:", result);
      
      let itemData = result;
      
      // Handle different response structures
      if (!itemData) {
        throw new Error("No data received from server");
      }
      
      // If result is an array (multiple items), take the first one
      if (Array.isArray(itemData)) {
        if (itemData.length === 0) {
          throw new Error("Item not found");
        }
        itemData = itemData[0];
      }
      
      console.log("Fetched item data:", itemData);
      
      setItem(itemData);
      
      // Split brand and product name
      const { brand, productName } = splitBrandAndProductName(itemData.brand || "");
      
      // Initialize form data with fetched data
      setFormData({
        brand: brand || "",
        productName: productName || "",
        internalCode: itemData.internalCode || "",
        quantity: itemData.quantity || 0,
        status: itemData.status || "AVAILABLE",
        cost: itemData.cost || 0,
        sellingPrice: itemData.sellingPrice || 0,
        soldPrice: itemData.soldPrice || 0,
        paymentMethod: itemData.paymentMethod || "",
        receivingAmount: itemData.receivingAmount || 0,
        notes: itemData.notes || "",
      });
    } catch (error) {
      console.error("Error fetching item:", error);
      setErrors({ 
        fetch: error.response?.data?.message || error.message || "Failed to load item. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim() && formData.brand !== "other") {
      newErrors.brand = "Brand is required";
    }
    
    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    
    if (formData.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }
    
    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = "Selling price cannot be negative";
    }

    if (formData.status === "SOLD" || formData.status === "AUCTION") {
      if (formData.soldPrice < 0) {
        newErrors.soldPrice = "Sold price cannot be negative";
      }
      if (formData.receivingAmount < 0) {
        newErrors.receivingAmount = "Receiving amount cannot be negative";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData(prev => ({
      ...prev,
      status: newStatus
    }));

    if (newStatus === "AVAILABLE") {
      setFormData(prev => ({
        ...prev,
        soldPrice: 0,
        paymentMethod: "",
        receivingAmount: 0,
      }));
    }
  };

  const clearSaleInformation = () => {
    setFormData(prev => ({
      ...prev,
      soldPrice: 0,
      paymentMethod: "",
      receivingAmount: 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Combine brand and product name for API
    let combinedBrand = "";
    if (formData.brand === "other") {
      combinedBrand = formData.productName;
    } else if (formData.brand) {
      combinedBrand = `${formData.brand} ${formData.productName}`.trim();
    } else {
      combinedBrand = formData.productName;
    }

    // Prepare data for submission
    const dataToSubmit = {
      brand: combinedBrand,
      internalCode: formData.internalCode,
      quantity: formData.quantity,
      status: formData.status,
      cost: formData.cost,
      sellingPrice: formData.sellingPrice,
      notes: formData.notes,
    };

    // Only include sale-related fields if status is SOLD or AUCTION
    if (formData.status === "SOLD" || formData.status === "AUCTION") {
      dataToSubmit.soldPrice = formData.soldPrice;
      dataToSubmit.paymentMethod = formData.paymentMethod;
      dataToSubmit.receivingAmount = formData.receivingAmount;
    } else {
      dataToSubmit.soldPrice = 0;
      dataToSubmit.paymentMethod = "";
      dataToSubmit.receivingAmount = 0;
    }

    setSaving(true);
    try {
      console.log("Submitting data for ID:", itemId, "Data:", dataToSubmit);
      
      const response = await updateInventory(itemId, dataToSubmit);
      
      console.log("Update successful:", response);
      
      if (onSave) {
        onSave(response);
      } else {
        router.push("/InventoryStock");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setErrors({ 
        submit: error.response?.data?.message || error.message || "Failed to update item. Please try again." 
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return (
      <div className="flex items-center gap-1">
        <img src={newCurrency.src} alt="Currency" className="w-3 h-3" />
        {typeof amount === 'number' ? amount.toLocaleString() : "0"}
      </div>
    );
  };

  const handleBackToInventory = () => {
    router.push("/InventoryStock");
  };

  const FormSection = ({ title, children, icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-600 font-medium mb-2">Error loading item</p>
            <p className="text-red-500 text-sm">{errors.fetch}</p>
          </div>
          <button
            onClick={handleBackToInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  // No item found state
  if (!item && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <p className="text-yellow-700 font-medium mb-2">Item not found</p>
            <p className="text-yellow-600 text-sm">
              The item with ID {itemId} could not be found.
            </p>
          </div>
          <button
            onClick={handleBackToInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToInventory}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                disabled={saving}
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Edit Item Details
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  Update product information for{" "}
                  <span className="font-semibold text-blue-600">
                    {item?.brand ? item.brand.split(' ')[0] : "Item"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
              <div className="text-sm text-blue-700">Item ID:</div>
              <div className="font-mono text-sm font-semibold text-blue-900 bg-white px-2 py-1 rounded">
                {item?._id?.slice(-6) || itemId?.slice(-6) || "N/A"}
              </div>
            </div>
          </div>

          {/* Item Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Product Code
                </div>
                <div className="text-lg font-semibold text-gray-900 font-mono">
                  {item?.internalCode || "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Current Stock
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  <span
                    className={`px-2 py-1 rounded ${
                      (item?.quantity || 0) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item?.quantity || 0} units
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Status
                </div>
                <div
                  className={`text-lg font-semibold ${
                    item?.status === "AVAILABLE"
                      ? "text-green-600"
                      : item?.status === "SOLD"
                      ? "text-yellow-600"
                      : "text-purple-600"
                  }`}
                >
                  {item?.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() : "Unknown"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Last Updated
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item?.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Product Details */}
            <div className="space-y-6 md:space-y-8">
              <FormSection title="Product Information">
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.brand
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a brand</option>
                      {brandList.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    {formData.brand === "other" && (
                      <p className="mt-2 text-sm text-amber-600">
                        Please specify the brand name in the product name field.
                      </p>
                    )}
                    {errors.brand && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      placeholder="Enter product name or description"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.productName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.productName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        {errors.productName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Code
                      </label>
                      <input
                        type="text"
                        name="internalCode"
                        value={formData.internalCode}
                        onChange={handleChange}
                        placeholder="e.g., WATCH-001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.quantity
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.quantity && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Pricing Details">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          {formatCurrency(formData.cost)}
                        </div>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 pl-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.cost
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.cost && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          {errors.cost}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          {formatCurrency(formData.sellingPrice)}
                        </div>
                        <input
                          type="number"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 pl-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.sellingPrice
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.sellingPrice && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          {errors.sellingPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.cost > 0 && formData.sellingPrice > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Expected Profit:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            formData.sellingPrice - formData.cost >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(formData.sellingPrice - formData.cost)}
                          <span className="ml-2 text-xs">
                            (
                            {(
                              ((formData.sellingPrice - formData.cost) /
                                formData.cost) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>
            </div>

            {/* Right Column - Status & Additional Info */}
            <div className="space-y-6 md:space-y-8">
              <FormSection title="Item Status & Sales">
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleStatusChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="AVAILABLE">🟢 Available</option>
                      <option value="SOLD">🟡 Sold</option>
                      <option value="AUCTION">🟣 Auction</option>
                    </select>
                  </div>

                  {(formData.status === "SOLD" || formData.status === "AUCTION") && (
                    <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                          <InformationCircleIcon className="w-4 h-4" />
                          Sale Information
                        </h4>
                        <button
                          type="button"
                          onClick={clearSaleInformation}
                          className="text-xs text-amber-700 hover:text-amber-900 px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sold Price
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {formatCurrency(formData.soldPrice)}
                          </div>
                          <input
                            type="number"
                            name="soldPrice"
                            value={formData.soldPrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-3 pl-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.soldPrice
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.soldPrice && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            {errors.soldPrice}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select payment method</option>
                          <option value="cash">💵 Cash</option>
                          <option value="stripe">💳 Stripe</option>
                          <option value="tabby">🏦 Tabby</option>
                          <option value="chrono">⌚ Chrono</option>
                          <option value="mamo">📱 Mamo Pay</option>
                          <option value="bank_transfer">🏛️ Bank Transfer</option>
                          <option value="other">📄 Other</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Received
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {formatCurrency(formData.receivingAmount)}
                          </div>
                          <input
                            type="number"
                            name="receivingAmount"
                            value={formData.receivingAmount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-3 pl-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.receivingAmount
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.receivingAmount && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            {errors.receivingAmount}
                          </p>
                        )}
                      </div>

                      {formData.soldPrice > 0 && formData.receivingAmount > 0 && (
                        <div className="p-3 bg-white rounded border border-amber-100">
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700">
                              Pending Amount:
                            </span>
                            <span
                              className={`font-semibold ${
                                formData.soldPrice - formData.receivingAmount === 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(formData.soldPrice - formData.receivingAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Additional Information">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes & Comments
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="5"
                      maxLength="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any additional notes, product condition, special instructions, or comments..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Character count: {formData.notes.length}/500
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        Created:{" "}
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div>
                        Last modified:{" "}
                        {item?.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>
                  Make sure all required fields (*) are completed before saving.
                </p>
                <p className="text-xs mt-1">
                  All changes will be saved to the database immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onCancel || handleBackToInventory}
                  className="px-6 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                  disabled={saving}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-semibold flex items-center justify-center gap-2 min-w-[140px] shadow-sm"
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    Object.keys(errors).length === 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={
                    Object.keys(errors).length === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Object.keys(errors).length === 0
                    ? "All required fields are complete"
                    : `${
                        Object.keys(errors).length
                      } validation error(s) need attention`}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;