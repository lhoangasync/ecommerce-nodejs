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
import Heading from "@/components/shared/Heading";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { getMsg } from "@/utils/error-message";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
        }
      ),
    confirm_password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (!urlToken) {
      setIsValidToken(false);
      toast.error(
        "Invalid reset link. Please request a new link."
      );
    } else {
      setToken(urlToken);
    }
    setIsLoading(false);
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthAPI.resetPassword({
        forgot_password_token: token,
        password: values.password,
        confirm_password: values.confirm_password,
      });

      toast.success(
        "Password reset successfully! Please sign in with your new password."
      );
      router.push("/sign-in");
    } catch (error) {
      const { msg } = getMsg(error);
      toast.error(msg);

      // If token is expired or invalid, redirect to forgot password
      if (msg.includes("expired") || msg.includes("invalid")) {
        setTimeout(() => {
          router.push("/forgot-password");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading spinner when checking token or submitting
  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  if (!isValidToken) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <Heading className="mb-6">Invalid Reset Link</Heading>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          This password reset link is invalid or has expired. Please request a new link.
        </p>
        <Link href="/forgot-password">
          <Button className="bg-gradient-to-primary text-white rounded-lg">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Heading className="flex justify-center items-center mb-10">
        Reset Your Password
      </Heading>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500 mt-1">
                  Password must contain at least 6 characters with uppercase,
                  lowercase, number, and special character.
                </p>
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full bg-gradient-to-primary text-white rounded-lg cursor-pointer"
          >
            Reset Password
          </Button>

          <div className="flex justify-center items-center">
            <p>
              Remember your password?
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary2 ml-1"
              >
                Back to Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
