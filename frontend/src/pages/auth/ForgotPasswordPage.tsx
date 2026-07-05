/**
 * Forgot Password Page
 * User enters their email — we send a password reset link.
 * Always shows a "check your email" message regardless of whether the email exists
 * (this is a security best practice — prevents attackers learning which emails are registered).
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = async (data: FormData) => {
    const message = await forgotPassword(data.email);
    if (message) setSuccessMessage(message);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries — we'll send you a reset link"
    >
      {successMessage ? (
        <div className="space-y-6">
          <Alert
            type="success"
            message={successMessage}
          />
          <p className="text-sm text-slate-500 text-center">
            Didn't receive it? Check your spam folder, or{" "}
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-brand-700 font-semibold hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {error && (
            <Alert
              type="error"
              message={error}
              onDismiss={clearError}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              hint="We'll send a password reset link to this address."
              {...register("email")}
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              {isLoading ? "Sending link…" : "Send reset link"}
            </Button>
          </form>
        </>
      )}

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </AuthLayout>
  );
}
