// components/auth/RequireAdmin.tsx
"use client";
import RequireAuth from "./RequireAuth";
import { EUserRole } from "@/types/enums";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth
      allowedRoles={[EUserRole.ADMIN]}
      fallbackPath="/"
      signInPath="/sign-in"
    >
      {children}
    </RequireAuth>
  );
}
