"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  CancelOrderReqBody,
  CreateOrderReqBody,
  GetOrdersReqQuery,
  IBackEndResponse,
  Order,
  Paginated,
  UpdateOrderStatusReqBody,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

export async function createOrder(
  body: CreateOrderReqBody
): Promise<FetchApiResponse<{ order: Order; payment_url?: string }>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<
      IBackEndResponse<{ order: Order; payment_url?: string }>
    >("/orders", body);

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating order:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to create order.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function getMyOrders(params?: GetOrdersReqQuery) {
  const api = await createServerApi();

  const queryParams = new URLSearchParams();

  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.payment_status) {
    queryParams.append("payment_status", params.payment_status);
  }
  if (params?.payment_method) {
    queryParams.append("payment_method", params.payment_method);
  }
  if (params?.from_date) {
    queryParams.append("from_date", params.from_date);
  }
  if (params?.to_date) {
    queryParams.append("to_date", params.to_date);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.page) {
    queryParams.append("page", params.page);
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit);
  }
  if (params?.sort) {
    queryParams.append("sort", params.sort);
  }

  const endpoint = `/orders/me${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data } = await api.get<IBackEndResponse<Paginated<Order>>>(endpoint);

  return data;
}

export async function getAllOrders(params?: GetOrdersReqQuery) {
  const api = await createServerApi();

  const queryParams = new URLSearchParams();

  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.payment_status) {
    queryParams.append("payment_status", params.payment_status);
  }
  if (params?.payment_method) {
    queryParams.append("payment_method", params.payment_method);
  }
  if (params?.from_date) {
    queryParams.append("from_date", params.from_date);
  }
  if (params?.to_date) {
    queryParams.append("to_date", params.to_date);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.page) {
    queryParams.append("page", params.page);
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit);
  }
  if (params?.sort) {
    queryParams.append("sort", params.sort);
  }

  const endpoint = `/orders/admin${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data } = await api.get<IBackEndResponse<Paginated<Order>>>(endpoint);

  return data;
}

export async function getOrder(
  orderId: string
): Promise<FetchApiResponse<Order>> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<Order>>(
      `/orders/${orderId}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);

    let errorMessage = "An unknown error occurred while fetching the order.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to fetch order.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function getOrderStatistics(): Promise<FetchApiResponse<any>> {
  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<any>>("/orders/statistics");

    return { success: true, data: data };
  } catch (error) {
    console.error("Error fetching order statistics:", error);

    let errorMessage = "An unknown error occurred while fetching statistics.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to fetch statistics.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function updateOrderStatus(
  orderId: string,
  body: UpdateOrderStatusReqBody
): Promise<FetchApiResponse<Order>> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Order>>(
      `/orders/${orderId}/status`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error updating order status ${orderId}:`, error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update order status.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function cancelOrder(
  orderId: string,
  body: CancelOrderReqBody
): Promise<FetchApiResponse<Order>> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Order>>(
      `/orders/${orderId}/cancel`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error cancelling order with ID ${orderId}:`, error);

    let errorMessage = "An unknown error occurred while cancelling the order.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to cancel order.";
    }

    return { success: false, error: errorMessage };
  }
}
