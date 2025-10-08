"use client";

import Image from "next/image";
import { Product } from "@/types/backend";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const hasDiscount = product.variants.some((v) => v.original_price);
  const originalPrices = product.variants
    .filter((v) => v.original_price)
    .map((v) => v.original_price!);
  const maxOriginalPrice =
    originalPrices.length > 0 ? Math.max(...originalPrices) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  // Collect all images from product and variants
  const allImages: string[] = [];
  if (product.images && product.images.length > 0) {
    allImages.push(...product.images);
  }
  product.variants.forEach((variant) => {
    if (variant.images && variant.images.length > 0) {
      variant.images.forEach((img) => {
        if (!allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }
  });

  const productImages =
    allImages.length > 0 ? allImages : ["/images/placeholder.jpg"];

  let badge = null;
  let badgeColor = "";
  if (hasDiscount) {
    badge = "SALE";
    badgeColor = "bg-gradient-to-r from-red-500 to-pink-500";
  } else if (product.created_at) {
    const createdDate = new Date(product.created_at);
    const daysSinceCreation =
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      badge = "NEW";
      badgeColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
    }
  }

  const hasStock = product.variants.some((v) => v.stock_quantity > 0);

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();
  const cleanDescription = product.description
    ? stripHtml(product.description)
    : "";

  // Calculate discount percentage
  let discountPercent = null;
  if (hasDiscount && maxOriginalPrice) {
    discountPercent = Math.round(
      ((maxOriginalPrice - minPrice) / maxOriginalPrice) * 100
    );
  }

  // Get rating data from product
  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 w-full h-full flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 via-pink-100/0 to-purple-50/0 group-hover:from-pink-50/30 group-hover:via-pink-100/20 group-hover:to-purple-50/30 transition-all duration-500 pointer-events-none z-10" />

      {/* Product Image Carousel */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-pink-50/30 flex-shrink-0">
        {productImages.length > 1 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            navigation={{
              enabled: isHovered,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={
              isHovered
                ? {
                    delay: 2500,
                    disableOnInteraction: false,
                  }
                : false
            }
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={productImages.length > 2}
            className="w-full h-full product-swiper"
          >
            {productImages.map((img, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative w-full h-full">
                  <Image
                    src={img}
                    alt={`${product.name} - Image ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={idx === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={productImages[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
          </div>
        )}

        {/* Badges */}
        {badge && (
          <div
            className={`absolute top-4 right-4 ${badgeColor} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-20 animate-pulse`}
          >
            {badge}
            {discountPercent && badge === "SALE" && (
              <span className="ml-1">-{discountPercent}%</span>
            )}
          </div>
        )}

        {/* Stock overlay */}
        {!hasStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-20">
            <div className="text-center">
              <span className="text-white font-bold text-lg bg-black bg-opacity-70 px-6 py-3 rounded-xl shadow-xl">
                Out of Stock
              </span>
            </div>
          </div>
        )}

        {/* Quick view button on hover */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 z-20 ${
            isHovered && hasStock
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <button className="bg-white text-gray-800 px-6 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center gap-2">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Quick View
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1 relative z-10">
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-2 h-5">
          {product.brand?.name && (
            <span className="text-xs text-pink-500 font-semibold uppercase tracking-wider truncate">
              {product.brand.name}
            </span>
          )}
          {product.brand?.name && product.category?.name && (
            <span className="text-gray-300 flex-shrink-0">•</span>
          )}
          {product.category?.name && (
            <span className="text-xs text-gray-400 font-medium truncate">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 h-12 mb-2 group-hover:text-pink-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">
          {cleanDescription || "\u00A0"}
        </p>

        {/* Rating Stars - Using real data */}
        {rating > 0 ? (
          <div className="flex items-center gap-1 mb-3 h-5">
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                // Full star
                return (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-current text-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                );
              } else if (i === fullStars && hasHalfStar) {
                // Half star
                return (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <defs>
                      <linearGradient id={`half-${product._id}`}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="#d1d5db" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#half-${product._id})`}
                      d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                    />
                  </svg>
                );
              } else {
                // Empty star
                return (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-current text-gray-300"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                );
              }
            })}
            <span className="text-xs text-gray-400 ml-1">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        ) : (
          <div className="h-5 mb-3" />
        )}

        <div className="flex-1"></div>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-pink-600">
              {priceDisplay}
            </span>
            {maxOriginalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(maxOriginalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          disabled={!hasStock}
          className={`w-full font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm relative overflow-hidden group/btn ${
            hasStock
              ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {hasStock && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{hasStock ? "Add to Cart" : "Out of Stock"}</span>
          </div>
        </button>
      </div>

      <style jsx>{`
        :global(.product-swiper .swiper-button-prev),
        :global(.product-swiper .swiper-button-next) {
          color: #ec4899 !important;
          background: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          opacity: 0;
          transition: opacity 0.3s;
        }

        :global(.product-swiper:hover .swiper-button-prev),
        :global(.product-swiper:hover .swiper-button-next) {
          opacity: 1;
        }

        :global(.product-swiper .swiper-button-prev:after),
        :global(.product-swiper .swiper-button-next:after) {
          font-size: 14px;
          font-weight: bold;
        }

        :global(.product-swiper .swiper-pagination-bullet) {
          background: #f9a8d4 !important;
          opacity: 0.6 !important;
          width: 8px;
          height: 8px;
          transition: all 0.3s;
        }

        :global(.product-swiper .swiper-pagination-bullet-active) {
          background: #ec4899 !important;
          opacity: 1 !important;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
