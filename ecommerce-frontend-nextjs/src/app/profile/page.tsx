"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/axios";
import { IBackEndResponse, UserProfile } from "@/types/backend";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("access_token");
        if (token) {
          setAccessToken(token);
        }
        
        const response = await api.get<IBackEndResponse<UserProfile>>("/users/me");

        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          throw new Error("Cannot get user information");
        }
      } catch (error: any) {
        console.error("Error while getting profile:", error);

        if (error.response?.status === 401) {
          setError("Login session expired");
          localStorage.removeItem("access_token");
          setAccessToken(null);
          setTimeout(() => {
            router.push("/sign-in");
          }, 1500);
        } else {
          setError("Cannot load user information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-2 bg-pink-400 text-white rounded hover:bg-pink-500"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="text-xl mb-4">Please sign in to view your profile</div>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-2 bg-pink-400 text-white rounded hover:bg-pink-500"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const getVerifyStatus = (verify: number) => {
    switch (verify) {
      case 0:
        return { text: "Not verified", color: "bg-yellow-100 text-yellow-700" };
      case 1:
        return { text: "Verified", color: "bg-green-100 text-green-700" };
      case 2:
        return { text: "Banned", color: "bg-red-100 text-red-700" };
      default:
        return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  const getRoleText = (role: number) => {
    return role === 1 ? "Admin" : "User";
  };

  const verifyStatus = getVerifyStatus(user.verify);

  return (
    <div className="min-h-screen bg-rose-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-pink-600">Profile</h1>
          <div className="w-20"></div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">

          {/* Avatar */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 text-sm rounded-full ${verifyStatus.color}`}>
                  {verifyStatus.text}
                </span>

                <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full">
                  {getRoleText(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pink-600 mb-4">Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">{user.name}</div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">{user.email}</div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">
                  {user.username || "Not updated"}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">
                  {user.phone || "Not updated"}
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="p-3 bg-rose-50 rounded border border-rose-200 font-mono text-sm">
                  {user._id}
                </div>
              </div>

              {/* Created date */}
              {user.created_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account created date
                  </label>
                  <div className="p-3 bg-rose-50 rounded border border-rose-200">
                    {new Date(user.created_at).toLocaleDateString("en-US")}
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="p-3 bg-rose-50 rounded border border-rose-200">
                {user.address || "Not updated"}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/profile/edit")}
              className="px-6 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 shadow-sm transition"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
