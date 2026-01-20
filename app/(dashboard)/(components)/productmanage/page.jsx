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
  FiBox,
  FiRefreshCw,
  FiArchive,
  FiPlus,
  FiList
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { fetchProduct, deleteProduct, updateProduct, moveToInventory } from "@/service/productService";
import newCurrency from '../../../../public/assets/newSymbole.png';
import Image from "next/image";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const ProductManagement = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 15;
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [isAllowed, setIsAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  // Move to inventory loading state
  const [movingToInventory, setMovingToInventory] = useState(null);

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
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleProductId, setScheduleProductId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  // Date details modal state
  const [dateDetailsModalOpen, setDateDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      return <FiArrowUp className="opacity-30 ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? <FiArrowUp className="ml-2 h-4 w-4" /> : <FiArrowDown className="ml-2 h-4 w-4" />;
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
  };

  // Handle edit product
  const handleEdit = (id) => {
    const product = products.find(p => p._id === id);
    if (!product) {
      console.warn(`Product with ID ${id} not found`);
      return;
    }

    // Accessories SKUs
    const accessoriesSKUs = ["MON0056", "MON0270", " MON0416", "MON0475", "MON0480"];

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
    setSelectedProduct(product);
    setDateDetailsModalOpen(true);
  };

  // Schedule product publishing
  const handleSchedulePublish = async () => {
    const productId = scheduleProductId;
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

        setScheduleModalOpen(false);
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

  // Handle move to inventory
  const handleMoveToInventory = async (productId) => {
    setMovingToInventory(productId);

    try {
      const { data, error } = await moveToInventory({ productId });

      if (!error) {
        Toastify({
          text: `Product moved to inventory successfully! ${data.movedCount ? `(${data.movedCount} moved)` : ''}`,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
          stopOnFocus: true,
        }).showToast();

        // Refresh products list
        loadProducts();
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error moving to inventory:", error);
      Toastify({
        text: error.message || "Failed to move product to inventory",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#EF4444",
        stopOnFocus: true,
      }).showToast();
    } finally {
      setMovingToInventory(null);
    }
  };

  // Get schedule status badge
  const getScheduleBadge = (product) => {
    if (!product.publishSchedule) {
      return <Badge variant="secondary">Draft</Badge>;
    }

    const { scheduledPublish, publishDate, status } = product.publishSchedule;

    if (status === 'published') {
      return (
        <Badge variant="success" className="gap-1">
          <FiCalendar className="w-3 h-3" /> Published
        </Badge>
      );
    }

    if (scheduledPublish && status === 'scheduled') {
      const now = new Date();
      const publishDateObj = new Date(publishDate);

      if (publishDateObj <= now) {
        return (
          <Badge variant="info" className="gap-1">
            <FiClock className="w-3 h-3" /> Publishing...
          </Badge>
        );
      }

      return (
        <Badge variant="warning" className="gap-1">
          <FiClock className="w-3 h-3" /> Scheduled
        </Badge>
      );
    }

    return <Badge variant="secondary">Draft</Badge>;
  };

  // Get stock status badge
  const getStockBadge = (product) => {
    const stock = product.stockQuantity || product.stock || 0;

    if (stock > 15) {
      return <Badge variant="success">In Stock</Badge>;
    } else if (stock > 0) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="danger">Out of Stock</Badge>;
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

  // Get scheduled products count for stats
  const scheduledProductsCount = products.filter(
    product => product.publishSchedule?.status === 'scheduled'
  ).length;

  const publishedProductsCount = products.filter(
    product => product.publishSchedule?.status === 'published'
  ).length;

  // Calculate low stock products
  const lowStockProductsCount = products.filter(product => {
    const stock = product.stockQuantity || product.stock || 0;
    return stock > 0 && stock <= 15;
  }).length;

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm, searchField, loadProducts]);

  return (
    <>
      <DashboardBreadcrumb text="Product Management" />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 lg:p-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Product Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your products, inventory, and publishing schedule securely.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden md:flex">
              <FiRefreshCw className="mr-2 h-4 w-4" />
              Sync Inventory
            </Button>
            <Button className="hidden md:flex">
              <FiPlus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add New By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {productCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddProduct(category)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-md border-0 text-white transition-all ${category.color} relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconComponent className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-lg">{category.name}</span>
                    <span className="text-xs text-white/80 mt-1">{category.description}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-2">{totalProducts}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <FiPackage className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <h3 className="text-2xl font-bold mt-2">{publishedProductsCount}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <FiCalendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <h3 className="text-2xl font-bold mt-2">{scheduledProductsCount}</h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <FiClock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <h3 className="text-2xl font-bold mt-2">{lowStockProductsCount}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <FiTrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle>Inventory List</CardTitle>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Select value={searchField} onValueChange={setSearchField}>
                    <SelectTrigger className="w-[140px] border-none shadow-none bg-transparent h-9">
                      <SelectValue placeholder="Search field" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <div className="relative">
                    <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-none shadow-none bg-transparent h-9 pl-8 w-full md:w-[200px] focus-visible:ring-0"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <FiFilter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-xs uppercase" onClick={() => handleSort('name')}>
                        Product {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-xs uppercase" onClick={() => handleSort('price')}>
                        Price {getSortIcon('price')}
                      </Button>
                    </TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-xs uppercase" onClick={() => handleSort('createdAt')}>
                        Created {getSortIcon('createdAt')}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-slate-100">
                              <Image
                                src={product.image || "/placeholder.png"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-sm truncate max-w-[200px]" title={product.name}>{product.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {getCategoryName(product)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium flex items-center">
                            <Image src={newCurrency} alt="currency" width={10} height={10} className="mr-1" />
                            {product.salePrice || product.price || 0}
                          </div>
                          {product.salePrice && product.price && product.salePrice < product.price && (
                            <div className="text-xs text-muted-foreground line-through flex items-center">
                              <Image src={newCurrency} alt="currency" width={8} height={8} className="mr-1" />
                              {product.price}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{product.stockQuantity || product.stock || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => handleViewDateDetails(product)}>
                            {getTimeAgo(product.createdAt)} ago
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStockBadge(product)}
                            {getScheduleBadge(product)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FiMoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDateDetails(product)}>
                                <FiEye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(product._id)}>
                                <FiEdit className="mr-2 h-4 w-4" /> Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleMoveToInventory(product._id)} disabled={movingToInventory === product._id}>
                                {movingToInventory === product._id ? <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <FiArchive className="mr-2 h-4 w-4" />}
                                Move to Inventory
                              </DropdownMenuItem>

                              {/* Schedule Actions */}
                              {(!product.publishSchedule || product.publishSchedule.status === 'draft') && (
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setScheduleProductId(product._id);
                                    setScheduleDate("");
                                    setScheduleTime("12:00");
                                    setScheduleModalOpen(true);
                                  }}>
                                    <FiClock className="mr-2 h-4 w-4" /> Schedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePublishNow(product._id)}>
                                    <FiCalendar className="mr-2 h-4 w-4" /> Publish Now
                                  </DropdownMenuItem>
                                </>
                              )}

                              {product.publishSchedule?.status === 'scheduled' && (
                                <DropdownMenuItem onClick={() => handleCancelSchedule(product._id)}>
                                  <FiX className="mr-2 h-4 w-4" /> Cancel Schedule
                                </DropdownMenuItem>
                              )}

                              {product.publishSchedule?.status === 'published' && (
                                <DropdownMenuItem onClick={() => handleUnpublish(product._id)}>
                                  <FiArchive className="mr-2 h-4 w-4" /> Unpublish
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(product._id)} className="text-red-600 focus:text-red-600">
                                <FiTrash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No products found</div>
              ) : (
                sortedProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden">
                    <div className="flex p-4 gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-slate-100 shrink-0">
                        <Image
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm line-clamp-2 leading-tight">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2 -mt-2">
                                <FiMoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product._id)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDateDetails(product)}>View Stats</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(product._id)} className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-5">{getCategoryName(product)}</Badge>
                          {getStockBadge(product)}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center font-bold">
                            <Image src={newCurrency} alt="currency" width={12} height={12} className="mr-1" />
                            {product.salePrice || product.price || 0}
                          </div>
                          <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => handleEdit(product._id)}>
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t">
              <span className="text-sm text-muted-foreground w-full text-center sm:text-left">
                Showing {sortedProducts.length} of {totalProducts} products
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <FiChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <FiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Schedule Publishing Dialog */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Publishing</DialogTitle>
            <DialogDescription>
              Choose a date and time to automatically publish this product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <Input
                id="date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">Time</label>
              <Input
                id="time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSchedulePublish}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Details Dialog */}
      <Dialog open={dateDetailsModalOpen} onOpenChange={setDateDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product Timeline</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Product</span>
                <span className="text-sm">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Created</span>
                <div className="text-right">
                  <p className="text-sm">{formatDate(selectedProduct.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{getTimeAgo(selectedProduct.createdAt)} ago</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Last Updated</span>
                <div className="text-right">
                  <p className="text-sm">{formatDate(selectedProduct.updatedAt)}</p>
                  <p className="text-xs text-muted-foreground">{getTimeAgo(selectedProduct.updatedAt)} ago</p>
                </div>
              </div>
              {selectedProduct.publishSchedule?.publishDate && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Scheduled Publication</span>
                  <div className="text-right">
                    <p className="text-sm">{formatDate(selectedProduct.publishSchedule.publishDate)}</p>
                    <p className="text-xs text-muted-foreground">{selectedProduct.publishSchedule.status}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDateDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductManagement;