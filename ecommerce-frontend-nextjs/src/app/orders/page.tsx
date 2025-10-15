"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyOrders } from "@/api/order.api";
import { Order } from "@/types/backend";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [filter, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage.toString(),
        limit: "10",
        sort: "-created_at",
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await getMyOrders(params);
      console.log("Fetched orders:", response);

      // FIX: Access the nested data correctly
      // response is IBackEndResponse<Paginated<Order>>
      // So response.data is Paginated<Order>
      // And response.data.items is Order[]
      if (response.data) {
        const ordersData =
          (response.data as any).orders || response.data.items || [];
        const paginationData =
          (response.data as any).pagination || response.data.meta;

        setOrders(ordersData);
        setTotalPages(
          paginationData?.total_pages || paginationData?.totalPages || 1
        );
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return texts[status] || status;
  };

  const filterOptions: Array<{
    value: Order["status"] | "all";
    label: string;
  }> = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === option.value
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào trong danh sách này
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã đơn hàng</p>
                        <p className="font-bold text-gray-900">
                          {order.order_code}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày đặt</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {item.product_name}
                          </h3>
                          <div className="flex gap-2 text-sm text-gray-600 mt-1">
                            {item.variant_shade_color && (
                              <span>Màu: {item.variant_shade_color}</span>
                            )}
                            {item.variant_volume_size && (
                              <span>| Size: {item.variant_volume_size}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            x{item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600 text-center">
                        +{order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tổng cộng</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white rounded-xl font-semibold text-gray-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  currentPage === page
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                    : "bg-white text-gray-700 hover:bg-pink-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white rounded-xl font-semibold text-gray-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
