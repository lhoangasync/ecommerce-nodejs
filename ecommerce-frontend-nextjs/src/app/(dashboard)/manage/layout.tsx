"use client";
import RequireAdmin from "@/components/features/auth/RequireAdmin";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <RequireAdmin>{children}</RequireAdmin>;
};

export default AdminLayout;
