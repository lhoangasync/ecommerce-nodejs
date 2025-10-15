"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";

import { getAllOrders } from "@/api/order.api";
import { OrderDataTable } from "@/components/features/order/data-tables";
import columns from "@/components/features/order/columns";

export default function OrdersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "orders",
      pagination.pageIndex + 1,
      pagination.pageSize,
      searchQuery,
      statusFilter,
    ],
    queryFn: () =>
      getAllOrders({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        status: statusFilter
          ? (statusFilter as
              | "pending"
              | "confirmed"
              | "processing"
              | "shipping"
              | "delivered"
              | "cancelled"
              | "refunded")
          : undefined,
        search: searchQuery || undefined,
      }),
    staleTime: 30000, // 30 seconds
  });

  let ordersData: any[] = [];
  let paginationData: any = {};
  let pageCount = 0;

  if (data?.data) {
    const responseData = data.data as any;

    ordersData = responseData.orders || responseData.items || [];
    paginationData = responseData.pagination || responseData.meta || {};

    pageCount = paginationData.total_pages || paginationData.totalPages || 1;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Orders Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all customer orders
        </p>
      </div>

      <OrderDataTable
        columns={columns}
        data={ordersData}
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={() => refetch()}
        isLoading={isLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  );
}
