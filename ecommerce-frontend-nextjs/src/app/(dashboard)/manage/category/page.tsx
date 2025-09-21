"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsIcon } from "lucide-react";
import { getAllCategories } from "@/api/category.api";
import { columns } from "@/components/features/category/columns";
import { CategoryDataTable } from "@/components/features/category/data-tables";

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const queryKey = ["categories", pagination, debouncedSearchQuery];

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getAllCategories(
        pagination.pageIndex + 1,
        pagination.pageSize,
        debouncedSearchQuery
      ),
    placeholderData: (previousData) => previousData,
  });

  const categories = response?.data?.items ?? [];
  const meta = response?.data?.meta ?? null;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  useEffect(() => {
    if (debouncedSearchQuery && pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [debouncedSearchQuery, pagination.pageIndex]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Category Management</h1>
        <LoadingSpinner />
      </div>
    );
  }

  const cardTitle = debouncedSearchQuery
    ? `Found Category`
    : `Total Categories`;

  return (
    <div className="container mx-auto py-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {meta?.totalItems ?? "..."}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <CategoryDataTable
        columns={columns}
        data={categories}
        pageCount={meta?.totalPages ?? 0}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={onRefresh}
        isLoading={isFetching}
      />
    </div>
  );
}
