/**
 * Company Setup Page
 * First page after login when the user has no company.
 * Two options:
 *  A) Create a new company (user becomes Admin)
 *  B) Join an existing company using an invite token sent by email
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, HardHat } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { companyApi } from "@/services/company";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { getErrorMessage } from "@/services/api";

const createSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

const joinSchema = z.object({
  token: z.string().min(10, "Please paste the full invite token from your email."),
});

type CreateForm = z.infer<typeof createSchema>;
type JoinForm = z.infer<typeof joinSchema>;

export function CompanySetupPage() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { setCompany } = useCompanyStore();

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const joinForm = useForm<JoinForm>({ resolver: zodResolver(joinSchema) });

  async function handleCreate(data: CreateForm) {
    setIsLoading(true);
    setError(null);
    try {
      const { data: company } = await companyApi.create(data);
      setCompany(company);
      const { data: user } = await authApi.getMe();
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoin(data: JoinForm) {
    setIsLoading(true);
    setError(null);
    try {
      const { data: company } = await companyApi.acceptInvitation(data.token);
      setCompany(company);
      const { data: user } = await authApi.getMe();
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set up your workspace</h1>
          <p className="text-slate-500 mt-2">
            Create a new company or join an existing one with an invite.
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
          <button
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "create"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setTab("create")}
          >
            Create Company
          </button>
          <button
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "join"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setTab("join")}
          >
            Join with Invite
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />
          )}

          {/* CREATE COMPANY */}
          {tab === "create" && (
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-brand-700" />
                <div>
                  <p className="font-semibold text-slate-900">Create a new company</p>
                  <p className="text-sm text-slate-500">You will be the Admin and can invite your team.</p>
                </div>
              </div>

              <Input
                label="Company name *"
                placeholder="e.g. Acme Construction LLC"
                error={createForm.formState.errors.name?.message}
                {...createForm.register("name")}
              />
              <Input
                label="Industry"
                placeholder="e.g. Construction, Infrastructure"
                error={createForm.formState.errors.industry?.message}
                {...createForm.register("industry")}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Country"
                  placeholder="e.g. India"
                  {...createForm.register("country")}
                />
                <Input
                  label="City"
                  placeholder="e.g. Mumbai"
                  {...createForm.register("city")}
                />
              </div>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
                {isLoading ? "Creating…" : "Create Company & Continue"}
              </Button>
            </form>
          )}

          {/* JOIN WITH INVITE */}
          {tab === "join" && (
            <form onSubmit={joinForm.handleSubmit(handleJoin)} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-brand-700" />
                <div>
                  <p className="font-semibold text-slate-900">Join with an invite</p>
                  <p className="text-sm text-slate-500">Paste the token from your invitation email.</p>
                </div>
              </div>

              <Input
                label="Invite token"
                placeholder="Paste the token from your invitation email"
                error={joinForm.formState.errors.token?.message}
                hint="The token is the long code at the end of the invite link your Admin sent you."
                {...joinForm.register("token")}
              />

              <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
                {isLoading ? "Joining…" : "Accept Invitation & Join"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
