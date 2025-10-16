"use client";
import { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useRouter } from "next/navigation"; // ✅ import router
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { fetchProduct } from "@/service/productService";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Image from "next/image";

const ProductManagement = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 15;
  const router = useRouter(); // ✅ initialize router
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    setLoading(true); // show loading state

    // Call fetchProduct with page, limit, and search term
    const { data, error } = await fetchProduct({
      page,
      limit,
      search: searchTerm,
    });
    console.log(data);

    if (!error && data) {
      // Assuming API returns: { products: [...], total: 100 }
      setPage(data.currentPage);
      setProducts(data.products); // set products for current page
      setTotalPages(data.totalPages); // calculate total pages
      setTotalProducts(data.totalProducts);
    } else {
      console.error("Error fetching products:", error);
      setProducts([]); // clear products on error
      setTotalPages(1);
    }

    setLoading(false);
  };

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState(false);

  const handleAdd = () => {
    const newProduct = {
      id: products.length + 1,
      name: `Product ${String.fromCharCode(65 + products.length)}`,
      price: Math.floor(Math.random() * 300),
      stock: Math.floor(Math.random() * 50),
      image: "https://via.placeholder.com/50",
      category: ["Electronics", "Clothing", "Home"][
        Math.floor(Math.random() * 3)
      ],
    };
    setProducts([...products, newProduct]);
    router.push(`/AddProduct`);
  };
  useEffect(() => {
    loadProducts();
  }, [page, searchTerm]);

  // ✅ Redirect to edit page
  const handleEdit = (id) => {
    console.log(id);

    router.push(`/ProductEditPage/${id}`);
  };

  const handleDelete = (id) => {
    const filtered = products.filter((p) => p.id !== id);
    setProducts(filtered);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto switch to mobile view on smaller screens
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      setMobileView(window.innerWidth < 768);
    });
  }

  return (
    <>
      <DashboardBreadcrumb text="Product Management" />
      <div className="min-h-screen bg-gradient-to-br  p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold  mb-2">
                  Product Management
                </h1>
                <p className="">
                  Manage your products, inventory, and pricing in one place
                </p>
              </div>

              <Button
                onClick={handleAdd}
                className="flex items-center  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlus className="mr-2 text-lg" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"></div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className=" rounded-2xl p-6 shadow-lg border border-gray-100 ">
              <div className="flex items-center justify-between">
                <div>
                  <p className=" text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold  mt-1">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiPlus className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className=" rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className=" text-sm font-medium">Low Stock</p>
                  <p className="text-3xl font-bold  mt-1">
                    {products.filter((p) => p.stock < 15).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiTrash2 className="text-red-600 text-xl" />
                </div>
              </div>
            </div>

            <div className=" rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className=" text-sm font-medium">Total Value</p>
                  <p className="text-3xl font-bold mt-1">
                    AED{" "}
                    {products
                      .reduce((sum, p) => sum + p.price * p.stock, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">AED</span>
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
                  className="w-full pl-12 pr-4 py-3  border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FiFilter className="mr-2" />
                Filter
              </button>
            </div>
          </div>

          {/* Products Table/Cards */}
          <div className=" rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gradient-to-r  border-b ">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Product
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Price
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Stock
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product, i) => (
                    <tr key={product._id || i} className=" transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.image || "/placeholder.png"} // ✅ fallback
                            alt={product.name || "Product image"}
                            width={50}
                            height={50}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                          />

                          <span className="font-medium ">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold ">
                          AED {product.salePrice}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.stockQuantity > 15
                              ? "bg-green-100 text-green-800"
                              : product.stockQuantity > 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stockQuantity > 15
                            ? "In Stock"
                            : product.stockQuantity > 0
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
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
                          <FiMoreVertical className="" />
                        </button>

                        {dropdownOpen === product._id && (
                          <div className="absolute right-6 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
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
                            <button
                              onClick={() => {
                                handleEdit(product._id); // ✅ redirect
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
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
              <div className="flex justify-end items-center gap-2 mt-4 mb-2 mr-3">
                <Button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded  disabled:opacity-50"
                >
                  Previous
                </Button>

                <span className="px-3 py-1">
                  Page {page} of {totalPages}
                </span>

                <Button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="p-4 space-y-4">
                {products.map((product, i) => (
                  <div
                    key={product._id || i}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image || "/placeholder.png"} // ✅ fallback
                            alt={product.name || "Product image"}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === product.id ? null : product.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FiMoreVertical className="text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-semibold text-gray-900">
                          AED {product.salePrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stock</p>
                        <p className="font-semibold text-gray-900">
                          {product.stockQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stockQuantity > 15
                              ? "bg-green-100 text-green-800"
                              : product.stockQuantity > 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stockQuantity > 15
                            ? "In Stock"
                            : product.stockQuantity > 5
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {dropdownOpen === product.id && (
                      <div className="mt-3 border-t border-gray-200 pt-3 space-y-1">
                        <button
                          onClick={() => {
                            handleEdit(product.id);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiEdit className="mr-2 text-gray-500" />
                          Edit Product
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(product.id);
                            setDropdownOpen(null);
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
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or add a new product.
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductManagement;
