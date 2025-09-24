"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/backend";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Tag,
  Calendar,
  Clock,
  Package,
  DollarSign,
  Warehouse,
  Eye,
  CheckCircle,
  XCircle,
  Palette,
  Package2,
} from "lucide-react";

interface ProductViewDetailsProps {
  product: Product;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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

export default function ProductViewDetails({
  product,
  open,
  onOpenChange,
}: ProductViewDetailsProps) {
  const priceRange = getPriceRange(product.variants);
  const totalStock = getTotalStock(product.variants);
  const availableVariants =
    product.variants?.filter((v) => v.is_available && v.stock_quantity > 0) ||
    [];

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[600px] rounded-none flex flex-col">
        <DrawerHeader className="p-6 border-b">
          <DrawerTitle className="text-2xl font-bold text-primary">
            {product.name}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover border-2 border-primary/20 shadow-md"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                <p className="text-muted-foreground italic">
                  No images available
                </p>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow
              icon={<Package className="h-4 w-4 text-primary" />}
              label="Product Name"
              value={product.name}
            />
            <DetailRow
              icon={<Tag className="h-4 w-4 text-primary" />}
              label="Slug"
              value={product.slug || "N/A"}
            />
            <DetailRow
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
              label="Price Range"
              value={
                priceRange.min === priceRange.max
                  ? formatPrice(priceRange.min)
                  : `${formatPrice(priceRange.min)} - ${formatPrice(
                      priceRange.max
                    )}`
              }
            />
            <DetailRow
              icon={<Warehouse className="h-4 w-4 text-blue-600" />}
              label="Total Stock"
              value={totalStock.toString()}
            />
            <DetailRow
              icon={<Package2 className="h-4 w-4 text-purple-600" />}
              label="Available Variants"
              value={`${availableVariants.length} / ${
                product.variants?.length || 0
              }`}
            />
            {product.origin && (
              <DetailRow
                icon={<Globe className="h-4 w-4 text-primary" />}
                label="Origin"
                value={product.origin}
              />
            )}
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-3">
            {product.is_available ? (
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Unavailable
              </Badge>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Product Variants
              </h3>
              <div className="space-y-3">
                {product.variants.map((variant, index) => (
                  <div
                    key={variant.id || index}
                    className="bg-muted/30 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {variant.shade_color && (
                        <DetailRow
                          icon={<Palette className="h-4 w-4 text-pink-600" />}
                          label="Shade/Color"
                          value={variant.shade_color}
                        />
                      )}
                      {variant.volume_size && (
                        <DetailRow
                          icon={<Package2 className="h-4 w-4 text-blue-600" />}
                          label="Volume/Size"
                          value={variant.volume_size}
                        />
                      )}
                      <DetailRow
                        icon={<DollarSign className="h-4 w-4 text-green-600" />}
                        label="Price"
                        value={formatPrice(variant.price)}
                      />
                      <DetailRow
                        icon={<Warehouse className="h-4 w-4 text-blue-600" />}
                        label="Stock"
                        value={variant.stock_quantity?.toString() || "0"}
                      />
                      <DetailRow
                        icon={<Tag className="h-4 w-4 text-gray-600" />}
                        label="SKU"
                        value={variant.sku || "N/A"}
                      />
                      <div className="flex items-center gap-2">
                        {variant.is_available && variant.stock_quantity > 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Variant Images */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Variant Images:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {variant.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative w-16 h-16">
                              <Image
                                src={image}
                                alt={`Variant ${index + 1} - Image ${
                                  imgIndex + 1
                                }`}
                                fill
                                className="rounded object-cover border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skin Types */}
          {product.skin_type && product.skin_type.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Suitable Skin Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.skin_type.map((type, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Brand & Category Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow
              icon={<Package className="h-4 w-4 text-purple-600" />}
              label="Brand"
              value={product.brand?.name || "N/A"}
            />
            <DetailRow
              icon={<Tag className="h-4 w-4 text-orange-600" />}
              label="Category"
              value={product.category?.name || "N/A"}
            />
          </div>

          {/* Rating & Reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow
              icon={<Eye className="h-4 w-4 text-yellow-600" />}
              label="Rating"
              value={`${product.rating ?? 0}/5`}
            />
            <DetailRow
              icon={<Eye className="h-4 w-4 text-gray-600" />}
              label="Reviews"
              value={(product.review_count ?? 0).toString()}
            />
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Created At"
              value={formatDate(product.created_at)}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4 text-primary" />}
              label="Last Updated"
              value={formatDate(product.updated_at)}
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Description
              </h3>
              <div
                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </div>
          )}
          {/* Ingredients */}
          {product.ingredients && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Ingredients
              </h3>
              <div
                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.ingredients,
                }}
              />
            </div>
          )}

          {/* How to Use */}
          {product.how_to_use && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                How to Use
              </h3>
              <div
                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.how_to_use,
                }}
              />
            </div>
          )}
        </div>

        <DrawerFooter className="p-6 border-t flex-shrink-0">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    {icon && <div className="mt-1">{icon}</div>}
    <div className="flex flex-col">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-md font-semibold text-foreground">{value}</span>
    </div>
  </div>
);
