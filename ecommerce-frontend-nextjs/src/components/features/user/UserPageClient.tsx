"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

import RequireAdmin from "@/components/features/auth/RequireAdmin";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Pagination from "@/components/shared/Pagination";
import { getAllUsers } from "@/api/user.api";
import UserManage from "@/components/features/user/UserManage";

export default function UserPageClient() {
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 5;
  // const [searchQuery, setSearchQuery] = useState('');
  // const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const { data: response, isLoading } = useQuery({
    queryKey: ["users", currentPage, limit],
    queryFn: () => getAllUsers(currentPage, limit),
  });

  const users = response?.data?.items || [];
  const meta = response?.data?.meta;
  const totalPages = meta?.totalPages || 1;

  return (
    <RequireAdmin>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <UserManage users={users} />
          <div className="flex justify-center mt-10">
            {users.length > 0 && meta && totalPages > 0 && (
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
              />
            )}
          </div>
        </>
      )}
    </RequireAdmin>
  );
}
