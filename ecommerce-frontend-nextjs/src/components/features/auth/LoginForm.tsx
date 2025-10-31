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
import { IconFacebook, IconGoogle } from "@/components/icon";
import Heading from "@/components/shared/Heading";
import Link from "next/link";
import { useState } from "react";
import { AuthAPI } from "@/api/auth.api";
import { useRouter } from "next/navigation";
import { getMsg } from "@/utils/error-message";
import { toast } from "react-toastify";
import { useAuth } from "@/app/auth-provider";
import { useOAuth } from "@/hooks/useOAuth";
import {
  saveRefreshTokenToCookie,
  getCartSessionId,
  deleteCartSessionCookie,
} from "@/lib/auth.action";
import { migrateCart } from "@/api/cart.api";
const formSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useAuth();
  const { handleGoogleLogin, handleFacebookLogin } = useOAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // 1. Get cart session ID BEFORE LOGIN
      const guestSessionId = await getCartSessionId();

      const response = await AuthAPI.login(values);
      const refreshToken = response.data?.refresh_token;

      // 2. Save refresh token to cookie
      if (refreshToken) {
        await saveRefreshTokenToCookie(refreshToken);
      }

      // 3. Call API /me
      const meResponse = await AuthAPI.me();
      await mutate(meResponse.data, { revalidate: false });

      // 4. MIGRATE CART if guest session exists
      if (guestSessionId) {
        try {
          const migrateResult = await migrateCart({
            session_id: guestSessionId,
          });

          if (migrateResult.success) {
            console.log("Cart migrated successfully!");
            // Delete old cart_session_id cookie
            await deleteCartSessionCookie();
          }
        } catch (migrateError) {
          console.error("Cart migration failed:", migrateError);
          // Do not block login flow if migrate fails
        }
      }

      toast.success("Login successfully!");
      router.replace("/");
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
        Welcome our shop!
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
                    placeholder="Enter your email"
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
                <FormLabel>Password</FormLabel>
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full bg-gradient-to-primary text-white rounded-lg cursor-pointer"
          >
            Sign in
          </Button>

          <div className="flex justify-between items-center">
            <p>
              Dont have any account?
              <Link
                href="/sign-up"
                className="text-primary hover:text-primary2 ml-1"
              >
                Sign up
              </Link>
            </p>

            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary2"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </Form>

      {/* Divider */}
      <div className="flex items-center gap-2 my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Google Login */}
      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 rounded-lg mb-2"
      >
        <IconGoogle />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        onClick={handleFacebookLogin}
        className="w-full flex items-center justify-center gap-2 rounded-lg"
      >
        <IconFacebook />
        Continue with Facebook
      </Button>
    </div>
  );
}
