import { useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/auth-provider";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/api/auth.api";

// Facebook SDK Types
interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: "connected" | "not_authorized" | "unknown";
}

interface FacebookSDK {
  init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;

  login(
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope: string }
  ): void;

  logout(callback?: (response: any) => void): void;

  getLoginStatus(callback: (response: FacebookLoginResponse) => void): void;
}

// Extend global window interface
declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
  const FB: FacebookSDK;
}

// Load Facebook SDK
const loadFacebookSDK = (): Promise<FacebookSDK> => {
  return new Promise((resolve, reject) => {
    console.log("📦 Loading Facebook SDK...");

    if (window.FB) {
      console.log("✅ Facebook SDK already loaded");
      resolve(window.FB);
      return;
    }

    window.fbAsyncInit = () => {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      console.log("🔧 Facebook App ID:", appId ? "Found" : "Missing");

      if (!appId) {
        console.error("❌ Facebook App ID not configured");
        reject(new Error("Facebook App ID not configured"));
        return;
      }

      console.log("🚀 Initializing Facebook SDK with App ID:", appId);
      FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      console.log("✅ Facebook SDK initialized successfully");
      resolve(FB);
    };

    // Check if script already exists
    if (document.querySelector('script[src*="connect.facebook.net"]')) {
      console.log("📜 Facebook SDK script already exists");
      return;
    }

    console.log("📜 Creating Facebook SDK script tag");
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => {
      console.error("❌ Failed to load Facebook SDK script");
      reject(new Error("Failed to load Facebook SDK"));
    };
    script.onload = () => {
      console.log("✅ Facebook SDK script loaded");
    };
    document.head.appendChild(script);
  });
};

export const useOAuth = () => {
  const router = useRouter();
  const { refetch } = useAuth();

  const handleGoogleLogin = useCallback(async () => {
    try {
      console.log("🚀 Starting Google login flow");

      // Use the consolidated AuthAPI
      const response = await AuthAPI.getGoogleAuthURL();
      console.log("✅ Got Google auth URL");

      // Open popup window
      const popup = window.open(
        response.data.authURL,
        "googleLogin",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        toast.error("Popup blocked. Please allow popups for this site.");
        return;
      }

      // Listen for popup to close and get code
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log("Google login popup was closed");
        }
      }, 1000);

      // Listen for message from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "GOOGLE_OAUTH_SUCCESS") {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener("message", messageListener);
          handleGoogleCallback(event.data.code);
        } else if (event.data.type === "GOOGLE_OAUTH_ERROR") {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener("message", messageListener);
          toast.error(event.data.message || "Google login failed");
        }
      };

      window.addEventListener("message", messageListener);
    } catch (error: any) {
      console.error("💥 Google login error:", error);
      toast.error("Failed to initiate Google login");
    }
  }, []);

  const handleGoogleCallback = async (code: string) => {
    try {
      console.log("🔄 Processing Google callback with code");

      // Use the consolidated AuthAPI - it handles token setting automatically
      const response = await AuthAPI.googleLogin(code);

      if (response.status === 200) {
        console.log("✅ Google login successful");
        toast.success(response.message || "Google login successful!");
        await refetch();
        router.push("/");
      } else {
        console.error("❌ Google login failed with status:", response.status);
        toast.error(response.message || "Google login failed");
      }
    } catch (error: any) {
      console.error("💥 Google callback error:", error);
      toast.error(error.message || "Google login failed");
    }
  };

  const handleFacebookLogin = useCallback(async () => {
    try {
      console.log("🚀 Starting Facebook login flow");

      const fbSDK = await loadFacebookSDK();
      console.log("✅ Facebook SDK loaded:", fbSDK);

      FB.login(
        (response) => {
          console.log("📥 Facebook login response:", response);

          if (response.authResponse && response.authResponse.accessToken) {
            console.log(
              "✅ Facebook auth successful, userID:",
              response.authResponse.userID
            );
            console.log(
              "🔑 Facebook access token:",
              response.authResponse.accessToken.substring(0, 20) + "..."
            );
            handleFacebookCallback(response.authResponse.accessToken);
          } else {
            console.error(
              "❌ Facebook login failed or cancelled:",
              response.status
            );
            toast.error("Facebook login cancelled or failed");
          }
        },
        { scope: "email,public_profile" }
      );
    } catch (error: any) {
      console.error("💥 Facebook login initiation error:", error);
      toast.error("Failed to initiate Facebook login");
    }
  }, []);

  const handleFacebookCallback = async (accessToken: string) => {
    try {
      console.log(
        "🔄 Processing Facebook callback with token:",
        accessToken.substring(0, 20) + "..."
      );

      // Use the consolidated AuthAPI - it handles token setting automatically
      const response = await AuthAPI.facebookLogin(accessToken);
      console.log("📥 Facebook login API response:", response);

      if (response.status === 200) {
        console.log("✅ Facebook login successful");
        toast.success(response.message || "Facebook login successful!");
        await refetch();
        router.push("/");
      } else {
        console.error("❌ Facebook login failed with status:", response.status);
        toast.error(response.message || "Facebook login failed");
      }
    } catch (error: any) {
      console.error("💥 Facebook callback error:", error);
      toast.error(error.message || "Facebook login failed");
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
  };
};
