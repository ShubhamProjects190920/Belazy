import { api } from "./api";
import type { Token, User } from "@/types/auth";

export const authApi = {
  requestOtp: (data: { email: string; first_name?: string; last_name?: string }) =>
    api.post<{ message: string; is_new_user: boolean }>("/auth/request-otp", data),

  verifyOtp: (data: { email: string; otp_code: string }) =>
    api.post<Token>("/auth/verify-otp", data),

  refresh: (refreshToken: string) =>
    api.post<Token>("/auth/refresh", { refresh_token: refreshToken }),

  getMe: () =>
    api.get<User>("/auth/me"),

  updateMe: (data: { first_name?: string; last_name?: string; phone?: string }) =>
    api.put<User>("/auth/me", data),
};
