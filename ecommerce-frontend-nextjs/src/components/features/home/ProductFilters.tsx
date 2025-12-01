"use client";

import { useState, useEffect } from "react";
import { GetProductsQuery, Brand, Category } from "@/types/backend";
import { getAllBrands } from "@/api/brand.api";
import { getAllCategories } from "@/api/category.api";

interface ProductFiltersProps {
  initialQuery: GetProductsQuery;
  onFilterChange: (filters: Partial<GetProductsQuery>) => void;
}

const SKIN_TYPES = ["dry", "oily", "combination", "sensitive", "normal"];
const ORIGINS = [
  "Korea",
  "Japan",
  "France",
  "USA",
  "Vietnam",
  "Thailand",
  "China",
  "Italy",
];
const SORT_OPTIONS = [
  { value: "created_at-desc", label: "Newest First" },
  { value: "created_at-asc", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating-desc", label: "Highest Rated" },
];

const MIN_PRICE = 0;
const MAX_PRICE = 5000000;

export default function ProductFilters({
  initialQuery,
  onFilterChange,
}: ProductFiltersProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [filters, setFilters] = useState<{
    name: string;
    brand_id: string;
    category_id: string;
    skin_type: string;
    origin: string;
    min_price: number | undefined;
    max_price: number | undefined;
    sort_by: string;
    order: string;
    is_available: boolean | undefined;
  }>({
    name: initialQuery.name || "",
    brand_id: initialQuery.brand_id || "",
    category_id: initialQuery.category_id || "",
    skin_type: initialQuery.skin_type || "",
    origin: initialQuery.origin || "",
    min_price: initialQuery.min_price,
    max_price: initialQuery.max_price,
    sort_by: initialQuery.sort_by || "",
    order: initialQuery.order || "",
    is_available: initialQuery.is_available,
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.min_price ?? MIN_PRICE,
    max: filters.max_price ?? MAX_PRICE,
  });

  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    category: true,
    skinType: false,
    origin: false,
  });

  // Load brands and categories
  useEffect(() => {
    async function loadFiltersData() {
      try {
        setLoadingData(true);
        const [brandsRes, categoriesRes] = await Promise.all([
          getAllBrands(1, 100),
          getAllCategories(1, 100),
        ]);

        if (brandsRes.status === 200 && brandsRes.data) {
          setBrands(brandsRes.data.items);
        }
        if (categoriesRes.status === 200 && categoriesRes.data) {
          setCategories(categoriesRes.data.items);
        }
      } catch (error) {
      } finally {
        setLoadingData(false);
      }
    }

    loadFiltersData();
  }, []);

  // Price range debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const minPrice = priceRange.min > MIN_PRICE ? priceRange.min : undefined;
      const maxPrice = priceRange.max < MAX_PRICE ? priceRange.max : undefined;

      handleFilterUpdate({
        min_price: minPrice,
        max_price: maxPrice,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [priceRange]);

  const handleFilterUpdate = (newFilters: Partial<GetProductsQuery>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Convert to proper GetProductsQuery format
    const queryFilters: Partial<GetProductsQuery> = {
      name: updatedFilters.name || undefined,
      brand_id: updatedFilters.brand_id || undefined,
      category_id: updatedFilters.category_id || undefined,
      skin_type: updatedFilters.skin_type || undefined,
      origin: updatedFilters.origin || undefined,
      min_price: updatedFilters.min_price,
      max_price: updatedFilters.max_price,
      sort_by: (updatedFilters.sort_by as any) || undefined,
      order: (updatedFilters.order as any) || undefined,
      is_available: updatedFilters.is_available,
    };

    onFilterChange(queryFilters);
  };

  const handleSortChange = (value: string) => {
    if (!value) {
      handleFilterUpdate({ sort_by: undefined, order: undefined });
      return;
    }
    const [sort_by, order] = value.split("-");
    handleFilterUpdate({ sort_by: sort_by as any, order: order as any });
  };

  const clearFilters = () => {
    const clearedFilters = {
      name: "",
      brand_id: "",
      category_id: "",
      skin_type: "",
      origin: "",
      min_price: undefined,
      max_price: undefined,
      sort_by: "",
      order: "",
      is_available: undefined,
    };
    setFilters(clearedFilters);
    setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });

    const queryFilters: Partial<GetProductsQuery> = {
      name: undefined,
      brand_id: undefined,
      category_id: undefined,
      skin_type: undefined,
      origin: undefined,
      min_price: undefined,
      max_price: undefined,
      sort_by: undefined,
      order: undefined,
      is_available: undefined,
    };
    onFilterChange(queryFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      key !== "sort_by" &&
      key !== "order" &&
      value !== "" &&
      value !== undefined
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.name) count++;
    if (filters.brand_id) count++;
    if (filters.category_id) count++;
    if (filters.skin_type) count++;
    if (filters.origin) count++;
    if (filters.min_price || filters.max_price) count++;
    if (filters.is_available) count++;
    return count;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b-2 border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-pink-500"
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
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear All
          </button>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => handleFilterUpdate({ name: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {filters.name && (
              <button
                onClick={() => handleFilterUpdate({ name: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={
              filters.sort_by && filters.order
                ? `${filters.sort_by}-${filters.order}`
                : ""
            }
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm bg-white"
          >
            <option value="">Default</option>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="bg-pink-50 rounded-lg p-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.is_available === true}
                onChange={(e) =>
                  handleFilterUpdate({
                    is_available: e.target.checked ? true : undefined,
                  })
                }
                className="w-5 h-5 text-pink-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-pink-300 cursor-pointer"
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 flex-1">
              Show In Stock Only
            </span>
            {filters.is_available && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </label>
        </div>

        <div className="border-t-2 border-gray-100 pt-6" />

        {/* Brand Filter */}
        <div>
          <button
            onClick={() => toggleSection("brand")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3 hover:text-pink-600"
          >
            <span className="flex items-center gap-2">
              Brand
              {filters.brand_id && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.brand ? "rotate-180" : ""
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
          {expandedSections.brand && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loadingData ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Loading brands...
                </div>
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <label
                    key={brand._id}
                    className="flex items-center gap-3 cursor-pointer group hover:bg-pink-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="brand_id"
                      value={brand._id}
                      checked={filters.brand_id === brand._id}
                      onChange={(e) =>
                        handleFilterUpdate({ brand_id: e.target.value })
                      }
                      className="w-4 h-4 text-pink-500 border-2 border-gray-300 focus:ring-2 focus:ring-pink-300 flex-shrink-0"
                    />
                    {brand.img && (
                      <img
                        src={brand.img}
                        alt={brand.name}
                        className="w-8 h-8 object-cover rounded-md border border-gray-200 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm text-gray-700 group-hover:text-pink-600 flex-1">
                      {brand.name}
                    </span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No brands available
                </div>
              )}
              {filters.brand_id && (
                <button
                  onClick={() => handleFilterUpdate({ brand_id: "" })}
                  className="text-xs text-pink-500 hover:text-pink-600 font-semibold ml-6 mt-2"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Category Filter */}
        <div>
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3 hover:text-pink-600"
          >
            <span className="flex items-center gap-2">
              Category
              {filters.category_id && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.category ? "rotate-180" : ""
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
          {expandedSections.category && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {loadingData ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Loading categories...
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center gap-3 cursor-pointer group hover:bg-pink-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="category_id"
                      value={category._id}
                      checked={filters.category_id === category._id}
                      onChange={(e) =>
                        handleFilterUpdate({ category_id: e.target.value })
                      }
                      className="w-4 h-4 text-pink-500 border-2 border-gray-300 focus:ring-2 focus:ring-pink-300 flex-shrink-0"
                    />
                    {category.img && (
                      <img
                        src={category.img}
                        alt={category.name}
                        className="w-8 h-8 object-cover rounded-md border border-gray-200 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm text-gray-700 group-hover:text-pink-600 flex-1">
                      {category.name}
                    </span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No categories available
                </div>
              )}
              {filters.category_id && (
                <button
                  onClick={() => handleFilterUpdate({ category_id: "" })}
                  className="text-xs text-pink-500 hover:text-pink-600 font-semibold ml-6 mt-2"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Price Range with Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Price Range (VND)
          </label>
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-pink-600">
                {formatPrice(priceRange.min)}
              </span>
              <span className="text-gray-400">-</span>
              <span className="font-medium text-pink-600">
                {formatPrice(priceRange.max)}
              </span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative pt-1 pb-4">
              <div className="relative h-2 bg-gray-200 rounded-full">
                {/* Active Range Track */}
                <div
                  className="absolute h-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                  style={{
                    left: `${(priceRange.min / MAX_PRICE) * 100}%`,
                    right: `${100 - (priceRange.max / MAX_PRICE) * 100}%`,
                  }}
                />
              </div>

              {/* Min Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={10000}
                value={priceRange.min}
                onChange={(e) => {
                  const newMin = Math.min(
                    Number(e.target.value),
                    priceRange.max - 10000
                  );
                  setPriceRange({ ...priceRange, min: newMin });
                }}
                className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pink-500 [&::-moz-range-thumb]:cursor-pointer"
              />

              {/* Max Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={10000}
                value={priceRange.max}
                onChange={(e) => {
                  const newMax = Math.max(
                    Number(e.target.value),
                    priceRange.min + 10000
                  );
                  setPriceRange({ ...priceRange, max: newMax });
                }}
                className="absolute w-full h-2 top-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pink-500 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Manual Input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= MIN_PRICE && val <= priceRange.max) {
                      setPriceRange({ ...priceRange, min: val });
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= MAX_PRICE && val >= priceRange.min) {
                      setPriceRange({ ...priceRange, max: val });
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm"
                />
              </div>
            </div>

            {(priceRange.min > MIN_PRICE || priceRange.max < MAX_PRICE) && (
              <button
                onClick={() => {
                  setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
                  handleFilterUpdate({
                    min_price: undefined,
                    max_price: undefined,
                  });
                }}
                className="text-xs text-pink-500 hover:text-pink-600 font-semibold"
              >
                Reset price range
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Skin Type */}
        <div>
          <button
            onClick={() => toggleSection("skinType")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3 hover:text-pink-600"
          >
            <span className="flex items-center gap-2">
              Skin Type
              {filters.skin_type && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.skinType ? "rotate-180" : ""
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
          {expandedSections.skinType && (
            <div className="space-y-2">
              {SKIN_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-pink-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="skin_type"
                    value={type}
                    checked={filters.skin_type === type}
                    onChange={(e) =>
                      handleFilterUpdate({ skin_type: e.target.value })
                    }
                    className="w-4 h-4 text-pink-500 border-2 border-gray-300 focus:ring-2 focus:ring-pink-300"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-pink-600 capitalize flex-1">
                    {type}
                  </span>
                </label>
              ))}
              {filters.skin_type && (
                <button
                  onClick={() => handleFilterUpdate({ skin_type: "" })}
                  className="text-xs text-pink-500 hover:text-pink-600 font-semibold ml-6 mt-2"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Origin */}
        <div>
          <button
            onClick={() => toggleSection("origin")}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3 hover:text-pink-600"
          >
            <span className="flex items-center gap-2">
              Origin Country
              {filters.origin && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.origin ? "rotate-180" : ""
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
          {expandedSections.origin && (
            <div className="space-y-2">
              {ORIGINS.map((country) => (
                <label
                  key={country}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-pink-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="origin"
                    value={country}
                    checked={filters.origin === country}
                    onChange={(e) =>
                      handleFilterUpdate({ origin: e.target.value })
                    }
                    className="w-4 h-4 text-pink-500 border-2 border-gray-300 focus:ring-2 focus:ring-pink-300"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-pink-600 flex-1">
                    {country}
                  </span>
                </label>
              ))}
              {filters.origin && (
                <button
                  onClick={() => handleFilterUpdate({ origin: "" })}
                  className="text-xs text-pink-500 hover:text-pink-600 font-semibold ml-6 mt-2"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Footer */}
      {hasActiveFilters && (
        <div className="p-4 border-t-2 border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Active Filters ({getActiveFiltersCount()})
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.name && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {filters.name}
                <button
                  onClick={() => handleFilterUpdate({ name: "" })}
                  className="hover:text-pink-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.brand_id &&
              brands.find((b) => b._id === filters.brand_id) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {brands.find((b) => b._id === filters.brand_id)?.name}
                  <button
                    onClick={() => handleFilterUpdate({ brand_id: "" })}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            {filters.category_id &&
              categories.find((c) => c._id === filters.category_id) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {categories.find((c) => c._id === filters.category_id)?.name}
                  <button
                    onClick={() => handleFilterUpdate({ category_id: "" })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
            {filters.skin_type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold capitalize">
                {filters.skin_type}
                <button
                  onClick={() => handleFilterUpdate({ skin_type: "" })}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.origin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                {filters.origin}
                <button
                  onClick={() => handleFilterUpdate({ origin: "" })}
                  className="hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                <button
                  onClick={() => {
                    setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
                    handleFilterUpdate({
                      min_price: undefined,
                      max_price: undefined,
                    });
                  }}
                  className="hover:text-yellow-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
