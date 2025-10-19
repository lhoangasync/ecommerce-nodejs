"use server";

import { createServerApi } from "@/lib/serverApi";
import {
  AutoCouponRule,
  CreateAutoCouponRuleReqBody,
  GetAutoCouponRulesReqQuery,
  IBackEndResponse,
  Paginated,
  UpdateAutoCouponRuleReqBody,
  UserCouponRedemption,
} from "@/types/backend";
import { isAxiosError } from "axios";

type FetchApiResponse<T> = {
  success: boolean;
  data?: IBackEndResponse<T>;
  error?: string;
};

// ========== AUTO COUPON RULE OPERATIONS ==========

export async function getAllAutoCouponRules(
  query: GetAutoCouponRulesReqQuery = {}
) {
  const api = await createServerApi();

  const params = new URLSearchParams();
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  params.append("page", String(page));
  params.append("limit", String(limit));

  if (query.trigger_type) params.append("trigger_type", query.trigger_type);
  if (query.is_active !== undefined)
    params.append("is_active", query.is_active);

  const endpoint = `/auto-coupons/rules?${params.toString()}`;

  const { data } = await api.get<IBackEndResponse<Paginated<AutoCouponRule>>>(
    endpoint
  );

  return data;
}

export async function getAutoCouponRuleById(
  rule_id: string
): Promise<IBackEndResponse<AutoCouponRule>> {
  const api = await createServerApi();

  try {
    const { data } = await api.get<IBackEndResponse<AutoCouponRule>>(
      `/auto-coupons/rules/${rule_id}`
    );

    console.log("API Response:", {
      status: data.status,
      ruleName: data.data?.name,
      triggerType: data.data?.trigger_type,
    });

    return data;
  } catch (error) {
    console.error("Error fetching auto coupon rule:", error);
    throw error;
  }
}

export async function createAutoCouponRule(
  body: CreateAutoCouponRuleReqBody
): Promise<FetchApiResponse<AutoCouponRule>> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<IBackEndResponse<AutoCouponRule>>(
      `/auto-coupons/rules`,
      body
    );

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating auto coupon rule:", error);

    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "An unexpected error occurred.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function updateAutoCouponRule(
  rule_id: string,
  body: UpdateAutoCouponRuleReqBody
): Promise<FetchApiResponse<AutoCouponRule>> {
  try {
    const api = await createServerApi();
    const { data } = await api.patch<IBackEndResponse<AutoCouponRule>>(
      `/auto-coupons/rules/${rule_id}`,
      body
    );
    return { success: true, data: data };
  } catch (error) {
    console.error(`Error updating auto coupon rule ${rule_id}:`, error);
    let errorMessage = "An unknown error occurred.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to update auto coupon rule.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteAutoCouponRule(
  rule_id: string
): Promise<FetchApiResponse<null>> {
  if (!rule_id) {
    return { success: false, error: "Rule ID is required." };
  }
  try {
    const api = await createServerApi();

    const { data } = await api.delete<IBackEndResponse<null>>(
      `/auto-coupons/rules/${rule_id}`
    );

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error deleting auto coupon rule with ID ${rule_id}:`, error);

    let errorMessage =
      "An unknown error occurred while deleting the auto coupon rule.";
    if (isAxiosError(error) && error.response) {
      errorMessage =
        error.response.data?.message || "Failed to delete auto coupon rule.";
    }

    return { success: false, error: errorMessage };
  }
}

// ========== USER AUTO COUPON OPERATIONS ==========

export async function getUserAutoCoupons(): Promise<
  IBackEndResponse<UserCouponRedemption[]>
> {
  const api = await createServerApi();

  try {
    const { data } = await api.get<IBackEndResponse<UserCouponRedemption[]>>(
      `/auto-coupons/my-coupons`
    );

    console.log("API Response:", {
      status: data.status,
      totalCoupons: data.data?.length,
    });

    return data;
  } catch (error) {
    console.error("Error fetching user auto coupons:", error);
    throw error;
  }
}
