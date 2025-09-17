"use client";

import { Suspense } from "react";
import VerifyEmailPage from "@/components/features/auth/VerifyEmailPage";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
