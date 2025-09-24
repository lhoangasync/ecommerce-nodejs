"use client";
import { useEffect, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

import RequireAdmin from "@/components/features/auth/RequireAdmin";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Pagination from "@/components/shared/Pagination";
import { getAllUsers } from "@/api/user.api";
import UserManage from "@/components/features/user/UserManage";

export default function UserPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 5;
  const initialSearch = searchParams.get("name") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchQuery) {
      params.set("name", debouncedSearchQuery);
      params.set("page", "1");
    } else {
      params.delete("name");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [debouncedSearchQuery, pathname, router, searchParams]);

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["users", currentPage, limit, debouncedSearchQuery],
    queryFn: () => getAllUsers(currentPage, limit, debouncedSearchQuery),
  });

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const users = response?.data.items || [];
  const meta = response?.data.meta;
  const totalPages = meta?.totalPages || 1;

  return (
    <RequireAdmin>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <UserManage
            users={users}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={onRefresh}
            isLoading={isFetching || isPending}
          />
          <div className="flex justify-center mt-10">
            {users.length > 0 && meta && (
              <Pagination currentPage={meta.page} totalPages={totalPages} />
            )}
          </div>
        </>
      )}
    </RequireAdmin>
  );
}
