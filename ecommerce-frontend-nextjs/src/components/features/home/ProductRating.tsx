"use client";

import { useState, useEffect } from "react";
import { RatingStats } from "@/types/backend";
import { getRatingStats } from "@/api/review.api";

interface ProductRatingProps {
  productId: string;
  onFilterChange?: (rating: string) => void;
  activeFilter?: string;
}

export default function ProductRating({
  productId,
  onFilterChange,
  activeFilter = "",
}: ProductRatingProps) {
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingStats();
  }, [productId]);

  const loadRatingStats = async () => {
    try {
      setLoading(true);
      const response = await getRatingStats(productId);
      if (response.status === 200 && response.data) {
        setRatingStats(response.data);
      }
    } catch (error) {
      console.error("Error loading rating stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (
    !ratingStats ||
    ratingStats.total_reviews === 0 ||
    typeof ratingStats.average_rating !== "number"
  ) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <p className="font-medium">Chưa có đánh giá nào</p>
          <p className="text-sm mt-1">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-pink-600 mb-2">
            {ratingStats.average_rating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => {
              const isFilled = i < Math.floor(ratingStats.average_rating);
              const isHalf =
                i === Math.floor(ratingStats.average_rating) &&
                ratingStats.average_rating % 1 >= 0.5;

              return (
                <svg
                  key={i}
                  className={`w-6 h-6 ${
                    isFilled || isHalf
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              );
            })}
          </div>
          <p className="text-gray-600">{ratingStats.total_reviews} đánh giá</p>
          {ratingStats.verified_purchase_count > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {ratingStats.verified_purchase_count} đã mua hàng
            </p>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats.rating_distribution[star] || 0;
            const percentage =
              ratingStats.total_reviews > 0
                ? (count / ratingStats.total_reviews) * 100
                : 0;

            return (
              <button
                key={star}
                onClick={() =>
                  onFilterChange?.(
                    activeFilter === String(star) ? "" : String(star)
                  )
                }
                className={`flex items-center gap-3 w-full group hover:bg-gray-50 p-2 rounded transition-colors ${
                  activeFilter === String(star) ? "bg-pink-50" : ""
                }`}
              >
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{star}</span>
                  <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
