"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  AddProductReqBody,
  GetProductsQuery,
  IBackEndResponse,
  Paginated,
  Product,
  UpdateProductReqBody,
  VariantReqBody,
  UpdateVariantStockReqBody,
  ProductPriceRange,
  ProductAvailability,
  GetVariantResponse,
  Variant,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

// ========== PRODUCT OPERATIONS ==========
export async function getAllProducts(query: GetProductsQuery = {}) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  const page = query.page || 1;
  const limit = query.limit || 10;

  params.append("page", String(page));
  params.append("limit", String(limit));

  if (query.name) params.append("name", query.name);
  if (query.brand_id) params.append("brand_id", query.brand_id);
  if (query.category_id) params.append("category_id", query.category_id);
  if (query.min_price !== undefined)
    params.append("min_price", String(query.min_price));
  if (query.max_price !== undefined)
    params.append("max_price", String(query.max_price));
  if (query.is_available !== undefined)
    params.append("is_available", String(query.is_available));
  if (query.skin_type) params.append("skin_type", query.skin_type);
  if (query.origin) params.append("origin", query.origin);
  if (query.sort_by) params.append("sort_by", query.sort_by);
  if (query.order) params.append("order", query.order);

  const endpoint = `/products/all?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Paginated<Product>>>(
    endpoint
  );

  // normalize here
  const normalized = normalizeProducts(data.data.items);

  return {
    ...data,
    data: {
      ...data.data,
      items: normalized,
    },
  };
}

export async function getFeaturedProducts(limit: number = 10) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  params.append("limit", String(limit));
  params.append("populate", "brand,category");
  const endpoint = `/products/featured?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Product[]>>(endpoint);

  return data;
}

export async function getProductsByBrand(brand_id: string, limit: number = 10) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  params.append("limit", String(limit));

  const endpoint = `/products/brand/${brand_id}?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Product[]>>(endpoint);

  return data;
}

export async function getProductsByCategory(
  category_id: string,
  limit: number = 10
) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  params.append("limit", String(limit));

  const endpoint = `/products/category/${category_id}?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Product[]>>(endpoint);

  return data;
}
// src/api/product.api.ts

export async function getProductById(
  product_id: string
): Promise<IBackEndResponse<Product>> {
  const api = await createServerApi();

  try {
    // Đảm bảo sử dụng GET method
    const { data } = await api.get<IBackEndResponse<Product>>(
      `/products/${product_id}`
    );

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getProductPriceRange(product_id: string) {
  const api = await createServerApi();

  const { data } = await api.get<IBackEndResponse<ProductPriceRange>>(
    `/products/${product_id}/price-range`
  );

  return data;
}

export async function getProductAvailability(product_id: string) {
  const api = await createServerApi();

  const { data } = await api.get<IBackEndResponse<ProductAvailability>>(
    `/products/${product_id}/availability`
  );

  return data;
}

export async function addProduct(
  body: AddProductReqBody
): Promise<FetchApiResponse<Product>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Product>>(
      `/products`,
      body
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "An unexpected error occurred.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function updateProduct(
  product_id: string,
  body: UpdateProductReqBody
): Promise<FetchApiResponse<Product>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Product>>(
      `/products/${product_id}`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update product.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteProduct(
  product_id: string
): Promise<FetchApiResponse<null>> {
  if (!product_id) {
    return { success: false, error: "Product ID is required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/products/${product_id}`
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred while deleting the product.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to delete product.";
    }

    return { success: false, error: errorMessage };
  }
}

// ========== VARIANT OPERATIONS ==========

export async function addVariant(
  product_id: string,
  body: VariantReqBody
): Promise<FetchApiResponse<Variant>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Variant>>(
      `/products/${product_id}/variants`,
      body
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to add variant.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function getVariant(product_id: string, variant_id: string) {
  const api = await createServerApi();

  const { data } = await api.get<IBackEndResponse<GetVariantResponse>>(
    `/products/${product_id}/variants/${variant_id}`
  );

  return data;
}

export async function updateVariant(
  product_id: string,
  variant_id: string,
  body: Partial<VariantReqBody>
): Promise<FetchApiResponse<Variant>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Variant>>(
      `/products/${product_id}/variants/${variant_id}`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update variant.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateVariantStock(
  product_id: string,
  variant_id: string,
  quantity: number
): Promise<FetchApiResponse<Variant>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Variant>>(
      `/products/${product_id}/variants/${variant_id}/stock`,
      { quantity }
    );
    return { success: true, data: data };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update variant stock.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteVariant(
  product_id: string,
  variant_id: string
): Promise<FetchApiResponse<null>> {
  if (!product_id || !variant_id) {
    return { success: false, error: "Product ID and Variant ID are required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/products/${product_id}/variants/${variant_id}`
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred while deleting the variant.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to delete variant.";
    }

    return { success: false, error: errorMessage };
  }
}

function normalizeProducts(products: Product[]): Product[] {
  return products.map((p) => {
    const isAvailable = p.variants?.some((v) => v.is_available) ?? false;

    return {
      ...p,
      is_available: isAvailable,
    };
  });
}
