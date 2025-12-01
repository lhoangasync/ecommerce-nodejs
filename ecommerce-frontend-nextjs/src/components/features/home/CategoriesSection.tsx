"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/types/backend";
import { manrope } from "@/utils/font";
import { getAllCategories } from "@/api/category.api";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const response = await getAllCategories(1, 20);

        if (response.status === 200 && response.data) {
          // Lấy tối đa 10 categories để hiển thị
          setCategories(response.data.items.slice(0, 10));
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`${manrope.className} text-4xl font-bold text-gray-800 text-center mb-12`}
          >
            TOP FEATURED CATEGORIES{" "}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-3" />
                <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`${manrope.className} text-4xl font-bold text-gray-800 text-center mb-12`}
        >
          TOP FEATURED CATEGORIES
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category_id=${category._id}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                {category.img ? (
                  <img
                    src={category.img}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-category.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-700 text-center font-medium line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
