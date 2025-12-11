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
import { fetchInventory } from '../../../../../service/productService.js';
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import axios from "axios";

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
    paymentMethod: "cash",
    receivingAmount: 0,
  });

  // Brand list
  const brandList = [
    "Aigner", "Akribos Xxiv", "Apogsum", "AquaMarin", "Aquaswiss", "Armin Strom",
    "Audemars Piguet", "Balenciaga", "Ball", "Bernhard H. Mayer", "Bertolucci",
    "Blancpain", "Borja", "Boss By Hugo Boss", "Boucheron", "Breguet",
    "Carl F. Bucherer", "Cartier", "Celine", "Chanel", "Charriol", "Chaumet",
    "Chopard", "Chronoswiss", "Citizen", "Concord", "Corum", "CT Scuderia",
    "De Grisogno", "Dior", "Dolce & Gabbana", "Dubey & Schaldenbrand", "Ebel",
    "Edox", "Elini", "Emporio Armani", "Erhard Junghans", "Favre Leuba", "Fendi",
    "Ferre Milano", "Franck Muller", "Frederique Constant", "Gerald Genta",
    "Gianfranco Ferre", "Giorgio Armani", "Girard Perregaux", "Giuseppe Zanotti",
    "Givenchy", "Glam Rock", "Goyard", "Graham", "Grimoldi Milano", "Gucci",
    "Harry Winston", "Hermes", "Hublot", "Hysek", "Jacob & Co.", "Jacques Lemans",
    "Jaeger LeCoultre", "Jean Marcel", "JeanRichard", "Jorg Hysek", "Joseph",
    "Junghans", "Just Cavalli", "Karl Lagerfeld", "KC", "Korloff", "Lancaster",
    "Locman", "Longines", "Louis Frard", "Louis Moine", "Louis Vuitton",
    "Marc by Marc Jacobs", "Marc Jacobs", "Martin Braun", "Mauboussin",
    "Maurice Lacroix", "Meyers", "Michael Kors", "MICHAEL Michael Kors", "Mido",
    "Montblanc", "Montega", "Montegrappa", "Movado", "Navitec", "NB Yaeger",
    "Nina Ricci", "Nubeo", "Officina Del Tempo", "Omega", "Oris", "Panerai",
    "Parmigiani", "Patek Philippe", "Paul Picot", "Perrelet", "Philip Stein",
    "Piaget", "Pierre Balmain", "Porsche Design", "Prada", "Quinting", "Rado",
    "Rolex", "Rama Swiss Watch", "Raymond Weil", "Richard Mille", "Robergé",
    "Roberto Cavalli", "Rochas", "Roger Dubuis", "S.T. Dupont", "Saint Laurent Paris",
    "Salvatore Ferragamo", "Seiko", "Swarovski", "Swatch", "Tag Heuer", "Techno Com",
    "Technomarine", "Tiffany & Co.", "Tissot", "Tonino Lamborghini", "Trussardi",
    "Tudor", "Vacheron Constantin", "Valentino", "Van Cleef & Arpels", "Versace",
    "Yves Saint Laurent", "Zenith", "Ingersoll", "IWC", "U-Boat", "Ulysse Nardin"
  ];

  // Show Toastify notification
  const showToast = (message, type = "success") => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: type === "success" ? "#10B981" : 
                      type === "error" ? "#EF4444" : 
                      type === "warning" ? "#F59E0B" : "#3B82F6",
      stopOnFocus: true,
      className: "toastify-custom",
    }).showToast();
  };

  useEffect(() => {
    if (itemId) {
      fetchItem();
    } else {
      setLoading(false);
      setErrors({ fetch: "No item ID provided" });
      showToast("No item ID provided", "error");
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      if (!itemId) {
        throw new Error("No item ID provided");
      }
      
      // Fetch single item by ID
      const result = await fetchInventory({ id: itemId });
      
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
      
      setItem(itemData);
      
      // Directly use the data from backend
      setFormData({
        brand: itemData.brand || "",
        productName: itemData.productName || "",
        internalCode: itemData.internalCode || "",
        quantity: itemData.quantity || 0,
        status: itemData.status || "AVAILABLE",
        cost: itemData.cost || 0,
        sellingPrice: itemData.sellingPrice || 0,
        soldPrice: itemData.soldPrice || 0,
        paymentMethod: itemData.paymentMethod || "cash",
        receivingAmount: itemData.receivingAmount || 0,
      });
      
      showToast("Item loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching item:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load item. Please try again.";
      setErrors({ fetch: errorMessage });
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
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
    
    if (Object.keys(newErrors).length > 0) {
      showToast("Please fix validation errors before saving", "warning");
    }
    
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
      status: newStatus,
      soldPrice: newStatus === "AVAILABLE" ? 0 : prev.soldPrice,
      receivingAmount: newStatus === "AVAILABLE" ? 0 : prev.receivingAmount,
    }));
  };

  const clearSaleInformation = () => {
    setFormData(prev => ({
      ...prev,
      soldPrice: 0,
      receivingAmount: 0,
    }));
    showToast("Sale information cleared", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Prepare data for submission - match backend schema exactly
    const dataToSubmit = {
      brand: formData.brand,
      productName: formData.productName,
      internalCode: formData.internalCode,
      quantity: Number(formData.quantity),
      status: formData.status,
      cost: Number(formData.cost),
      sellingPrice: Number(formData.sellingPrice),
      paymentMethod: formData.paymentMethod,
    };

    // Only include sale-related fields if status is SOLD or AUCTION
    if (formData.status === "SOLD" || formData.status === "AUCTION") {
      dataToSubmit.soldPrice = Number(formData.soldPrice);
      dataToSubmit.receivingAmount = Number(formData.receivingAmount);
    } else {
      // Clear sale-related fields when status is AVAILABLE
      dataToSubmit.soldPrice = 0;
      dataToSubmit.receivingAmount = 0;
    }

    setSaving(true);
    try {
      console.log("Submitting data:", dataToSubmit);
      
      const response = await axios.put(`https://api.montres.ae/api/invontry/updated/${itemId}`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Update successful:", response);
      
      showToast("Item updated successfully!", "success");
      
      if (onSave) {
        onSave(response.data);
      } else {
        setTimeout(() => {
          router.push("/InventoryStock");
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update item. Please try again.";
      
      // Handle specific validation errors
      if (errorMessage.includes('not a valid enum value')) {
        if (errorMessage.includes('brand')) {
          setErrors({ 
            brand: `"${formData.brand}" is not a valid brand. Please select from the list.` 
          });
          showToast("Please select a valid brand from the list", "error");
        } else if (errorMessage.includes('paymentMethod')) {
          setErrors({ 
            paymentMethod: `"${formData.paymentMethod}" is not a valid payment method. Please select from the list.` 
          });
          showToast("Please select a valid payment method", "error");
        }
      } else {
        setErrors({ submit: errorMessage });
        showToast(errorMessage, "error");
      }
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                type="button"
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
                    {item?.brand || "Item"}
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
                  Brand
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {item?.brand || "N/A"}
                </div>
              </div>
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
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Product Details */}
            <div className="space-y-6 md:space-y-8">
              {/* Product Information Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
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
                    </select>
                    {errors.brand && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div>
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
                    <div>
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

                    <div>
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
              </div>

              {/* Pricing Details Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <InformationCircleIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                </div>
              </div>
            </div>

            {/* Right Column - Status & Additional Info */}
            <div className="space-y-6 md:space-y-8">
              {/* Item Status & Sales Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <InformationCircleIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Item Status & Sales</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
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

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="stripe">💳 Stripe</option>
                      <option value="tabby">🏦 Tabby</option>
                      <option value="chrono">⌚ Chrono</option>
                      <option value="bank_transfer">🏛️ Bank Transfer</option>
                      <option value="other">📄 Other</option>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sold Price
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="soldPrice"
                            value={formData.soldPrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Received
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="receivingAmount"
                            value={formData.receivingAmount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>
                  Make sure all required fields (*) are completed before saving.
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

      {/* Add custom styles for Toastify */}
      <style jsx global>{`
        .toastify-custom {
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px 20px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default EditItemPage;