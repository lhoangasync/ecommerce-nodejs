"use server";
import { createServerApi } from "@/lib/serverApi";
import {
  AddBrandReqBody,
  Brand,
  IBackEndResponse,
  Paginated,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

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

export async function addBrand(
  body: AddBrandReqBody
): Promise<FetchApiResponse<Brand>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Brand>>(
      `/brands/add`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error adding brand:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "An unexpected error occurred.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function deleteBrand(
  brand_id: string
): Promise<FetchApiResponse<null>> {
  if (!brand_id) {
    return { success: false, error: "Brand ID is required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/brands/delete/${brand_id}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error deleting brand with ID ${brand_id}:`, error);

    let errorMessage = "An unknown error occurred while deleting the brand.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to delete brand.";
    }

    return { success: false, error: errorMessage };
  }
}
