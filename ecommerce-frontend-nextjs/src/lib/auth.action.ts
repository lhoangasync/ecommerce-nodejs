"use server";

import { cookies } from "next/headers";

export async function saveRefreshTokenToCookie(refreshToken: string) {
  try {
    (await cookies()).set("refresh_token_fe", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 ngày, khớp với backend
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to set refresh token cookie:", error);
    return { success: false, error: "Could not save session." };
  }
}

export async function deleteRefreshTokenCookie() {
  try {
    (await cookies()).delete("refresh_token_fe");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Could not log out." };
  }
}
export async function checkRefreshTokenExists() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token");
    return { exists: !!refreshToken };
  } catch (error) {
    return { exists: false };
  }
}
export async function getCartSessionId() {
  try {
    const cookieStore = await cookies();
    const cartSession = cookieStore.get("cart_session_id");
    return cartSession?.value || null;
  } catch (error) {
    console.error("Failed to get cart session:", error);
    return null;
  }
}

export async function deleteCartSessionCookie() {
  try {
    (await cookies()).delete("cart_session_id");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete cart session cookie:", error);
    return { success: false };
  }
}
