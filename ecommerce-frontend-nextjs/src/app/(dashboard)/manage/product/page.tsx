"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { getAllProducts } from "@/api/product.api";
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
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "created_at" | "price" | "rating" | "name"
  >("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Debounced search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Build query key with all filters
  const queryKey = [
    "products",
    pagination,
    debouncedSearchQuery,
    availabilityFilter,
    skinTypeFilter,
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
        skin_type: skinTypeFilter || undefined,
        sort_by: sortBy,
        order: order,
      }),
    placeholderData: (previousData) => previousData,
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
  }, [debouncedSearchQuery, availabilityFilter, skinTypeFilter, sortBy, order]);

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
      debouncedSearchQuery || availabilityFilter !== null || skinTypeFilter;
    return hasFilters ? "Found Products" : "Total Products";
  };

  const getCardDescription = () => {
    const filters = [];
    if (debouncedSearchQuery) filters.push(`search: "${debouncedSearchQuery}"`);
    if (availabilityFilter !== null)
      filters.push(`${availabilityFilter ? "available" : "unavailable"}`);
    if (skinTypeFilter) filters.push(`${skinTypeFilter} skin`);

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
        skinTypeFilter={skinTypeFilter}
        setSkinTypeFilter={setSkinTypeFilter}
        sortBy={sortBy}
        setSortBy={handleSetSortBy}
        order={order}
        setOrder={setOrder}
      />
    </div>
  );
}
