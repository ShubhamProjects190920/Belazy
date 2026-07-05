/**
 * Verify Email Page
 * Reached by clicking the link in the verification email.
 * URL: /verify-email/<token>
 * Calls the backend, shows success or error, then redirects to login.
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { authApi } from "@/services/auth";
import { getErrorMessage } from "@/services/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";

type Status = "loading" | "success" | "error";

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  return (
    <AuthLayout title="Email Verification">
      <div className="flex flex-col items-center text-center gap-6 py-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-brand-600 animate-spin" />
            <p className="text-slate-600">Verifying your email address…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-slate-500 text-sm">{message}</p>
            </div>
            <Link to="/login">
              <Button size="lg">Go to Login</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-slate-500 text-sm">{message}</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link to="/resend-verification">
                <Button fullWidth variant="secondary">
                  Resend Verification Email
                </Button>
              </Link>
              <Link to="/login">
                <Button fullWidth variant="ghost">
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
