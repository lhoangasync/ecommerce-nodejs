"use client";

import Link from "next/link";
import Image from "next/image";
import HeroBanner from "./HeroBanner";
import ProductGrid from "./ProductGrid";
import { manrope } from "@/utils/font";
import CategoriesSection from "./CategoriesSection";
import BrandsSection from "./BrandSection";

import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";
import { useState, useEffect, useRef } from "react";
import {
  checkRefreshTokenExists,
  deleteRefreshTokenCookie,
} from "@/lib/auth.action";
import ChatbotWidget from "./ChatBotWidget";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ✅ Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const { exists: hasRefreshToken } = await checkRefreshTokenExists();

        const hasAnyToken = !!(accessToken || hasRefreshToken);

        console.log("Auth check:", {
          accessToken: !!accessToken,
          hasRefreshToken,
          hasAnyToken,
        });

        if (hasAnyToken) {
          await fetchUserProfile();
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    };

    checkAuth();
  }, []);

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch user profile với error handling
  const fetchUserProfile = async () => {
    try {
      const response = await AuthAPI.me();
      setUserProfile(response.data);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);

      // Nếu lỗi 401, token không hợp lệ
      if (error?.response?.status === 401) {
        localStorage.removeItem("access_token");
        await deleteRefreshTokenCookie();
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    }
  };

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      setLoading(true);

      // Gọi API logout
      await AuthAPI.logout();

      // Xóa access_token từ localStorage
      localStorage.removeItem("access_token");

      // ✅ Xóa refresh_token cookie qua Server Action
      await deleteRefreshTokenCookie();

      // Cập nhật state
      setIsLoggedIn(false);
      setUserProfile(null);
      setShowProfileMenu(false);

      // Hiển thị thông báo thành công
      setShowSuccessMessage(true);

      // Reload trang sau khi đã xóa hết
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error while logging out:", error);

      // Ngay cả khi có lỗi, vẫn xóa token local
      localStorage.removeItem("access_token");
      await deleteRefreshTokenCookie();

      setIsLoggedIn(false);
      setUserProfile(null);
      setShowProfileMenu(false);
      setLoading(false);

      // Reload trang
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">Signed out successfully!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* Left side - Search + Navigation */}
            <div className="flex items-center gap-6">
              <div className="cursor-pointer flex-shrink-0">
                <svg
                  className="w-6 h-6 text-gray-600 hover:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <nav className="flex items-center gap-6 flex-shrink-0">
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium whitespace-nowrap"
                >
                  Products
                </Link>
                <Link
                  href="/promotion"
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium whitespace-nowrap"
                >
                  Promotions
                </Link>
                <Link
                  href="/cocoon"
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium whitespace-nowrap"
                >
                  Cosmetic
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium whitespace-nowrap"
                >
                  Blog
                </Link>
              </nav>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="flex flex-col items-center">
              <div
                className={`${manrope.className} font-extrabold text-3xl tracking-wide 
                  bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 
                  bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]`}
              >
                Cosmetic
              </div>
              <div
                className={`${manrope.className} text-sm text-pink-400 tracking-wider uppercase`}
              >
                Pastel Beauty
              </div>
            </Link>

            {/* Right side - User Actions */}
            <div className="flex items-center justify-end gap-6">
              <Link
                href="/contact"
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                Contact
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                Cart
              </Link>

              {/* Profile Dropdown hoặc Sign in button */}
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 text-gray-700 hover:text-pink-400 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          alt={userProfile?.name || "User"}
                          src={
                            userProfile?.avatar ||
                            "https://plus.unsplash.com/premium_photo-1732757787074-0f95bf19cf73?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVmYXVsdCUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D"
                          }
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      {/* Verify Badge */}
                      {userProfile?.verify === 1 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
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
                        </div>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {userProfile?.name || "User"}
                          </p>
                          {userProfile?.verify === 1 && (
                            <div
                              className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                              title="Verified"
                            >
                              <svg
                                className="w-2.5 h-2.5 text-white"
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
                          )}
                          {userProfile?.role === 1 && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {userProfile?.email || "email@example.com"}
                        </p>
                      </div>

                      <div className="py-1">
                        {/* Admin Dashboard - Only show if role is 1 (Admin) */}
                        {userProfile?.role === 1 && (
                          <button
                            onClick={() => {
                              router.push("/admin");
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-3 font-medium"
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
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => {
                            router.push("/profile");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-3"
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          My Profile
                        </button>

                        <button
                          onClick={() => {
                            router.push("/orders");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-3"
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
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          My Orders
                        </button>

                        <button
                          onClick={() => {
                            router.push("/settings");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-3"
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
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 disabled:opacity-50"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {loading ? "Signing out..." : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/sign-in")}
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <HeroBanner />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <ProductGrid />
      </main>
      <CategoriesSection />

      {/* Running Text Section */}
      <section className="bg-pink-100 py-8 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div
            className={`${manrope.className} flex-shrink-0 text-6xl md:text-8xl font-black text-pink-400/30 tracking-widest uppercase animate-scroll`}
          >
            • LOVE YOUR SKIN • PASTEL COSMETICS • VEGAN BEAUTY • NATURAL CARE •
            BE CONFIDENT • BE ORIGINAL •
          </div>
          <div
            className={`${manrope.className} flex-shrink-0 text-6xl md:text-8xl font-black text-pink-400/30 tracking-widest uppercase animate-scroll`}
          >
            • PASTEL BEAUTY • VEGAN COSMETICS • NATURAL SKINCARE • LOVE YOUR
            SKIN • ORIGINAL VIETNAM •
          </div>
        </div>
      </section>

      <BrandsSection />
      <ChatbotWidget />

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
