import { Suspense } from "react";
import { getAllProducts } from "@/api/product.api";
import ProductsClient from "@/components/features/home/ProductsClient";

export const metadata = {
  title: "Products | Cosmestic Store",
  description: "Browse our collection of beauty and cosmetic products",
};

interface SearchParams {
  page?: string;
  limit?: string;
  name?: string;
  brand_id?: string;
  category_id?: string;
  min_price?: string;
  max_price?: string;
  skin_type?: string;
  origin?: string;
  sort_by?: string;
  order?: string;
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  // Await searchParams here
  const params = await searchParams;

  const query = {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 12,
    name: params.name,
    brand_id: params.brand_id,
    category_id: params.category_id,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    skin_type: params.skin_type,
    origin: params.origin,
    sort_by: params.sort_by as any,
    order: params.order as any,
  };

  try {
    const response = await getAllProducts(query);

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50/30">
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <ProductsClient
            initialProducts={response.data.items}
            initialMeta={response.data.meta}
            initialQuery={query}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50/30 flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Error Loading Products
          </h2>
          <p className="text-red-600">
            Unable to load products. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

function ProductsLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
          >
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
