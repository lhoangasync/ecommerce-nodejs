import ProductCard from "./ProductCard";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Son Lip Cream",
    description: "Màu sắc tự nhiên, lâu trôi",
    price: "299.000 ₫",
    originalPrice: null,
    image: "/images/son_lip_cream.jpg",
    badge: null,
  },
  {
    id: 2,
    name: "Kem dưỡng da",
    description: "Cung cấp độ ẩm và làm sáng da",
    price: "499.000 ₫",
    originalPrice: null,
    image: "/images/kem_duong.jpg",
    badge: "HOT",
  },
  {
    id: 3,
    name: "Nước hoa hồng",
    description: "Cân bằng độ pH, làm dịu da",
    price: "199.000 ₫",
    originalPrice: "250.000 ₫",
    image: "/images/nuoc_hoa.jpg",
    badge: "SALE",
  },
  {
    id: 4,
    name: "Kem nền",
    description: "Che phủ hoàn hảo, mịn màng",
    price: "279.000 ₫",
    originalPrice: "320.000 ₫",
    image: "/images/kem_nen.jpg",
    badge: null,
  },
  {
    id: 5,
    name: "Phấn phủ",
    description: "Kiểm soát dầu, lớp nền mịn mượt",
    price: "299.000 ₫",
    originalPrice: null,
    image: "/images/phan_ma.jpg",
    badge: null,
  },
  {
    id: 6,
    name: "Eyeliner",
    description: "Đầu bút mảnh, chống lem nước",
    price: "219.000 ₫",
    originalPrice: null,
    image: "/images/ke_mat.jpg",
    badge: "NEW",
  },
];

export default function ProductGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const maxSlides = Math.ceil(products.length / 2);
    if (currentIndex < maxSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start gap-8">
        {/* Left side - Title */}
        <div className="flex-shrink-0 w-80">
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            Sản phẩm
            <br />
            <span className="text-5xl font-black">BÁN CHẠY</span>
          </h2>
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            Cosmetic tự hào khi các sản phẩm mà chúng tôi tạo ra mang đến những
            thay đổi tuyệt vời trên làn da, mái tóc của bạn.
          </p>
        </div>

        {/* Right side - Product Slider */}
        <div className="flex-1 relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {/* Tạo các slide, mỗi slide có 2 sản phẩm */}
              {Array.from(
                { length: Math.ceil(products.length / 2) },
                (_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="w-full flex-shrink-0 grid grid-cols-2 gap-6"
                  >
                    {products
                      .slice(slideIndex * 2, slideIndex * 2 + 2)
                      .map((product) => (
                        <ProductCard key={product.id} {...product} />
                      ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= Math.ceil(products.length / 2) - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentIndex >= Math.ceil(products.length / 2) - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
