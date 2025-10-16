"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  IBackEndResponse,
  Paginated,
  Review,
  CreateReviewReqBody,
  UpdateReviewReqBody,
  SellerResponseReqBody,
  GetReviewsQuery,
  RatingStats,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

// ========== REVIEW OPERATIONS ==========

/**
 * Get all reviews with optional filtering and pagination
 */
export async function getReviews(
  query: GetReviewsQuery = {}
): Promise<IBackEndResponse<Paginated<Review>>> {
  const api = await createServerApi();

  const params = new URLSearchParams();
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  params.append("page", String(page));
  params.append("limit", String(limit));

  // Thêm populate để lấy thông tin user
  params.append("populate", "user");

  if (query.product_id) params.append("product_id", query.product_id);
  if (query.user_id) params.append("user_id", query.user_id);
  if (query.rating) params.append("rating", query.rating);
  if (query.status) params.append("status", query.status);
  if (query.is_verified_purchase)
    params.append("is_verified_purchase", query.is_verified_purchase);
  if (query.sort_by) params.append("sort_by", query.sort_by);
  if (query.order) params.append("order", query.order);

  const endpoint = `/reviews?${params.toString()}`;

  try {
    const { data } = await api.get<IBackEndResponse<Paginated<Review>>>(
      endpoint
    );

    // Validate response structure
    if (!data.data) {
      console.error("Invalid response structure:", data);
      return {
        status: data.status || 200,
        message: data.message || "Success",
        data: {
          items: [],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        },
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Return empty paginated result instead of throwing
    return {
      status: 500,
      message: "Failed to fetch reviews",
      data: {
        items: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      },
    };
  }
}

/**
 * Get a single review by ID
 */
export async function getReviewById(
  review_id: string
): Promise<IBackEndResponse<Review>> {
  const api = await createServerApi();

  try {
    const { data } = await api.get<IBackEndResponse<Review>>(
      `/reviews/${review_id}?populate=user`
    );
    return data;
  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
}
/**
 * Get rating statistics for a product
 */
export async function getRatingStats(
  product_id: string
): Promise<IBackEndResponse<RatingStats>> {
  const api = await createServerApi();

  try {
    const { data } = await api.get<IBackEndResponse<RatingStats>>(
      `/reviews/products/${product_id}/stats`
    );
    return data;
  } catch (error) {
    console.error("Error fetching rating stats:", error);
    // Return default stats instead of throwing
    return {
      status: 200,
      message: "No rating stats available",
      data: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {},
        verified_purchase_count: 0,
      },
    };
  }
}

/**
 * Create a new review
 */
export async function createReview(
  body: CreateReviewReqBody
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Review>>(`/reviews`, body);

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating review:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "An unexpected error occurred.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  review_id: string,
  body: UpdateReviewReqBody
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Review>>(
      `/reviews/${review_id}`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error updating review ${review_id}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to update review.";
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  review_id: string
): Promise<FetchApiResponse<null>> {
  if (!review_id) {
    return { success: false, error: "Review ID is required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/reviews/${review_id}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error deleting review with ID ${review_id}:`, error);

    let errorMessage = "An unknown error occurred while deleting the review.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to delete review.";
    }

    return { success: false, error: errorMessage };
  }
}

// ========== REVIEW ACTIONS ==========

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  review_id: string
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Review>>(
      `/reviews/${review_id}/helpful`
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error marking review ${review_id} as helpful:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to mark review as helpful.";
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Report a review
 */
export async function reportReview(
  review_id: string
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Review>>(
      `/reviews/${review_id}/report`
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error reporting review ${review_id}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to report review.";
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Add seller response to a review
 */
export async function addSellerResponse(
  review_id: string,
  body: SellerResponseReqBody
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Review>>(
      `/reviews/${review_id}/response`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(
      `Error adding seller response to review ${review_id}:`,
      error
    );
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to add seller response.";
    }
    return { success: false, error: errorMessage };
  }
}

// ========== ADMIN OPERATIONS ==========

/**
 * Approve a review (Admin only)
 */
export async function approveReview(
  review_id: string
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Review>>(
      `/reviews/${review_id}/approve`
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error approving review ${review_id}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to approve review.";
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Reject a review (Admin only)
 */
export async function rejectReview(
  review_id: string
): Promise<FetchApiResponse<Review>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Review>>(
      `/reviews/${review_id}/reject`
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error rejecting review ${review_id}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to reject review.";
    }
    return { success: false, error: errorMessage };
  }
}
