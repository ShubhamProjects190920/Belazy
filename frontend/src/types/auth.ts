/**
 * TypeScript Types — Authentication
 * These types mirror the shapes returned by the backend API.
 * TypeScript uses them to catch bugs at compile time, before the code even runs.
 */

export type UserRole =
  | "ADMIN"
  | "PLANNING_ENGINEER"
  | "PROJECT_MANAGER"
  | "CLIENT";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  company_id: string | null;
  phone: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form input types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
