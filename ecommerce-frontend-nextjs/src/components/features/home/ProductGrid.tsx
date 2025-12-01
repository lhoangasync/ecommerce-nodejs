"use client";

import ProductCard from "./ProductCard";
import { useState, useEffect } from "react";
import { Product } from "@/types/backend";
import { getFeaturedProducts } from "@/api/product.api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("An error occurred while loading products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-pink-500 text-xs uppercase tracking-wider font-semibold mb-2">
              Our Collection
            </p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              BEST SELLERS
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-pink-500 text-xs uppercase tracking-wider font-semibold mb-2">
              Our Collection
            </p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              BEST SELLERS
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-600 text-center">
            <svg
              className="w-10 h-10 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-pink-500 text-xs uppercase tracking-wider font-semibold mb-2">
              Our Collection
            </p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              BEST SELLERS
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="text-gray-500 text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-base font-medium">No products available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-12 px-6 bg-gradient-to-br from-pink-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <p className="text-pink-500 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-2 justify-center">
              <span className="w-6 h-px bg-pink-400" />
              Our Collection
              <span className="w-6 h-px bg-pink-400" />
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            BEST SELLERS
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-sm">
            Discover our most-loved products that bring wonderful changes to
            your skin and hair.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 mx-auto rounded-full mt-4" />
        </div>

        {/* Product Carousel */}
        <div className="relative px-4">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={products.length > 3}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
            className="product-grid-swiper !pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="custom-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 text-gray-800 hover:text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group -translate-x-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="custom-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 text-gray-800 hover:text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group translate-x-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-sm">
            <span>View All Products</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .product-grid-swiper .swiper-pagination {
          bottom: 0 !important;
        }

        .product-grid-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #f9a8d4;
          opacity: 0.5;
          transition: all 0.3s;
        }

        .product-grid-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(to right, #ec4899, #a855f7);
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }

        .product-grid-swiper .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}
