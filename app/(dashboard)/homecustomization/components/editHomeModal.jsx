"use client";
import { fetchProductAll } from "@/service/productService";
import { useEffect, useState } from "react";

const EditHomeModal = ({
  isOpen,
  onClose,
  onSelectProduct,
  heading,
  index,
  onSave,
  selectedProduct,
  mockProducts = [],
}) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProducts = async (searchValue) => {
    try {
      setLoading(true);

      if (mockProducts.length > 0) {
        const filtered = mockProducts.filter((p) =>
          p.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        setItems(filtered);
      } else {
        const res = await fetchProductAll({ search: searchValue });
        setItems(res.data?.products || []);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const delay = setTimeout(() => {
      loadProducts(search);
    }, 300);
    return () => clearTimeout(delay);
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-2">Select Product</h3>
        <h4 className="text-md font-medium mb-4">
          {heading} - Slot {index + 1}
        </h4>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
          className="w-full p-2 border rounded mb-4"
        />

        {/* Product list */}
        {loading && <p className="text-center py-2">Loading...</p>}
        {!loading && items.length === 0 && <p>No products found.</p>}

        {!loading &&
          items.map((product) => (
            <div
              key={product._id}
              className={`flex items-center justify-between border-b py-2 px-1 cursor-pointer rounded ${
                selectedProduct?._id === product._id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    product.images?.[0]?.url ||
                    "https://via.placeholder.com/50"
                  }
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-sm">{product.name}</span>
              </div>
              {selectedProduct?._id === product._id && (
                <span className="px-2 py-1 text-white bg-green-600 rounded text-xs">
                  Selected
                </span>
              )}
            </div>
          ))}

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={!selectedProduct}
          className={`mt-4 w-full px-4 py-2 text-white rounded ${
            selectedProduct
              ? "bg-[#6B46C1] hover:bg-[#5a37a1]"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditHomeModal;
