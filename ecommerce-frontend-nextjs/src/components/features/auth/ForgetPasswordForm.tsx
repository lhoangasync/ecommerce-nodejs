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
import { useState } from "react";
import { AuthAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { getMsg } from "@/utils/error-message";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await AuthAPI.forgotPassword(values);

      setIsEmailSent(true);
      toast.success(
        "Password reset email has been sent! Please check your inbox."
      );
    } catch (error) {
      const { msg } = getMsg(error);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading spinner when submitting
  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  if (isEmailSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <Heading className="mb-6">Check Your Email</Heading>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We have sent a password reset link to{" "}
          <span className="font-medium">{form.getValues("email")}</span>. Please
          check your inbox and follow the instructions to reset your password.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEmailSent(false)}
              className="rounded-lg"
            >
              Try Again
            </Button>
            <Link href="/sign-in">
              <Button variant="outline" className="rounded-lg">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading className="flex justify-center items-center mb-10">
        Forgot Password?
      </Heading>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
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
            Send Reset Link
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
