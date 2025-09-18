"use server";
import { createServerApi } from "@/lib/serverApi";
import { Brand, IBackEndResponse, Paginated } from "@/types/backend";

export async function getAllBrands(
  page: number = 1,
  limit: number = 10,
  name?: string
) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (name) {
    params.append("name", name);
  }

  // `params.toString()` sẽ tạo ra chuỗi như "page=1&limit=10" hoặc "page=1&limit=10&name=sony"
  const endpoint = `/brands/all?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Paginated<Brand>>>(endpoint);

  return data;
}
