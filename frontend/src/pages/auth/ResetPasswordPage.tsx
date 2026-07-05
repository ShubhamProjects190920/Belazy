/**
 * Reset Password Page
 * Reached by clicking the link in the password reset email.
 * The URL contains a token: /reset-password/<token>
 * User enters and confirms their new password.
 */
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowLeft } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";

const schema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Must contain at least one number."),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = (data: FormData) => {
    if (!token) return;
    resetPassword(token, data.new_password);
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <Alert
          type="error"
          message="This password reset link is invalid. Please request a new one."
        />
        <Link
          to="/forgot-password"
          className="mt-4 flex items-center gap-2 text-sm text-brand-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Request new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
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
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.new_password?.message}
          {...register("new_password")}
        />

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirm_password?.message}
          {...register("confirm_password")}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          {isLoading ? "Resetting password…" : "Reset password"}
        </Button>
      </form>

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
