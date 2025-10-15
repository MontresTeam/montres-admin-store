"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { fetchProduct, updateProduct } from "@/service/productService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProductEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    salePrice: "",
    regularPrice: "",
    taxStatus: "",
    stockQuantity: "",
    gender: "",
    categorisOne: "",
    subcategory: "",
    shortDescription: "",
    description: "",
    visibility: "visible",
    tags: "",
    images: [],
    metaBrands: "",
    discount: "",
  });
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchProduct({ id });
      if (!error && data) {
        console.log(data);
        // ✅ Assuming your API returns { product: {...} }
        const product = data.product || data;

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
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          visibility: product.visibility || "visible",
          tags: product.tags?.join(", ") || "",
          images: product.images || [],
          // metaBrands: productbrands.|| product.meta || "",
          discount: product.discount || "",
        });
      } else {
        console.error("❌ Error fetching product:", error);
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProducts();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    // Create FormData instance
    const payload = new FormData();

    // Append all fields from formData
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images" && value.length > 0) {
        // Append multiple files
        Array.from(value).forEach((file) => payload.append("images", file));
      } else if (key === "tags") {
        payload.append(key, value); // you can convert comma-separated string if needed
      } else {
        payload.append(key, value ?? "");
      }
    });

    const { data, error } = await updateProduct(id, payload); // updateProduct should accept FormData

    if (error) {
      setError("Failed to update product");
      console.error(error);
    } else {
      setSuccess(true);
      console.log("✅ Product updated:", data);
      router.push(`/productmanage`);
    }
  } catch (err) {
    setError("Unexpected error occurred");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  const handleCancel = () => {
    router.push(`/productmanage`);
  };

  return (
    <>
      <DashboardBreadcrumb title="Colors" text="Colors" />
      <div className="min-h-screen  py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <DashboardBreadcrumb text="Update product information and details" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold ">Edit Product</h1>
                <p className="mt-1 text-sm ">
                  Update your product details, pricing, and inventory
                  information
                </p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className=" rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold  flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Basic Information
                  </h2>
                  <p className="text-sm  mt-1">
                    Product identity and core details
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SKU */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="SKU-001"
                      required
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
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
                  <h2 className="text-lg font-semibold  flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Pricing & Inventory
                  </h2>
                  <p className="text-sm  mt-1">
                    Price details and stock management
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Regular Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Regular Price
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
                      />
                    </div>
                  </div>

                  {/* Sale Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
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
                      />
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold mb-1">
                      Tax Status
                    </label>
                    <select
                      name="taxStatus"
                      value={formData.taxStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="">Select Tax Status</option>
                      <option value="taxable">Taxable</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border bg-white text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category & Classification Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold  flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Category & Classification
                  </h2>
                  <p className="text-sm  mt-1">
                    Product categorization and targeting
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 bg-white text-gray-900 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
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
                    <label className="block text-sm font-medium ">
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
                    <label className="block text-sm font-medium ">Brand</label>
                    <input
                      type="text"
                      name="metaBrands"
                      value={formData.metaBrands}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Brand name"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">Tags</label>
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
                  <h2 className="text-lg font-semibold  flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    Media
                  </h2>
                  <p className="text-sm  mt-1">Product images and thumbnails</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Thumbnail Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      {/* <input
                        type="file"
                        name="thumbnail"
                        onChange={handleChange}
                        className="hidden"
                        id="thumbnail"
                      /> */}
                      <label htmlFor="thumbnail" className="cursor-pointer">
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
                          <span className="text-sm ">
                            Click to upload thumbnail
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 5MB
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Gallery Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <input
                        type="file"
                        name="images"
                        onChange={handleChange}
                        multiple
                        className="hidden"
                        id="gallery"
                      />
                      <label htmlFor="gallery" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </div>
                          <span className="text-sm ">
                            Click to upload multiple images
                          </span>
                          <span className="text-xs text-gray-500">
                            Multiple files allowed
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold  flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Description
                  </h2>
                  <p className="text-sm  mt-1">
                    Product descriptions and details
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Short Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                      placeholder="Brief product description..."
                      rows={3}
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                      placeholder="Detailed product description..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r  from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-7 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
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
                    Save Product Changes
                  </div>
                </Button>
                <button
                  onClick={handleCancel}
                  type="button"
                  className="px-6 py-4 border border-gray-300   font-medium rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductEditPage;
