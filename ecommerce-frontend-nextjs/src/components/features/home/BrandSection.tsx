"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brand } from "@/types/backend";
import { manrope } from "@/utils/font";
import { getAllBrands } from "@/api/brand.api";

export default function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        const response = await getAllBrands(1, 10);

        if (response.status === 200 && response.data) {
          setBrands(response.data.items);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    loadBrands();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`${manrope.className} text-4xl font-bold text-center mb-12`}
          >
            TOP FEATURED BRANDS{" "}
          </h2>
          <div className="relative overflow-x-auto scrollbar-hide">
            <div
              className="flex space-x-8 pb-4"
              style={{ width: "max-content" }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="w-80 h-60 rounded-2xl bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  // Màu gradient ngẫu nhiên cho mỗi brand
  const gradientClasses = [
    "bg-gradient-to-br from-blue-300 to-green-300",
    "bg-gradient-to-br from-pink-400 to-red-400",
    "bg-gradient-to-br from-purple-400 to-indigo-500",
    "bg-gradient-to-br from-orange-200 to-yellow-200",
    "bg-gradient-to-br from-teal-500 to-teal-700",
    "bg-gradient-to-br from-green-800 to-green-600",
  ];

  return (
    <section className="bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`${manrope.className} text-4xl font-bold text-center mb-12`}
        >
          TOP FEATURED BRANDS
        </h2>

        <div className="relative overflow-x-auto scrollbar-hide">
          <div className="flex space-x-8 pb-4" style={{ width: "max-content" }}>
            {brands.map((brand, index) => {
              const gradientClass =
                gradientClasses[index % gradientClasses.length];

              return (
                <Link
                  key={brand._id}
                  href={`/products?brand_id=${brand._id}`}
                  className="flex-shrink-0 relative"
                >
                  <div
                    className={`w-80 h-60 rounded-2xl p-6 relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer ${gradientClass}`}
                    style={
                      brand.img
                        ? {
                            backgroundImage: `url(${brand.img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {/* Overlay để text dễ đọc hơn nếu có background image */}
                    {brand.img && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}

                    {/* Logo/Icon */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden z-10">
                      {brand.img ? (
                        <img
                          src={brand.img}
                          alt={brand.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `<span class="text-gray-600 font-bold text-xs">${brand.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-gray-600 font-bold text-sm">
                          {brand.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <h3 className="font-bold text-lg mb-2 text-white drop-shadow-lg">
                        {brand.name}
                      </h3>
                      {brand.country && (
                        <p className="text-sm text-white/90 drop-shadow">
                          {brand.country}
                        </p>
                      )}
                      {brand.desc && (
                        <p
                          className="text-sm text-white/80 drop-shadow line-clamp-2 mt-1"
                          dangerouslySetInnerHTML={{ __html: brand.desc }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
