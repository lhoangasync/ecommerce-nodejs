"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface CartItemProps {
  item: any;
  onUpdateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  onRemove: (productId: string, variantId: string) => void;
  updating: string | null;
  formatPrice: (price: number) => string;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  updating,
  formatPrice,
}: CartItemProps) {
  // Cache data to keep when updating
  const [cachedProduct, setCachedProduct] = useState<any>(null);
  const [cachedVariant, setCachedVariant] = useState<any>(null);

  const product = item.product || item.product_id;
  const variant = item.variant || item.variant_id;

  // Update cache when valid data is available
  useEffect(() => {
    if (product && typeof product !== "string") {
      setCachedProduct(product);
    }
    if (variant && typeof variant !== "string") {
      setCachedVariant(variant);
    }
  }, [product, variant]);

  // Use cached data if current data is invalid
  const displayProduct =
    product && typeof product !== "string" ? product : cachedProduct;
  const displayVariant =
    variant && typeof variant !== "string" ? variant : cachedVariant;

  // Only return null if no cache available
  if (!displayProduct || !displayVariant) {
    return null;
  }

  // FIX: Get ID from original item instead of displayProduct/displayVariant
  const productId =
    typeof item.product_id === "object" ? item.product_id._id : item.product_id;

  const variantId =
    typeof item.variant_id === "object"
      ? item.variant_id._id || item.variant_id.id
      : item.variant_id;

  const updateKey = `${productId}-${variantId}`;
  const isUpdating = updating === updateKey;

  const variantInfo =
    displayVariant.shade_color || displayVariant.volume_size || "Default";
  const productImage =
    displayVariant.images?.[0] ||
    displayProduct.images?.[0] ||
    "/images/placeholder.jpg";

  const itemTotal = displayVariant.price * item.quantity;
  const hasDiscount =
    displayVariant.original_price &&
    displayVariant.original_price > displayVariant.price;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-2xl flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-pink-600">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">Updating...</span>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Product Image */}
        <Link
          href={`/products/${displayProduct.slug}`}
          className="flex-shrink-0"
        >
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 hover:ring-2 hover:ring-pink-400 transition-all">
            <Image
              src={productImage}
              alt={displayProduct.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${displayProduct.slug}`}
                className="text-lg font-bold text-gray-900 hover:text-pink-600 transition-colors line-clamp-2"
              >
                {displayProduct.name}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                Variant: <span className="font-medium">{variantInfo}</span>
              </p>
              {displayVariant.sku && (
                <p className="text-xs text-gray-400 mt-1">
                  SKU: {displayVariant.sku}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(productId, variantId)}
              disabled={isUpdating}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Remove product"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-end justify-between gap-4 mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">
                Quantity:
              </span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    onUpdateQuantity(productId, variantId, item.quantity - 1)
                  }
                  disabled={isUpdating || item.quantity <= 1}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="px-4 py-1.5 border-x-2 border-gray-200 font-semibold min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(productId, variantId, item.quantity + 1)
                  }
                  disabled={
                    isUpdating || item.quantity >= displayVariant.stock_quantity
                  }
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-pink-600">
                {formatPrice(itemTotal)}
              </div>
              {hasDiscount && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(displayVariant.original_price * item.quantity)}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {formatPrice(displayVariant.price)} / product
              </div>
            </div>
          </div>

          {/* Stock Warning */}
          {displayVariant.stock_quantity < 10 && (
            <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg inline-block">
              ⚠️ Only {displayVariant.stock_quantity} products left
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
