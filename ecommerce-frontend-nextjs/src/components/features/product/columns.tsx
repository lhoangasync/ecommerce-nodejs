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
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/backend";
import { IconCopy, IconDelete, IconEdit, IconEye } from "@/components/icon";
import Swal from "sweetalert2";
import { deleteProduct } from "@/api/product.api";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductUpdate from "./ProductUpdate";
import { useState } from "react";
import ProductViewDetails from "./ProductViewDetail";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Helper functions for variants
const getPriceRange = (variants: any[]) => {
  if (!variants || variants.length === 0) return { min: 0, max: 0 };

  const prices = variants.map((v) => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

const getTotalStock = (variants: any[]) => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce(
    (total, variant) => total + (variant.stock_quantity || 0),
    0
  );
};

const getAvailableVariantsCount = (variants: any[]) => {
  if (!variants || variants.length === 0) return 0;
  return variants.filter((v) => v.is_available && v.stock_quantity > 0).length;
};

export const columns: ColumnDef<Product>[] = [
  // Checkbox Column
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

  // Product Name with Image
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      const fallback = product.name.substring(0, 2).toUpperCase();
      const mainImage = product.images?.[0];

      return (
        <div className="flex items-center gap-3 max-w-[250px]">
          <Avatar className="rounded-sm h-12 w-12 flex-shrink-0">
            <AvatarImage src={mainImage || undefined} alt={product.name} />
            <AvatarFallback className="text-xs rounded-sm">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-bold text-primary truncate">
              {product.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {product.slug || "No slug"}
            </div>
          </div>
        </div>
      );
    },
  },

  // Price Range (from variants)
  {
    id: "price_range",
    header: "Price Range",
    cell: ({ row }) => {
      const product = row.original;
      const priceRange = getPriceRange(product.variants);

      if (priceRange.min === 0 && priceRange.max === 0) {
        return (
          <div className="text-muted-foreground italic text-sm">No pricing</div>
        );
      }

      return (
        <div className="font-semibold text-green-600">
          {priceRange.min === priceRange.max ? (
            formatPrice(priceRange.min)
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">From</div>
              <div>{formatPrice(priceRange.min)}</div>
              <div className="text-xs text-muted-foreground">To</div>
              <div>{formatPrice(priceRange.max)}</div>
            </div>
          )}
        </div>
      );
    },
  },

  // Total Stock (from variants)
  {
    id: "total_stock",
    header: "Total Stock",
    cell: ({ row }) => {
      const product = row.original;
      const totalStock = getTotalStock(product.variants);
      const isLowStock = totalStock <= 10;
      const isOutOfStock = totalStock === 0;

      return (
        <Badge
          variant={
            isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"
          }
          className={
            isLowStock && !isOutOfStock ? "bg-yellow-100 text-yellow-800" : ""
          }
        >
          {totalStock} units
        </Badge>
      );
    },
  },

  // Variants Info
  {
    id: "variants_info",
    header: "Variants",
    cell: ({ row }) => {
      const product = row.original;
      const totalVariants = product.variants?.length || 0;
      const availableVariants = getAvailableVariantsCount(product.variants);

      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {totalVariants} variant{totalVariants !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-muted-foreground">
            {availableVariants} available
          </div>
        </div>
      );
    },
  },

  // Availability Status
  {
    accessorKey: "is_available",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("is_available") as boolean;
      return (
        <Badge variant={isAvailable ? "default" : "secondary"}>
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      );
    },
  },

  // Brand & Category
  {
    id: "brand_category",
    header: "Brand/Category",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-purple-600">
            Brand: {product.brand?.name || "N/A"}
          </div>
          <div className="text-sm font-medium text-orange-600">
            Cat: {product.category?.name || "N/A"}
          </div>
        </div>
      );
    },
  },

  // Skin Types
  {
    id: "skin_types",
    header: "Skin Types",
    cell: ({ row }) => {
      const product = row.original;
      const skinTypes = product.skin_type;

      if (!skinTypes || skinTypes.length === 0) {
        return <span className="text-muted-foreground italic">N/A</span>;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {skinTypes.slice(0, 2).map((type, index) => (
            <Badge key={index} variant="outline" className="text-xs capitalize">
              {type}
            </Badge>
          ))}
          {skinTypes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{skinTypes.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },

  // Tags
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      if (!tags || tags.length === 0) {
        return <span className="text-muted-foreground italic">No tags</span>;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },

  // Rating (if available)
  {
    id: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const product = row.original;
      const rating = product.rating;
      const reviewCount = product.review_count;

      if (!rating && !reviewCount) {
        return <span className="text-muted-foreground italic">No rating</span>;
      }

      return (
        <div className="space-y-1">
          {rating && (
            <div className="text-sm font-medium text-yellow-600">
              ⭐ {rating}/5
            </div>
          )}
          {reviewCount && (
            <div className="text-xs text-muted-foreground">
              ({reviewCount} reviews)
            </div>
          )}
        </div>
      );
    },
  },

  // Created At
  {
    accessorKey: "created_at",
    header: "Created",
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

  // Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

      const queryClient = useQueryClient();
      const product = row.original;

      const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: (result) => {
          if (result.success) {
            toast.success(
              result.data?.message || "Product deleted successfully!"
            );
            queryClient.invalidateQueries({ queryKey: ["products"] });
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
          title: `Are you sure you want to delete "${product.name}"?`,
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#78C841",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            deleteMutation.mutate(product._id);
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
                onClick={() => navigator.clipboard.writeText(product._id)}
              >
                <IconCopy />
                Copy Product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-blue-400"
                onSelect={() => setIsViewDialogOpen(true)}
              >
                <IconEye />
                View details
              </DropdownMenuItem>
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

          <ProductUpdate
            product={product}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />

          <ProductViewDetails
            product={product}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        </>
      );
    },
  },
];
