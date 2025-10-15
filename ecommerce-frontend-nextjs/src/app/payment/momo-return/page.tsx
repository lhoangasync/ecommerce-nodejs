"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleVNPayReturn } from "@/api/payment.api";
import { VnpayReturnReqQuery } from "@/types/backend";
import Link from "next/link";

export default function VNPayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [orderId, setOrderId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const processReturn = async () => {
      try {
        // Lấy tất cả query params
        const params: VnpayReturnReqQuery = {
          vnp_Amount: searchParams.get("vnp_Amount") || "",
          vnp_BankCode: searchParams.get("vnp_BankCode") || "",
          vnp_BankTranNo: searchParams.get("vnp_BankTranNo") || undefined,
          vnp_CardType: searchParams.get("vnp_CardType") || undefined,
          vnp_OrderInfo: searchParams.get("vnp_OrderInfo") || "",
          vnp_PayDate: searchParams.get("vnp_PayDate") || "",
          vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
          vnp_TmnCode: searchParams.get("vnp_TmnCode") || "",
          vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
          vnp_TransactionStatus:
            searchParams.get("vnp_TransactionStatus") || "",
          vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
          vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
        };

        const response = await handleVNPayReturn(params);

        if (response.success && response.data) {
          const { order_id, payment_status } = response.data.data;
          setOrderId(order_id);

          if (
            payment_status === "completed" ||
            params.vnp_ResponseCode === "00"
          ) {
            setStatus("success");
            setMessage("Thanh toán thành công!");
          } else {
            setStatus("failed");
            setMessage("Thanh toán thất bại. Vui lòng thử lại.");
          }
        } else {
          setStatus("failed");
          setMessage(response.error || "Có lỗi xảy ra khi xử lý thanh toán");
        }
      } catch (error) {
        console.error("Error processing VNPay return:", error);
        setStatus("failed");
        setMessage("Có lỗi xảy ra khi xử lý thanh toán");
      }
    };

    processReturn();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-600 mt-2">Vui lòng không đóng trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {status === "success" ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Thanh toán thành công!
            </h2>
            <p className="text-center text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-lg font-bold text-green-700">{orderId}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Thanh toán thất bại
            </h2>
            <p className="text-center text-gray-600 mb-6">{message}</p>
          </>
        )}

        <div className="space-y-3">
          {status === "success" && orderId && (
            <Link
              href={`/orders/${orderId}`}
              className="block w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:scale-105"
            >
              Xem chi tiết đơn hàng
            </Link>
          )}
          <Link
            href="/orders"
            className="block w-full border-2 border-gray-200 hover:border-pink-300 text-gray-700 hover:text-pink-600 font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300"
          >
            Xem tất cả đơn hàng
          </Link>
          <Link
            href="/products"
            className="block w-full text-center text-gray-600 hover:text-pink-600 font-medium py-2 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
