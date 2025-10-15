"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Cart } from "@/types/backend";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/api/cart.api";
import CartSummary from "./CartSummary";
import CartItem from "./CartItem";
import { AuthAPI } from "@/api/auth.api";
import {
  checkRefreshTokenExists,
  deleteRefreshTokenCookie,
} from "@/lib/auth.action";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // ✅ Kiểm tra trạng thái đăng nhập và fetch user profile
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const { exists: hasRefreshToken } = await checkRefreshTokenExists();

        const hasAnyToken = !!(accessToken || hasRefreshToken);

        if (hasAnyToken) {
          await fetchUserProfile();
        } else {
          toast.error("Vui lòng đăng nhập để xem giỏ hàng");
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Vui lòng đăng nhập để tiếp tục");
        router.push("/sign-in");
      }
    };

    checkAuthAndFetchUser();
  }, [router]);

  // ✅ Fetch user profile với error handling
  const fetchUserProfile = async () => {
    try {
      const response = await AuthAPI.me();
      setUserProfile(response.data);
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);

      // Nếu lỗi 401, token không hợp lệ
      if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        await deleteRefreshTokenCookie();
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        router.push("/sign-in");
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      console.log("Cart loaded:", response);
      if (response.data) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    variantId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    const updateKey = `${productId}-${variantId}`;
    setUpdating(updateKey);

    try {
      const result = await updateCartItem(productId, variantId, {
        quantity: newQuantity,
      });

      if (result.success && result.data?.data) {
        setCart(result.data.data);
        toast.success("Đã cập nhật số lượng");
      } else {
        toast.error(result.error || "Không thể cập nhật số lượng");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string, variantId: string) => {
    const updateKey = `${productId}-${variantId}`;
    setUpdating(updateKey);

    try {
      const result = await removeFromCart(productId, variantId);

      if (result.success && result.data?.data) {
        setCart(result.data.data);
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } else {
        toast.error(result.error || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;

    try {
      const result = await clearCart();

      if (result.success) {
        setCart({ ...cart!, items: [] });
        toast.success("Đã xóa toàn bộ giỏ hàng");
      } else {
        toast.error(result.error || "Không thể xóa giỏ hàng");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 500000 ? 0 : 30000; // Free ship if > 500k
  const total = subtotal + shipping;

  // Prepare cart items for checkout
  const cartItems =
    cart?.items.map((item) => {
      // Handle both populated object and string ID
      const productId =
        typeof item.product_id === "object"
          ? (item.product_id as any)?._id
          : item.product_id;

      const variantId =
        typeof item.variant_id === "object"
          ? (item.variant_id as any)?._id
          : item.variant_id;

      return {
        product_id: productId || "",
        variant_id: variantId || "",
        quantity: item.quantity,
        price: item.price,
      };
    }) || [];

  // User info for checkout - Using REAL user data from AuthAPI.me()
  const userInfo = {
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 h-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-pink-600 transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Giỏ hàng</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn
            </h1>
            <p className="text-gray-600">
              {isEmpty
                ? "Chưa có sản phẩm nào"
                : `${cart.items.length} sản phẩm`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-2 transition-colors"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa tất cả
            </button>
          )}
        </div>

        {isEmpty ? (
          // Empty Cart
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="max-w-md mx-auto">
              <svg
                className="w-32 h-32 mx-auto mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-8">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm
                sản phẩm yêu thích của bạn!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Mua sắm ngay
              </Link>
            </div>
          </div>
        ) : (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={`${(item.product_id as any)?._id}-${
                    (item.variant_id as any)?._id
                  }`}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  updating={updating}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                formatPrice={formatPrice}
                itemCount={cart.items.length}
                cartItems={cartItems}
                userId={userProfile?._id || ""}
                userInfo={userInfo}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
