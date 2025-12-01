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

  // Helper function to safely extract ID from either string or object
  const extractId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || "";
  };

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const { exists: hasRefreshToken } = await checkRefreshTokenExists();

        const hasAnyToken = !!(accessToken || hasRefreshToken);

        if (hasAnyToken) {
          await fetchUserProfile();
        } else {
          toast.error("Please login to view cart");
          router.push("/sign-in");
        }
      } catch (error) {
        toast.error("Please login to continue");
        router.push("/sign-in");
      }
    };

    checkAuthAndFetchUser();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await AuthAPI.me();
      setUserProfile(response.data);
    } catch (error: any) {

      if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        await deleteRefreshTokenCookie();
        toast.error("Session expired. Please login again");
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
      if (response.data) {
        setCart(response.data);
      }
    } catch (error) {
      toast.error("Unable to load cart");
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
        toast.success("Quantity updated");
      } else {
        toast.error(result.error || "Unable to update quantity");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
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
        toast.success("Product removed from cart");
      } else {
        toast.error(result.error || "Unable to remove product");
      }
    } catch (error) {
      toast.error("An error occurred while removing product");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear the entire cart?")) return;

    try {
      const result = await clearCart();

      if (result.success) {
        setCart({ ...cart!, items: [] });
        toast.success("Cart cleared");
      } else {
        toast.error(result.error || "Unable to clear cart");
      }
    } catch (error) {
      toast.error("An error occurred");
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
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const cartItems =
    cart?.items.map((item) => {
      const productId = extractId(item.product_id);
      const variantId = extractId(item.variant_id);

      return {
        product_id: productId,
        variant_id: variantId,
        quantity: item.quantity,
        price: item.price,
      };
    }) || [];

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-pink-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Cart</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Cart
            </h1>
            <p className="text-gray-600">
              {isEmpty
                ? "No products yet"
                : `${cart.items.length} products`}
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
              Clear all
            </button>
          )}
        </div>

        {isEmpty ? (
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
                Empty Cart
              </h2>
              <p className="text-gray-600 mb-8">
                You have no products in your cart. Explore and add your favorite products!
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
                Shop now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                // Generate unique key using the helper function
                const productId = extractId(item.product_id);
                const variantId = extractId(item.variant_id);
                const uniqueKey = `${productId}-${variantId}`;

                return (
                  <CartItem
                    key={uniqueKey}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    updating={updating}
                    formatPrice={formatPrice}
                  />
                );
              })}
            </div>

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
