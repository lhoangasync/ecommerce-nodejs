"use client";
import React from "react";
import { menuItems } from "@/constants";
import ActiveLink from "../shared/ActiveLink";
import { TMenuItem } from "@/types";
import Link from "next/link";
import { IconExit } from "../icon";
import { Button } from "../ui/button";
import { AuthAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { useAuth } from "@/app/auth-provider";

const Sidebar = () => {
  const { mutate } = useAuth();
  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      toast.success("Logout successfully!");
      await mutate();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="hidden p-5 border-r borderDarkMode bgDarkMode lg:flex flex-col dark:border-r-gray-200/10 fixed top-0 left-0 bottom-0 w-[300px]">
      <Link
        href="/"
        className="font-bold inline-block text-3xl mb-5 self-start"
      >
        <span className="text-primary">C</span>
        osmetic
      </Link>
      <ul className="flex flex-col gap-1">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            url={item.url}
            title={item.title}
            icon={item.icon}
          ></MenuItem>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-end gap-5">
        <Button onClick={handleLogout}>
          <IconExit className="size-7" />
        </Button>
      </div>
    </div>
  );
};

export function MenuItem({ url = "/", title = "", icon, onlyIcon }: TMenuItem) {
  return (
    <li>
      <ActiveLink url={url}>
        {icon}

        {onlyIcon ? null : title}
      </ActiveLink>
    </li>
  );
}

export default Sidebar;
