"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  CreatePaymentReqBody,
  GetPaymentsReqQuery,
  IBackEndResponse,
  MomoCallbackReqBody,
  Paginated,
  Payment,
  PaymentUrlResponse,
  RefundPaymentReqBody,
  VnpayReturnReqQuery,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

// Type cho MoMo return params
interface MomoReturnParams {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: string;
  message: string;
  payType: string;
  responseTime: string;
  extraData: string;
  signature: string;
}

/**
 * Tạo payment và nhận payment URL
 */
export async function createPayment(
  body: CreatePaymentReqBody
): Promise<FetchApiResponse<PaymentUrlResponse>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<PaymentUrlResponse>>(
      "/payments",
      body
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to create payment.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy payment theo order_id
 */
export async function getPaymentByOrder(
  orderId: string
): Promise<FetchApiResponse<Payment>> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<Payment>>(
      `/payments/order/${orderId}`
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred while fetching payment.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to fetch payment.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  paymentId: string
): Promise<FetchApiResponse<Payment>> {
  if (!paymentId) {
    return { success: false, error: "Payment ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<Payment>>(
      `/payments/${paymentId}/verify`
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred while verifying payment.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to verify payment.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Lấy tất cả payments (Admin only)
 */
export async function getAllPayments(params?: GetPaymentsReqQuery) {
  const api = await createServerApi();

  const queryParams = new URLSearchParams();

  if (params?.order_id) {
    queryParams.append("order_id", params.order_id);
  }
  if (params?.status) {
    queryParams.append("status", params.status);
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
  if (params?.page) {
    queryParams.append("page", params.page);
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit);
  }

  const endpoint = `/payments/admin${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data } = await api.get<IBackEndResponse<Paginated<Payment>>>(
    endpoint
  );

  return data;
}

/**
 * Refund payment (Admin only)
 */
export async function refundPayment(
  paymentId: string,
  body: RefundPaymentReqBody
): Promise<FetchApiResponse<Payment>> {
  if (!paymentId) {
    return { success: false, error: "Payment ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Payment>>(
      `/payments/${paymentId}/refund`,
      body
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred while refunding payment.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to refund payment.";
    }

    return { success: false, error: errorMessage };
  }
}

// ========== PAYMENT GATEWAY CALLBACKS ==========

/**
 * Xử lý callback từ MoMo (IPN - Instant Payment Notification)
 * Route: POST /payments/momo/callback
 * Note: Được gọi từ MoMo server, không cần auth
 */
export async function handleMoMoCallback(
  callbackData: MomoCallbackReqBody
): Promise<FetchApiResponse<any>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<any>>(
      "/payments/momo/callback",
      callbackData
    );

    return { success: true, data: data };
  } catch (error) {

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to process MoMo callback.";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Xử lý return từ MoMo (user được redirect về sau khi thanh toán)
 * Note: Frontend gọi để xử lý MoMo return params
 */
export async function handleMoMoReturn(params: MomoReturnParams) {
  try {
    const api = await createServerApi();

    // Convert params to query string
    const queryString = new URLSearchParams({
      partnerCode: params.partnerCode,
      orderId: params.orderId,
      requestId: params.requestId,
      amount: params.amount,
      orderInfo: params.orderInfo,
      orderType: params.orderType,
      transId: params.transId,
      resultCode: params.resultCode,
      message: params.message,
      payType: params.payType,
      responseTime: params.responseTime,
      extraData: params.extraData,
      signature: params.signature,
    }).toString();

    const endpoint = `/payments/momo/callback?${queryString}`;

    const { data } = await api.get<IBackEndResponse<any>>(endpoint);

    return { success: true, data: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Xử lý return URL từ VNPay (user được redirect về sau khi thanh toán)
 * Route: GET /payments/vnpay/callback
 * Note: Được gọi khi user được redirect từ VNPay
 */
export const handleVNPayReturn = async (params: VnpayReturnReqQuery) => {
  try {
    const api = await createServerApi();

    // Build query string với tất cả params
    const queryParams: Record<string, string> = {
      vnp_Amount: params.vnp_Amount,
      vnp_BankCode: params.vnp_BankCode,
      vnp_OrderInfo: params.vnp_OrderInfo,
      vnp_PayDate: params.vnp_PayDate,
      vnp_ResponseCode: params.vnp_ResponseCode,
      vnp_TmnCode: params.vnp_TmnCode,
      vnp_TransactionNo: params.vnp_TransactionNo,
      vnp_TransactionStatus: params.vnp_TransactionStatus,
      vnp_TxnRef: params.vnp_TxnRef,
      vnp_SecureHash: params.vnp_SecureHash,
    };

    // Add optional params
    if (params.vnp_BankTranNo) {
      queryParams.vnp_BankTranNo = params.vnp_BankTranNo;
    }
    if (params.vnp_CardType) {
      queryParams.vnp_CardType = params.vnp_CardType;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `/payments/vnpay/callback?${queryString}`;

    const { data } = await api.get<IBackEndResponse<any>>(endpoint);

    return { success: true, data: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
