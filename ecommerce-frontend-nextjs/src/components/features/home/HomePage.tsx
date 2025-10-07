"use client";

import Link from "next/link";
import HeroBanner from "./HeroBanner";
import ProductGrid from "./ProductGrid";
import { manrope } from "@/utils/font";
import CategoriesSection from "./CategoriesSection";
import BrandsSection from "./BrandSection";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AuthAPI.logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error while logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* Left side - Search + Navigation */}
            <div className="flex items-center gap-6">
              {/* Search Icon */}
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
              {/* Navigation Menu */}
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
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
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
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <HeroBanner />

      {/* Product List */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <ProductGrid />
      </main>

      {/* Featured Categories */}
      <CategoriesSection />

      {/* Running Text Section */}
      <section className="bg-pink-100 py-8 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div
            className={`${manrope.className} flex-shrink-0 text-6xl md:text-8xl font-black text-pink-400/30 
              tracking-widest uppercase animate-scroll`}
          >
            • LOVE YOUR SKIN • PASTEL COSMETICS • VEGAN BEAUTY • NATURAL CARE •
            BE CONFIDENT • BE ORIGINAL •
          </div>
          <div
            className={`${manrope.className} flex-shrink-0 text-6xl md:text-8xl font-black text-pink-400/30 
              tracking-widest uppercase animate-scroll`}
          >
            • PASTEL BEAUTY • VEGAN COSMETICS • NATURAL SKINCARE • LOVE YOUR
            SKIN • ORIGINAL VIETNAM •
          </div>
        </div>
      </section>

      {/* Cosmetic Collection Section */}
      <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 py-16 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-pink-600 text-sm uppercase tracking-wider font-semibold">
                  Skincare Collection
                </p>
                <h2
                  className={`${manrope.className} text-4xl lg:text-5xl font-bold text-gray-900`}
                >
                  BLOOMING COLLECTION
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  The Blooming Collection brings a perfect skincare experience
                  with elegant design, soft fragrance, and nutrient-rich
                  formulas. From cleanser and serum to moisturizer, every
                  product helps you achieve soft, radiant skin.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  Inspired by the purity of roses and natural energy, this
                  collection not only nourishes your skin but also offers a
                  soothing, luxurious, and feminine feeling.
                </p>
              </div>

              <button className="bg-pink-500 hover:bg-pink-400 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 uppercase tracking-wide shadow-md">
                Explore Now
              </button>
            </div>

            {/* Right Content - Product Collection Image */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="clt.jpg"
                  alt="Blooming Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cosmetic Collection Section 2 */}
      <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 py-16 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Product Image */}
            <div className="relative order-1 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="clt2.jpg"
                  alt="Luxury Skincare Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Content - Text */}
            <div className="space-y-6 order-2 lg:order-2">
              <div className="space-y-2">
                <p className="text-pink-600 text-sm uppercase tracking-wider font-semibold">
                  Intensive Skincare Collection
                </p>
                <h2
                  className={`${manrope.className} text-4xl lg:text-5xl font-bold text-gray-900`}
                >
                  KOREAN GLASS SKIN COLLECTION
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Inspired by Korean skincare secrets, the{" "}
                  <span className="italic">KOREAN GLASS SKIN COLLECTION</span>{" "}
                  is designed to bring smooth, glowing, and youthful
                  “glass-like” skin.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  From gentle toner, restorative essence, deep serum to
                  moisturizing cream — each product is a step in a complete
                  skincare routine, helping to rejuvenate and maintain your
                  skin’s natural radiance every day.
                </p>
              </div>

              <button className="bg-pink-500 hover:bg-pink-400 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 uppercase tracking-wide shadow-md">
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Brands Section */}
      <BrandsSection />

      {/* Footer */}
      <footer className="bg-white mt-10 border-t">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600">
          {/* Column 1: Logo + Description */}
          <div>
            <h2
              className={`${manrope.className} text-2xl font-extrabold 
                bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 
                bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`}
            >
              Cosmetic Shop
            </h2>
            <p
              className={`${manrope.className} text-xs text-pink-400 uppercase tracking-wider`}
            >
              Pastel Beauty
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Bringing you authentic, natural skincare and cosmetic products
              from Vietnam — helping you feel confident and radiant every day.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/products" className="hover:text-pink-400">
                  Products
                </a>
              </li>
              <li>
                <a href="/promotion" className="hover:text-pink-400">
                  Promotions
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-pink-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-pink-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-800">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Email: info@thecocoon.vn</li>
              <li>Hotline: 1900 6750</li>
              <li>
                Address: 4th Floor, Pax Sky Building, 63-65 Ngo Thi Nham St., An
                Khanh Ward, Ninh Kieu District, Can Tho City
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-pink-400">
                🌸 Facebook
              </a>
              <a href="#" className="hover:text-pink-400">
                📸 Instagram
              </a>
              <a href="#" className="hover:text-pink-400">
                🎵 TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="border-t py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Cosmetic Shop - Pastel Beauty. All rights
          reserved.
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
