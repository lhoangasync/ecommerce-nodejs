"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { EUserRole } from "@/types/enums";

type Props = {
  children: React.ReactNode;
  allowedRoles?: EUserRole[];
  fallbackPath?: string;
  signInPath?: string;
};

export default function RequireAuth({
  children,
  allowedRoles,
  fallbackPath = "/",
  signInPath = "/sign-in",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasRole =
    !allowedRoles || (user && allowedRoles.includes(user.role as EUserRole));

  useEffect(() => {
    if (isLoading) return; // đợi SWR xong đã

    // Chưa đăng nhập
    if (!isAuthenticated) {
      if (pathname !== signInPath) {
        router.replace(signInPath);
      }
      return;
    }

    // Đã đăng nhập nhưng sai quyền
    if (!hasRole) {
      if (pathname !== fallbackPath) {
        router.replace(fallbackPath);
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    hasRole,
    pathname,
    router,
    signInPath,
    fallbackPath,
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated && hasRole) return <>{children}</>;
  return null; // đang chuyển hướng
}
