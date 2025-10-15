"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowUpDown, Edit } from "lucide-react";
import { useState } from "react";
import OrderViewDetails from "./OrderViewDetail";
import OrderUpdate from "./OrderUpdate";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const getStatusBadge = (status: Order["status"]) => {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending", className: "" },
    confirmed: {
      variant: "default" as const,
      label: "Confirmed",
      className: "",
    },
    processing: {
      variant: "default" as const,
      label: "Processing",
      className: "bg-yellow-500",
    },
    shipping: {
      variant: "default" as const,
      label: "Shipping",
      className: "bg-blue-500",
    },
    delivered: {
      variant: "default" as const,
      label: "Delivered",
      className: "bg-green-500",
    },
    cancelled: {
      variant: "destructive" as const,
      label: "Cancelled",
      className: "",
    },
    refunded: {
      variant: "destructive" as const,
      label: "Refunded",
      className: "bg-purple-500",
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: Order["payment_status"]) => {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending", className: "" },
    paid: {
      variant: "default" as const,
      label: "Paid",
      className: "bg-green-500",
    },
    failed: { variant: "destructive" as const, label: "Failed", className: "" },
    refunded: {
      variant: "destructive" as const,
      label: "Refunded",
      className: "bg-purple-500",
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

// Actions cell component with both view and edit functionality
const ActionsCell = ({ order }: { order: Order }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailsOpen(true)}
          className="h-8 w-8 p-0"
          title="View details"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View details</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsUpdateOpen(true)}
          className="h-8 w-8 p-0"
          title="Update order"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Update order</span>
        </Button>
      </div>

      <OrderViewDetails
        order={order}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <OrderUpdate
        order={order}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
    </>
  );
};

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono font-medium">{row.getValue("order_code")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => getPaymentStatusBadge(row.getValue("payment_status")),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-semibold text-green-600">
        {formatPrice(row.getValue("total_amount"))}
      </div>
    ),
  },
  {
    accessorKey: "shipping_address",
    header: "Delivery Address",
    cell: ({ row }) => {
      const address = row.original.shipping_address;
      const fullAddress = [
        address.address,
        address.ward,
        address.district,
        address.city,
      ]
        .filter(Boolean)
        .join(", ");

      return (
        <div className="max-w-[200px] truncate" title={fullAddress}>
          {fullAddress}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{formatDate(row.getValue("created_at"))}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell order={row.original} />,
  },
];

export default columns;
