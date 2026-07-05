import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";

export function useAuth() {
  const { logout: storeLogout } = useAuthStore();
  const { setCompany } = useCompanyStore();

  function logout() {
    storeLogout();
    setCompany(null);
    localStorage.removeItem("ai-pcp-auth");
    window.location.href = "/auth";
  }

  return { logout };
}
