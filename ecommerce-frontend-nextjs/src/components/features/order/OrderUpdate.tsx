"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "react-toastify";
import { updateOrderStatus } from "@/api/order.api";
import { Order } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";

const formSchema = z.object({
  status: z.enum([
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  cancellation_reason: z.string().optional(),
  tracking_number: z.string().optional(),
});

type OrderFormData = z.infer<typeof formSchema>;

interface OrderUpdateProps {
  order: Order;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function OrderUpdate({ order, open, onOpenChange }: OrderUpdateProps) {
  const queryClient = useQueryClient();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: order.status === "pending" ? "confirmed" : order.status,
      cancellation_reason: order.cancellation_reason || "",
      tracking_number: "",
    },
  });

  const selectedStatus = form.watch("status");

  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        status: OrderFormData["status"];
        cancellation_reason?: string;
        tracking_number?: string;
      };
    }) => updateOrderStatus(orderId, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          result.data?.message || "Order status updated successfully!"
        );
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(values: OrderFormData) {
    if (values.status === order.status && !values.tracking_number) {
      toast.info("No changes to save.");
      return;
    }

    // Validate cancellation reason
    if (values.status === "cancelled" && !values.cancellation_reason?.trim()) {
      toast.error("Cancellation reason is required when cancelling an order.");
      return;
    }

    const data: {
      status: OrderFormData["status"];
      cancellation_reason?: string;
      tracking_number?: string;
    } = {
      status: values.status,
    };

    if (values.cancellation_reason?.trim()) {
      data.cancellation_reason = values.cancellation_reason;
    }

    if (values.tracking_number?.trim()) {
      data.tracking_number = values.tracking_number;
    }

    updateMutation.mutate({ orderId: order._id, data });
  }

  const handleModalClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset({
        status: order.status === "pending" ? "confirmed" : order.status,
        cancellation_reason: order.cancellation_reason || "",
        tracking_number: "",
      });
    }
  };

  return (
    <Dialog onOpenChange={handleModalClose} open={open}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="contents"
          >
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-500">
                Update Order Status
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Order Code:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {order.order_code}
                  </span>
                </div>
              </div>

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tracking Number Field - Show for shipping status */}
              {selectedStatus === "shipping" && (
                <FormField
                  control={form.control}
                  name="tracking_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number (Optional)</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter tracking number"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Cancellation Reason Field - Required for cancelled status */}
              {selectedStatus === "cancelled" && (
                <FormField
                  control={form.control}
                  name="cancellation_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cancellation Reason{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide a reason for cancellation"
                          className="min-h-[80px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Warning Messages */}
              {selectedStatus === "cancelled" && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  ⚠️ Cancelling this order will make it non-editable and may
                  trigger refund processes.
                </div>
              )}

              {selectedStatus === "refunded" && (
                <div className="rounded-lg bg-orange-500/10 p-3 text-sm text-orange-600">
                  ⚠️ This status indicates the order has been refunded. Ensure
                  payment refund has been processed.
                </div>
              )}

              {selectedStatus === "delivered" && (
                <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                  ✓ Marking as delivered will complete this order.
                </div>
              )}

              {selectedStatus === "processing" && (
                <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-600">
                  📦 Order is being prepared for shipment.
                </div>
              )}

              {selectedStatus === "shipping" && (
                <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-600">
                  🚚 Order is on the way to customer.
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default OrderUpdate;
