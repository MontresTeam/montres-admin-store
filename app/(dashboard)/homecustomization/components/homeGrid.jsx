"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  getHomeProductGrid,
  updateHomeProductGrid,
} from "@/service/productService";
import { FiEdit2 } from "react-icons/fi";
import EditHomeModal from "./editHomeModal";

const HomeGrid = () => {
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedModalProduct, setSelectedModalProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Fetch all products for grid
  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const res = await getHomeProductGrid();
        const homeProductsData = res.data?.homeProducts || res.data || [];
        setHomeProducts(homeProductsData);
      } catch (err) {
        console.error("Failed to fetch home products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  // ✅ Open modal to edit one of the 3 slots
  const openEditModal = (category, index) => {
    setEditingCategory(category);
    setEditingIndex(index);
    setSelectedModalProduct(null);
    setModalOpen(true);
  };

  // ✅ Save updated product for one slot
  const handleSave = async () => {
    if (!selectedModalProduct || !editingCategory || editingIndex === null)
      return;

    try {
      // Step 1️⃣: Build a fresh array of product IDs
      const updatedProducts = [...editingCategory.products];

      // Replace the product in the slot being edited
      updatedProducts[editingIndex] = selectedModalProduct;

      // Extract only product IDs for backend
      const productIds = updatedProducts.map((p) => p?._id || p);
      console.log("🛠️ Updating product slot:", productIds, editingCategory);
      // Step 2️⃣: Update backend
      const res = await updateHomeProductGrid(editingCategory._id, {
        title: editingCategory.title,
        products: productIds,
      });

      // Step 3️⃣: Update local state
      setHomeProducts((prev) =>
        prev.map((cat) =>
          cat._id === editingCategory._id
            ? { ...cat, products: updatedProducts }
            : cat
        )
      );

      console.log("🔄 Local state updated successfully");
    } catch (error) {
      console.error("❌ Failed to update product slot:", error);
    } finally {
      setModalOpen(false);
      setSelectedModalProduct(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading products...
      </div>
    );

  return (
    <div className="min-h-[100px] p-4 sm:p-6 lg:p-8">
      {/* Outer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeProducts.length > 0 ? (
          homeProducts.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 relative"
            >
              {/* Category Title */}
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                {category.title}
              </h2>

              {/* Product Grid (3 per category) */}
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => {
                  const product = category.products[index];

                  return (
                    <div
                      key={product?._id || index}
                      className="flex flex-col items-center text-center group relative"
                    >
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(category, index)}
                        className="absolute top-1 right-1 bg-[#6B46C1] hover:bg-[#553C9A] text-white p-1 rounded-full shadow-md z-1"
                      >
                        <FiEdit2 size={14} />
                      </button>

                      {product ? (
                        <>
                          <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 relative">
                            <Image
                              src={
                                product.images?.[0]?.url ||
                                "https://via.placeholder.com/300x300?text=No+Image"
                              }
                              alt={product.name || "Product"}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              width={300}
                              height={300}
                              loading="lazy"
                            />
                          </div>
                          <p className="mt-2 text-sm font-semibold text-gray-800">
                            {product.salePrice
                              ? `AED ${product.salePrice}`
                              : "Price not available"}
                          </p>

                          <p className="text-xs text-gray-500 line-clamp-2">
                            {product.name || product.sku}
                          </p>
                        </>
                      ) : (
                        <div className="w-full aspect-square rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          Empty Slot
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No categories found.
          </p>
        )}
      </div>

      {/* Edit Modal */}
      <EditHomeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectProduct={setSelectedModalProduct}
        heading={editingCategory?.title || ""}
        index={editingIndex ?? 0}
        onSave={handleSave}
        selectedProduct={selectedModalProduct}
      />
    </div>
  );
};

export default HomeGrid;
