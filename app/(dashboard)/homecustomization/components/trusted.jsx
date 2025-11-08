"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaEdit } from "react-icons/fa";
import { getTrustedProducts, updateTrustedProducts } from "@/service/productService";
import EditHomeModal from "./editHomeModal";

const ProductSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm animate-pulse hover:shadow-md transition-shadow duration-300">
    <div className="p-3 flex flex-col items-center text-center relative">
      <div className="rounded-lg mb-3 w-[160px] h-[160px] bg-gray-200" />
      <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
    </div>
  </div>
);

const ProductItem = ({ product, isInWishlist, onToggleWishlist, onEditClick }) => {
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    onToggleWishlist(product._id);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="p-3 flex flex-col items-center text-center relative">
        <button
          onClick={() => onEditClick(product)}
          className="absolute top-3 left-3 bg-white/90 hover:bg-[#1e518e] hover:text-white text-gray-700 border border-gray-200 rounded-full p-1.5 shadow transition-all duration-300 hover:scale-105"
          title="Edit Product"
        >
          <FaEdit className="text-xs" />
        </button>

      

        <Image
          src={product?.images?.[0]?.url || product?.images}
          alt={product?.name || "Product"}
          width={180}
          height={180}
          className="rounded-lg mb-3 w-[160px] h-[160px] object-contain"
        />

        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
          {product?.name}
        </h3>

        <p className="text-sm font-bold text-[#1e518e]">
          {product?.price || ""}
        </p>
      </div>
    </div>
  );
};

const Trusted = () => {
  const [trustedData, setTrustedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [editIndex, setEditIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔹 Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTrustedProducts();
        setTrustedData(res.data);
        console.log(res.data,"New Arrivals");
        
      } catch (err) {
        console.error("Failed to load trusted products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ❤️ Wishlist
  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      newWishlist.has(productId)
        ? newWishlist.delete(productId)
        : newWishlist.add(productId);
      return newWishlist;
    });
  };

  // ✏️ Edit
  const handleEditClick = (section, index) => {
    setSelectedSection(section);
    setEditIndex(index);
    setIsModalOpen(true);
  };

 // 💾 Save Product
const handleSave = async () => {
  try {
    if (!selectedProduct || !trustedData) return;

    // Deep clone trustedData
    const updated = JSON.parse(JSON.stringify(trustedData));
    const key = selectedSection;

    if (!Array.isArray(updated[key])) updated[key] = [];

    // Replace the edited product in its position
    updated[key][editIndex] = selectedProduct;

    // Update UI immediately
    setTrustedData(updated);
    setIsModalOpen(false);

    // Prepare payload (send only _id or full if missing)
    const payload = {
      [key]: updated[key].map((p) => (p?._id ? p._id : p)),
      replace: true, // 🔹 ensures backend overwrites
    };

    // Send update request
    await updateTrustedProducts(payload);

    console.log("✅ Trusted products updated successfully");
  } catch (error) {
    console.error("❌ Error updating trusted products:", error);
  }
};

  const skeletonArray = Array(6).fill(null);

  const renderGrid = (title, products, sectionKey) => (
    <div className="bg-white rounded-xl p-6 shadow-md w-full lg:w-1/2 border border-gray-200">
      <h2 className="text-xl font-semibold mb-5 pb-3 border-b text-gray-800">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {loading
          ? skeletonArray.map((_, i) => <ProductSkeleton key={i} />)
          : products?.slice(0, 6).map((product, i) => (
              <ProductItem
                key={product._id || i}
                product={product}
                isInWishlist={wishlist.has(product._id)}
                onToggleWishlist={handleToggleWishlist}
                onEditClick={() => handleEditClick(sectionKey, i)}
              />
            ))}
      </div>
    </div>
  );

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-[1536px] mx-auto flex flex-col lg:flex-row gap-8">
        {renderGrid("New Arrivals", trustedData?.newArrivals || [], "newArrivals")}
        {renderGrid("Montres Trusted", trustedData?.montresTrusted || [], "montresTrusted")}
      </div>

     

      {isModalOpen && (
        <EditHomeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectProduct={setSelectedProduct}
          onSave={handleSave}
          heading={selectedSection === "newArrivals" ? "New Arrivals" : "Montres Trusted"}
          index={editIndex}
          selectedProduct={selectedProduct}
        />
      )}
    </section>
  );
};

export default Trusted;
