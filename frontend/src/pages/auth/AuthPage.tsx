/**
 * AuthPage — Unified Sign Up / Sign In via OTP
 *
 * Step 1a: User enters email → clicks Continue
 * Step 1b: If new user → show name fields → clicks Send Code
 * Step 2:  User enters 6-digit code from email → clicks Verify
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, ArrowLeft, RefreshCw } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { OtpInput } from "@/components/ui/OtpInput";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { getErrorMessage } from "@/services/api";

type Step = "email" | "name" | "otp";

export function AuthPage() {
  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [otp, setOtp]             = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [otpError, setOtpError]   = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  // ── Step 1: Submit email ────────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await authApi.requestOtp({ email: email.trim() });
      setIsNewUser(data.is_new_user);
      setStep("otp");
    } catch (err: any) {
      // Backend returns detail="new_user" when email not found and no name given
      if (err?.response?.data?.detail === "new_user") {
        setIsNewUser(true);
        setStep("name");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 1b: Submit name (new users only) ───────────────────────────────
  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestOtp({ email, first_name: firstName.trim(), last_name: lastName.trim() });
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) { setError("Please enter all 6 digits."); return; }
    setIsLoading(true);
    setError(null);
    setOtpError(false);

    try {
      const { data: tokens } = await authApi.verifyOtp({ email, otp_code: otp });
      setTokens(tokens.access_token, tokens.refresh_token);
      const { data: user } = await authApi.getMe();
      setUser(user);
      navigate(user.company_id ? "/dashboard" : "/company/setup");
    } catch (err) {
      setOtpError(true);
      setError(getErrorMessage(err));
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────
  async function handleResend() {
    setIsLoading(true);
    setError(null);
    setOtp("");
    setOtpError(false);
    try {
      await authApi.requestOtp({
        email,
        ...(isNewUser ? { first_name: firstName, last_name: lastName } : {}),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title={
        step === "email" ? "Welcome" :
        step === "name"  ? "Create your account" :
                           "Enter your code"
      }
      subtitle={
        step === "email" ? "Sign in or create a new account" :
        step === "name"  ? "Tell us your name to get started" :
                           `We sent a 6-digit code to ${email}`
      }
    >
      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />
      )}

      {/* ── STEP 1a: Email ─────────────────────────────────────── */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            {isLoading ? "Checking…" : "Continue"}
          </Button>
        </form>
      )}

      {/* ── STEP 1b: Name (new users) ──────────────────────────── */}
      {step === "name" && (
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 mb-2">
            No account found for <strong>{email}</strong>. Enter your name to create one.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              placeholder="Jaskirat"
              leftIcon={<User className="w-4 h-4" />}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
            <Input
              label="Last name"
              placeholder="Singh"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            {isLoading ? "Sending code…" : "Send OTP Code"}
          </Button>
          <button
            type="button"
            onClick={() => { setStep("email"); setError(null); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Use a different email
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP ────────────────────────────────────────── */}
      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} error={otpError} />

          {otpError && (
            <p className="text-center text-sm text-red-600">Incorrect code — please try again.</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={otp.length !== 6}
          >
            {isLoading ? "Verifying…" : "Verify & Continue"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); setError(null); setOtpError(false); }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Change email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900 font-medium disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> Resend code
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
