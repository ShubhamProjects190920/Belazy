import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";

import { AuthPage }           from "@/pages/auth/AuthPage";
import { VerifyEmailPage }    from "@/pages/auth/VerifyEmailPage";
import { AcceptInvitePage }   from "@/pages/auth/AcceptInvitePage";
import { CompanySetupPage }   from "@/pages/company/CompanySetupPage";
import { DashboardPage }      from "@/pages/dashboard/DashboardPage";
import { CompanyProfilePage } from "@/pages/company/CompanyProfilePage";
import { TeamPage }           from "@/pages/company/TeamPage";
import { UserProfilePage }    from "@/pages/profile/UserProfilePage";
import { BillingPage }        from "@/pages/billing/BillingPage";
import { ProjectsPage }       from "@/pages/projects/ProjectsPage";
import { AIPage }             from "@/pages/ai/AIPage";
import { ReportsPage }        from "@/pages/reports/ReportsPage";
import { LandingPage }        from "@/pages/landing/LandingPage";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true);
      return;
    }
    authApi
      .getMe()
      .then(({ data }) => setUser(data))
      .catch(() => logout())
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div
          className="w-8 h-8 rounded-full animate-spin border-2 border-transparent"
          style={{ borderTopColor: "var(--blue)", boxShadow: "0 0 20px rgba(79,124,255,0.3)" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function CompanyRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!user?.company_id) return <Navigate to="/company/setup" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthInitializer>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public (redirects to dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* Logged in but no company required */}
          <Route element={<ProtectedRoute />}>
            <Route path="/verify-email/:token"  element={<VerifyEmailPage />} />
            <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
            <Route path="/company/setup"        element={<CompanySetupPage />} />
          </Route>

          {/* Logged in + company required */}
          <Route element={<CompanyRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects"  element={<ProjectsPage />} />
            <Route path="/company"   element={<CompanyProfilePage />} />
            <Route path="/team"      element={<TeamPage />} />
            <Route path="/billing"   element={<BillingPage />} />
            <Route path="/ai"        element={<AIPage />} />
            <Route path="/reports"   element={<ReportsPage />} />
            <Route path="/profile"   element={<UserProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInitializer>
    </ThemeProvider>
  );
}
