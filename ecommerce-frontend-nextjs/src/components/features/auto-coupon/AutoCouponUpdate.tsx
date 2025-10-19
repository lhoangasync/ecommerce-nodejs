"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { UpdateAutoCouponRuleReqBody, AutoCouponRule } from "@/types/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAutoCouponRule } from "@/api/autoCoupon.api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  trigger_type: z.enum([
    "order_count",
    "total_spent",
    "first_order",
    "birthday",
  ]),
  required_order_count: z.number().optional().nullable(),
  order_status: z.array(z.enum(["paid", "delivered"])).optional(),
  required_total_spent: z.number().optional().nullable(),
  code_prefix: z.string().min(1, "Code prefix is required"),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().min(0, "Discount value must be positive"),
  min_order_value: z.number().optional().nullable(),
  max_discount_amount: z.number().optional().nullable(),
  usage_limit_per_user: z.number().min(1, "Must be at least 1"),
  valid_days: z.number().min(1, "Must be at least 1 day"),
  is_active: z.boolean().default(true),
  max_redemptions: z.number().optional().nullable(),
});

type FormSchema = z.infer<typeof formSchema>;

interface AutoCouponUpdateProps {
  rule: AutoCouponRule;
}

function AutoCouponUpdate({ rule }: AutoCouponUpdateProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule.name,
      description: rule.description || "",
      trigger_type: rule.trigger_type,
      required_order_count: rule.required_order_count,
      order_status: rule.order_status,
      required_total_spent: rule.required_total_spent,
      code_prefix: rule.coupon_config.code_prefix,
      discount_type: rule.coupon_config.discount_type,
      discount_value: rule.coupon_config.discount_value,
      min_order_value: rule.coupon_config.min_order_value,
      max_discount_amount: rule.coupon_config.max_discount_amount,
      usage_limit_per_user: rule.coupon_config.usage_limit_per_user,
      valid_days: rule.coupon_config.valid_days,
      is_active: rule.is_active,
      max_redemptions: rule.max_redemptions,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: rule.name,
        description: rule.description || "",
        trigger_type: rule.trigger_type,
        required_order_count: rule.required_order_count,
        order_status: rule.order_status,
        required_total_spent: rule.required_total_spent,
        code_prefix: rule.coupon_config.code_prefix,
        discount_type: rule.coupon_config.discount_type,
        discount_value: rule.coupon_config.discount_value,
        min_order_value: rule.coupon_config.min_order_value,
        max_discount_amount: rule.coupon_config.max_discount_amount,
        usage_limit_per_user: rule.coupon_config.usage_limit_per_user,
        valid_days: rule.coupon_config.valid_days,
        is_active: rule.is_active,
        max_redemptions: rule.max_redemptions,
      });
    }
  }, [open, rule, form]);

  const updateMutation = useMutation({
    mutationFn: (body: UpdateAutoCouponRuleReqBody) =>
      updateAutoCouponRule(rule._id, body),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data?.message || "Auto coupon rule updated!");
        queryClient.invalidateQueries({ queryKey: ["auto-coupon-rules"] });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(values: FormSchema) {
    const payload: UpdateAutoCouponRuleReqBody = {
      name: values.name,
      description: values.description,
      required_order_count: values.required_order_count ?? undefined,
      order_status: values.order_status,
      required_total_spent: values.required_total_spent ?? undefined,
      coupon_config: {
        code_prefix: values.code_prefix,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_order_value: values.min_order_value ?? undefined,
        max_discount_amount: values.max_discount_amount ?? undefined,
        usage_limit_per_user: values.usage_limit_per_user,
        valid_days: values.valid_days,
      },
      is_active: values.is_active,
      max_redemptions: values.max_redemptions ?? undefined,
    };
    updateMutation.mutate(payload);
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const triggerType = form.watch("trigger_type");

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hover:bg-blue-50"
        >
          <Pencil className="size-4 text-blue-600" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl text-blue-600">
                Update Auto Coupon Rule
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 grid gap-6 overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., First Order Discount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trigger_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type *</FormLabel>
                      <FormControl>
                        <Input
                          value={
                            field.value === "first_order"
                              ? "First Order"
                              : field.value === "order_count"
                              ? "Order Count"
                              : field.value === "total_spent"
                              ? "Total Spent"
                              : "Birthday"
                          }
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormDescription>
                        Trigger type cannot be changed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Rule description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trigger Conditions */}
              {triggerType === "order_count" && (
                <FormField
                  control={form.control}
                  name="required_order_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Order Count *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? Number(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {triggerType === "total_spent" && (
                <FormField
                  control={form.control}
                  name="required_total_spent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Total Spent *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? Number(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Coupon Config */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Coupon Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code_prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code Prefix *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., WELCOME" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="fixed_amount">
                              Fixed Amount
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usage_limit_per_user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit Per User *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valid_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Days *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_order_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Order Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="max_redemptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Redemptions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? Number(value) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>Enable this rule</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AutoCouponUpdate;
