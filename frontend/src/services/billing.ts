import { api } from "./api";
import type { Subscription } from "@/types/billing";

export const billingApi = {
  getSubscription: () =>
    api.get<Subscription>("/billing/subscription"),

  createCheckout: (plan: "pro" | "enterprise") =>
    api.post<{ url: string }>(`/billing/checkout/${plan}`),

  createPortal: () =>
    api.post<{ url: string }>("/billing/portal"),
};
