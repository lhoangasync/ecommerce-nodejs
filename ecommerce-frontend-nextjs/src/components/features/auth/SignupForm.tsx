"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  IconAddress,
  IconEmail,
  IconPassword,
  IconUser,
} from "@/components/icon";
import Heading from "@/components/shared/Heading";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { getMsg } from "@/utils/error-message";

const formSchema = z
  .object({
    email: z.email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
    confirm_password: z
      .string()
      .min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
    first_name: z.string().min(1, { message: "Vui lòng nhập tên" }),
    last_name: z.string().min(1, { message: "Vui lòng nhập họ" }),
    address: z.string().min(1, { message: "Vui lòng nhập địa chỉ" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu không khớp",
    path: ["confirm_password"],
  });
export default function SignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      address: "",
    },
  });

  const getFullName = (first_name: string, last_name: string) => {
    return `${first_name} ${last_name}`;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await AuthAPI.register({
        name: getFullName(values.first_name, values.last_name) as string,
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
        address: values.address,
      });

      if (result.status === 201) {
        toast.success("Register successfully! ");
        router.push("/sign-in");
      }
    } catch (error) {
      const { msg } = getMsg(error);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Heading className="flex justify-center items-center mb-10">
        Sign Up
      </Heading>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          autoComplete="off"
        >
          <div className="flex items-center justify-center gap-3">
            {/* First Name*/}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-start gap-2">
                    <IconUser className="size-4" />
                    <FormLabel>First Name</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your first name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-start gap-2">
                    <IconUser className="size-4" />
                    <FormLabel>Last Name</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your last name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <Input
                    type="text"
                    placeholder="Enter your address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-start gap-2">
                  <IconPassword className="size-4" />
                  <FormLabel>Password</FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-start gap-2">
                  <IconPassword className="size-4" />
                  <FormLabel>Confirm Password</FormLabel>
                </div>{" "}
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-gradient-to-primary text-white rounded-lg cursor-pointer"
          >
            Sign up
          </Button>

          <div className="flex justify-center items-center">
            <p>
              Already have an account?
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary2 ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
