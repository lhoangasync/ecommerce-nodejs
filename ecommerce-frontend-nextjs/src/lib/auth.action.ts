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
