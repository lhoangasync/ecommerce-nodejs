import type { AxiosError } from "axios";

export function getMsg(error: unknown, fallback = "Error") {
  const err = error as AxiosError<any>;
  const errors = err?.response?.data?.errors;

  if (errors && typeof errors === "object") {
    const entry = Object.entries(errors)[0];
    if (entry) {
      const [field, value] = entry as [string, any];
      const msg = Array.isArray(value) ? value[0]?.msg : value?.msg;
      if (msg) return { field, msg };
    }
  }

  const message =
    err?.response?.data?.message || (err as any)?.message || fallback;
  return { field: "root", msg: message };
}
