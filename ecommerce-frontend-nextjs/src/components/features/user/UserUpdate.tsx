"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconAddress,
  IconEdit,
  IconEmail,
  IconPhone,
  IconUser,
} from "@/components/icon";
import { UpdateUserReqBody, UserProfile } from "@/types/backend";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { BadgeAlert, Ban, CheckCircle2, XIcon } from "lucide-react";
import { updateUsers } from "@/api/user.api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import getDirtyValues from "@/utils/getDirtyFields";
import { getMsg } from "@/utils/error-message";
import { EUserVerifyStatus } from "@/types/enums";
import { UploadButton } from "@/utils/uploadthing";

const formSchema = z.object({
  name: z.string().nonempty("Name is required").optional(),
  username: z
    .string()
    .min(4, "Username must more than 4 characters")
    .optional(),
  email: z.email().nonempty("Email is required").optional(),
  address: z
    .string()
    .min(1, { message: "Address is more than 1 character" })
    .optional(),
  phone: z
    .string()
    .regex(/^\d+$/, { message: "Phone number must contain only digits." })
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(11, { message: "Phone number must be no more than 11 digits." })
    .or(z.literal(""))
    .optional(),
  avatar: z.string().optional(),
});

function UserUpdate({ user }: { user: UserProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: user.name,
      username: user.username,
      email: user.email,
      address: user.address,
      avatar: user.avatar,
      phone: user.phone,
    },
  });

  async function onsubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { dirtyFields } = form.formState;
      if (Object.keys(dirtyFields).length === 0) {
        toast.info("No changes to save.");
        setIsSubmitting(false);
        return;
      }
      const allValues = form.getValues();

      const payload = getDirtyValues<typeof allValues>(dirtyFields, allValues);

      console.log("payload", payload);
      const res = await updateUsers(
        user._id,
        payload as Partial<UpdateUserReqBody>
      );

      toast.success(res.message);
      form.reset(values);
      router.refresh();
    } catch (error) {
      // toast.error("An error occurred. Please try again.");
      // console.error("Failed to update user:", error);
      const { msg } = getMsg(error);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      form.reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        address: user.address || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
      });
    }
  };

  const avatarWatch = form.watch("avatar");

  return (
    <Dialog onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <button className="size-8 rounded-md border flex items-center justify-center p-2 text-blue-500 hover:border-primary border-gray-500/10 cursor-pointer">
          <IconEdit className="size-12" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg p-2"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} autoComplete="off">
            <div className="p-6 ">
              <DialogHeader>
                <DialogTitle className="mx-auto mb-2">Edit User</DialogTitle>
              </DialogHeader>
              <div className="flex items-start justify-between ">
                {/* Avatar và tên */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Image
                      alt=""
                      src={
                        user.avatar ||
                        "https://plus.unsplash.com/premium_photo-1732757787074-0f95bf19cf73?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVmYXVsdCUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D"
                      }
                      width={72}
                      height={72}
                      className="rounded-full object-cover w-24 h-24 "
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {user.verify === EUserVerifyStatus.VERIFIED ? (
                        <CheckCircle2 className="size-6 fill-blue-500 text-white" />
                      ) : user.verify === EUserVerifyStatus.UNVERIFIED ? (
                        <BadgeAlert className="size-6 fill-orange-500 text-white" />
                      ) : (
                        <Ban className="size-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-5 grid gap-5">
              {/* Name */}
              <div className="grid grid-cols-2 gap-8 mt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-start gap-2">
                        <IconUser className="size-4" />
                        <FormLabel>Name</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-start gap-2">
                        <IconUser className="size-4" />
                        <FormLabel>Username</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Username..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-8 mt-2">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-start gap-2">
                        <IconEmail className="size-4" />
                        <FormLabel>Email address</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Email..." {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-start gap-2">
                        <IconPhone className="size-4" />
                        <FormLabel>Phone</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Phone..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-start gap-2">
                      <IconAddress className="size-4" />
                      <FormLabel>Address</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="Address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-start">
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <div className="h-[100px] w-[100px] bg-white rounded-full border border-gray-500 border-dashed flex relative">
                          {!avatarWatch ? (
                            <UploadButton
                              className=" h-[100px] w-[100px] bg-gray-300 rounded-full text-red-500"
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                // Do something with the response
                                form.setValue("avatar", res[0].ufsUrl, {
                                  shouldDirty: true,
                                });
                                console.log(">>>>>>>>>", res[0].ufsUrl);
                              }}
                              onUploadError={(error: Error) => {
                                // Do something with the error.
                                console.error(`ERROR! ${error.message}`);
                              }}
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                alt="Avatar preview"
                                src={avatarWatch}
                                fill
                                className="rounded-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  form.setValue("avatar", "", {
                                    shouldDirty: true,
                                  });
                                }}
                                className="absolute top-0 right-0 z-10 flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full transition-transform hover:scale-110 focus:outline-none"
                                aria-label="Remove profile photo"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default UserUpdate;
