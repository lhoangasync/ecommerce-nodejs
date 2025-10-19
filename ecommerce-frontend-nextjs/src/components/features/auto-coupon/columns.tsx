"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Badge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AutoCouponRule } from "@/types/backend";
import { IconCopy, IconDelete, IconEdit } from "@/components/icon";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteAutoCouponRule } from "@/api/autoCoupon.api";
import AutoCouponUpdate from "./AutoCouponUpdate";

const TRIGGER_TYPE_LABELS = {
  order_count: "Order Count",
  total_spent: "Total Spent",
  first_order: "First Order",
  birthday: "Birthday",
};

export const autoCouponColumns: ColumnDef<AutoCouponRule>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: "Rule Name",
    cell: ({ row }) => (
      <div className="font-bold text-primary">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "trigger_type",
    header: "Trigger Type",
    cell: ({ row }) => {
      const triggerType = row.getValue(
        "trigger_type"
      ) as keyof typeof TRIGGER_TYPE_LABELS;
      return (
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium inline-block">
          {TRIGGER_TYPE_LABELS[triggerType]}
        </div>
      );
    },
  },

  {
    accessorKey: "coupon_config",
    header: "Discount",
    cell: ({ row }) => {
      const config = row.original.coupon_config;
      return (
        <div className="font-semibold text-green-600">
          {config.discount_type === "percentage"
            ? `${config.discount_value}%`
            : `$${config.discount_value}`}
        </div>
      );
    },
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <div
          className={`px-2 py-1 rounded-md text-xs font-medium inline-block ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </div>
      );
    },
  },

  {
    accessorKey: "redemption_count",
    header: "Redemptions",
    cell: ({ row }) => {
      const count = row.getValue("redemption_count") as number;
      const max = row.original.max_redemptions;
      return (
        <div className="text-sm">
          {count} {max ? `/ ${max}` : ""}
        </div>
      );
    },
  },

  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-emerald-600 text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const queryClient = useQueryClient();
      const rule = row.original;

      const deleteMutation = useMutation({
        mutationFn: deleteAutoCouponRule,
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Auto coupon rule deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["auto-coupon-rules"] });
          } else {
            toast.error(result.error);
          }
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });

      const handleDelete = async () => {
        Swal.fire({
          title: `Are you sure you want to delete "${rule.name}"?`,
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#78C841",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            deleteMutation.mutate(rule._id);
          }
        });
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-bold">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(rule._id)}
              >
                <IconCopy />
                Copy Rule ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-yellow-600"
                onSelect={() => setIsEditDialogOpen(true)}
              >
                <IconEdit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                <IconDelete />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AutoCouponUpdate rule={rule} />
        </>
      );
    },
  },
];
