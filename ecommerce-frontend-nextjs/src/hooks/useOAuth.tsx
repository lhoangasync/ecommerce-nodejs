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

    if (window.FB) {
      resolve(window.FB);
      return;
    }

    window.fbAsyncInit = () => {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

      if (!appId) {
        reject(new Error("Facebook App ID not configured"));
        return;
      }

      FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      resolve(FB);
    };

    // Check if script already exists
    if (document.querySelector('script[src*="connect.facebook.net"]')) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => {
      reject(new Error("Failed to load Facebook SDK"));
    };
    script.onload = () => {
    };
    document.head.appendChild(script);
  });
};

export const useOAuth = () => {
  const router = useRouter();
  const { refetch } = useAuth();

  const handleGoogleLogin = useCallback(async () => {
    try {

      // Use the consolidated AuthAPI
      const response = await AuthAPI.getGoogleAuthURL();

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
      toast.error("Failed to initiate Google login");
    }
  }, []);

  const handleGoogleCallback = async (code: string) => {
    try {

      // Use the consolidated AuthAPI - it handles token setting automatically
      const response = await AuthAPI.googleLogin(code);

      if (response.status === 200) {
        toast.success(response.message || "Google login successful!");
        await refetch();
        router.push("/");
      } else {
        toast.error(response.message || "Google login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  const handleFacebookLogin = useCallback(async () => {
    try {

      const fbSDK = await loadFacebookSDK();

      FB.login(
        (response) => {

          if (response.authResponse && response.authResponse.accessToken) {
            
            handleFacebookCallback(response.authResponse.accessToken);
          } else {
            
            toast.error("Facebook login cancelled or failed");
          }
        },
        { scope: "email,public_profile" }
      );
    } catch (error: any) {
      toast.error("Failed to initiate Facebook login");
    }
  }, []);

  const handleFacebookCallback = async (accessToken: string) => {
    try {
      

      // Use the consolidated AuthAPI - it handles token setting automatically
      const response = await AuthAPI.facebookLogin(accessToken);

      if (response.status === 200) {
        toast.success(response.message || "Facebook login successful!");
        await refetch();
        router.push("/");
      } else {
        toast.error(response.message || "Facebook login failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Facebook login failed");
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
  };
};
