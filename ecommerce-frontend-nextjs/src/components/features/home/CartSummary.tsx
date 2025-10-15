"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createOrder } from "@/api/order.api";
import { CreateOrderReqBody } from "@/types/backend";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (price: number) => string;
  itemCount: number;
  cartItems: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
  }>;
  userId: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

type PaymentMethod = "vnpay" | "momo" | "cod";
type ShippingMethod = "standard" | "express";

export default function CartSummary({
  subtotal,
  shipping: initialShipping,
  total: initialTotal,
  formatPrice,
  itemCount,
  cartItems,
  userId,
  userInfo,
}: CartSummaryProps) {
  const router = useRouter();

  // Payment & Shipping
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Calculate shipping based on method
  const shippingFee = shippingMethod === "express" ? 50000 : initialShipping;

  // Calculate discount
  const discount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? subtotal * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  // Recalculate total
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      // TODO: Call real API to validate coupon
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock coupon validation
      if (couponCode.toUpperCase() === "DISCOUNT10") {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          type: "percentage",
          value: 10,
          description: "Giảm 10%",
        });
      } else if (couponCode.toUpperCase() === "FREESHIP") {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          type: "fixed",
          value: shippingFee,
          description: "Miễn phí vận chuyển",
        });
      } else {
        alert("Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log("=== CHECKOUT DEBUG ===");
      console.log("User Info:", userInfo);
      console.log("Payment Method:", paymentMethod);
      console.log("Shipping Method:", shippingMethod);
      console.log("Shipping Fee:", shippingFee);
      console.log("Applied Coupon:", appliedCoupon);
      console.log("Cart Items:", cartItems);

      // Prepare order data
      const orderData: CreateOrderReqBody = {
        shipping_address: {
          full_name: userInfo.name,
          phone_number: userInfo.phone,
          address: userInfo.address,
          city: "Ho Chi Minh City",
          district: "",
          ward: "",
        },
        note: "",
        payment_method: paymentMethod,
        shipping_fee: shippingFee,
        discount_code: appliedCoupon?.code,
      };

      console.log("Order Data to send:", orderData);

      // Call API to create order
      const response = await createOrder(orderData);
      console.log("API Response:", response);

      if (!response.success || !response.data) {
        console.error("Order creation failed:", response.error);
        alert(response.error || "Có lỗi xảy ra khi tạo đơn hàng");
        setIsProcessing(false);
        return;
      }

      // Backend trả về: { order: Order, payment_url?: string }
      const { order, payment_url } = response.data.data;
      console.log("Order created:", order);
      console.log("Payment URL:", payment_url);

      // Handle payment redirect
      if (paymentMethod === "momo" || paymentMethod === "vnpay") {
        if (payment_url) {
          console.log("Redirecting to payment gateway:", payment_url);
          // Redirect to payment gateway
          window.location.href = payment_url;
        } else {
          console.error("No payment URL returned from backend");
          alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
          // Redirect to order page, user can retry payment later
          router.push(`/orders/${order._id}?payment_status=failed`);
        }
      } else if (paymentMethod === "cod") {
        console.log("COD payment, redirecting to order page");
        // Redirect to order success page
        router.push(`/orders/${order._id}?payment_status=pending`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Có lỗi xảy ra trong quá trình thanh toán");
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "vnpay" as PaymentMethod,
      name: "VNPay",
      logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png",
      description: "Thanh toán qua VNPay",
    },
    {
      id: "momo" as PaymentMethod,
      name: "MoMo",
      logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
      description: "Ví điện tử MoMo",
    },
    {
      id: "cod" as PaymentMethod,
      name: "COD",
      icon: (
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      description: "Thanh toán khi nhận hàng",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6 space-y-6">
      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-pink-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Phương thức thanh toán
        </h3>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              disabled={isProcessing}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === method.id
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-pink-300"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white">
                {method.logo ? (
                  <Image
                    src={method.logo}
                    alt={method.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  method.icon
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{method.name}</div>
                <div className="text-xs text-gray-500">
                  {method.description}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id
                    ? "border-pink-500 bg-pink-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMethod === method.id && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shipping Method */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-pink-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          Phương thức vận chuyển
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => setShippingMethod("standard")}
            disabled={isProcessing}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              shippingMethod === "standard"
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-pink-300"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Giao hàng tiêu chuẩn
                </div>
                <div className="text-xs text-gray-500">3-5 ngày làm việc</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">
                {formatPrice(30000)}
              </div>
            </div>
          </button>

          <button
            onClick={() => setShippingMethod("express")}
            disabled={isProcessing}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              shippingMethod === "express"
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-pink-300"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Giao hàng nhanh
                </div>
                <div className="text-xs text-gray-500">1-2 ngày làm việc</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">
                {formatPrice(50000)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Coupon */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-pink-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Mã giảm giá
        </h3>

        {appliedCoupon ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-bold text-green-700">
                  {appliedCoupon.code}
                </div>
                <div className="text-sm text-green-600">
                  {appliedCoupon.description}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={isProcessing}
              className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              disabled={applyingCoupon || isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applyingCoupon || !couponCode.trim() || isProcessing}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              {applyingCoupon ? (
                <svg
                  className="w-5 h-5 animate-spin"
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
              ) : (
                "Áp dụng"
              )}
            </button>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          💡 Thử mã:{" "}
          <span className="font-semibold text-pink-600">DISCOUNT10</span> hoặc{" "}
          <span className="font-semibold text-pink-600">FREESHIP</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính ({itemCount} sản phẩm)</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span>
            <span className="font-semibold">{formatPrice(shippingFee)}</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-pink-600">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || itemCount === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
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
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span>Thanh toán</span>
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>

        {/* Continue Shopping */}
        <Link
          href="/products"
          className="w-full border-2 border-gray-200 hover:border-pink-300 text-gray-700 hover:text-pink-600 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Tiếp tục mua sắm</span>
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="pt-6 border-t space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-green-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Thanh toán an toàn & bảo mật</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Hỗ trợ 24/7</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-orange-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Đổi trả miễn phí trong 7 ngày</span>
        </div>
      </div>
    </div>
  );
}
