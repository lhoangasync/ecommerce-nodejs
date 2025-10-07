"use client";

import Link from "next/link";
import HeroBanner from "./HeroBanner";
import ProductGrid from "./ProductGrid";
import { manrope } from "@/utils/font";

export default function HomePage() {
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
                  Sản phẩm
                </Link>
                <Link
                  href="/promotion"
                  className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium whitespace-nowrap"
                >
                  Khuyến mãi
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
                  Bài viết
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
                href="/login"
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                Đăng xuất
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                Liên hệ
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium"
              >
                Giỏ hàng
              </Link>
              <div className="text-gray-700 hover:text-pink-400 transition-colors text-base font-medium cursor-pointer">
                VIE
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <HeroBanner />

      {/* Danh sách sản phẩm */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <ProductGrid />
      </main>

      {/* Danh mục nổi bật */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`${manrope.className} text-4xl font-bold text-gray-800 text-center mb-12`}
          >
            DANH MỤC NỔI BẬT
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-8">
            {/* Tẩy trang */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Tẩy trang"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Tẩy trang
              </span>
            </div>

            {/* Body mist */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/bodymist.jpg"
                  alt="Body Mist"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Body Mist
              </span>
            </div>

            {/* Mascara */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/mascara.jpg"
                  alt="Mascara"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Mascara
              </span>
            </div>

            {/* False Lashes */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/False-Lashes.jpg"
                  alt="False Lashes"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                False Lashes
              </span>
            </div>

            {/* Styling Wax */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Styling Wax"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Styling Wax
              </span>
            </div>

            {/* Conditioner */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Conditioner"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Conditioner
              </span>
            </div>

            {/* Dưỡng thể */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Dưỡng thể"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Dưỡng thể
              </span>
            </div>

            {/* Trang điểm */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Trang điểm"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Trang điểm
              </span>
            </div>

            {/* Chăm sóc tóc */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Chăm sóc tóc"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Chăm sóc tóc
              </span>
            </div>

            {/* Nước hoa */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border-2 border-pink-300 overflow-hidden mb-3 group-hover:border-pink-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src="/images/categories/tay-trang.jpg"
                  alt="Nước hoa"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 text-center font-medium">
                Nước hoa
              </span>
            </div>
          </div>
        </div>
      </section>

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
                  Bộ sưu tập chăm sóc da
                </p>
                <h2
                  className={`${manrope.className} text-4xl lg:text-5xl font-bold text-gray-900`}
                >
                  BLOOMING COLLECTION
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Bộ sưu tập Blooming Collection mang đến trải nghiệm chăm sóc
                  da hoàn hảo, với thiết kế tinh tế, hương thơm dịu nhẹ và công
                  thức giàu dưỡng chất. Sự kết hợp của các sản phẩm từ sữa rửa
                  mặt, serum đến kem dưỡng, tất cả dành cho làn da mịn màng và
                  rạng rỡ.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  Lấy cảm hứng từ sự tinh khiết của hoa hồng và năng lượng tự
                  nhiên, bộ sưu tập không chỉ nuôi dưỡng làn da mà còn mang lại
                  cảm giác thư thái, sang trọng và đầy nữ tính.
                </p>
              </div>

              <button className="bg-pink-500 hover:bg-pink-400 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 uppercase tracking-wide shadow-md">
                Khám phá ngay
              </button>
            </div>

            {/* Right Content - Product Collection Image */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/images/clt.jpg"
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
                  src="/images/clt2.jpg"
                  alt="Luxury Skincare Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Content - Text */}
            <div className="space-y-6 order-2 lg:order-2">
              <div className="space-y-2">
                <p className="text-pink-600 text-sm uppercase tracking-wider font-semibold">
                  Bộ sưu tập dưỡng da chuyên sâu
                </p>
                <h2
                  className={`${manrope.className} text-4xl lg:text-5xl font-bold text-gray-900`}
                >
                  KOREAN GLASS SKIN COLLECTION
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Lấy cảm hứng từ bí quyết dưỡng da Hàn Quốc, bộ sưu tập
                  <span className="italic"> KOREAN GLASS SKIN COLLECTION </span>
                  được thiết kế để mang đến làn da căng bóng, mịn màng và tươi
                  trẻ như “thủy tinh”.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  Từ toner dịu nhẹ, essence phục hồi, serum dưỡng sâu đến kem
                  dưỡng khóa ẩm, mỗi sản phẩm đều là một bước trong hành trình
                  chăm sóc da toàn diện, giúp tái tạo năng lượng và duy trì sự
                  rạng rỡ tự nhiên cho làn da mỗi ngày.
                </p>
              </div>

              <button className="bg-pink-500 hover:bg-pink-400 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 uppercase tracking-wide shadow-md">
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Brands Section */}
      <section className="bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`${manrope.className} text-4xl font-bold text-center mb-12 `}
          >
            TOP THƯƠNG HIỆU NỔI BẬT
          </h2>

          <div className="relative overflow-x-auto scrollbar-hide">
            <div
              className="flex space-x-8 pb-4"
              style={{ width: "max-content" }}
            >
              {/* Brand Cards */}
              {[
                {
                  id: 1,
                  logoUrl: "/images/brands/cocoon-logo.png",
                  backgroundImage: "/images/brands/cocoon-bg.jpg",
                  gradientClass: "bg-gradient-to-br from-blue-300 to-green-300",
                  title: "Chăm sóc da tự nhiên",
                  description: "Thương hiệu Việt với nguyên liệu thiên nhiên",
                  name: "cocoon",
                },
                {
                  id: 2,
                  logoUrl: "/images/brands/caryophy-logo.png",
                  backgroundImage: "/images/brands/caryophy-bg.jpg",
                  gradientClass:
                    "bg-gradient-to-br from-green-800 to-green-600",
                  title: "Giải pháp da mụn",
                  description: "& phục hồi chuẩn Hàn",
                  name: "CARYOPHY",
                  textColor: "text-green-800",
                },
                {
                  id: 3,
                  logoUrl: "/images/brands/glorie-logo.png",
                  backgroundImage: "/images/brands/glorie-bg.jpg",
                  gradientClass: "bg-gradient-to-br from-pink-400 to-red-400",
                  title: "Find your",
                  subtitle: "shine",
                  description: "by yourself",
                  name: "glorie",
                  textColor: "text-pink-800",
                },
                {
                  id: 4,
                  logoUrl: "/images/brands/dasique-logo.png",
                  backgroundImage: "/images/brands/dasique-bg.jpg",
                  gradientClass:
                    "bg-gradient-to-br from-orange-200 to-yellow-200",
                  title: "Làng màu",
                  subtitle: "NHƯ THỞ",
                  description: "VẺ ĐẸP NGỌT NGÀO",
                  name: "dasique",
                  textColor: "text-pink-800",
                },
                {
                  id: 5,
                  logoUrl: "/images/brands/thebodyshop-logo.png",
                  backgroundImage: "/images/brands/thebodyshop-bg.jpg",
                  gradientClass: "bg-gradient-to-br from-teal-500 to-teal-700",
                  title: "The Body Shop",
                  description: "Spa of the World™",
                  name: "TBS",
                },
                {
                  id: 6,
                  logoUrl: "/images/brands/loreal-logo.png",
                  backgroundImage: "/images/brands/loreal-bg.jpg",
                  gradientClass:
                    "bg-gradient-to-br from-purple-400 to-indigo-500",
                  title: "Because",
                  subtitle: "You're Worth It",
                  name: "L'Oréal",
                },
              ].map((brand) => (
                <div key={brand.id} className="flex-shrink-0 relative">
                  <div
                    className={`w-80 h-60 rounded-2xl p-6 relative overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer ${brand.gradientClass}`}
                    style={{
                      backgroundImage: brand.backgroundImage
                        ? `url(${brand.backgroundImage})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Logo */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span class="text-gray-600 font-bold text-xs">${brand.name}</span>`;
                          }
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3
                        className={`font-bold text-lg mb-2 ${
                          brand.textColor || "text-white"
                        }`}
                      >
                        {brand.title}
                      </h3>
                      {brand.subtitle && (
                        <h4
                          className={`font-bold text-lg mb-2 ${
                            brand.textColor || "text-white"
                          }`}
                        >
                          {brand.subtitle}
                        </h4>
                      )}
                      {brand.description && (
                        <p
                          className={`text-sm ${
                            brand.textColor
                              ? brand.textColor + "/90"
                              : "text-white/90"
                          }`}
                        >
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mt-10 border-t">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600">
          {/* Cột 1: Logo + mô tả */}
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
              Nơi mang đến cho bạn những sản phẩm chăm sóc da và mỹ phẩm thiên
              nhiên chính hãng từ Việt Nam, giúp bạn tự tin và tỏa sáng mỗi
              ngày.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="font-semibold text-gray-800">Liên kết</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/products" className="hover:text-pink-400">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="/promotion" className="hover:text-pink-400">
                  Khuyến mãi
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-pink-400">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-pink-400">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div>
            <h3 className="font-semibold text-gray-800">Liên hệ</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Email: info@thecocoon.vn</li>
              <li>Hotline: 1900 6750</li>
              <li>
                Địa chỉ: Tầng 4, Tòa nhà Pax Sky, 63-65 Ngô Thì Nhậm, P.An
                Khánh, Q.Ninh Kiều, TP.Cần Thơ
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

        {/* Dòng bản quyền */}
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
