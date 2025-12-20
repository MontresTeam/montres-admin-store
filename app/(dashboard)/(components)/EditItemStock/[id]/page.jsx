"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import newCurrency from "../../../../../public/assets/newSymbole.png";
import { useRouter, useParams } from "next/navigation";
import { fetchInventory } from "../../../../../service/productService.js";
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
  const [brandSearch, setBrandSearch] = useState("");
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Get item ID from props or URL params
  const itemId = propItemId || params.id;

  // Category options
  const categoryOptions = [
    { value: "watch", label: "⌚ Watch" },
    { value: "Accessories", label: "👓 Accessories" },
    { value: "Leather Goods", label: "👝 Leather Goods" },
    { value: "Leather Bags", label: "👜 Leather Bags" },
  ];

  // Initialize form data
  const [formData, setFormData] = useState({
    brand: "",
    productName: "",
    category: "watch",
    internalCode: "",
    quantity: 0,
    status: "AVAILABLE",
    cost: 0,
    sellingPrice: 0,
    soldPrice: 0,
    paymentMethod: "cash",
    receivingAmount: 0,
    soldAt: "",
    lastEditedBy: "",
    lastEditedAt: "",
  });

  // Brand list (truncated for brevity)
  const brandList = [
   "Aigner", "Akribos Xxiv", "Alfred Dunhill", "Alviero Martini", "Apogsum", "AquaMarin", "Aquaswiss", "Armin Strom",
  "Audemars Piguet", "Balenciaga", "Ball", "Bernhard H. Mayer", "Bertolucci",
  "Blancpain", "Borja", "Boss By Hugo Boss", "Boucheron", "Breitling", "Breguet",
  "Burberry", "Bvlgari", "Carl F. Bucherer", "Cartier", "Celine", "Chanel", "Charriol", "Chaumet",
  "Chopard", "Chronoswiss", "Citizen", "Concord", "Corum", "CT Scuderia",
  "De Grisogno", "Dior", "Dolce & Gabbana", "Dubey & Schaldenbrand", "Ebel",
  "Edox", "Elini", "Emporio Armani", "Erhard Junghans", "Favre Leuba", "Fendi",
  "Ferre Milano", "Franck Muller", "Frederique Constant", "Gerald Genta",
  "Gianfranco Ferre", "Giorgio Armani", "Girard Perregaux", "Giuseppe Zanotti",
  "Givenchy", "Glam Rock", "Goyard", "Graham", "Grimoldi Milano", "Gucci",
  "Harry Winston", "Hermes", "Hublot", "Hysek", "Ingersoll", "IWC", "Jacob & Co.", "Jacques Lemans",
  "Jaeger LeCoultre", "Jean Marcel", "JeanRichard", "Jorg Hysek", "Joseph",
  "Junghans", "Just Cavalli", "Karl Lagerfeld", "KC", "Kenzo", "Korloff", "Lancaster",
  "Locman", "Longines", "Lord King", "Louis Frard", "Louis Moine", "Louis Vuitton",
  "Marc by Marc Jacobs", "Marc Jacobs", "Martin Braun", "Mauboussin",
  "Maurice Lacroix", "Meyers", "Michael Kors", "MICHAEL Michael Kors", "Mido",
  "Montblanc", "Montega", "Montegrappa", "Movado", "Navitec", "NB Yaeger",
  "Nina Ricci", "Nubeo", "Officina Del Tempo", "Omega", "Oris", "Panerai",
  "Parmigiani", "Patek Philippe", "Paul Picot", "Perrelet", "Philip Stein",
  "Piaget", "Pierre Balmain", "Porsche Design", "Prada", "Principessa", "Quinting", "Rado",
  "Rama Swiss Watch", "Raymond Weil", "Richard Mille", "Robergé",
  "Roberto Cavalli", "Rochas", "Roger Dubuis", "Rolex", "S.T. Dupont", "Saint Laurent Paris",
  "Salvatore Ferragamo", "Seiko", "Swarovski", "Swatch", "Tag Heuer", "Techno Com",
  "Technomarine", "Tiffany & Co.", "Tissot", "Tonino Lamborghini", "Trussardi",
  "Tudor", "U-Boat", "Ulysse Nardin", "Vacheron Constantin", "Valentino", "Van Cleef & Arpels", "Versace",
  "Yves Saint Laurent", "Zenith", "Other"
  ];

  // Filtered brands based on search
  const filteredBrands = brandSearch
    ? brandList.filter((brand) =>
        brand.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : brandList;

  // Check device type for responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load current admin from localStorage
  useEffect(() => {
    const loadAdminData = () => {
      try {
        const adminDataStr = localStorage.getItem("adminData");
        if (adminDataStr) {
          const adminData = JSON.parse(adminDataStr);
          setCurrentAdmin({
            username: adminData.username || "Unknown",
            role: adminData.role || "admin",
            loginTime: adminData.loginTime || new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };

    loadAdminData();
  }, []);

  // Show Toastify notification
  const showToast = (message, type = "success") => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: isMobile ? "center" : "right",
      backgroundColor:
        type === "success"
          ? "#10B981"
          : type === "error"
          ? "#EF4444"
          : type === "warning"
          ? "#F59E0B"
          : "#3B82F6",
      stopOnFocus: true,
      className: "toastify-custom",
    }).showToast();
  };

  // Fetch item data
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

      const result = await fetchInventory({ id: itemId });
      let itemData = result;

      if (!itemData) {
        throw new Error("No data received from server");
      }

      if (Array.isArray(itemData)) {
        if (itemData.length === 0) {
          throw new Error("Item not found");
        }
        itemData = itemData[0];
      }

      setItem(itemData);

      // Format soldAt date for input field (YYYY-MM-DD)
      // Check both soldAt and soldDate for backward compatibility
      const soldAtDate = itemData.soldAt || itemData.soldDate;
      let formattedSoldAt = "";
      
      if (soldAtDate) {
        // Try to parse the date from backend format (could be DD/MM/YYYY or MM/DD/YYYY)
        const date = new Date(soldAtDate);
        if (!isNaN(date.getTime())) {
          formattedSoldAt = date.toISOString().split('T')[0];
        } else {
          // If Date parsing fails, try manual parsing
          const parts = soldAtDate.toString().split('/');
          if (parts.length === 3) {
            const [first, second, third] = parts;
            // Determine format based on values
            let year, month, day;
            
            if (parseInt(first) > 12) {
              // DD/MM/YYYY
              day = parseInt(first);
              month = parseInt(second) - 1;
              year = parseInt(third);
            } else if (parseInt(second) > 12) {
              // MM/DD/YYYY
              month = parseInt(first) - 1;
              day = parseInt(second);
              year = parseInt(third);
            } else {
              // Default to MM/DD/YYYY (American format)
              month = parseInt(first) - 1;
              day = parseInt(second);
              year = parseInt(third);
            }
            
            const parsedDate = new Date(year, month, day);
            if (!isNaN(parsedDate.getTime())) {
              formattedSoldAt = parsedDate.toISOString().split('T')[0];
            }
          }
        }
      }

      setFormData({
        brand: itemData.brand || "",
        productName: itemData.productName || "",
        category: itemData.category || "watch",
        internalCode: itemData.internalCode || "",
        quantity: itemData.quantity || 0,
        status: itemData.status || "AVAILABLE",
        cost: itemData.cost || 0,
        sellingPrice: itemData.sellingPrice || 0,
        soldPrice: itemData.soldPrice || 0,
        paymentMethod: itemData.paymentMethod || "cash",
        receivingAmount: itemData.receivingAmount || 0,
        soldAt: formattedSoldAt,
        lastEditedBy: itemData.lastEditedBy || "",
        lastEditedAt: itemData.lastEditedAt || "",
      });

      showToast("Item loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching item:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load item. Please try again.";
      setErrors({ fetch: errorMessage });
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not edited yet";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "Not set";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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

    if (!formData.category) {
      newErrors.category = "Category is required";
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

    if (type === "number") {
      const numValue = value === "" ? 0 : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brand }));
    setBrandSearch("");
    setShowBrandDropdown(false);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const currentDate = new Date().toISOString().split('T')[0];
    
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      soldPrice: newStatus === "AVAILABLE" ? 0 : prev.soldPrice,
      receivingAmount: newStatus === "AVAILABLE" ? 0 : prev.receivingAmount,
      paymentMethod: newStatus === "AVAILABLE" ? "cash" : prev.paymentMethod,
      soldAt: (newStatus === "SOLD" || newStatus === "AUCTION") ? currentDate : ""
    }));
  };

  const clearSaleInformation = () => {
    setFormData((prev) => ({
      ...prev,
      soldPrice: 0,
      receivingAmount: 0,
      soldAt: "",
    }));
    showToast("Sale information cleared", "info");
  };

  // Helper function to format date in MM/DD/YYYY format for backend
  const formatDateForBackend = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString(); // No padding
    const day = date.getDate().toString(); // No padding
    const year = date.getFullYear();
    
    // Return in M/D/YYYY format (same as your Postman example)
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Prepare data with editor information
    const currentTime = new Date().toISOString();
    const editorInfo = currentAdmin ? {
      editorId: currentAdmin.username,
      editorName: currentAdmin.username,
      editorRole: currentAdmin.role,
      editedAt: currentTime
    } : {
      editorId: "unknown",
      editorName: "Unknown",
      editorRole: "admin",
      editedAt: currentTime
    };

    // Format soldAt date for backend in M/D/YYYY format
    let soldAt = "";
    if (formData.status === "SOLD" || formData.status === "AUCTION") {
      if (formData.soldAt) {
        soldAt = formatDateForBackend(formData.soldAt);
      } else {
        // Use current date if no date specified
        soldAt = formatDateForBackend(new Date());
      }
    }

    const dataToSubmit = {
      brand: formData.brand,
      productName: formData.productName,
      category: formData.category,
      internalCode: formData.internalCode,
      quantity: Number(formData.quantity),
      status: formData.status,
      cost: Number(formData.cost),
      sellingPrice: Number(formData.sellingPrice),
      paymentMethod: formData.paymentMethod,
      lastEditedBy: editorInfo,
      lastEditedAt: currentTime,
    };

    // Include sale-related fields if needed
    if (formData.status === "SOLD" || formData.status === "AUCTION") {
      dataToSubmit.soldPrice = Number(formData.soldPrice);
      dataToSubmit.receivingAmount = Number(formData.receivingAmount);
      dataToSubmit.soldAt = soldAt; // Send as M/D/YYYY format (12/8/2025)
    } else {
      // For AVAILABLE status, clear sale information
      dataToSubmit.soldPrice = 0;
      dataToSubmit.receivingAmount = 0;
      dataToSubmit.soldAt = ""; // Clear soldAt
    }

    console.log("Data to submit to backend:", JSON.stringify(dataToSubmit, null, 2));

    setSaving(true);
    try {
      const response = await axios.put(
        `https://api.montres.ae/api/invontry/updated/${itemId}`,
        dataToSubmit,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update successful:", response);

      showToast("Item updated successfully!", "success");

      // Also update the local item state
      setItem(prev => ({
        ...prev,
        ...dataToSubmit,
        _id: itemId
      }));

      if (onSave) {
        onSave(response.data);
      } else {
        setTimeout(() => {
          router.push("/InventoryStock");
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update item. Please try again.";

      if (errorMessage.includes("not a valid enum value")) {
        if (errorMessage.includes("brand")) {
          setErrors({
            brand: `"${formData.brand}" is not a valid brand. Please select from the list.`,
          });
          showToast("Please select a valid brand from the list", "error");
        } else if (errorMessage.includes("category")) {
          setErrors({
            category: `"${formData.category}" is not a valid category. Please select from the list.`,
          });
          showToast("Please select a valid category", "error");
        } else if (errorMessage.includes("paymentMethod")) {
          setErrors({
            paymentMethod: `"${formData.paymentMethod}" is not a valid payment method. Please select from the list.`,
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
        {typeof amount === "number" ? amount.toLocaleString() : "0"}
      </div>
    );
  };

  const handleBackToInventory = () => {
    router.push("/InventoryStock");
  };

  // Calculate profit
  const calculateProfit = () => {
    const cost = formData.cost || 0;
    const sellingPrice = formData.sellingPrice || 0;
    return sellingPrice - cost;
  };

  // Calculate balance due
  const calculateBalanceDue = () => {
    const soldPrice = formData.soldPrice || 0;
    const receivingAmount = formData.receivingAmount || 0;
    return soldPrice - receivingAmount;
  };

  // Calculate profit percentage
  const calculateProfitPercentage = () => {
    const cost = formData.cost || 0;
    const sellingPrice = formData.sellingPrice || 0;
    if (cost === 0) return 0;
    return ((sellingPrice - cost) / cost) * 100;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-600 font-medium mb-2">Error loading item</p>
            <p className="text-red-500 text-sm">{errors.fetch}</p>
          </div>
          <button
            onClick={handleBackToInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <p className="text-yellow-700 font-medium mb-2">Item not found</p>
            <p className="text-yellow-600 text-sm">
              The item with ID {itemId} could not be found.
            </p>
          </div>
          <button
            onClick={handleBackToInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button and device indicator */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToInventory}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                disabled={saving}
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Edit Inventory Item
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Update stock, cost, and brand details
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {isMobile ? (
                  <DevicePhoneMobileIcon className="w-4 h-4" />
                ) : (
                  <ComputerDesktopIcon className="w-4 h-4" />
                )}
                <span>{isMobile ? "Mobile View" : "Desktop View"}</span>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                <div className="text-xs text-blue-700">Item ID:</div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-blue-900">
                  {item?._id?.slice(-6) || itemId?.slice(-6) || "N/A"}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-lg px-2 py-1.5">
                <div className="text-xs text-purple-700">Category:</div>
                <div className="text-xs sm:text-sm font-semibold text-purple-900">
                  {formData.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Friendly Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Owner Friendly Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4" />
              Owner's Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Stock</div>
                <div className="text-lg font-bold text-blue-700">
                  {item?.quantity || 0} units
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Category</div>
                <div className="text-lg font-bold text-purple-700">
                  {formData.category}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Sold</div>
                <div className={`text-lg font-bold ${
                  item?.status === "SOLD" ? "text-green-700" : "text-gray-500"
                }`}>
                  {item?.status === "SOLD" ? "Yes" : "No"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-lg font-bold text-green-700">
                  {item?.status === "AVAILABLE" ? "Yes" : "No"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Purchase Cost</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(item?.cost || 0)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Sale Price</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(item?.sellingPrice || 0)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Profit</div>
                <div className={`text-lg font-bold ${
                  calculateProfit() >= 0 ? "text-green-700" : "text-red-700"
                }`}>
                  {formatCurrency(calculateProfit())}
                </div>
              </div>
            </div>
          </div>

          {/* Editor Information Section - Enhanced Design */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4" />
              Editor Information
            </h3>
            
            <div className="space-y-3">
              {/* Current Editor (You) */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                      <UserCircleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-700 font-medium">Current Editor</div>
                      <div className="text-sm font-bold text-gray-900">
                        {currentAdmin?.username || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {currentAdmin?.role || "Admin"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      ACTIVE NOW
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Editor */}
              {item?.lastEditedBy && (
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
                        <ClockIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Last Edited By</div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.lastEditedBy.username || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.lastEditedBy.role || "Admin"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                        {formatRelativeTime(item.lastEditedAt)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(item.lastEditedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit History Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-200 p-1 rounded">
                      <ShoppingBagIcon className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-gray-600">Edit Count</div>
                      <div className="font-medium text-gray-900">
                        {item?.editHistory?.length || 1} {item?.editHistory?.length === 1 ? 'time' : 'times'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-600">First Edit</div>
                    <div className="font-medium text-gray-900">
                      {item?.createdAt ? formatDateOnly(item.createdAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Status</h3>
              <div className="flex items-center gap-3">
                <div className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  item?.status === "AVAILABLE"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : item?.status === "SOLD"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}>
                  {item?.status
                    ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                    : "Unknown"}
                </div>
                {item?.status === "SOLD" && item?.soldAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    Sold on: {formatDateOnly(item.soldAt)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Cost Value</div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency((item?.cost || 0) * (item?.quantity || 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Sale Value</div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency((item?.sellingPrice || 0) * (item?.quantity || 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Stock Value</div>
                <div className="text-sm font-bold text-blue-700">
                  {item?.quantity || 0} units
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Profit %</div>
                <div className={`text-sm font-bold ${
                  calculateProfitPercentage() >= 0 ? "text-green-700" : "text-red-700"
                }`}>
                  {calculateProfitPercentage().toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Form Sections */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2">
                  Product Information
                </h3>

                <div className="space-y-4">
                  {/* Brand with Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={brandSearch || formData.brand}
                          onChange={(e) => {
                            setBrandSearch(e.target.value);
                            setShowBrandDropdown(true);
                          }}
                          onFocus={() => setShowBrandDropdown(true)}
                          placeholder="Search or select brand..."
                          className={`w-full pl-10 pr-10 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                            errors.brand
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {formData.brand && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, brand: "" }));
                              setBrandSearch("");
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </div>

                      {showBrandDropdown && filteredBrands.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 md:max-h-60 overflow-y-auto">
                          {filteredBrands.map((brand) => (
                            <div
                              key={brand}
                              onClick={() => handleBrandSelect(brand)}
                              className={`px-3 py-2 md:px-4 md:py-3 cursor-pointer hover:bg-blue-50 text-sm md:text-base ${
                                formData.brand === brand
                                  ? "bg-blue-50 text-blue-600"
                                  : ""
                              }`}
                            >
                              {brand}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.brand && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                          errors.productName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.productName && (
                        <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                          <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                          {errors.productName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base appearance-none ${
                            errors.category
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.category && (
                        <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                          <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                          className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                            errors.quantity
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                            {errors.quantity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleStatusChange}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                        >
                          <option value="AVAILABLE">🟢 Available</option>
                          <option value="SOLD">🟡 Sold</option>
                          <option value="AUCTION">🟣 Auction</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2">
                  Pricing Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <BanknotesIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                          errors.cost
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.cost && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                        {errors.cost}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                          errors.sellingPrice
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.sellingPrice && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                        <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                        {errors.sellingPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profit Summary
                    </label>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3">
                      <div className="text-sm md:text-base text-gray-900 font-bold mb-1">
                        {calculateProfitPercentage().toFixed(2)}% Margin
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">Profit:</div>
                        <div className={`text-xs font-bold ${
                          calculateProfit() >= 0 ? "text-green-700" : "text-red-700"
                        }`}>
                          {formatCurrency(calculateProfit())}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sale Information (Only for SOLD/AUCTION) */}
              {(formData.status === "SOLD" || formData.status === "AUCTION") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Sale Information
                    </h3>
                    <button
                      type="button"
                      onClick={clearSaleInformation}
                      className="text-xs md:text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sold Price
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <img
                              src={newCurrency.src}
                              alt="Currency"
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                          </div>
                          <input
                            type="number"
                            name="soldPrice"
                            value={formData.soldPrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                              errors.soldPrice
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.soldPrice && (
                          <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                            {errors.soldPrice}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                        >
                          <option value="cash">💵 Cash</option>
                          <option value="stripe">💳 Stripe</option>
                          <option value="tabby">🏦 Tabby</option>
                          <option value="chrono">⌚ Chrono</option>
                          <option value="bank_transfer">
                            🏛️ Bank Transfer
                          </option>
                          <option value="other">📄 Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Received
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <img
                              src={newCurrency.src}
                              alt="Currency"
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                          </div>
                          <input
                            type="number"
                            name="receivingAmount"
                            value={formData.receivingAmount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base ${
                              errors.receivingAmount
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.receivingAmount && (
                          <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4" />
                            {errors.receivingAmount}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sold Date
                        </label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            name="soldAt"
                            value={formData.soldAt}
                            onChange={handleChange}
                            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base bg-gray-50"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Will be sent as M/D/YYYY format (e.g., 12/8/2025)
                        </p>
                      </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Balance Due</div>
                          <div className={`text-lg font-bold ${
                            calculateBalanceDue() > 0 ? "text-red-700" : "text-green-700"
                          }`}>
                            {formatCurrency(calculateBalanceDue())}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Sale Status</div>
                          <div className={`text-sm font-semibold px-2 py-1 rounded-full inline-block ${
                            calculateBalanceDue() === 0 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {calculateBalanceDue() === 0 ? "Fully Paid" : "Partial Payment"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs md:text-sm text-gray-600 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        Object.keys(errors).length === 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <span>
                      {Object.keys(errors).length === 0
                        ? "All fields are valid"
                        : `${Object.keys(errors).length} error(s) need attention`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Editor: <strong>{currentAdmin?.username || "Unknown"}</strong></span>
                    <span>•</span>
                    <span>Time: <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    <span>•</span>
                    <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span>Category: <strong>{formData.category}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onCancel || handleBackToInventory}
                    className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow text-sm md:text-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        <span className="hidden sm:inline">Saving Changes...</span>
                        <span className="sm:hidden">Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Save & Update Item</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Mobile Quick Actions */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                <div className="font-medium">{currentAdmin?.username || "Admin"}</div>
                <div className="text-gray-500">Editing • {formData.category}</div>
              </div>
              <button
                type="submit"
                form="edit-form"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Save...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add custom styles for Toastify */}
      <style jsx global>{`
        .toastify-custom {
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px 20px;
          font-weight: 500;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .toastify-custom {
            margin: 10px;
            width: calc(100% - 20px);
            font-size: 13px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default EditItemPage;