import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { billingApi } from "@/services/billing";
import { getErrorMessage } from "@/services/api";
import { PLANS, type PlanInfo, type PlanName, type Subscription } from "@/types/billing";

const PLAN_ICONS: Record<PlanName, React.ReactNode> = {
  starter: <Shield className="w-5 h-5" />,
  pro:     <Zap    className="w-5 h-5" />,
  enterprise: <Sparkles className="w-5 h-5" />,
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:     { label: "Active",     color: "bg-emerald-100 text-emerald-800" },
  trialing:   { label: "Trial",      color: "bg-blue-100 text-blue-800" },
  past_due:   { label: "Past Due",   color: "bg-amber-100 text-amber-800" },
  canceled:   { label: "Canceled",   color: "bg-red-100 text-red-800" },
  incomplete: { label: "Incomplete", color: "bg-slate-100 text-slate-600" },
};

function PlanCard({
  plan,
  currentPlan,
  onUpgrade,
  upgrading,
}: {
  plan: PlanInfo;
  currentPlan: PlanName;
  onUpgrade: (plan: "pro" | "enterprise") => void;
  upgrading: string | null;
}) {
  const isCurrent   = plan.name === currentPlan;
  const isDowngrade = plan.name === "starter" && currentPlan !== "starter";
  const isPaid      = plan.name !== "starter";

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col transition-shadow ${
        plan.highlighted
          ? "border-brand-500 shadow-lg shadow-brand-100 ring-1 ring-brand-500"
          : "border-slate-200"
      } ${isCurrent ? "bg-brand-50" : "bg-white"}`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${plan.highlighted ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
          {PLAN_ICONS[plan.name]}
        </div>
        <h3 className="font-bold text-slate-900">{plan.label}</h3>
        {isCurrent && (
          <span className="ml-auto text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </div>

      <div className="mb-4">
        <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
        <span className="text-slate-500 text-sm ml-1">{plan.priceNote}</span>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        <li className="text-sm text-slate-700 font-medium">{plan.users}</li>
        <li className="text-sm text-slate-700 font-medium">{plan.projects}</li>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="secondary" disabled className="w-full">
          Current Plan
        </Button>
      ) : isDowngrade ? (
        <Button variant="ghost" disabled className="w-full text-slate-400">
          Downgrade via billing portal
        </Button>
      ) : isPaid ? (
        <Button
          className="w-full"
          onClick={() => onUpgrade(plan.name as "pro" | "enterprise")}
          isLoading={upgrading === plan.name}
          disabled={!!upgrading}
        >
          Upgrade to {plan.label}
        </Button>
      ) : null}
    </div>
  );
}

export function BillingPage() {
  const [searchParams] = useSearchParams();
  const [sub, setSub]         = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [portaling, setPortaling] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccess("Payment successful! Your plan has been upgraded.");
    } else if (searchParams.get("canceled") === "true") {
      setError("Checkout was canceled. No charges were made.");
    }
  }, [searchParams]);

  useEffect(() => {
    billingApi
      .getSubscription()
      .then(({ data }) => setSub(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan: "pro" | "enterprise") {
    setUpgrading(plan);
    setError(null);
    try {
      const { data } = await billingApi.createCheckout(plan);
      window.location.href = data.url;
    } catch (err) {
      setError(getErrorMessage(err));
      setUpgrading(null);
    }
  }

  async function handlePortal() {
    setPortaling(true);
    setError(null);
    try {
      const { data } = await billingApi.createPortal();
      window.location.href = data.url;
    } catch (err) {
      setError(getErrorMessage(err));
      setPortaling(false);
    }
  }

  const statusInfo = sub ? STATUS_LABELS[sub.status] : null;

  return (
    <AppLayout
      title="Billing & Subscription"
      subtitle="Manage your plan and payment details"
    >
      <div className="max-w-4xl space-y-8">

        {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}
        {error   && <Alert type="error"   message={error}   onDismiss={() => setError(null)} />}

        {/* Current Plan Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Current Plan</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-slate-400 text-sm">Loading…</span>
                </div>
              ) : sub ? (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 capitalize">{sub.plan}</h2>
                  {statusInfo && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              ) : null}

              {sub?.current_period_end && (
                <p className="text-sm text-slate-500 mt-1">
                  {sub.cancel_at_period_end ? "Cancels on" : "Renews on"}{" "}
                  {new Date(sub.current_period_end).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </div>

            {sub?.stripe_subscription_id && (
              <Button
                variant="secondary"
                onClick={handlePortal}
                isLoading={portaling}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Plan Cards */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Choose a Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                currentPlan={sub?.plan ?? "starter"}
                onUpgrade={handleUpgrade}
                upgrading={upgrading}
              />
            ))}
          </div>
        </div>

        {/* Stripe notice */}
        <p className="text-xs text-slate-400 text-center">
          Payments are processed securely by Stripe. We never store your card details.
        </p>

      </div>
    </AppLayout>
  );
}
