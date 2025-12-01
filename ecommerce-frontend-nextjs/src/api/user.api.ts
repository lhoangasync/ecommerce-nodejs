"use server";
import { revalidateTag } from "next/cache"; // Import revalidateTag để làm mới dữ liệu
import { isAxiosError } from "axios";
import { createServerApi } from "@/lib/serverApi";
import {
  IBackEndResponse,
  Paginated,
  UpdateUserReqBody,
  UserProfile,
} from "@/types/backend";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  name?: string
): Promise<IBackEndResponse<Paginated<UserProfile>>> {
  try {
    const api = await createServerApi();

    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (name) {
      params.append("name", name);
    }

    const endpoint = `/users/get-all-user?${params.toString()}`;
    const { data } = await api.get<IBackEndResponse<Paginated<UserProfile>>>(
      endpoint
    );

    return data;
  } catch (error) {
    return {
      status: 500,
      message: "Failed to fetch users",
      data: {
        items: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
      },
    };
  }
}

export async function updateUsers(
  userId: string,
  payload: UpdateUserReqBody
): Promise<FetchApiResponse<UserProfile>> {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<UserProfile>>(
      `/users/update/${userId}`,
      payload
    );

    revalidateTag("users");

    return { success: true, data: data };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to update user.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteUser(
  userId: string
): Promise<FetchApiResponse<null>> {
  if (!userId) {
    return { success: false, error: "User ID is required." };
  }

  try {
    const api = await createServerApi();
    const { data } = await api.delete<IBackEndResponse<null>>(
      `/users/delete/${userId}`
    );

    revalidateTag("users");

    return { success: true, data: data };
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to delete user.";
    }
    return { success: false, error: errorMessage };
  }
}
