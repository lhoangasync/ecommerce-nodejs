"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { getAllProducts } from "@/api/product.api";
import { getAllBrands } from "@/api/brand.api";
import { getAllCategories } from "@/api/category.api";
import { columns } from "@/components/features/product/columns";
import { ProductDataTable } from "@/components/features/product/data-tables";

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(
    null
  );
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "created_at" | "price" | "rating" | "name"
  >("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Debounced search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Fetch brands
  const { data: brandsResponse } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getAllBrands(1, 100),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(1, 100),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const brands = brandsResponse?.data?.items ?? [];
  const categories = categoriesResponse?.data?.items ?? [];

  // Build query key with all filters
  const queryKey = [
    "products",
    pagination,
    debouncedSearchQuery,
    availabilityFilter,
    brandFilter,
    categoryFilter,
    sortBy,
    order,
  ];

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getAllProducts({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        name: debouncedSearchQuery || undefined,
        is_available:
          availabilityFilter !== null ? availabilityFilter : undefined,
        brand_id: brandFilter || undefined,
        category_id: categoryFilter || undefined,
        sort_by: sortBy,
        order: order,
      }),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const products = response?.data?.items ?? [];
  const meta = response?.data?.meta ?? null;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // Type-safe wrapper functions for the data table
  const handleSetSortBy = (value: string) => {
    if (
      value === "created_at" ||
      value === "price" ||
      value === "rating" ||
      value === "name"
    ) {
      setSortBy(value);
    }
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    if (pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [
    debouncedSearchQuery,
    availabilityFilter,
    brandFilter,
    categoryFilter,
    sortBy,
    order,
  ]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Product Management</h1>
        <LoadingSpinner />
      </div>
    );
  }

  // Dynamic card title based on search/filter state
  const getCardTitle = () => {
    const hasFilters =
      debouncedSearchQuery ||
      availabilityFilter !== null ||
      brandFilter ||
      categoryFilter;
    return hasFilters ? "Found Products" : "Total Products";
  };

  const getCardDescription = () => {
    const filters = [];
    if (debouncedSearchQuery) filters.push(`search: "${debouncedSearchQuery}"`);
    if (availabilityFilter !== null)
      filters.push(`${availabilityFilter ? "available" : "unavailable"}`);
    if (brandFilter) {
      const brand = brands.find((b) => b._id === brandFilter);
      if (brand) filters.push(`brand: ${brand.name}`);
    }
    if (categoryFilter) {
      const category = categories.find((c) => c._id === categoryFilter);
      if (category) filters.push(`category: ${category.name}`);
    }

    return filters.length > 0
      ? `Filtered by: ${filters.join(", ")}`
      : "+15.8% from last month";
  };

  return (
    <div className="container mx-auto py-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getCardTitle()}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {meta?.totalItems ?? "..."}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {getCardDescription()}
            </p>
          </CardContent>
        </Card>
      </div>

      <ProductDataTable
        columns={columns}
        data={products}
        pageCount={meta?.totalPages ?? 0}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={onRefresh}
        isLoading={isFetching}
        // Filter props
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={handleSetSortBy}
        order={order}
        setOrder={setOrder}
        // Options for dropdowns
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
