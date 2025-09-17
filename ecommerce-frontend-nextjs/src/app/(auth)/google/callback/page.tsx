"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (code) {
      // Send success message to parent window
      window.opener?.postMessage(
        {
          type: "GOOGLE_OAUTH_SUCCESS",
          code,
        },
        window.location.origin
      );
      window.close();
    } else if (error) {
      // Send error message to parent window
      window.opener?.postMessage(
        {
          type: "GOOGLE_OAUTH_ERROR",
          error,
        },
        window.location.origin
      );
      window.close();
    }
  }, [searchParams]);

  return <LoadingSpinner />;
}
