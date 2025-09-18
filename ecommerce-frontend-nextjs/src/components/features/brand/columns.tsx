"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/types/backend";
import { IconCopy, IconDelete, IconEdit, IconEye } from "@/components/icon";

export const columns: ColumnDef<Brand>[] = [
  // Cột Checkbox
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

  // Brand Name
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.original;
      const fallback = brand.name.substring(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="rounded-sm h-10 w-10">
            <AvatarImage src={brand.img} alt={brand.name} />
            <AvatarFallback className="text-xs rounded-sm">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="font-bold text-primary">{brand.name}</div>
        </div>
      );
    },
  },

  // Cột Country
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <div className="font-semibold text-blue-500">
        {row.getValue("country") || "N/A"}
      </div>
    ),
  },

  // Cột Slug
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <div className="italic text-orange-400">
        {row.getValue("slug") || "N/A"}
      </div>
    ),
  },

  // Cột Created At
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-green-400">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </div>
      );
    },
  },

  // Cột Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(brand._id)}
            >
              <IconCopy />
              Copy Brand ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-blue-400">
              <IconEye />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-yellow-600">
              <IconEdit />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <IconDelete />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
