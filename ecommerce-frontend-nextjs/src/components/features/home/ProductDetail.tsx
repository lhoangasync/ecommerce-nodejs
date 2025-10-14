"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Product, Variant } from "@/types/backend";
import { getProductById } from "@/api/product.api";
import { addToCart } from "@/api/cart.api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { toast } from "react-toastify";

interface ProductDetailProps {
  productSlug?: string;
}

export default function ProductDetail({
  productSlug: propProductSlug,
}: ProductDetailProps) {
  const params = useParams();
  const router = useRouter();
  const slug = propProductSlug || (params?.slug as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await getProductById(slug);

        if (response.status === 200 && response.data) {
          setProduct(response.data);
          if (response.data.variants && response.data.variants.length > 0) {
            setSelectedVariant(response.data.variants[0]);
          }
          setComments([
            {
              id: 1,
              author: "Nguyễn Hoa",
              rating: 5,
              text: "Sản phẩm rất tốt, mình rất hài lòng!",
              date: "2 ngày trước",
              verified: true,
            },
            {
              id: 2,
              author: "Trần Hà",
              rating: 4,
              text: "Chất lượng ổn, giao hàng nhanh.",
              date: "5 ngày trước",
              verified: true,
            },
          ]);
        } else {
          setError(response.message || "Không thể tải sản phẩm");
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  const allImages: string[] = [];
  if (product?.images && product.images.length > 0) {
    allImages.push(...product.images);
  }
  if (selectedVariant?.images && selectedVariant.images.length > 0) {
    selectedVariant.images.forEach((img) => {
      if (!allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  const productImages =
    allImages.length > 0 ? allImages : ["/images/placeholder.jpg"];
  const handleAddToCart = async () => {
    if (!selectedVariant || !product || addingToCart) return;
    setAddingToCart(true);
    try {
      const result = await addToCart({
        product_id: product._id,
        variant_id: selectedVariant.id,
        quantity: quantity,
      });
      if (result.success) {
        setAddedToCart(true);

        const variantInfo =
          selectedVariant.shade_color ||
          selectedVariant.volume_size ||
          "Mặc định";

        // ⭐ Ưu tiên ảnh của variant, nếu không có mới lấy ảnh product
        const productImage =
          selectedVariant.images && selectedVariant.images.length > 0
            ? selectedVariant.images[0]
            : product.images && product.images.length > 0
            ? product.images[0]
            : "/images/placeholder.jpg";

        toast.success(
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="font-semibold text-sm">Đã thêm vào giỏ hàng!</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {variantInfo} × {quantity}
                </p>
                <p className="text-sm font-semibold text-pink-600 mt-1">
                  {formatPrice(selectedVariant.price * quantity)}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/cart")}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Xem giỏ hàng
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: false,
            className: "!p-3",
          }
        );

        setTimeout(() => setAddedToCart(false), 2000);
      } else {
        toast.error(result.error || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Đã xảy ra lỗi khi thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: comments.length + 1,
      author: "Bạn",
      rating: rating,
      text: newComment,
      date: "vừa xong",
      verified: false,
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
    setRating(5);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty > 0 && newQty <= (selectedVariant?.stock_quantity || 0)) {
      setQuantity(newQty);
    }
  };

  const hasDiscount = selectedVariant?.original_price
    ? selectedVariant.original_price > selectedVariant.price
    : false;

  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedVariant!.original_price! - selectedVariant!.price) /
          selectedVariant!.original_price!) *
          100
      )
    : 0;

  const avgRating = product?.rating || 0;
  const reviewCount = product?.review_count || 0;
  const fullStars = Math.floor(avgRating);
  const hasHalfStar = avgRating % 1 >= 0.5;

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-200 rounded-2xl aspect-square animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-pink-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8 font-medium"
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
                d="M19 12H5m7 7l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-red-400"
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
            <p className="text-red-600 font-semibold text-lg">
              {error || "Sản phẩm không tìm thấy"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {addedToCart && (
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
          <span className="font-medium">Đã thêm vào giỏ hàng!</span>
        </div>
      )}

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
            <Link
              href="/products"
              className="text-gray-500 hover:text-pink-600 transition-colors"
            >
              Sản phẩm
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium truncate">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg relative">
              <Swiper
                modules={[Navigation, Pagination, Thumbs, EffectFade]}
                effect="fade"
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                thumbs={{ swiper: thumbsSwiper }}
                className="product-detail-swiper"
              >
                {productImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full aspect-square">
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg z-10">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                slidesPerView={4}
                spaceBetween={8}
                className="product-detail-thumbs"
              >
                {productImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-pink-400 transition-colors">
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {product.brand && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                    {product.brand.img && (
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={product.brand.img}
                          alt={product.brand.name}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    )}
                    <span className="text-sm text-pink-600 font-semibold uppercase tracking-wide">
                      {product.brand.name}
                    </span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    {product.category.img && (
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={product.category.img}
                          alt={product.category.name}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    )}
                    <span className="text-sm text-purple-600 font-semibold">
                      {product.category.name}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              {avgRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < fullStars
                            ? "fill-yellow-400 text-yellow-400"
                            : i === fullStars && hasHalfStar
                            ? "text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {avgRating.toFixed(1)} ({reviewCount} đánh giá)
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-pink-600">
                  {formatPrice(selectedVariant?.price || 0)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(selectedVariant?.original_price || 0)}
                  </span>
                )}
              </div>
              {selectedVariant?.sku && (
                <p className="text-sm text-gray-500">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-600 leading-relaxed">
                  {stripHtml(product.description)}
                </p>
              </div>
            )}

            {product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Chọn loại sản phẩm
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedVariant?.id === variant.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      } ${
                        !variant.is_available
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={!variant.is_available}
                    >
                      {variant.images && variant.images.length > 0 && (
                        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={variant.images[0]}
                            alt={`${
                              variant.shade_color ||
                              variant.volume_size ||
                              "Variant"
                            }`}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {variant.shade_color && (
                            <div>{variant.shade_color}</div>
                          )}
                          {variant.volume_size && (
                            <div>{variant.volume_size}</div>
                          )}
                          {!variant.shade_color && !variant.volume_size && (
                            <div>Loại</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPrice(variant.price)}
                        </div>
                        {!variant.is_available && (
                          <div className="text-xs text-red-500 mt-1">
                            Hết hàng
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedVariant && (
              <div
                className={`p-4 rounded-lg ${
                  selectedVariant.stock_quantity > 0
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    selectedVariant.stock_quantity > 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {selectedVariant.stock_quantity > 0
                    ? `Còn ${selectedVariant.stock_quantity} sản phẩm`
                    : "Hết hàng"}
                </p>
              </div>
            )}

            {selectedVariant?.is_available &&
              selectedVariant?.stock_quantity > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                      Số lượng:
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 border-l border-r border-gray-200 font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
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
                        Đang thêm...
                      </>
                    ) : (
                      <>
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
                        Thêm vào giỏ
                      </>
                    )}
                  </button>
                </div>
              )}

            {(product.skin_type || product.origin || product.ingredients) && (
              <div className="border-t pt-6 space-y-4">
                {product.skin_type && product.skin_type.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Loại da phù hợp
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.skin_type.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.origin && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Xuất xứ
                    </h4>
                    <p className="text-gray-600">{product.origin}</p>
                  </div>
                )}
                {product.ingredients && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Thành phần
                    </h4>
                    <div
                      className="text-gray-600 text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.ingredients }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 border-t pt-12">
          <div className="flex gap-6 mb-8 border-b">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === "details"
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Chi tiết sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === "comments"
                  ? "text-pink-600 border-b-2 border-pink-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bình luận ({comments.length})
            </button>
          </div>

          {activeTab === "details" && (
            <div className="prose max-w-none">
              {product.how_to_use && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Hướng dẫn sử dụng
                  </h3>
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.how_to_use }}
                  />
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Viết bình luận</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRating(r)}
                          className="transition-transform hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 ${
                              r <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-300 text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bình luận của bạn
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Gửi bình luận
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-lg p-5 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {comment.author}
                            </p>
                            {comment.verified && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                                Đã mua
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {comment.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < comment.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-300 text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .product-detail-swiper .swiper-button-prev,
        .product-detail-swiper .swiper-button-next {
          color: #ec4899 !important;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .product-detail-swiper .swiper-pagination-bullet {
          background: #f9a8d4 !important;
          opacity: 0.6 !important;
        }

        .product-detail-swiper .swiper-pagination-bullet-active {
          background: #ec4899 !important;
          opacity: 1 !important;
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

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
