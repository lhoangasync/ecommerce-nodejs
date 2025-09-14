"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";
import axios from "axios";
import { AuthAPI } from "@/api/auth.api";
import type { UserProfile } from "@/types/backend";

type Ctx = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
  mutate: (data?: UserProfile | null) => void;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
    "me",
    async () => {
      try {
        const res = await AuthAPI.me();
        return res.data ?? null;
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // không có refresh cookie hoặc refresh fail -> chưa đăng nhập
          return null;
        }
        throw err;
      }
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  return (
    <AuthContext.Provider
      value={{
        user: data ?? null,
        isAuthenticated: !!data,
        isLoading,
        isError: !!error,
        refetch: () => mutate(),
        mutate: (d) => mutate(d, false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
