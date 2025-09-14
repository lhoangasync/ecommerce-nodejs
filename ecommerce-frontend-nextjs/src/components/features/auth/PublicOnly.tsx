"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function PublicOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
