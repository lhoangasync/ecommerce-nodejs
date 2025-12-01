"use client";

import { Suspense } from "react";
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

function PaymentResultContent() {
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
        // Detect payment gateway based on query params
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
          setMessage("Unable to determine payment method");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("An error occurred while processing payment");
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
        setMessage("Payment successful!");
      } else {
        setStatus("failed");
        setMessage(getVNPayErrorMessage(params.vnp_ResponseCode));
      }
    } else {
      setStatus("failed");
      setMessage(response.error || "An error occurred while processing payment");
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
        setMessage("Payment successful!");
      } else {
        setStatus("failed");
        setMessage(getMoMoErrorMessage(params.resultCode, params.message));
      }
    } else {
      setStatus("failed");
      setMessage(response.error || "An error occurred while processing payment");
    }
  };

  const getVNPayErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      "07": "Money deducted successfully. Transaction suspected of fraud or unusual activity.",
      "09": "Transaction failed: Customer card or account has not registered for InternetBanking service.",
      "10": "Transaction failed: Customer entered incorrect card or account information more than 3 times",
      "11": "Transaction failed: Payment timeout has expired.",
      "12": "Transaction failed: Customer card or account is locked.",
      "13": "Transaction failed: Customer entered incorrect OTP authentication password.",
      "24": "Transaction failed: Customer canceled transaction",
      "51": "Transaction failed: Your account does not have sufficient balance to complete the transaction.",
      "65": "Transaction failed: Your account has exceeded the daily transaction limit.",
      "75": "Payment bank is under maintenance.",
      "79": "Transaction failed: Customer entered incorrect payment password more than allowed times.",
      "99": "Other errors",
    };
    return errorMessages[code] || "Payment failed. Please try again.";
  };

  const getMoMoErrorMessage = (code: string, message: string): string => {
    const errorMessages: Record<string, string> = {
      "9000": "Transaction rejected by user.",
      "1001":
        "Payment transaction failed due to insufficient funds in user account.",
      "1002": "Transaction rejected by payment account issuer.",
      "1003": "Transaction canceled.",
      "1004":
        "Transaction failed due to payment amount exceeding user payment limit.",
      "1005": "Transaction failed due to expired URL or QR code.",
      "1006":
        "Transaction failed due to user declining payment confirmation.",
      "1007":
        "Transaction rejected because user account is temporarily locked.",
      "1017": "Transaction failed due to user cancellation.",
      "1026": "Transaction limited by regulations.",
      "2001": "Transaction failed due to incorrect information.",
      "3001": "Transaction rejected by issuer.",
      "3002": "Card does not exist or has not been registered.",
      "3003": "Card has expired or expiration date is incorrect.",
      "3004": "Insufficient balance to complete transaction.",
      "3005": "Invalid OTP.",
      "3006": "OTP has expired.",
      "3007": "OTP entry attempts exceeded.",
    };
    return (
      errorMessages[code] || message || "Payment failed. Please try again."
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Processing payment...
          </h2>
          <p className="text-gray-600 mt-2">Please do not close this page</p>
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
              Payment successful!
            </h2>
            <p className="text-center text-gray-600 mb-2">{message}</p>
            {paymentMethod && (
              <p className="text-center text-sm text-gray-500 mb-6">
                Payment method: {paymentMethod === "vnpay" ? "VNPay" : "MoMo"}
              </p>
            )}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
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
              Payment failed
            </h2>
            <p className="text-center text-gray-600 mb-2">{message}</p>
            {paymentMethod && (
              <p className="text-center text-sm text-gray-500 mb-6">
                Payment method: {paymentMethod === "vnpay" ? "VNPay" : "MoMo"}
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
              View order details
            </Link>
          )}
          <Link
            href="/orders"
            className="block w-full border-2 border-gray-200 hover:border-pink-300 text-gray-700 hover:text-pink-600 font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300"
          >
            View all orders
          </Link>
          <Link
            href="/products"
            className="block w-full text-center text-gray-600 hover:text-pink-600 font-medium py-2 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
