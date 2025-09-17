import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      setMessage("Invalid verification link. No token found.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await AuthAPI.verifyEmail(token);

      if (response.status === 200) {
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.message || "Verification failed.");
      }
    } catch (error: any) {
      setStatus("error");
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message?.includes("USER_NOT_FOUND")) {
        setMessage("User not found. Please register again.");
      } else if (error.message?.includes("EMAIL_ALREADY_VERIFIED_BEFORE")) {
        setMessage("This email has already been verified.");
        setStatus("success");
      } else {
        setMessage("Verification failed. Please try again or contact support.");
      }
    }
  };

  const handleResendEmail = async () => {
    const email = localStorage.getItem("registration_email");
    if (!email) {
      setMessage("Cannot resend email. Please register again.");
      return;
    }

    try {
      await AuthAPI.resendVerificationEmail(email);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Resend Verification Email
                </button>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Register Again
                </button>
              </div>
            </>
          )}

          {status === "invalid" && (
            <>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Link
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Go to Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
