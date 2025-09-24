"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  AddCategoryReqBody,
  Category,
  IBackEndResponse,
  Paginated,
  UpdateCategoryReqBody,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

export async function getAllCategories(
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

  // `params.toString()` sẽ tạo ra chuỗi như "page=1&limit=10" hoặc "page=1&limit=10&name=lipsticks"
  const endpoint = `/categories/all?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Paginated<Category>>>(
    endpoint
  );

  return data;
}

export async function addCategory(
  body: AddCategoryReqBody
): Promise<FetchApiResponse<Category>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<Category>>(
      `/categories/add`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error adding category:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "An unexpected error occurred.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function deleteCategory(
  category_id: string
): Promise<FetchApiResponse<null>> {
  if (!category_id) {
    return { success: false, error: "Category ID is required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/categories/delete/${category_id}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error deleting category with ID ${category_id}:`, error);

    let errorMessage = "An unknown error occurred while deleting the category.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to delete category.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function updateCategory(
  categoryId: string,
  body: UpdateCategoryReqBody
): Promise<FetchApiResponse<Category>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<Category>>(
      `/categories/update/${categoryId}`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error updating brand ${categoryId}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update category.";
    }
    return { success: false, error: errorMessage };
  }
}
