import clsx from "clsx";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-blue-500", "bg-purple-500", "bg-green-500",
  "bg-amber-500", "bg-red-500", "bg-teal-500",
];

function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center text-white font-semibold shrink-0",
        colorFromName(name),
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
