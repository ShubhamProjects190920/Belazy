import clsx from "clsx";
import type { UserRole } from "@/types/auth";

const roleConfig: Record<UserRole, { label: string; classes: string }> = {
  ADMIN: { label: "Admin", classes: "bg-purple-100 text-purple-700" },
  PLANNING_ENGINEER: { label: "Planning Engineer", classes: "bg-blue-100 text-blue-700" },
  PROJECT_MANAGER: { label: "Project Manager", classes: "bg-green-100 text-green-700" },
  CLIENT: { label: "Client", classes: "bg-amber-100 text-amber-700" },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const { label, classes } = roleConfig[role] ?? { label: role, classes: "bg-slate-100 text-slate-700" };
  return (
    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", classes)}>
      {label}
    </span>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        "text-xs font-semibold px-2 py-0.5 rounded-full",
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
