"use client";

import ProductCard from "./ProductCard";
import { useState, useEffect } from "react";
import { Product } from "@/types/backend";
import { getFeaturedProducts } from "@/api/product.api";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await getFeaturedProducts(10);

        if (response.status === 200 && response.data) {
          setProducts(response.data);
        } else {
          setError(response.message || "Unable to load products");
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError("An error occurred while loading products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const nextSlide = () => {
    const maxSlides = Math.ceil(products.length / 2);
    if (currentIndex < maxSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                Products
                <br />
                <span className="text-5xl font-black">BEST SELLERS</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-2xl aspect-square animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                Products
                <br />
                <span className="text-5xl font-black">BEST SELLERS</span>
              </h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                Products
                <br />
                <span className="text-5xl font-black">BEST SELLERS</span>
              </h2>
            </div>
            <div className="text-gray-500 text-center py-12">
              No products available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-6 bg-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 items-start">
          {/* Left side - Title */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
              Products
              <br />
              <span className="text-5xl font-black">BEST SELLERS</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cosmetic is proud to deliver products that bring wonderful changes
              to your skin and hair.
            </p>
          </div>

          {/* Right side - Product Slider */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {/* Each slide contains 2 products */}
                {Array.from(
                  { length: Math.ceil(products.length / 2) },
                  (_, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6 px-1"
                    >
                      {products
                        .slice(slideIndex * 2, slideIndex * 2 + 2)
                        .map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-8 gap-3">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  currentIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg active:scale-95"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= Math.ceil(products.length / 2) - 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  currentIndex >= Math.ceil(products.length / 2) - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg active:scale-95"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
