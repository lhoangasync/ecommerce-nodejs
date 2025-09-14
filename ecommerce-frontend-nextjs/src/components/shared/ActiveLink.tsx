"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { TActiveLinkProps } from "../../types";

const ActiveLink = ({ url, children }: TActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = url === pathname;

  return (
    <Link
      scroll={false}
      href={url}
      className={`p-3 rounded-md flex items-center gap-3 text-base transition-all font-medium dark:text-grayDark ${
        isActive
          ? "text-primary bg-primary/10 link-active font-semibold"
          : "hover:text-primary  hover:bg-primary/10"
      }`}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;
