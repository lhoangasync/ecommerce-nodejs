// src/hooks/useEmailVerification.ts
import { useState } from "react";
import { AuthAPI } from "@/api/auth.api";

export function useEmailVerification() {
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const verifyToken = async (token: string) => {
    if (!token) {
      setVerificationResult({
        status: "error",
        message: "Invalid verification token",
      });
      return;
    }

    setVerificationResult({ status: "loading", message: "Verifying..." });

    try {
      const response = await AuthAPI.verifyEmail(token);
      setVerificationResult({
        status: "success",
        message: response.message || "Email verified successfully!",
      });
      return response;
    } catch (error: any) {
      let errorMessage = "Verification failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes("USER_NOT_FOUND")) {
        errorMessage = "User not found. Please register again.";
      } else if (error.message?.includes("EMAIL_ALREADY_VERIFIED_BEFORE")) {
        errorMessage = "This email has already been verified.";
        setVerificationResult({ status: "success", message: errorMessage });
        return;
      }

      setVerificationResult({
        status: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  return { verificationResult, verifyToken };
}
