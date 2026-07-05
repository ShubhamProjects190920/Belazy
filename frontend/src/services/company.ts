import { api } from "./api";
import type { Company, CompanyCreateData, CompanyMember, CompanyUpdateData, InvitationDetails } from "@/types/company";
import type { UserRole } from "@/types/auth";

export const companyApi = {
  create: (data: CompanyCreateData) =>
    api.post<Company>("/company", data),

  getMyCompany: () =>
    api.get<Company>("/company/me"),

  updateMyCompany: (data: CompanyUpdateData) =>
    api.put<Company>("/company/me", data),

  getMembers: () =>
    api.get<CompanyMember[]>("/company/me/members"),

  inviteMember: (email: string, role: UserRole) =>
    api.post<{ message: string }>("/company/me/invite", { email, role }),

  updateMemberRole: (userId: string, role: UserRole) =>
    api.put<CompanyMember>(`/company/me/members/${userId}/role`, { role }),

  removeMember: (userId: string) =>
    api.delete<{ message: string }>(`/company/me/members/${userId}`),

  getInvitation: (token: string) =>
    api.get<InvitationDetails>(`/company/invite/${token}`),

  acceptInvitation: (token: string) =>
    api.post<Company>(`/company/invite/${token}/accept`),
};
