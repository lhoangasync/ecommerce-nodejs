"use client";

import * as React from "react";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const generatePagination = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = generatePagination();

  return (
    <ShadcnPagination>
      <PaginationContent>
        {/* Nút Previous */}
        {currentPage > 1 && (
          <PaginationItem suppressHydrationWarning>
            <Link href={createPageURL(currentPage - 1)}>
              <PaginationPrevious />
            </Link>
          </PaginationItem>
        )}

        {/* Các nút số trang */}
        {pages.map((page, index) =>
          typeof page === "number" ? (
            <PaginationItem key={`${page}-${index}`} suppressHydrationWarning>
              <Link href={createPageURL(page)}>
                <PaginationLink
                  isActive={currentPage === page}
                  className="text-white"
                >
                  {page}
                </PaginationLink>
              </Link>
            </PaginationItem>
          ) : (
            <PaginationItem key={`${page}-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        )}

        {/* Nút Next */}
        {currentPage < totalPages && (
          <PaginationItem suppressHydrationWarning>
            <Link href={createPageURL(currentPage + 1)}>
              <PaginationNext />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}
