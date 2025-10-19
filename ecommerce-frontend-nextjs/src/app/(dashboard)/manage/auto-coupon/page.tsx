"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketIcon } from "lucide-react";
import { getAllAutoCouponRules } from "@/api/autoCoupon.api";
import { autoCouponColumns } from "@/components/features/auto-coupon/columns";
import { AutoCouponDataTable } from "@/components/features/auto-coupon/data-tables";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AutoCouponPage() {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerTypeFilter, setTriggerTypeFilter] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const queryKey = [
    "auto-coupon-rules",
    pagination,
    debouncedSearchQuery,
    triggerTypeFilter,
    isActiveFilter,
  ];

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      getAllAutoCouponRules({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        trigger_type: triggerTypeFilter as
          | "order_count"
          | "total_spent"
          | "first_order"
          | "birthday"
          | undefined,
        is_active: isActiveFilter || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  const autoCouponRules = response?.data?.items ?? [];
  const meta = response?.data?.meta ?? null;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["auto-coupon-rules"] });
  };

  useEffect(() => {
    if (
      (debouncedSearchQuery || triggerTypeFilter || isActiveFilter) &&
      pagination.pageIndex !== 0
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [
    debouncedSearchQuery,
    triggerTypeFilter,
    isActiveFilter,
    pagination.pageIndex,
  ]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Auto Coupon Management</h1>
        <LoadingSpinner />
      </div>
    );
  }

  const cardTitle = debouncedSearchQuery
    ? `Found Auto Coupon Rules`
    : `Total Auto Coupon Rules`;

  return (
    <div className="container mx-auto py-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Auto Coupon Management</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {meta?.totalItems ?? "..."}
            </div>
            <p className="text-xs text-muted-foreground">
              Active rules in system
            </p>
          </CardContent>
        </Card>
      </div>

      <AutoCouponDataTable
        columns={autoCouponColumns}
        data={autoCouponRules}
        pageCount={meta?.totalPages ?? 0}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        triggerTypeFilter={triggerTypeFilter}
        setTriggerTypeFilter={setTriggerTypeFilter}
        isActiveFilter={isActiveFilter}
        setIsActiveFilter={setIsActiveFilter}
        onRefresh={onRefresh}
        isLoading={isFetching}
      />
    </div>
  );
}
