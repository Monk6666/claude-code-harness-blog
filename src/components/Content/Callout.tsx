import { ReactNode } from "react";

type CalloutType = "tip" | "warning" | "note" | "important";

const config: Record<
  CalloutType,
  { icon: string; bg: string; border: string; title: string }
> = {
  tip: {
    icon: "💡",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-500",
    title: "Tip",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-500",
    title: "Warning",
  },
  note: {
    icon: "📝",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-500",
    title: "Note",
  },
  important: {
    icon: "🔑",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-500",
    title: "Key Insight",
  },
};

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const c = config[type];
  return (
    <div
      className={`${c.bg} border-l-4 ${c.border} rounded-r-lg p-4 my-4`}
    >
      <div className="font-semibold mb-1">
        {c.icon} {title || c.title}
      </div>
      <div className="text-sm leading-relaxed [&>p]:mb-0">{children}</div>
    </div>
  );
}
