"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { Brand, PaginationMeta } from "@/types/backend";
import { getAllBrands } from "@/api/brand.api";
import { BrandDataTable } from "@/components/features/brand/data-tables";
import { columns } from "@/components/features/brand/columns";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useDebounce } from "use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSignIcon, TagsIcon } from "lucide-react";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);

        const page = pagination.pageIndex + 1;
        const limit = pagination.pageSize;

        const backendResponse = await getAllBrands(
          page,
          limit,
          debouncedSearchQuery
        );

        const paginatedData = backendResponse.data;

        if (paginatedData && paginatedData.items) {
          setBrands(paginatedData.items);
          setMeta(paginatedData.meta);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [pagination, debouncedSearchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery && pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [debouncedSearchQuery, pagination.pageIndex]);

  if (isLoading && brands.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Brand Management</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Brand Management</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {meta?.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <BrandDataTable
        columns={columns}
        data={brands}
        pageCount={meta?.totalPages ?? 0}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
}
