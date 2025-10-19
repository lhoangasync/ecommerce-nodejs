"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  IBackEndResponse,
  SendMessageReqBody,
  ChatHistory,
  GetChatHistoryReqQuery,
  ChatbotResponse,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

// ========== CHATBOT OPERATIONS ==========

export async function sendChatMessage(
  body: SendMessageReqBody
): Promise<FetchApiResponse<ChatbotResponse>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<ChatbotResponse>>(
      `/chatbot/chat`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error sending chat message:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || "Failed to send message.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function getChatHistory(query: GetChatHistoryReqQuery = {}) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page);
  if (query.limit) params.append("limit", query.limit);

  const endpoint = `/chatbot/history?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<ChatHistory[]>>(endpoint);

  return data;
}

export async function getChatSession(session_id: string) {
  const api = await createServerApi();

  const { data } = await api.get<IBackEndResponse<ChatHistory>>(
    `/chatbot/history/${session_id}`
  );

  return data;
}

export async function getQuickSuggestions() {
  const api = await createServerApi();

  const { data } = await api.get<IBackEndResponse<string[]>>(
    `/chatbot/suggestions`
  );

  return data;
}

export async function explainIngredients(
  product_id: string
): Promise<FetchApiResponse<{ explanation: string }>> {
  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<{ explanation: string }>>(
      `/chatbot/ingredients/${product_id}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error explaining ingredients:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to explain ingredients.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function createRoutine(): Promise<
  FetchApiResponse<{ routine: string }>
> {
  try {
    const api = await createServerApi();
    const { data } = await api.get<IBackEndResponse<{ routine: string }>>(
      `/chatbot/routine`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating routine:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to create routine.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function compareProducts(
  product_ids: string[]
): Promise<FetchApiResponse<{ comparison: string }>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<{ comparison: string }>>(
      `/chatbot/compare`,
      { product_ids }
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error comparing products:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to compare products.";
    }

    return { success: false, error: errorMessage };
  }
}
