import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import Bag from '@/public/assets/images/homecustomization/beautiful-elegance-luxury-fashion-green-handbag.jpg';

const BrandNewAdded = ({ products, loading }) => {
  // Dummy products with correct structure
  const dummyProducts = [
    {
      _id: "1",
      name: "Luxury Leather Handbag",
      images:Bag,
      price: 299.99
    },
    {
      _id: "2",
      name: "Designer Crossbody Bag",
      images: Bag,
      price: 199.99
    },
    {
      _id: "3",
      name: "Elegant Evening Clutch",
      images:Bag,
      price: 149.99
    },
    {
      _id: "4",
      name: "Premium Tote Bag",
      images: Bag,
      price: 249.99
    },
    {
      _id: "5",
      name: "Vintage Shoulder Bag",
      images: Bag,
      price: 179.99
    },
    {
      _id: "6",
      name: "Modern Backpack Purse",
      images: Bag,
      price: 219.99
    }
  ];

  const skeletonArray = Array(6).fill(null);
  const displayProducts = products && products.length > 0 ? products : dummyProducts;

  return (
    <section className="w-full ">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Title - Updated */}
        <h2 className="text-3xl font-bold text-center mb-12 ">
          Brand New
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {loading
            ? skeletonArray.map((_, i) => (
                <div
                  key={i}
                  className=" border rounded-lg overflow-hidden shadow-sm animate-pulse flex flex-col"
                >
                  {/* Image skeleton */}
                  <div className="flex justify-center items-center p-4 ">
                    <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px]  rounded-md" />
                  </div>

                  {/* Product name skeleton */}
                  <div className="px-4 flex-1 flex items-center justify-center text-center py-3">
                    <div className="h-4 w-3/4  rounded" />
                  </div>

                  {/* Bottom strip skeleton */}
                  <div className="border-t  px-4 py-2">
                    <div className="h-4 w-1/2 mx-auto  rounded" />
                  </div>
                </div>
              ))
            : displayProducts?.map((product) => (
                <div
                  key={product._id}
                  className=" border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col group"
                >
                  {/* Image with Hover Effects */}
                  <div className="flex justify-center items-center p-4  relative overflow-hidden">
                    <div className="relative">
                      <Image
                        src={product.images}
                        alt="emty"
                        width={160}
                        height={160}
                        loading="lazy"
                        className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] object-contain transition duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-4 flex-1 flex items-center justify-center text-center py-3">
                    <h3 className="text-sm font-medium  leading-tight group-hover:text-[#1e518e] transition duration-300">
                      {product.name}
                    </h3>
                  </div>

                  {/* Bottom strip */}
                  <div className="border-t  px-4 py-2  transition duration-300">
                    <a
                      href="#"
                      className="flex items-center justify-center text-sm font-medium text-[#1e518e] hover:text-[#0061b0] transition"
                    >
                      Get Price <FaArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default BrandNewAdded;