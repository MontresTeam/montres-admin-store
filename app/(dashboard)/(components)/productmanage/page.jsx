"use client";
import { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiClock,
  FiCalendar,
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
  
  // Schedule publishing states
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  const loadProducts = async () => {
    setLoading(true);

    const { data, error } = await fetchProduct({
      page,
      limit,
      search: searchTerm,
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

    setLoading(false);
  };


  const safeToLowerCase = (value) => {
    return String(value || '').toLowerCase();
  };

  // Helper function to get category name
  const getCategoryName = (product) => {
    return product.category || product.category ||  "Uncategorized";
  };


  // Helper function to check if product matches search term
  const productMatchesSearch = (product, searchTerm) => {
    if (!searchTerm) return true;
    
    const term = safeToLowerCase(searchTerm);
    
    return (
      safeToLowerCase(product.name).includes(term) ||
      safeToLowerCase(getCategoryName(product)).includes(term) ||
      (product.brands && Array.isArray(product.brands) && 
       product.brands.some(brand => safeToLowerCase(brand).includes(term))) ||
      (product.tags && Array.isArray(product.tags) && 
       product.tags.some(tag => safeToLowerCase(tag).includes(term))) ||
      safeToLowerCase(product.sku).includes(term)
    );
  };

  // Calculate total value function
  const calculateTotalValue = () => {
    return products.reduce((sum, product) => {
      const price = product.salePrice || product.price || 0;
      const stock = product.stockQuantity || product.stock || 0;
      return sum + (price * stock);
    }, 0);
  };

  // Handle delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const { error } = await deleteProduct(id);
      
      if (!error) {
        // Remove product from local state
        setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
        
        // Show success message
        Toastify({
          text: "Product deleted successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#10B981",
          stopOnFocus: true,
        }).showToast();
        
        // Reload products to sync with server
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

  const handleAdd = () => {
    router.push(`/AddProduct`);
  };

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm]);

  const handleEdit = (id) => {
    router.push(`/ProductEditPage/${id}`);
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
        'publishSchedule.status': 'scheduled'
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
        loadProducts(); // Refresh the list
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
        'publishSchedule.publishDate': null
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
        'publishSchedule.publishDate': new Date()
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
        'publishSchedule.publishDate': null
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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    }

    const { scheduledPublish, publishDate, status } = product.publishSchedule;
    
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCalendar className="mr-1" />
          Published
        </span>
      );
    }

    if (scheduledPublish && status === 'scheduled') {
      const now = new Date();
      const publishDateObj = new Date(publishDate);
      
      if (publishDateObj <= now) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiClock className="mr-1" />
            Publishing...
          </span>
        );
      }
      
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FiClock className="mr-1" />
          Scheduled: {publishDateObj.toLocaleDateString()}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Draft
      </span>
    );
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    productMatchesSearch(product, searchTerm)
  );

  // Auto switch to mobile view on smaller screens
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get scheduled products count for stats
  const scheduledProductsCount = products.filter(
    product => product.publishSchedule?.status === 'scheduled'
  ).length;

  const publishedProductsCount = products.filter(
    product => product.publishSchedule?.status === 'published'
  ).length;

  return (
    <>
      <DashboardBreadcrumb text="Product Management" />
      <div className="min-h-screen bg-gradient-to-br p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Product Management
                </h1>
                <p className="">
                  Manage your products, inventory, pricing, and publishing schedule
                </p>
              </div>

              <Button
                onClick={handleAdd}
                className="flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlus className="mr-2 text-lg" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold mt-1">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiPlus className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-3xl font-bold mt-1">{publishedProductsCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiCalendar className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Scheduled</p>
                  <p className="text-3xl font-bold mt-1">{scheduledProductsCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FiClock className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Value</p>
                  <p className="text-3xl font-bold mt-1">
                    {calculateTotalValue().toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Image 
                    src={newCurrency} 
                    alt="Currency Symbol" 
                    width={24} 
                    height={24}
                    className="text-purple-600 text-xl font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FiFilter className="mr-2" />
                Filter
              </button>
            </div>
          </div>

          {/* Schedule Publishing Modal */}
          {scheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Schedule Product Publishing</h3>
                <p className="text-gray-600 mb-4">Set when you want this product to be published automatically.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleSchedulePublish(scheduleModal)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <FiClock className="mr-2" />
                    Schedule Publishing
                  </Button>
                  <Button
                    onClick={() => setScheduleModal(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table/Cards */}
          <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Schedule
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product, i) => (
                    <tr 
                      key={product._id || i} 
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.image || "/placeholder.png"}
                            alt={product.name || "Product image"}
                            unoptimized   // <--- bypasses Vercel
                            width={50}
                            height={50}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                          />
                          <div>
                            <span className="font-medium text-gray-900 block">{product.name}</span>
                            <span className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getCategoryName(product)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 flex items-center">
                            <Image 
                              src={newCurrency} 
                              alt="Currency" 
                              width={16} 
                              height={16}
                              className="mr-1"
                            />
                            {product.salePrice || product.price || 0}
                          </span>
                          {product.salePrice && product.price && product.salePrice < product.price && (
                            <span className="text-sm text-gray-500 line-through flex items-center">
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
                      <td className="py-4 px-6">
                        <span className={`font-medium ${
                          (product.stockQuantity || product.stock) < 10 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.stockQuantity || product.stock || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (product.stockQuantity || product.stock) > 15
                              ? "bg-green-100 text-green-800"
                              : (product.stockQuantity || product.stock) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(product.stockQuantity || product.stock) > 15
                            ? "In Stock"
                            : (product.stockQuantity || product.stock) > 0
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getScheduleBadge(product)}
                      </td>
                      <td className="py-4 px-6 relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === product._id ? null : product._id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FiMoreVertical className="text-gray-600" />
                        </button>

                        {dropdownOpen === product._id && (
                          <div className="absolute right-6 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            {/* Edit Option */}
                            <button
                              onClick={() => {
                                handleEdit(product._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiEdit className="mr-3 text-gray-500" />
                              Edit Product
                            </button>
                            
                            {/* Publishing Options */}
                            {(!product.publishSchedule || product.publishSchedule.status === 'draft') && (
                              <>
                                <button
                                  onClick={() => {
                                    setScheduleModal(product._id);
                                    setScheduleDate("");
                                    setScheduleTime("12:00");
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <FiClock className="mr-3" />
                                  Schedule Publishing
                                </button>
                                <button
                                  onClick={() => {
                                    handlePublishNow(product._id);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center w-full px-4 py-3 text-left text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <FiCalendar className="mr-3" />
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
                                className="flex items-center w-full px-4 py-3 text-left text-orange-600 hover:bg-orange-50 transition-colors"
                              >
                                <FiClock className="mr-3" />
                                Cancel Schedule
                              </button>
                            )}
                            
                            {product.publishSchedule?.status === 'published' && (
                              <button
                                onClick={() => {
                                  handleUnpublish(product._id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                <FiCalendar className="mr-3" />
                                Unpublish
                              </button>
                            )}
                            
                            {/* Delete Option */}
                            <button
                              onClick={() => {
                                handleDelete(product._id);
                              }}
                              className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                            >
                              <FiTrash2 className="mr-3" />
                              Delete Product
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {filteredProducts.length} of {totalProducts} products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </Button>

                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>

                  <Button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    variant="outline"
                    className="px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="p-4 space-y-4">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product._id || i}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image || "/placeholder.png"}
                          alt={product.name || "Product image"}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getCategoryName(product)}
                            </span>
                            {getScheduleBadge(product)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === product._id ? null : product._id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiMoreVertical className="text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Price</p>
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
                      </div>
                      <div>
                        <p className="text-gray-600">Stock</p>
                        <p className="font-semibold text-gray-900">
                          {product.stockQuantity || product.stock || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (product.stockQuantity || product.stock) > 15
                              ? "bg-green-100 text-green-800"
                              : (product.stockQuantity || product.stock) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(product.stockQuantity || product.stock) > 15
                            ? "In Stock"
                            : (product.stockQuantity || product.stock) > 0
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {dropdownOpen === product._id && (
                      <div className="mt-3 border-t border-gray-200 pt-3 space-y-1">
                        <button
                          onClick={() => {
                            handleEdit(product._id);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                              className="flex items-center w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiClock className="mr-2" />
                              Schedule Publishing
                            </button>
                            <button
                              onClick={() => {
                                handlePublishNow(product._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-left text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                            className="flex items-center w-full px-3 py-2 text-left text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
                            className="flex items-center w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <FiCalendar className="mr-2" />
                            Unpublish
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            handleDelete(product._id);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="mr-2" />
                          Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first product."}
                </p>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add Your First Product
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading products...
                </h3>
                <p className="text-gray-600">Please wait while we fetch your products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductManagement;