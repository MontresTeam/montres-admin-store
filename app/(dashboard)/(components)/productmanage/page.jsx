"use client";
import { useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiMoreVertical, FiSearch, FiFilter } from "react-icons/fi";
import { useRouter } from "next/navigation"; // ✅ import router

const ProductManagement = () => {
  const router = useRouter(); // ✅ initialize router
  const [products, setProducts] = useState([
    { id: 1, name: "Product A", price: 100, stock: 20, image: "https://via.placeholder.com/50", category: "Electronics" },
    { id: 2, name: "Product B", price: 200, stock: 15, image: "https://via.placeholder.com/50", category: "Clothing" },
    { id: 3, name: "Product C", price: 150, stock: 10, image: "https://via.placeholder.com/50", category: "Home" },
  ]);

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
      category: ["Electronics", "Clothing", "Home"][Math.floor(Math.random() * 3)]
    };
    setProducts([...products, newProduct]);
  };

  // ✅ Redirect to edit page
  const handleEdit = (id) => {
    router.push(`/ProductEditPage}`);
  };

  const handleDelete = (id) => {
    const filtered = products.filter((p) => p.id !== id);
    setProducts(filtered);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto switch to mobile view on smaller screens
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      setMobileView(window.innerWidth < 768);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your products, inventory, and pricing in one place
              </p>
            </div>
            
            <button
              onClick={handleAdd}
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiPlus className="mr-2 text-lg" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiPlus className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {products.filter(p => p.stock < 15).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FiTrash2 className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <FiFilter className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Products Table/Cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-75 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">${product.price}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">{product.stock}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 15 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 15 ? 'In Stock' : product.stock > 5 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === product.id ? null : product.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiMoreVertical className="text-gray-600" />
                      </button>

                      {dropdownOpen === product.id && (
                        <div className="absolute right-6 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                          <button
                            onClick={() => {
                              handleEdit()
                              setDropdownOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FiEdit className="mr-3 text-gray-500" />
                            Edit Product
                          </button>
                          <button
                              onClick={() => {
                    handleEdit(product.id); // ✅ redirect
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
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="p-4 space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === product.id ? null : product.id)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FiMoreVertical className="text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-gray-900">${product.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Stock</p>
                      <p className="font-semibold text-gray-900">{product.stock}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 15 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 15 ? 'In Stock' : product.stock > 5 ? 'Low Stock' : 'Out of Stock'}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or add a new product.</p>
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
  );
};

export default ProductManagement;