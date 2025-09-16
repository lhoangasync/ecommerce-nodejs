import { getAllUsers } from "@/api/user.api";
import UserManage from "@/components/features/user/UserManage";
import Pagination from "@/components/shared/Pagination";
import { TPage } from "@/types";
import { UserProfile } from "@/types/backend";

import React from "react";

const page = async ({ searchParams }: TPage) => {
  const currentPage = Number((await searchParams).page) || 1;
  const limit = Number((await searchParams).limit) || 5;

  const response = await getAllUsers(currentPage, limit);
  const users = response.data?.items || ([] as UserProfile[]);
  const meta = response.data?.meta;
  const totalPages = meta?.totalPages || 1;

  return (
    <>
      <UserManage users={users}></UserManage>

      <div className="flex justify-center mt-10">
        {users.length > 0 && meta && totalPages > 0 && (
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
        )}
      </div>
    </>
  );
};

export default page;
