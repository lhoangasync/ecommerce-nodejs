"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { EUserRole } from "@/types/enums"; // enum: ADMIN | USER ...

type Props = {
  children: React.ReactNode;
  allowedRoles?: EUserRole[];
  /** Nếu không đủ quyền thì chuyển tới trang nào (mặc định "/") */
  fallbackPath?: string;
  /** Nếu chưa login thì chuyển tới trang nào (mặc định "/sign-in") */
  signInPath?: string;
};

export default function RequireAuth({
  children,
  allowedRoles,
  fallbackPath = "/",
  signInPath = "/sign-in",
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasRole =
    !allowedRoles || (user && allowedRoles.includes(user.role as EUserRole));

  useEffect(() => {
    if (isLoading) return;

    // chưa đăng nhập -> về trang sign-in
    if (!isAuthenticated) {
      router.replace(signInPath);
      return;
    }

    // đã đăng nhập nhưng không đủ quyền -> về fallback
    if (!hasRole) {
      router.replace(fallbackPath);
      return;
    }
  }, [isLoading, isAuthenticated, hasRole, router, signInPath, fallbackPath]);

  if (isLoading) return <LoadingSpinner />;

  // đang điều hướng
  if (!isAuthenticated || !hasRole) return null;

  return <>{children}</>;
}
