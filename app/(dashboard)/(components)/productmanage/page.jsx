"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiClock,
  FiCalendar,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiWatch,
  FiShoppingBag,
  FiStar,
  FiAward,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiGrid,
  FiTag,
  FiTrendingUp,
  FiLayers,
  FiBox
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { fetchProduct, deleteProduct, updateProduct } from "@/service/productService";
import newCurrency from '../../../../public/assets/newSymbole.png';
import Image from "next/image";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const ProductManagement = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 15;
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState(false);
  const [searchField, setSearchField] = useState("all"); 
  const [isAllowed, setIsAllowed] = useState(false);
  const [checked, setChecked] = useState(false); 

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


  



  // Timeline sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  
  // Schedule publishing states
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  // Date details modal state
  const [dateDetailsModal, setDateDetailsModal] = useState(null);

  // Product categories - standardized format
  const productCategories = [
    {
      id: 'watches',
      name: 'Watches',
      icon: FiWatch,
      description: 'Luxury watches collection',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/AddProduct'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: FiShoppingBag,
      description: 'Watch accessories',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/AddAccessories'
    },
    {
      id: 'leather-goods',
      name: 'Leather Goods',
      icon: FiPackage,
      description: 'Premium leather items',
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      route: '/AddLeatherGoods'
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      icon: FiStar,
      description: 'Fine jewelry collection',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      route: '/AddJewelry'
    },
    {
      id: 'gold',
      name: 'Gold Items',
      icon: FiAward,
      description: 'Gold & precious metals',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      route: '/AddGold'
    }
  ];

  // Search field options
  const searchOptions = [
    { value: "all", label: "All Fields", icon: FiGrid },
    { value: "name", label: "Product Name", icon: FiTag },
    { value: "sku", label: "SKU", icon: FiBox },
    { value: "brand", label: "Brand", icon: FiTrendingUp },
    { value: "model", label: "Model", icon: FiLayers },
    { value: "ref", label: "Ref No.", icon: FiPackage }
  ];

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProduct({
        page,
        limit,
        search: searchTerm,
        searchField: searchField === "all" ? undefined : searchField,
      });

      if (!error && data) {
        setPage(data.currentPage);
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
      } else {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, searchField]);

  const safeToLowerCase = (value) => {
    return String(value || '').toLowerCase();
  };

  // Get category name with fallback
  const getCategoryName = (product) => {
    return product.category || product.category || "Uncategorized";
  };

  // Enhanced search function with multiple fields
  const productMatchesSearch = (product, term) => {
    if (!term) return true;
    
    const searchTerm = safeToLowerCase(term);
    
    // Always search these basic fields
    const basicSearch = (
      safeToLowerCase(product.name).includes(searchTerm) ||
      safeToLowerCase(product.sku).includes(searchTerm) ||
      safeToLowerCase(getCategoryName(product)).includes(searchTerm)
    );
    
    // If searchField is "all", search all possible fields
    if (searchField === "all") {
      return (
        basicSearch ||
        (product.brand && safeToLowerCase(product.brand).includes(searchTerm)) ||
        (product.model && safeToLowerCase(product.model).includes(searchTerm)) ||
        (product.referenceNumber && safeToLowerCase(product.referenceNumber).includes(searchTerm)) ||
        (product.brands && Array.isArray(product.brands) && 
         product.brands.some(brand => safeToLowerCase(brand).includes(searchTerm))) ||
        (product.tags && Array.isArray(product.tags) && 
         product.tags.some(tag => safeToLowerCase(tag).includes(searchTerm)))
      );
    }
    
    // Search specific field based on searchField
    switch (searchField) {
      case "name":
        return safeToLowerCase(product.name).includes(searchTerm);
      case "sku":
        return safeToLowerCase(product.sku).includes(searchTerm);
      case "brand":
        return (
          (product.brand && safeToLowerCase(product.brand).includes(searchTerm)) ||
          (product.brands && Array.isArray(product.brands) && 
           product.brands.some(brand => safeToLowerCase(brand).includes(searchTerm)))
        );
      case "model":
        return product.model && safeToLowerCase(product.model).includes(searchTerm);
      case "ref":
        return product.referenceNumber && safeToLowerCase(product.referenceNumber).includes(searchTerm);
      default:
        return basicSearch;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sortable date
  const getSortableDate = (dateString) => {
    if (!dateString) return new Date(0);
    return new Date(dateString);
  };

  // Calculate time since creation/update (mobile friendly)
  const getTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return "<1h";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      const diffInMonths = diffInDays / 30;
      return `${Math.floor(diffInMonths)}mo`;
    }
  };

  // Handle sort request
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FiArrowUp className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />;
  };

  // Sort products based on criteria
  const sortedProducts = useMemo(() => {
    const filtered = products.filter(product => 
      productMatchesSearch(product, searchTerm)
    );

    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'createdAt':
          aValue = getSortableDate(a.createdAt);
          bValue = getSortableDate(b.createdAt);
          break;
        case 'updatedAt':
          aValue = getSortableDate(a.updatedAt);
          bValue = getSortableDate(b.updatedAt);
          break;
        case 'publishDate':
          aValue = getSortableDate(a.publishSchedule?.publishDate);
          bValue = getSortableDate(b.publishSchedule?.publishDate);
          break;
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'price':
          aValue = a.salePrice || a.price || 0;
          bValue = b.salePrice || b.price || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, searchField, sortConfig]);

  // Handle add product
  const handleAddProduct = (category) => {
    router.push(category.route);
  };

  // Handle delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const { error } = await deleteProduct(id);
      
      if (!error) {
        setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
        
        Toastify({
          text: "Product deleted successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
          stopOnFocus: true,
        }).showToast();
        
        loadProducts();
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Toastify({
        text: "Failed to delete product. Please try again.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
        stopOnFocus: true,
      }).showToast();
    }
    
    setDropdownOpen(null);
  };

  // Handle edit product
  const handleEdit = (id) => {
    const product = products.find(p => p._id === id);
    if (!product) {
      console.warn(`Product with ID ${id} not found`);
      return;
    }

    // Accessories SKUs
    const accessoriesSKUs = ["MON0056", "MON0270"];
    
    // Forced Leather SKUs
    const forcedLeatherSKUs = ["MON0044", "MON0042", "MON0295", "MON0300"];
    
    // Check SKU first
    if (accessoriesSKUs.includes(product.sku)) {
      router.push(`/AccessoriesEdit/${id}`);
      return;
    }
    
    if (forcedLeatherSKUs.includes(product.sku)) {
      router.push(`/LeatherGoodsEdit/${id}`);
      return;
    }

    // Check category or name
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    
    const leatherKeywords = ["bag", "wallet", "holder", "card", "leather", "case"];
    const isLeatherGoods = leatherKeywords.some(keyword => 
      name.includes(keyword) || category.includes(keyword)
    );

    const accessoriesKeywords = ["accessories", "accessory", "strap", "band", "cover", "case"];
    const isAccessories = accessoriesKeywords.some(keyword =>
      name.includes(keyword) || category.includes(keyword)
    );

    if (isAccessories) {
      router.push(`/AccessoriesEdit/${id}`);
    } else if (isLeatherGoods) {
      router.push(`/LeatherGoodsEdit/${id}`);
    } else {
      router.push(`/ProductEditPage/${id}`);
    }
  };

  // View date details
  const handleViewDateDetails = (product) => {
    setDateDetailsModal(product);
  };

  // Schedule product publishing
  const handleSchedulePublish = async (productId) => {
    if (!scheduleDate) {
      Toastify({
        text: "Please select a date and time",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
      return;
    }

    const publishDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    if (publishDateTime <= new Date()) {
      Toastify({
        text: "Please select a future date and time",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
      return;
    }

    try {
      const { error } = await updateProduct(productId, {
        'publishSchedule.scheduledPublish': true,
        'publishSchedule.publishDate': publishDateTime,
        'publishSchedule.status': 'scheduled',
        updatedAt: new Date().toISOString()
      });

      if (!error) {
        Toastify({
          text: `Product scheduled for ${publishDateTime.toLocaleString()}`,
          duration: 4000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
        }).showToast();
        
        setScheduleModal(null);
        loadProducts();
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error scheduling product:", error);
      Toastify({
        text: "Failed to schedule product",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
    }
  };

  // Cancel scheduled publishing
  const handleCancelSchedule = async (productId) => {
    try {
      const { error } = await updateProduct(productId, {
        'publishSchedule.scheduledPublish': false,
        'publishSchedule.status': 'draft',
        'publishSchedule.publishDate': null,
        updatedAt: new Date().toISOString()
      });

      if (!error) {
        Toastify({
          text: "Schedule cancelled successfully",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
        }).showToast();
        loadProducts();
      }
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      Toastify({
        text: "Failed to cancel schedule",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
    }
  };

  // Publish product immediately
  const handlePublishNow = async (productId) => {
    try {
      const { error } = await updateProduct(productId, {
        'publishSchedule.scheduledPublish': false,
        'publishSchedule.status': 'published',
        'publishSchedule.publishDate': new Date(),
        updatedAt: new Date().toISOString()
      });

      if (!error) {
        Toastify({
          text: "Product published successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
        }).showToast();
        loadProducts();
      }
    } catch (error) {
      console.error("Error publishing product:", error);
      Toastify({
        text: "Failed to publish product",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
    }
  };

  // Unpublish product
  const handleUnpublish = async (productId) => {
    try {
      const { error } = await updateProduct(productId, {
        'publishSchedule.scheduledPublish': false,
        'publishSchedule.status': 'draft',
        'publishSchedule.publishDate': null,
        updatedAt: new Date().toISOString()
      });

      if (!error) {
        Toastify({
          text: "Product unpublished successfully",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
        }).showToast();
        loadProducts();
      }
    } catch (error) {
      console.error("Error unpublishing product:", error);
      Toastify({
        text: "Failed to unpublish product",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
      }).showToast();
    }
  };

  // Get schedule status badge
  const getScheduleBadge = (product) => {
    if (!product.publishSchedule) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    }

    const { scheduledPublish, publishDate, status } = product.publishSchedule;
    
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCalendar className="mr-1 w-3 h-3" />
          Published
        </span>
      );
    }

    if (scheduledPublish && status === 'scheduled') {
      const now = new Date();
      const publishDateObj = new Date(publishDate);
      
      if (publishDateObj <= now) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiClock className="mr-1 w-3 h-3" />
            Publishing...
          </span>
        );
      }
      
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FiClock className="mr-1 w-3 h-3" />
          Scheduled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Draft
      </span>
    );
  };

  // Get stock status badge
  const getStockBadge = (product) => {
    const stock = product.stockQuantity || product.stock || 0;
    
    if (stock > 15) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    } else if (stock > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    }
  };

  // Mobile optimization
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  // Get scheduled products count for stats
  const scheduledProductsCount = products.filter(
    product => product.publishSchedule?.status === 'scheduled'
  ).length;

  const publishedProductsCount = products.filter(
    product => product.publishSchedule?.status === 'published'
  ).length;

  // Get recently added products (last 7 days)
  const recentProductsCount = products.filter(product => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length;

  // Calculate low stock products
  const lowStockProductsCount = products.filter(product => {
    const stock = product.stockQuantity || product.stock || 0;
    return stock > 0 && stock <= 15;
  }).length;

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm, searchField, loadProducts]);

  // Mobile-friendly pagination component
  const MobilePagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white">
      <div className="text-xs sm:text-sm text-gray-600">
        Showing {sortedProducts.length} of {totalProducts}
      </div>
      <div className="flex items-center gap-1">
        <Button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <FiChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center">
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (page === 1) {
              pageNum = i + 1;
            } else if (page === totalPages) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            
            return (
              <Button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <FiChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DashboardBreadcrumb text="Product Management" />
      <div className="min-h-screen bg-gradient-to-br p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Product Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your products, inventory, and publishing schedule
                </p>
              </div>
            </div>

            {/* Category Selection Cards - Standardized Format */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
                <span className="text-sm text-gray-500">Select category</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {productCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleAddProduct(category)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] text-white ${category.color}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                        <IconComponent className="text-xl" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base mb-1">{category.name}</span>
                      <span className="text-xs text-white/80 text-center leading-tight">{category.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FiPackage className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Products</p>
                    <p className="text-xl font-bold">{totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FiCalendar className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Published</p>
                    <p className="text-xl font-bold">{publishedProductsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <FiClock className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Scheduled</p>
                    <p className="text-xl font-bold">{scheduledProductsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <FiTrendingUp className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Low Stock</p>
                    <p className="text-xl font-bold">{lowStockProductsCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Field Selector */}
                <div className="relative flex-shrink-0">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="appearance-none w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    {searchOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {(() => {
                      const option = searchOptions.find(opt => opt.value === searchField);
                      const Icon = option?.icon || FiGrid;
                      return <Icon className="text-gray-400 text-sm" />;
                    })()}
                  </div>
                  <FiArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>

                {/* Search Input */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder={`Search by ${searchOptions.find(opt => opt.value === searchField)?.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="text-sm" />
                    </button>
                  )}
                </div>

                <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <FiFilter className="mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Modals */}
          {scheduleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm sm:max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Schedule Publishing</h3>
                  <button
                    onClick={() => setScheduleModal(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-4">Set when this product should be published.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleSchedulePublish(scheduleModal)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                  >
                    <FiClock className="mr-2" />
                    Schedule
                  </Button>
                  <Button
                    onClick={() => setScheduleModal(null)}
                    variant="outline"
                    className="flex-1 text-sm py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {dateDetailsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Product Timeline</h3>
                  <button
                    onClick={() => setDateDetailsModal(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-sm">Product:</span>
                    <span className="text-gray-900 text-sm">{dateDetailsModal.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-sm">SKU:</span>
                    <span className="text-gray-600 text-sm">{dateDetailsModal.sku}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-sm">Created:</span>
                    <div className="text-right">
                      <div className="text-gray-900 text-sm">{formatDate(dateDetailsModal.createdAt)}</div>
                      <div className="text-xs text-gray-500">{getTimeAgo(dateDetailsModal.createdAt)} ago</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-sm">Updated:</span>
                    <div className="text-right">
                      <div className="text-gray-900 text-sm">{formatDate(dateDetailsModal.updatedAt)}</div>
                      <div className="text-xs text-gray-500">{getTimeAgo(dateDetailsModal.updatedAt)} ago</div>
                    </div>
                  </div>
                  {dateDetailsModal.publishSchedule?.publishDate && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="font-medium text-sm">Scheduled:</span>
                      <div className="text-right">
                        <div className="text-gray-900 text-sm">{formatDate(dateDetailsModal.publishSchedule.publishDate)}</div>
                        <div className="text-xs text-gray-500">{getTimeAgo(dateDetailsModal.publishSchedule.publishDate)} ago</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setDateDetailsModal(null)}
                    className="flex-1 text-sm py-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table/Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Product
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Price
                        {getSortIcon('price')}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Created
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedProducts.map((product, i) => (
                    <tr 
                      key={product._id || i} 
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <Image
                              src={product.image || "/placeholder.png"}
                              alt={product.name || "Product image"}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate">
                              SKU: {product.sku}
                            </div>
                            {product.brand && (
                              <div className="text-xs text-gray-500 truncate">
                                Brand: {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getCategoryName(product)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 flex items-center text-sm">
                            <Image 
                              src={newCurrency} 
                              alt="Currency" 
                              width={14} 
                              height={14}
                              className="mr-1"
                            />
                            {product.salePrice || product.price || 0}
                          </span>
                          {product.salePrice && product.price && product.salePrice < product.price && (
                            <span className="text-xs text-gray-500 line-through flex items-center">
                              <Image 
                                src={newCurrency} 
                                alt="Currency" 
                                width={12} 
                                height={12}
                                className="mr-1"
                              />
                              {product.price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`font-medium text-sm ${
                            (product.stockQuantity || product.stock) < 10 ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {product.stockQuantity || product.stock || 0}
                          </span>
                          {getStockBadge(product)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDateDetails(product)}
                          className="text-left hover:text-blue-600 transition-colors group"
                        >
                          <div className="text-sm font-medium group-hover:text-blue-600">
                            {getTimeAgo(product.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(product.createdAt)}
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {getScheduleBadge(product)}
                        </div>
                      </td>
                      <td className="py-3 px-4 relative dropdown-container">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === product._id ? null : product._id
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FiMoreVertical className="text-gray-600 w-5 h-5" />
                        </button>

                        {dropdownOpen === product._id && (
                          <div className="absolute right-3 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                handleViewDateDetails(product);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <FiEye className="mr-2 text-gray-500" />
                              View Timeline
                            </button>

                            <button
                              onClick={() => {
                                handleEdit(product._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <FiEdit className="mr-2 text-gray-500" />
                              Edit Product
                            </button>
                            
                            {(!product.publishSchedule || product.publishSchedule.status === 'draft') && (
                              <>
                                <button
                                  onClick={() => {
                                    setScheduleModal(product._id);
                                    setScheduleDate("");
                                    setScheduleTime("12:00");
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2.5 text-left text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                                >
                                  <FiClock className="mr-2" />
                                  Schedule
                                </button>
                                <button
                                  onClick={() => {
                                    handlePublishNow(product._id);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2.5 text-left text-green-600 hover:bg-green-50 transition-colors text-sm"
                                >
                                  <FiCalendar className="mr-2" />
                                  Publish Now
                                </button>
                              </>
                            )}
                            
                            {product.publishSchedule?.status === 'scheduled' && (
                              <button
                                onClick={() => {
                                  handleCancelSchedule(product._id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-3 py-2.5 text-left text-orange-600 hover:bg-orange-50 transition-colors text-sm"
                              >
                                <FiClock className="mr-2" />
                                Cancel Schedule
                              </button>
                            )}
                            
                            {product.publishSchedule?.status === 'published' && (
                              <button
                                onClick={() => {
                                  handleUnpublish(product._id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-3 py-2.5 text-left text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                              >
                                <FiCalendar className="mr-2" />
                                Unpublish
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                handleDelete(product._id);
                              }}
                              className="flex items-center w-full px-3 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-100"
                            >
                              <FiTrash2 className="mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Desktop Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {sortedProducts.length} of {totalProducts} products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 text-sm"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Card View - Enhanced for better clarity */}
            <div className="lg:hidden">
              <div className="p-3 space-y-3">
                {sortedProducts.map((product, i) => (
                  <div
                    key={product._id || i}
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image
                            src={product.image || "/placeholder.png"}
                            alt={product.name || "Product image"}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1 mb-2">
                            <span className="text-xs text-gray-500">
                              SKU: {product.sku}
                            </span>
                            {product.brand && (
                              <span className="text-xs text-gray-500">
                                • Brand: {product.brand}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getCategoryName(product)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative dropdown-container">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === product._id ? null : product._id
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FiMoreVertical className="text-gray-600 w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Product Details Grid - Better organized */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Price</p>
                          <p className="font-semibold text-gray-900 flex items-center">
                            <Image 
                              src={newCurrency} 
                              alt="Currency" 
                              width={14} 
                              height={14}
                              className="mr-1"
                            />
                            {product.salePrice || product.price || 0}
                          </p>
                          {product.salePrice && product.price && product.salePrice < product.price && (
                            <p className="text-xs text-gray-500 line-through flex items-center mt-1">
                              <Image 
                                src={newCurrency} 
                                alt="Currency" 
                                width={12} 
                                height={12}
                                className="mr-1"
                              />
                              {product.price}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Stock</p>
                          <p className="font-semibold text-gray-900">
                            {product.stockQuantity || product.stock || 0}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Created</p>
                          <button
                            onClick={() => handleViewDateDetails(product)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="font-semibold text-gray-900">
                              {getTimeAgo(product.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {formatDate(product.createdAt)}
                            </p>
                          </button>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Updated</p>
                          <button
                            onClick={() => handleViewDateDetails(product)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <p className="font-semibold text-gray-900">
                              {getTimeAgo(product.updatedAt)}
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getStockBadge(product)}
                      {getScheduleBadge(product)}
                    </div>

                    {/* Dropdown Menu for Mobile */}
                    {dropdownOpen === product._id && (
                      <div className="mt-4 border-t border-gray-200 pt-4 space-y-1">
                        <button
                          onClick={() => {
                            handleViewDateDetails(product);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                          <FiEye className="mr-2 text-gray-500" />
                          View Timeline
                        </button>

                        <button
                          onClick={() => {
                            handleEdit(product._id);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                          <FiEdit className="mr-2 text-gray-500" />
                          Edit Product
                        </button>
                        
                        {(!product.publishSchedule || product.publishSchedule.status === 'draft') && (
                          <>
                            <button
                              onClick={() => {
                                setScheduleModal(product._id);
                                setScheduleDate("");
                                setScheduleTime("12:00");
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                            >
                              <FiClock className="mr-2" />
                              Schedule Publishing
                            </button>
                            <button
                              onClick={() => {
                                handlePublishNow(product._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-left text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                            >
                              <FiCalendar className="mr-2" />
                              Publish Now
                            </button>
                          </>
                        )}
                        
                        {product.publishSchedule?.status === 'scheduled' && (
                          <button
                            onClick={() => {
                              handleCancelSchedule(product._id);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center w-full px-3 py-2 text-left text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm"
                          >
                            <FiClock className="mr-2" />
                            Cancel Schedule
                          </button>
                        )}
                        
                        {product.publishSchedule?.status === 'published' && (
                          <button
                            onClick={() => {
                              handleUnpublish(product._id);
                              setDropdownOpen(null);
                            }}
                            className="flex items-center w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                          >
                            <FiCalendar className="mr-2" />
                            Unpublish
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            handleDelete(product._id);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          <FiTrash2 className="mr-2" />
                          Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Mobile Pagination */}
              <MobilePagination />
            </div>

            {/* Empty State */}
            {sortedProducts.length === 0 && !loading && (
              <div className="py-12 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No products matching "${searchTerm}" in ${searchOptions.find(opt => opt.value === searchField)?.label.toLowerCase()}.` 
                    : "Get started by adding your first product."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {productCategories.slice(0, 3).map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleAddProduct(category)}
                        className={`flex items-center px-3 py-2 rounded-lg text-white text-sm ${category.color}`}
                      >
                        <IconComponent className="mr-2" />
                        Add {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-12 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Loading products...
                </h3>
                <p className="text-gray-600 text-sm">Please wait while we fetch your products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductManagement;