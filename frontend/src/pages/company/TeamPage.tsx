/**
 * Team Management Page
 * Lists all company members, lets Admins invite new ones, change roles, or remove members.
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Trash2, MoreVertical } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { companyApi } from "@/services/company";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/services/api";
import type { CompanyMember } from "@/types/company";
import type { UserRole } from "@/types/auth";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "ADMIN",             label: "Admin" },
  { value: "PLANNING_ENGINEER", label: "Planning Engineer" },
  { value: "PROJECT_MANAGER",   label: "Project Manager" },
  { value: "CLIENT",            label: "Client" },
];

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["ADMIN", "PLANNING_ENGINEER", "PROJECT_MANAGER", "CLIENT"]),
});

type InviteForm = z.infer<typeof inviteSchema>;

export function TeamPage() {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "PROJECT_MANAGER" },
  });

  async function loadMembers() {
    try {
      const { data } = await companyApi.getMembers();
      setMembers(data);
    } catch {
      setError("Failed to load team members.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadMembers(); }, []);

  async function handleInvite(data: InviteForm) {
    setInviteLoading(true);
    setError(null);
    try {
      await companyApi.inviteMember(data.email, data.role as UserRole);
      setSuccess(`Invitation sent to ${data.email}.`);
      setInviteOpen(false);
      reset();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: UserRole) {
    try {
      const { data: updated } = await companyApi.updateMemberRole(memberId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      setSuccess("Role updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRemove(memberId: string, name: string) {
    if (!window.confirm(`Remove ${name} from the company?`)) return;
    try {
      await companyApi.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSuccess(`${name} has been removed.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppLayout
      title="Team"
      subtitle={`${members.length} member${members.length !== 1 ? "s" : ""}`}
      actions={
        isAdmin ? (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4" /> Invite Member
          </Button>
        ) : undefined
      }
    >
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} className="mb-6" />}
      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />}

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading team…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Last Login</th>
                {isAdmin && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${member.first_name} ${member.last_name}`} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.first_name} {member.last_name}
                          {member.id === user?.id && (
                            <span className="ml-2 text-xs text-slate-400">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin && member.id !== user?.id ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">
                    {member.last_login_at
                      ? new Date(member.last_login_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      {member.id !== user?.id && (
                        <button
                          onClick={() => handleRemove(member.id, `${member.first_name} ${member.last_name}`)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            {...register("role")}
          />
          <p className="text-xs text-slate-500">
            They will receive an email with an invitation link valid for 7 days.
          </p>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={inviteLoading} fullWidth>
              Send Invitation
            </Button>
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
