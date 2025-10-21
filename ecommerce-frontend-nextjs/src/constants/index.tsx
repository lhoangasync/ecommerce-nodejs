import {
  IconBrand,
  IconCategory,
  IconCosmetic,
  IconCoupon,
  IconOrder,
  IconUsers,
} from "@/components/icon";
import { TMenuItem } from "@/types";
import { EUserRole } from "@/types/enums";
import { LayoutDashboard } from "lucide-react";

export const menuItems: TMenuItem[] = [
  {
    url: "/manage/overview",
    title: "Dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    url: "/manage/user",
    title: "User Management",
    icon: <IconUsers className="size-5" />,
  },
  {
    url: "/manage/product",
    title: "Product Management",
    icon: <IconCosmetic className="size-6" />,
  },
  {
    url: "/manage/brand",
    title: "Brand Management",
    icon: <IconBrand className="size-6" />,
  },
  {
    url: "/manage/category",
    title: "Category Management",
    icon: <IconCategory className="size-6" />,
  },
  {
    url: "/manage/order",
    title: "Order Management",
    icon: <IconOrder className="size-6" />,
  },
  {
    url: "/manage/auto-coupon",
    title: "Discount Management",
    icon: <IconCoupon className="size-6" />,
  },
];

export const userType: {
  title: string;
  value: EUserRole;
  className?: string;
}[] = [
  {
    title: "ADMIN",
    value: EUserRole.ADMIN,
    className: "text-red-500",
  },
  {
    title: "CUSTOMER",
    value: EUserRole.USER,
    className: "text-blue-500",
  },
];

export const commonClassName = {
  userType:
    "cursor-pointer bg-current/10 border border-current rounded-md font-medium px-3 py-1 text-xs whitespace-nowrap",
  action:
    "size-8 rounded-md border flex items-center justify-center p-2 hover:border-primary  border-gray-500/10 cursor-pointer",
};
