"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrder, cancelOrder } from "@/api/order.api";
import { Order } from "@/types/backend";

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const paymentStatus = searchParams.get("payment_status");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    const response = await getOrder(orderId);

    if (response.success && response.data) {
      setOrder(response.data.data);
    } else {
      setError(response.error || "Cannot load order information");
    }
    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter cancellation reason");
      return;
    }

    setIsCancelling(true);
    const response = await cancelOrder(orderId, { reason: cancelReason });

    if (response.success) {
      await loadOrder();
      setShowCancelModal(false);
      setCancelReason("");
    } else {
      alert(response.error || "Cannot cancel order");
    }
    setIsCancelling(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      processing: "bg-purple-100 text-purple-800 border-purple-300",
      shipping: "bg-indigo-100 text-indigo-800 border-indigo-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      refunded: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: Order["status"]) => {
    const texts = {
      pending: "Pending Confirmation",
      confirmed: "Confirmed",
      processing: "Processing",
      shipping: "Shipping",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status: Order["payment_status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusText = (status: Order["payment_status"]) => {
    const texts = {
      pending: "Unpaid",
      paid: "Paid",
      failed: "Payment Failed",
      refunded: "Refunded",
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: Order["payment_method"]) => {
    const texts = {
      cod: "Cash on Delivery (COD)",
      momo: "MoMo E-Wallet",
      vnpay: "VNPay",
      bank_transfer: "Bank Transfer",
    };
    return texts[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">
            {error || "Order not found"}
          </p>
          <Link href="/orders" className="text-pink-600 hover:underline">
            Back to order list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Payment Status Alert */}
        {paymentStatus === "pending" && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold text-yellow-800">
                  Order is pending payment
                </p>
                <p className="text-sm text-yellow-700">
                  Please complete payment to process order
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
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
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Order Details
            </h1>
            <div className="w-20"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Code</p>
              <p className="text-lg font-bold text-gray-900">
                {order.order_code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                order.payment_status
              )}`}
            >
              {getPaymentStatusText(order.payment_status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ordered Products
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 border-2 border-gray-100 rounded-xl"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product_name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {item.variant_shade_color && (
                          <span className="text-sm text-gray-600">
                            Color: {item.variant_shade_color}
                          </span>
                        )}
                        {item.variant_volume_size && (
                          <span className="text-sm text-gray-600">
                            | Size: {item.variant_volume_size}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-600">
                          x{item.quantity}
                        </span>
                        <span className="font-bold text-pink-600">
                          {formatPrice(item.unit_price)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {order.shipping_address.full_name}
                </p>
                <p className="text-gray-600">
                  {order.shipping_address.phone_number}
                </p>
                <p className="text-gray-600">
                  {order.shipping_address.address}
                </p>
                <p className="text-gray-600">
                  {[
                    order.shipping_address.ward,
                    order.shipping_address.district,
                    order.shipping_address.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              {order.note && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Note: {order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">
                    {formatPrice(order.shipping_fee)}
                  </span>
                </div>
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -{formatPrice(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-pink-600">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Payment Method
                </p>
                <p className="font-semibold text-gray-900">
                  {getPaymentMethodText(order.payment_method)}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order History
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {(order.confirmed_at ||
                      order.shipping_at ||
                      order.delivered_at ||
                      order.cancelled_at) && (
                      <div className="w-0.5 h-12 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">
                      Order Placed
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                {order.confirmed_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      {(order.shipping_at ||
                        order.delivered_at ||
                        order.cancelled_at) && (
                        <div className="w-0.5 h-12 bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">Confirmed</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.confirmed_at)}
                      </p>
                    </div>
                  </div>
                )}

                {order.shipping_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
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
                      </div>
                      {(order.delivered_at || order.cancelled_at) && (
                        <div className="w-0.5 h-12 bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">
                        Shipping
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.shipping_at)}
                      </p>
                    </div>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">
                        Delivered
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.delivered_at)}
                      </p>
                    </div>
                  </div>
                )}

                {order.cancelled_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Cancelled</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.cancelled_at)}
                      </p>
                      {order.cancellation_reason && (
                        <p className="text-sm text-gray-500 mt-1">
                          Reason: {order.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {order.status === "pending" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {order.status === "delivered" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <Link
                  href={`/products/${order.items[0]?.product_slug}?review=true`}
                  className="block w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 hover:scale-105"
                >
                  Review Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-gray-600 mb-4">
              Please let us know the reason you want to cancel this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors min-h-[100px] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Processing..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
