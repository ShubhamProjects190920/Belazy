import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/services/api";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name:  z.string().min(1, "Last name is required."),
  phone:      z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function UserProfilePage() {
  const [isLoading, setIsLoading]   = useState(false);
  const [success, setSuccess]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const { user, setUser }           = useAuthStore();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name:  user?.last_name  ?? "",
      phone:      user?.phone      ?? "",
    },
  });

  async function onSubmit(data: ProfileForm) {
    setIsLoading(true);
    setError(null);
    try {
      const { data: updated } = await authApi.updateMe({
        first_name: data.first_name,
        last_name:  data.last_name,
        phone:      data.phone || undefined,
      });
      setUser(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal account settings">
      <div className="max-w-2xl space-y-6">

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5">
          <Avatar name={fullName} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
            {user?.role && <RoleBadge role={user.role} />}
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-brand-700" />
            <h3 className="font-semibold text-slate-900">Personal Information</h3>
          </div>

          {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} className="mb-4" />}
          {error   && <Alert type="error"   message={error}   onDismiss={() => setError(null)}   className="mb-4" />}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                error={form.formState.errors.first_name?.message}
                {...form.register("first_name")}
              />
              <Input
                label="Last name"
                error={form.formState.errors.last_name?.message}
                {...form.register("last_name")}
              />
            </div>

            <Input
              label="Email address"
              value={user?.email ?? ""}
              disabled
              hint="Email cannot be changed — it is used for OTP sign-in."
            />

            <Input
              label="Phone number"
              type="tel"
              placeholder="+91 98765 43210"
              leftIcon={<Phone className="w-4 h-4" />}
              error={form.formState.errors.phone?.message}
              {...form.register("phone")}
            />

            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </form>
        </div>

      </div>
    </AppLayout>
  );
}
