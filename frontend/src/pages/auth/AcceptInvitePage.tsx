/**
 * Accept Invite Page
 * When someone clicks an invitation link (/accept-invite/<token>):
 * - If logged in  → accept immediately
 * - If not logged in → show login/signup options first, then accept
 */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { companyApi } from "@/services/company";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { authApi } from "@/services/auth";
import { getErrorMessage } from "@/services/api";
import type { InvitationDetails } from "@/types/company";

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, setUser } = useAuthStore();
  const { setCompany } = useCompanyStore();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [status, setStatus] = useState<"loading" | "preview" | "accepting" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid invite link."); return; }
    companyApi.getInvitation(token)
      .then(({ data }) => { setInvitation(data); setStatus("preview"); })
      .catch((err) => { setStatus("error"); setMessage(getErrorMessage(err)); });
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setStatus("accepting");
    try {
      const { data: company } = await companyApi.acceptInvitation(token);
      setCompany(company);
      const { data: user } = await authApi.getMe();
      setUser(user);
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <AuthLayout title="Team Invitation">
      <div className="text-center py-4">
        {(status === "loading" || status === "accepting") && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
            <p className="text-slate-500">{status === "loading" ? "Loading invitation…" : "Joining company…"}</p>
          </div>
        )}

        {status === "preview" && invitation && (
          <div className="space-y-6">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
              <p className="text-slate-600 text-sm">You've been invited to join</p>
              <p className="text-2xl font-bold text-brand-900 mt-1">{invitation.company_name}</p>
              <p className="text-sm text-slate-500 mt-1">
                as <strong>{invitation.role.replace("_", " ")}</strong>
              </p>
            </div>

            {isAuthenticated ? (
              <Button fullWidth size="lg" onClick={handleAccept}>
                Accept & Join {invitation.company_name}
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">You need to be logged in to accept this invitation.</p>
                <Link to={`/login?next=/accept-invite/${token}`}>
                  <Button fullWidth size="lg">Log in to Accept</Button>
                </Link>
                <Link to={`/signup?email=${encodeURIComponent(invitation.email)}`}>
                  <Button fullWidth variant="secondary">Create Account First</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-semibold text-slate-900">You've joined the team!</p>
            <p className="text-sm text-slate-500">Redirecting to dashboard…</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <p className="font-semibold text-slate-900">Invitation Error</p>
            <p className="text-sm text-slate-500">{message}</p>
            <Link to="/dashboard"><Button variant="secondary">Go to Dashboard</Button></Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
