"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/axios";
import { IBackEndResponse, UserProfile, UpdateUserReqBody } from "@/types/backend";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [formData, setFormData] = useState<UpdateUserReqBody>({
    name: "",
    username: "",
    avatar: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Load access token
        const token = localStorage.getItem("access_token");
        if (token) {
          setAccessToken(token);
        }
        
        const response = await api.get<IBackEndResponse<UserProfile>>("/users/me");

        if (response.data && response.data.data) {
          const userData = response.data.data;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            username: userData.username || "",
            avatar: userData.avatar || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
          setAvatarPreview(userData.avatar || "");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      // Upload to backend
      const response = await api.post<IBackEndResponse<{ url: string }>>(
        "/upload/single",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.data && response.data.data.url) {
        const imageUrl = response.data.data.url;
        setAvatarPreview(imageUrl);
        setFormData((prev) => ({
          ...prev,
          avatar: imageUrl,
        }));
        setSuccess("Avatar uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error.response?.data?.message || "Failed to upload avatar. Please try again.");
      // Revert preview on error
      setAvatarPreview(formData.avatar || "");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validation
    if (!formData.name || formData.name.trim().length < 1) {
      setError("Name is required");
      return;
    }

    if (formData.phone && formData.phone.length > 0) {
      if (!/^\d+$/.test(formData.phone)) {
        setError("Phone number must contain only digits");
        return;
      }
      if (formData.phone.length < 10 || formData.phone.length > 11) {
        setError("Phone number must be 10-11 digits");
        return;
      }
    }

    if (formData.username && formData.username.length > 0) {
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError("Username can only contain letters, numbers and underscores");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: UpdateUserReqBody = {};
      
      // Chỉ gửi những trường đã thay đổi
      if (formData.name && formData.name.trim() !== user.name) {
        payload.name = formData.name.trim();
      }
      if (formData.username && formData.username.trim() !== user.username) {
        payload.username = formData.username.trim();
      }
      if (formData.avatar !== user.avatar) {
        payload.avatar = formData.avatar ? formData.avatar.trim() : "";
      }
      if (formData.phone !== user.phone) {
        payload.phone = formData.phone ? formData.phone.trim() : "";
      }
      if (formData.address !== user.address) {
        payload.address = formData.address ? formData.address.trim() : "";
      }

      const response = await api.patch<IBackEndResponse<UserProfile>>(
        `/users/update-me`,
        payload
      );

      if (response.data && response.data.data) {
        setSuccess("Profile updated successfully! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 403) {
        setError("You don't have permission to update this profile");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="text-xl mb-4">Please sign in to edit your profile</div>
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

  return (
    <div className="min-h-screen bg-rose-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
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
          <h1 className="text-3xl font-bold text-pink-600">Edit Profile</h1>
          <div className="w-20"></div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          
          {/* Avatar Upload Section */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  formData.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full shadow-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload avatar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="ml-6 flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-gray-500 text-xs mt-1">
                {uploading ? "Uploading avatar..." : "Click the camera icon to upload a new avatar"}
              </p>
              
              {avatarPreview && !uploading && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                maxLength={50}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
                placeholder="Enter username (letters, numbers, underscore)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers and underscores allowed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={11}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
                placeholder="0123456789"
              />
              <p className="text-xs text-gray-500 mt-1">
                10-11 digits only
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                maxLength={200}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none resize-none"
                placeholder="Enter your address"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 200 characters
              </p>
            </div>

            {/* Note */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Note
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-7">
                <li>• Email cannot be changed</li>
                <li>• Avatar: JPG, PNG, GIF, or WebP (max 5MB)</li>
                <li>• Avatar is uploaded to Cloudinary cloud storage</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t flex gap-3">
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-8 py-3 bg-pink-400 text-white rounded-lg hover:bg-pink-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm font-medium flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving || uploading}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}