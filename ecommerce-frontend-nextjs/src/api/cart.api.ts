"use server";
import { createServerApi } from "@/lib/serverApi";
import {
  AddToCartReqBody,
  Cart,
  CartSummary,
  IBackEndResponse,
  MigrateCartReqBody,
  UpdateCartItemReqBody,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

export async function getCart(sessionId?: string) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  if (sessionId) {
    params.append("session_id", sessionId);
  }

  const endpoint = params.toString() ? `/carts?${params.toString()}` : "/carts";

  const { data } = await api.get<IBackEndResponse<Cart>>(endpoint);

  return data;
}

export async function addToCart(
  body: AddToCartReqBody
): Promise<FetchApiResponse<Cart>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Cart>>(`/carts`, body);

    return { success: true, data: data };
  } catch (error) {
    console.error("Error adding to cart:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to add item to cart.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function updateCartItem(
  productId: string,
  variantId: string,
  body: UpdateCartItemReqBody
): Promise<FetchApiResponse<Cart>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Cart>>(
      `/carts/${productId}/variants/${variantId}`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error updating cart item:`, error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update cart item.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function removeFromCart(
  productId: string,
  variantId: string
): Promise<FetchApiResponse<Cart>> {
  if (!productId || !variantId) {
    return {
      success: false,
      error: "Product ID and Variant ID are required.",
    };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.delete<IBackEndResponse<Cart>>(
      `/carts/${productId}/variants/${variantId}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error removing item from cart:`, error);

    let errorMessage = "An unknown error occurred while removing item.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to remove item from cart.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function clearCart(): Promise<
  FetchApiResponse<{ message: string }>
> {
  try {
    const api = await createServerApi();
    const { data } = await api.delete<IBackEndResponse<{ message: string }>>(
      `/carts`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error clearing cart:", error);

    let errorMessage = "An unknown error occurred while clearing cart.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to clear cart.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function migrateCart(
  body: MigrateCartReqBody
): Promise<FetchApiResponse<Cart>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Cart>>(
      `/carts/migrate`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error migrating cart:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to migrate cart.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function getCartSummary(
  sessionId?: string
): Promise<IBackEndResponse<CartSummary>> {
  const api = await createServerApi();

  const params = new URLSearchParams();
  if (sessionId) {
    params.append("session_id", sessionId);
  }

  const endpoint = params.toString()
    ? `/carts/summary?${params.toString()}`
    : "/carts/summary";

  const { data } = await api.get<IBackEndResponse<CartSummary>>(endpoint);

  return data;
}
