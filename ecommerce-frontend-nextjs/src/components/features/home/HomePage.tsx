"use client";
import Link from "next/link";
import RequireAuth from "../auth/RequireAuth";
import { useAuth } from "@/app/auth-provider";

export default function HomePage() {
  const { user } = useAuth();
  const name = user?.name;
  const user_id = user?._id;
  return (
    <RequireAuth>
      <div className="flex justify-center items-center flex-col gap-5">
        <span>
          Hello {name} {user_id}
        </span>
        <Link href="/manage/user">Admin</Link>
      </div>
    </RequireAuth>
  );
}
