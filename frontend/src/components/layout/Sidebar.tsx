import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  UserCircle,
  FileBarChart2,
  BrainCircuit,
  CreditCard,
  LogOut,
  Lock,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCompanyStore } from "@/store/companyStore";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar } from "@/components/ui/Avatar";

interface NavItem {
  label:     string;
  icon:      React.ReactNode;
  to:        string;
  module:    number;
  available: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard",    icon: <LayoutDashboard className="w-4 h-4" />, to: "/dashboard", module: 1, available: true  },
  { label: "Projects",     icon: <FolderKanban    className="w-4 h-4" />, to: "/projects",  module: 4, available: true  },
  { label: "Reports",      icon: <FileBarChart2   className="w-4 h-4" />, to: "/reports",   module: 8, available: true  },
  { label: "AI Assistant", icon: <BrainCircuit    className="w-4 h-4" />, to: "/ai",        module: 7, available: true  },
];

const settingsItems: NavItem[] = [
  { label: "Team",            icon: <Users    className="w-4 h-4" />, to: "/team",    module: 2, available: true },
  { label: "Company",         icon: <Building2 className="w-4 h-4" />, to: "/company", module: 2, available: true },
  { label: "Billing",         icon: <CreditCard className="w-4 h-4" />, to: "/billing", module: 3, available: true },
  { label: "Profile",         icon: <UserCircle className="w-4 h-4" />, to: "/profile", module: 2, available: true },
];

function SideNavLink({ item }: { item: NavItem }) {
  if (!item.available) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[var(--text-3)] cursor-not-allowed select-none text-sm">
        {item.icon}
        <span>{item.label}</span>
        <span className="ml-auto flex items-center gap-1 text-xs opacity-60">
          <Lock className="w-3 h-3" />
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-brand-500/15 text-[var(--blue)]"
            : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-brand-500/7",
        ].join(" ")
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  const { user }         = useAuthStore();
  const { company }      = useCompanyStore();
  const { logout }       = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <aside
      className="shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden"
      style={{
        width: "var(--sidebar-w)",
        background: "rgba(7,7,26,0.96)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Brand */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-brand-500 to-violet-600 shadow-[0_0_20px_rgba(79,124,255,0.4)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[var(--text)] font-bold text-sm tracking-wide">Belazy</p>
            {company && (
              <p className="text-[var(--text-3)] text-xs truncate">{company.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {navItems.map((item) => (
          <SideNavLink key={item.to} item={item} />
        ))}

        <div className="pt-4 pb-1.5 px-1">
          <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-widest">
            Settings
          </p>
        </div>

        {settingsItems.map((item) => (
          <SideNavLink key={item.to} item={item} />
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-2.5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-brand-500/7 transition-colors mb-1"
        >
          {theme === "dark"
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <Avatar name={user ? `${user.first_name} ${user.last_name}` : "?"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text)] text-xs font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[var(--text-3)] text-xs truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-2)] hover:text-red-400 hover:bg-red-500/7 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
