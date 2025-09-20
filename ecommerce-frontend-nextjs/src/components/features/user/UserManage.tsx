"use client";
import React, { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
// 1. CẬP NHẬT PROPS ĐỂ NHẬN ĐẦY ĐỦ CÁC HÀM TỪ CHA
interface UserManageProps {
  users: UserProfile[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
}

const UserManage = ({
  users,
  isLoading,
  searchQuery,
  setSearchQuery,
  onRefresh,
}: UserManageProps) => {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();

  // 2. DI CHUYỂN `useMutation` RA CẤP CAO NHẤT CỦA COMPONENT
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (result) => {
      if (result.success) {
        Swal.fire(
          "Deleted!",
          result.data?.message || "User deleted successfully.",
          "success"
        );
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        Swal.fire("Error!", result.error, "error");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // `handleDeleteUser` bây giờ là một hàm bình thường, không phải hook
  const handleDeleteUser = (user: UserProfile) => {
    Swal.fire({
      title: `Delete user "${user.name}"?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#78C841",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Chỉ cần gọi `mutate` ở đây
        deleteUserMutation.mutate(user._id);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between mb-10">
        <Heading>User Management</Heading>
        <div className="w-full lg:w-[300px]">
          <Input
            placeholder="Search user by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                        src={
                          user.avatar ||
                          "https://plus.unsplash.com/premium_photo-1732757787074-0f95bf19cf73?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVmYXVsdCUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D"
                        }
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

                      {/* Delete User */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 text-red-500 hover:border-destructive"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <IconDelete className="size-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {users.length <= 0 && <p className="text-red-500 p-5">No user data</p>}
      {editingUser && (
        <UserUpdate
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingUser(null);
            }
          }}
        />
      )}
    </>
  );
};

export default UserManage;
