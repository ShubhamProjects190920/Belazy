export type PlanName = "starter" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete";

export interface Subscription {
  id: string;
  company_id: string;
  plan: PlanName;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanInfo {
  name: PlanName;
  label: string;
  price: string;
  priceNote: string;
  users: string;
  projects: string;
  features: string[];
  highlighted: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    name: "starter",
    label: "Starter",
    price: "Free",
    priceNote: "forever",
    users: "Up to 3 users",
    projects: "1 project",
    features: ["Basic dashboard", "Team management", "Company profile"],
    highlighted: false,
  },
  {
    name: "pro",
    label: "Pro",
    price: "$49",
    priceNote: "/ month",
    users: "Up to 25 users",
    projects: "Unlimited projects",
    features: ["Everything in Starter", "AI Assistant", "Advanced reports", "Priority support"],
    highlighted: true,
  },
  {
    name: "enterprise",
    label: "Enterprise",
    price: "$199",
    priceNote: "/ month",
    users: "Unlimited users",
    projects: "Unlimited projects",
    features: ["Everything in Pro", "Custom integrations", "SLA guarantee", "Dedicated support"],
    highlighted: false,
  },
];
