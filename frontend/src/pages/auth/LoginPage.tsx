/**
 * Login Page
 * Users enter their email and password to get JWT tokens and access the dashboard.
 */
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    clearError();
  }, []);

  const onSubmit = (data: FormData) => login(data.email, data.password);

  // Messages from other pages (e.g., "Registration successful! Please verify your email")
  const successMessage =
    searchParams.get("registered") === "true"
      ? "Account created! Please check your email to verify your account before logging in."
      : searchParams.get("reset") === "true"
      ? "Password reset successfully. You can now log in with your new password."
      : null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your AI Project Controls account"
    >
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-6" />
      )}

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
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-brand-700 hover:text-brand-900 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-brand-700 hover:text-brand-900 font-semibold"
        >
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  );
}
