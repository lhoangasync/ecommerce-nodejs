"use server";
import { createServerApi } from "@/lib/serverApi";
import {
  IBackEndResponse,
  Paginated,
  UpdateUserReqBody,
  UserProfile,
} from "@/types/backend";

export async function getAllUsers(page: number = 1, limit: number = 10) {
  const api = await createServerApi();
  const { data } = await api.get<IBackEndResponse<Paginated<UserProfile>>>(
    `/users/get-all-user?page=${page}&limit=${limit}`
  );
  return data;
}

export async function updateUsers(userId: string, payload: UpdateUserReqBody) {
  const api = await createServerApi();
  const { data } = await api.patch<IBackEndResponse<UserProfile>>(
    `/users/update/${userId}`,
    payload
  );
  console.log(">>>>updateUsers: ", data);
  return data;
}

export async function deleteUser(userId: string) {
  const api = await createServerApi();
  await api.delete<IBackEndResponse<{ message: string }>>(
    `/users/delete/${userId}`,
    {}
  );
}
