"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Heading from "@/components/shared/Heading";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { IconDelete, IconEye } from "@/components/icon";
import { UserProfile } from "@/types/backend";
import { commonClassName, userType } from "@/constants";
import { cn } from "@/lib/utils";
import UserUpdate from "./UserUpdate";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteUser } from "@/api/user.api";
import { useRouter } from "next/navigation";

const UserManage = ({ users }: { users: UserProfile[] }) => {
  const router = useRouter();
  const handleDeleteUser = (userId: string) => {
    Swal.fire({
      title: "Delete it ? :((",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#78C841",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteUser(userId);
        toast.success("Delete user successfully!");
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between mb-10">
        <Heading>User Management</Heading>
        <div className="w-full lg:w-[300px]">
          <Input placeholder="Search user..." />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold text-lg">Info</TableHead>
            <TableHead className="font-bold text-lg">ID</TableHead>
            <TableHead className="font-bold text-lg">Email</TableHead>
            <TableHead className="font-bold text-lg">Role</TableHead>
            <TableHead className="font-bold text-lg">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users &&
            users.map((user) => {
              const userTypeItem = userType.find(
                (item) => item.value === user.role
              );
              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        alt=""
                        src={user.avatar}
                        width={70}
                        height={70}
                        className="shrink-0 size-16 rounded-full h-[40px] w-[40px] object-cover"
                      />
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm lg:text-base">
                          {user.name}
                        </h3>
                        <h4 className="text-sx lg:text-sm text-slate-500">
                          <i>Joined: </i>
                          {new Date(user.created_at).toLocaleDateString(
                            "vi-VI"
                          )}
                        </h4>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span>{user._id}</span>
                  </TableCell>
                  <TableCell>
                    <i>{user.email}</i>
                  </TableCell>
                  <TableCell>
                    <button
                      className={cn(
                        commonClassName.userType,
                        userTypeItem?.className
                      )}
                    >
                      {userTypeItem?.title}
                    </button>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-3">
                      <Link
                        href="#"
                        className="size-8 rounded-md border flex items-center justify-center p-2 text-orange-500 hover:border-primary border-gray-500/10 cursor-pointer"
                      >
                        <IconEye className="size-12" />
                      </Link>

                      {/*  Update User */}
                      <UserUpdate user={user} />

                      {/* Delete User */}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className={cn("text-red-500", commonClassName.action)}
                      >
                        <IconDelete className="size-12" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {users.length <= 0 && <p className="text-red-500 p-5">No user data</p>}
    </>
  );
};

export default UserManage;
