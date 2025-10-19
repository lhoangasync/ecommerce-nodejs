"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createOrder } from "@/api/order.api";
import { getUserAutoCoupons } from "@/api/autoCoupon.api";
import {
  CreateOrderReqBody,
  Coupon,
  UserCouponRedemption,
} from "@/types/backend";
import { toast } from "react-toastify";

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
    product?: {
      _id: string;
      category?: { _id: string };
      brand?: { _id: string };
    };
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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [isProcessing, setIsProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const [userAutoCoupons, setUserAutoCoupons] = useState<
    (UserCouponRedemption & { coupon: Coupon })[]
  >([]);
  const [loadingAutoCoupons, setLoadingAutoCoupons] = useState(false);

  const shippingFee = shippingMethod === "express" ? 50000 : initialShipping;

  useEffect(() => {
    if (selectedCoupon) {
      let discount = 0;

      if (
        selectedCoupon.min_order_value &&
        subtotal < selectedCoupon.min_order_value
      ) {
        toast.error(
          `Đơn hàng tối thiểu ${formatPrice(
            selectedCoupon.min_order_value
          )} để áp dụng mã này`
        );
        setSelectedCoupon(null);
        setCouponCode("");
        setCouponDiscount(0);
        return;
      }

      if (selectedCoupon.discount_type === "percentage") {
        discount = (subtotal * selectedCoupon.discount_value) / 100;
        if (selectedCoupon.max_discount_amount) {
          discount = Math.min(discount, selectedCoupon.max_discount_amount);
        }
      } else {
        discount = selectedCoupon.discount_value;
      }

      setCouponDiscount(discount);
    } else {
      setCouponDiscount(0);
    }
  }, [selectedCoupon, subtotal, formatPrice]);

  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  useEffect(() => {
    async function loadUserAutoCoupons() {
      if (!userId) return;

      try {
        setLoadingAutoCoupons(true);
        const response = await getUserAutoCoupons();

        if (response.status === 200 && response.data) {
          setUserAutoCoupons(
            response.data as (UserCouponRedemption & { coupon: Coupon })[]
          );
        }
      } catch (error) {
        console.error("Error loading user auto coupons:", error);
      } finally {
        setLoadingAutoCoupons(false);
      }
    }

    loadUserAutoCoupons();
  }, [userId]);

  const handleApplyCouponFromModal = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    setSelectedCoupon(coupon);
    setShowCouponModal(false);
    toast.success(`Đã áp dụng mã ${coupon.code}`);
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    toast.info("Đã xóa mã giảm giá");
  };

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
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
        coupon_code: couponCode || undefined,
      };

      const response = await createOrder(orderData);

      if (!response.success || !response.data) {
        toast.error(response.error || "Có lỗi xảy ra khi tạo đơn hàng");
        setIsProcessing(false);
        return;
      }

      const { order, payment_url } = response.data.data;

      if (paymentMethod === "momo" || paymentMethod === "vnpay") {
        if (payment_url) {
          window.location.href = payment_url;
        } else {
          toast.error(
            "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau."
          );
          router.push(`/orders/${order._id}?payment_status=failed`);
        }
      } else if (paymentMethod === "cod") {
        toast.success("Đặt hàng thành công!");
        router.push(`/orders/${order._id}?payment_status=pending`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Có lỗi xảy ra trong quá trình thanh toán");
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
    <>
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
                  <div className="font-semibold text-gray-900">
                    {method.name}
                  </div>
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

          {selectedCoupon ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-green-700">
                    {selectedCoupon.code}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {selectedCoupon.description}
                  </div>
                  <div className="text-sm font-semibold text-green-700 mt-2">
                    Giảm {formatPrice(couponDiscount)}
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
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50 uppercase"
              />
            </div>
          )}

          {userAutoCoupons.length > 0 && !selectedCoupon && (
            <button
              onClick={() => setShowCouponModal(true)}
              disabled={isProcessing}
              className="mt-3 w-full px-4 py-2 border-2 border-pink-200 rounded-xl text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              Mã của tôi ({userAutoCoupons.length})
            </button>
          )}
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

            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="font-semibold">{formatPrice(shippingFee)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span className="font-semibold">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Tổng cộng
                </span>
                <span className="text-2xl font-bold text-pink-600">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

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

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Mã giảm giá của tôi
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingAutoCoupons ? (
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
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
              ) : userAutoCoupons.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Bạn chưa có mã giảm giá nào
                </p>
              ) : (
                <div className="space-y-3">
                  {userAutoCoupons.map((redemption) => {
                    const coupon = redemption.coupon;
                    const isExpired = new Date(coupon.end_date) < new Date();
                    const isMinOrderNotMet =
                      coupon.min_order_value &&
                      subtotal < coupon.min_order_value;

                    return (
                      <button
                        key={redemption._id}
                        onClick={() => handleApplyCouponFromModal(coupon)}
                        disabled={isExpired || !!isMinOrderNotMet}
                        className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                          isExpired || isMinOrderNotMet
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-gray-900">
                                {coupon.code}
                              </div>
                              {isExpired && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                  Hết hạn
                                </span>
                              )}
                              {isMinOrderNotMet && !isExpired && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                                  Chưa đủ điều kiện
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {coupon.description}
                            </div>
                            {coupon.discount_type === "percentage" ? (
                              <div className="text-sm font-semibold text-pink-600 mt-1">
                                Giảm {coupon.discount_value}%
                                {coupon.max_discount_amount && (
                                  <span className="text-gray-500 text-xs ml-1">
                                    (tối đa{" "}
                                    {formatPrice(coupon.max_discount_amount)})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm font-semibold text-pink-600 mt-1">
                                Giảm {formatPrice(coupon.discount_value)}
                              </div>
                            )}
                            {coupon.min_order_value && (
                              <div className="text-xs text-gray-500 mt-1">
                                Đơn tối thiểu:{" "}
                                {formatPrice(coupon.min_order_value)}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              HSD:{" "}
                              {new Date(coupon.end_date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                          {!isExpired && !isMinOrderNotMet && (
                            <svg
                              className="w-5 h-5 text-pink-500 flex-shrink-0 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
