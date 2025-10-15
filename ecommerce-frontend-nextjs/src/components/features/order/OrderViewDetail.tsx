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
import { Order } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  DollarSign,
} from "lucide-react";

interface OrderViewDetailsProps {
  order: Order;
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
      className: "bg-blue-400",
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
      variant: "secondary" as const,
      label: "Refunded",
      className: "",
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
      variant: "secondary" as const,
      label: "Refunded",
      className: "",
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const getPaymentMethodBadge = (method: Order["payment_method"]) => {
  const methodConfig = {
    cod: { label: "Cash on Delivery", className: "bg-amber-500" },
    momo: { label: "MoMo Wallet", className: "bg-pink-500" },
    vnpay: { label: "VNPay", className: "bg-blue-600" },
    bank_transfer: { label: "Bank Transfer", className: "bg-purple-500" },
  };

  const config = methodConfig[method];
  return (
    <Badge variant="default" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function OrderViewDetails({
  order,
  open,
  onOpenChange,
}: OrderViewDetailsProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[600px] rounded-none flex flex-col">
        <DrawerHeader className="p-6 border-b">
          <DrawerTitle className="text-2xl font-bold text-primary">
            Order Details
          </DrawerTitle>
          <div className="font-mono text-lg text-muted-foreground">
            {order.order_code}
          </div>
        </DrawerHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Order Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Order Status
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order Status</p>
                {getStatusBadge(order.status)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Method</p>
                {getPaymentMethodBadge(order.payment_method)}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Customer Information
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<MapPin className="h-4 w-4 text-primary" />}
                label="Full Name"
                value={order.shipping_address.full_name}
              />
              <DetailRow
                icon={<Phone className="h-4 w-4 text-primary" />}
                label="Phone Number"
                value={order.shipping_address.phone_number}
              />
              <DetailRow
                icon={<MapPin className="h-4 w-4 text-primary" />}
                label="Address"
                value={order.shipping_address.address}
              />
              {order.shipping_address.ward && (
                <DetailRow
                  icon={<MapPin className="h-4 w-4 text-primary" />}
                  label="Ward"
                  value={order.shipping_address.ward}
                />
              )}
              {order.shipping_address.district && (
                <DetailRow
                  icon={<MapPin className="h-4 w-4 text-primary" />}
                  label="District"
                  value={order.shipping_address.district}
                />
              )}
              <DetailRow
                icon={<MapPin className="h-4 w-4 text-primary" />}
                label="City"
                value={order.shipping_address.city}
              />
              {order.shipping_address.country && (
                <DetailRow
                  icon={<MapPin className="h-4 w-4 text-primary" />}
                  label="Country"
                  value={order.shipping_address.country}
                />
              )}
            </div>
          </div>

          {/* Order Note */}
          {order.note && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Order Note
              </h3>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{order.note}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Order Items ({totalItems} items)
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-muted/30 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold">{item.product_name}</h4>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {item.variant_shade_color && (
                          <div>Color: {item.variant_shade_color}</div>
                        )}
                        {item.variant_volume_size && (
                          <div>Size: {item.variant_volume_size}</div>
                        )}
                        <div className="font-mono text-xs">
                          SKU: {item.variant_sku}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold text-green-600">
                        {formatPrice(item.unit_price)}
                      </div>
                      {item.original_price &&
                        item.original_price > item.unit_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.original_price)}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Quantity:{" "}
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="text-sm">
                      Subtotal:{" "}
                      <span className="font-semibold text-green-600">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Order Summary
            </h3>
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <span className="font-medium">
                  {formatPrice(order.shipping_fee)}
                </span>
              </div>
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-red-500">
                    -{formatPrice(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Total Amount:</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Order Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow
                icon={<Calendar className="h-4 w-4 text-primary" />}
                label="Created At"
                value={formatDate(order.created_at)}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4 text-primary" />}
                label="Last Updated"
                value={formatDate(order.updated_at)}
              />
              {order.confirmed_at && (
                <DetailRow
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="Confirmed At"
                  value={formatDate(order.confirmed_at)}
                />
              )}
              {order.shipping_at && (
                <DetailRow
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="Shipped At"
                  value={formatDate(order.shipping_at)}
                />
              )}
              {order.delivered_at && (
                <DetailRow
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="Delivered At"
                  value={formatDate(order.delivered_at)}
                />
              )}
              {order.cancelled_at && (
                <DetailRow
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="Cancelled At"
                  value={formatDate(order.cancelled_at)}
                />
              )}
            </div>
            {order.cancellation_reason && (
              <div className="mt-4">
                <DetailRow
                  icon={<FileText className="h-4 w-4 text-destructive" />}
                  label="Cancellation Reason"
                  value={order.cancellation_reason}
                />
              </div>
            )}
          </div>
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
  <div className="flex items-start gap-3 min-w-0">
    {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
    <div className="flex flex-col min-w-0 gap-0.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground break-words">
        {value}
      </span>
    </div>
  </div>
);
