import Image from "next/image";
import { Review, UserProfile } from "@/types/backend";
import { Check, XCircle } from "lucide-react";
interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  currentUser?: UserProfile;
  onMarkHelpful: (reviewId: string) => void;
  onApprove?: (reviewId: string) => void;
  onReject?: (reviewId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ReviewList({
  reviews,
  isLoading = false,
  currentUser,
  onMarkHelpful,
  onApprove,
  onReject,
  currentPage,
  totalPages,
  onPageChange,
}: ReviewListProps) {
  const isAdmin = currentUser?.role === 1; // Assuming role 1 is admin
  console.log("=== ReviewList Debug ===");
  console.log("currentUser:", currentUser);
  console.log("isAdmin:", isAdmin);
  console.log("reviews:", reviews);
  console.log("reviews.length:", reviews.length);
  console.log("isLoading:", isLoading);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Check className="w-3 h-3" />
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Đã từ chối
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-8 h-8 animate-spin mx-auto text-pink-500"
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
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-gray-500 font-medium">Chưa có đánh giá nào</p>
        <p className="text-sm text-gray-400 mt-2">
          Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className={`bg-white rounded-lg p-6 border-2 transition-all ${
            review.status === "pending"
              ? "border-yellow-200 bg-yellow-50/30"
              : review.status === "rejected"
              ? "border-red-200 bg-red-50/30 opacity-75"
              : "border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold text-gray-900">
                  {review.user?.name || "Người dùng"}
                </p>
                {review.is_verified_purchase && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Đã mua hàng
                  </span>
                )}
                {isAdmin && getStatusBadge(review.status)}
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(review.created_at)}
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {review.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Seller Response */}
          {review.seller_response && (
            <div className="mt-4 bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-semibold text-pink-600">
                  Phản hồi từ người bán
                </p>
              </div>
              <p className="text-gray-700">{review.seller_response.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(review.seller_response.created_at)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t flex-wrap">
            {/* Helpful Button - visible to all */}
            <button
              onClick={() => onMarkHelpful(review._id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
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
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>Hữu ích ({review.helpful_count || 0})</span>
            </button>

            {/* Admin Actions - only visible to admin */}
            {isAdmin && review.status === "pending" && (
              <>
                {onApprove && (
                  <button
                    onClick={() => onApprove(review._id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Duyệt
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => onReject(review._id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
