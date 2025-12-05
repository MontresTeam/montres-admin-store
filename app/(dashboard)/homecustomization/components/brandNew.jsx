"use client";
import React, { useEffect, useState } from "react";
import { FaArrowRight, FaEdit } from "react-icons/fa";
import Image from "next/image";
import Bag from "@/public/assets/images/homecustomization/beautiful-elegance-luxury-fashion-green-handbag.jpg";
import { getBrandNew, updateBrandNew } from "@/service/productService";
import EditHomeModal from "./editHomeModal";

const BrandNewAdded = () => {
  const [products, setBrandNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products on load
  useEffect(() => {
    const fetchBrandNewProducts = async () => {
      try {
        const response = await getBrandNew();
        console.log("Fetched BrandNew products:", response);
        setBrandNewProducts(response?.data?.products || []);
      } catch (error) {
        console.error("Error fetching BrandNew products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandNewProducts();
  }, []);

  // Handle modal open for editing
  const handleEditClick = (index) => {
    setEditIndex(index);
    setSelectedProduct(products[index]);
    setIsModalOpen(true);
  };

  // Save updated product for that slot
  const handleSave = async () => {
    try {
      if (!selectedProduct) return;

      const updatedProducts = [...products];
      updatedProducts[editIndex] = selectedProduct;

      setBrandNewProducts(updatedProducts);
      setIsModalOpen(false);

      // Call API to update
      await updateBrandNew({ products: updatedProducts.map((p) => p._id) });
      console.log("Products updated successfully");
    } catch (error) {
      console.error("Error updating BrandNew products:", error);
    }
  };

  const skeletonArray = Array(6).fill(null);
  const displayProducts =
    products && products.length > 0 ? products : skeletonArray;

  return (
    <section className="w-full">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Title with Edit Button */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-center w-full">Brand New</h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {loading
            ? skeletonArray.map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg overflow-hidden shadow-sm animate-pulse flex flex-col"
                >
                  <div className="flex justify-center items-center p-4">
                    <div className="w-[160px] h-[160px] rounded-md bg-gray-200" />
                  </div>
                  <div className="px-4 flex-1 flex items-center justify-center text-center py-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                  <div className="border-t px-4 py-2">
                    <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            : displayProducts?.map((product, i) => (
                <div
                  key={product?._id || i}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col group relative"
                >
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(i)}
                    className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-white/90 hover:bg-[#1e518e] text-[#1e518e] hover:text-white transition-all duration-300 rounded-full shadow-md px-3 py-1.5 backdrop-blur-sm group"
                    title="Edit Product"
                  >
                    <FaEdit className="text-sm group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-xs font-medium hidden sm:inline-block">
                      Edit
                    </span>
                  </button>

                  {/* Image */}
                  <div className="flex justify-center items-center p-4 relative overflow-hidden">
                    <div className="relative w-[160px] h-[160px]">
                      <Image
                        src={product?.images?.[0]?.url || Bag}
                        alt={product?.name || "Product"}
                        fill
                        sizes="160px"
                        className="object-contain w-full h-full rounded-xl transition duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Product Name */}
                  <div className="px-4 flex-1 flex items-center justify-center text-center py-3">
                    <h3 className="text-sm font-medium leading-tight group-hover:text-[#1e518e] transition duration-300">
                      {product?.name || "Product Name"}
                    </h3>
                  </div>

                 
                </div>
              ))}
        </div>

        {/* Edit Modal */}
        <EditHomeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectProduct={setSelectedProduct}
          heading="Brand New"
          index={editIndex || 0}
          onSave={handleSave}
          selectedProduct={selectedProduct}
        />
      </div>
    </section>
  );
};

export default BrandNewAdded;
