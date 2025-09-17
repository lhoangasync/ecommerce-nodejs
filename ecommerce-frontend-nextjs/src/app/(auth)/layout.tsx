"use client";

import PublicOnly from "@/components/features/auth/PublicOnly";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
// import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { user, isLoading, isAuthenticated } = useAuth();
  // if (isLoading) return <LoadingSpinner />;
  // if (isAuthenticated) return redirect("/");
  return (
    <PublicOnly>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-primary p-4">
        <div className="flex w-full max-w-5xl bg-[#FDFAF6] rounded-3xl overflow-hidden shadow-xl">
          {/* Left Side */}
          <div className="hidden md:flex flex-col justify-between bg-[url(/poster-cosmetic.jpg)] bg-cover bg-center p-10 w-1/2 text-white relative rounded-3xl"></div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 p-10">{children}</div>
        </div>
      </div>
    </PublicOnly>
  );
}
