"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { handleVNPayReturn, handleMoMoReturn } from "@/api/payment.api";
import { VnpayReturnReqQuery } from "@/types/backend";
import Link from "next/link";

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

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [orderId, setOrderId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "momo" | null>(
    null
  );

  useEffect(() => {
    const processReturn = async () => {
      try {
        // Phát hiện payment gateway dựa vào query params
        const hasVNPayParams = searchParams.has("vnp_TxnRef");
        const hasMoMoParams =
          searchParams.has("orderId") && searchParams.has("partnerCode");

        if (hasVNPayParams) {
          setPaymentMethod("vnpay");
          await processVNPayReturn();
        } else if (hasMoMoParams) {
          setPaymentMethod("momo");
          await processMoMoReturn();
        } else {
          setStatus("failed");
          setMessage("Không xác định được phương thức thanh toán");
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setStatus("failed");
        setMessage("Có lỗi xảy ra khi xử lý thanh toán");
      }
    };

    processReturn();
  }, [searchParams]);

  const processVNPayReturn = async () => {
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
      vnp_TransactionStatus: searchParams.get("vnp_TransactionStatus") || "",
      vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
      vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
    };

    const response = await handleVNPayReturn(params);

    if (response.success && response.data) {
      const { order_id, payment_status } = response.data.data;
      setOrderId(order_id);

      if (payment_status === "completed" || params.vnp_ResponseCode === "00") {
        setStatus("success");
        setMessage("Thanh toán thành công!");
      } else {
        setStatus("failed");
        setMessage(getVNPayErrorMessage(params.vnp_ResponseCode));
      }
    } else {
      setStatus("failed");
      setMessage(response.error || "Có lỗi xảy ra khi xử lý thanh toán");
    }
  };

  const processMoMoReturn = async () => {
    const params: MomoReturnParams = {
      partnerCode: searchParams.get("partnerCode") || "",
      orderId: searchParams.get("orderId") || "",
      requestId: searchParams.get("requestId") || "",
      amount: searchParams.get("amount") || "",
      orderInfo: searchParams.get("orderInfo") || "",
      orderType: searchParams.get("orderType") || "",
      transId: searchParams.get("transId") || "",
      resultCode: searchParams.get("resultCode") || "",
      message: searchParams.get("message") || "",
      payType: searchParams.get("payType") || "",
      responseTime: searchParams.get("responseTime") || "",
      extraData: searchParams.get("extraData") || "",
      signature: searchParams.get("signature") || "",
    };

    const response = await handleMoMoReturn(params);

    if (response.success && response.data) {
      const { order_id, payment_status } = response.data.data;
      setOrderId(order_id);

      if (payment_status === "completed" || params.resultCode === "0") {
        setStatus("success");
        setMessage("Thanh toán thành công!");
      } else {
        setStatus("failed");
        setMessage(getMoMoErrorMessage(params.resultCode, params.message));
      }
    } else {
      setStatus("failed");
      setMessage(response.error || "Có lỗi xảy ra khi xử lý thanh toán");
    }
  };

  const getVNPayErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      "99": "Các lỗi khác",
    };
    return errorMessages[code] || "Thanh toán thất bại. Vui lòng thử lại.";
  };

  const getMoMoErrorMessage = (code: string, message: string): string => {
    const errorMessages: Record<string, string> = {
      "9000": "Giao dịch bị từ chối bởi người dùng.",
      "1001":
        "Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền.",
      "1002": "Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán.",
      "1003": "Giao dịch bị hủy.",
      "1004":
        "Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng.",
      "1005": "Giao dịch thất bại do url hoặc QR code đã hết hạn.",
      "1006":
        "Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán.",
      "1007":
        "Giao dịch bị từ chối vì tài khoản người dùng đang ở trạng thái tạm khóa.",
      "1017": "Giao dịch thất bại do người dùng hủy giao dịch.",
      "1026": "Giao dịch bị giới hạn theo quy định.",
      "2001": "Giao dịch thất bại do sai thông tin.",
      "3001": "Giao dịch bị từ chối bởi issuer.",
      "3002": "Thẻ không tồn tại hoặc chưa được đăng ký.",
      "3003": "Thẻ đã hết hạn hoặc ngày hết hạn không chính xác.",
      "3004": "Không đủ số dư để thực hiện giao dịch.",
      "3005": "OTP không hợp lệ.",
      "3006": "OTP đã hết hạn.",
      "3007": "Đã vượt quá số lần nhập OTP.",
    };
    return (
      errorMessages[code] || message || "Thanh toán thất bại. Vui lòng thử lại."
    );
  };

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
            <p className="text-center text-gray-600 mb-2">{message}</p>
            {paymentMethod && (
              <p className="text-center text-sm text-gray-500 mb-6">
                Phương thức: {paymentMethod === "vnpay" ? "VNPay" : "MoMo"}
              </p>
            )}
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
            <p className="text-center text-gray-600 mb-2">{message}</p>
            {paymentMethod && (
              <p className="text-center text-sm text-gray-500 mb-6">
                Phương thức: {paymentMethod === "vnpay" ? "VNPay" : "MoMo"}
              </p>
            )}
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
