import Image from "next/image";
import { Product } from "@/types/backend";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const hasDiscount = product.variants.some((v) => v.original_price);
  const originalPrices = product.variants
    .filter((v) => v.original_price)
    .map((v) => v.original_price!);
  const maxOriginalPrice =
    originalPrices.length > 0 ? Math.max(...originalPrices) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const priceDisplay =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  const imageUrl =
    product.images?.[0] ||
    product.variants.find((v) => v.images && v.images.length > 0)
      ?.images?.[0] ||
    "/images/placeholder.jpg";

  let badge = null;
  if (hasDiscount) badge = "SALE";
  else if (product.created_at) {
    const createdDate = new Date(product.created_at);
    const daysSinceCreation =
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) badge = "NEW";
  }

  const hasStock = product.variants.some((v) => v.stock_quantity > 0);

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();
  const cleanDescription = product.description
    ? stripHtml(product.description)
    : "";

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 w-full h-full flex flex-col">
      {/* Product Image */}
      <div className="relative w-full h-64 bg-gray-50 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 340px"
        />
        {badge && (
          <div className="absolute top-3 right-3 bg-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            {badge}
          </div>
        )}
        {!hasStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-base bg-black bg-opacity-60 px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 min-h-[240px]">
        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 h-[3rem] mb-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 h-[2.5rem] mb-2">
          {cleanDescription || "\u00A0"}
        </p>

        <div className="h-5 mb-3">
          {product.brand?.name && (
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {product.brand.name}
            </p>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2 mb-3 h-7">
          <span className="text-lg font-bold text-gray-900">
            {priceDisplay}
          </span>
          {maxOriginalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(maxOriginalPrice)}
            </span>
          )}
        </div>

        <button
          disabled={!hasStock}
          className={`w-full font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm ${
            hasStock
              ? "bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base">🛒</span>
            <span className="font-semibold">
              {hasStock ? "Add to Cart" : "Out of Stock"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
