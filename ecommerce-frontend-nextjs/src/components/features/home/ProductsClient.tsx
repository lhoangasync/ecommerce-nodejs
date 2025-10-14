"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { Product, PaginationMeta, GetProductsQuery } from "@/types/backend";
import { getAllProducts } from "@/api/product.api";

interface ProductsClientProps {
  initialProducts: Product[];
  initialMeta: PaginationMeta;
  initialQuery: GetProductsQuery;
}

export default function ProductsClient({
  initialProducts,
  initialMeta,
  initialQuery,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = (newQuery: Partial<GetProductsQuery>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handleFilterChange = async (filters: Partial<GetProductsQuery>) => {
    setLoading(true);
    updateURL({ ...filters, page: 1 });

    try {
      const response = await getAllProducts({
        ...initialQuery,
        ...filters,
        page: 1,
      });
      setProducts(response.data.items);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    updateURL({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await getAllProducts({ ...initialQuery, page });
      setProducts(response.data.items);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a
              href="/"
              className="text-gray-500 hover:text-pink-500 transition-colors"
            >
              Trang chủ
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">Sản phẩm</li>
        </ol>
      </nav>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">
          Discover our full collection of beauty products
        </p>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between font-semibold text-gray-700 hover:border-pink-300 transition-colors"
      >
        <span className="flex items-center gap-2">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters & Sort
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            showFilters ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block w-full lg:w-64 flex-shrink-0`}
        >
          <ProductFilters
            initialQuery={initialQuery}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {products.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {meta.totalItems}
              </span>{" "}
              products
            </p>
            <div className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </div>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-gray-600 font-medium">
                  Loading products...
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 hover:bg-pink-50 transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {[...Array(meta.totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === meta.page;
                  const isNearCurrent = Math.abs(page - meta.page) <= 2;
                  const isFirstOrLast = page === 1 || page === meta.totalPages;

                  if (!isNearCurrent && !isFirstOrLast) {
                    if (page === 2 || page === meta.totalPages - 1) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        isCurrentPage
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 hover:bg-pink-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
