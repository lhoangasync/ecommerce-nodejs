import Image from "next/image";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  image: string;
  badge?: string | null;
}

export default function ProductCard({
  name,
  description,
  price,
  originalPrice,
  image,
  badge,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="flex h-48">
        {/* Product Image */}
        <div className="relative w-48 flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 192px"
          />
          {badge && (
            <div className="absolute top-3 right-3 bg-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {badge}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2">
              {name}
            </h3>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            {/* Price Section */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span>🛒</span>
                <span>Add To Cart</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}