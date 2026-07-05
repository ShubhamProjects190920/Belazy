/**
 * Company Profile Page
 * View and edit company information.
 * Editing is restricted to Admins only.
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Globe, Phone, MapPin, Briefcase, Pencil, Check, X } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { companyApi } from "@/services/company";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { getErrorMessage } from "@/services/api";
import type { Company } from "@/types/company";

const schema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-slate-800 font-medium mt-0.5">{value || <span className="text-slate-400 italic">Not set</span>}</p>
      </div>
    </div>
  );
}

export function CompanyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { company, setCompany } = useCompanyStore();
  const isAdmin = user?.role === "ADMIN";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!company) {
      companyApi.getMyCompany().then(({ data }) => setCompany(data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (company) reset(company);
  }, [company]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const { data: updated } = await companyApi.updateMyCompany(data);
      setCompany(updated);
      setSuccess("Company profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout
      title="Company Profile"
      subtitle="Manage your organisation's details"
      actions={
        isAdmin && !isEditing ? (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        ) : undefined
      }
    >
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} className="mb-6" />}
      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />}

      <div className="max-w-2xl">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <Input label="Company name *" error={errors.name?.message} {...register("name")} />
            <Input label="Industry" placeholder="e.g. Construction" {...register("industry")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Country" {...register("country")} />
              <Input label="City" {...register("city")} />
            </div>
            <Input label="Address" {...register("address")} />
            <Input label="Phone" type="tel" {...register("phone")} />
            <Input label="Website" placeholder="https://..." {...register("website")} />

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isLoading}>
                <Check className="w-4 h-4" /> Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); reset(company ?? {}); }}>
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-brand-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{company?.name}</h2>
                {company?.industry && <p className="text-slate-500">{company.industry}</p>}
              </div>
            </div>

            <InfoRow icon={<Briefcase className="w-5 h-5" />} label="Industry" value={company?.industry} />
            <InfoRow icon={<MapPin className="w-5 h-5" />} label="Location" value={[company?.city, company?.country].filter(Boolean).join(", ")} />
            <InfoRow icon={<MapPin className="w-5 h-5" />} label="Address" value={company?.address} />
            <InfoRow icon={<Phone className="w-5 h-5" />} label="Phone" value={company?.phone} />
            <InfoRow icon={<Globe className="w-5 h-5" />} label="Website" value={company?.website} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
