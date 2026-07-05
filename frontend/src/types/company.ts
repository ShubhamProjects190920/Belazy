import type { UserRole } from "./auth";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
}

export interface InvitationDetails {
  id: string;
  email: string;
  role: UserRole;
  company_name: string;
  expires_at: string;
}

export interface CompanyCreateData {
  name: string;
  industry?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {}
