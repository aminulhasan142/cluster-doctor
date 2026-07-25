import { Radio, Calculator, FlaskConical, History } from "lucide-react";

import { cn } from "@/lib/utils";

const SOURCES = {
  live: {
    icon: Radio,
    label: "Live",
    className: "border-success/25 bg-success/10 text-success",
  },
  computed: {
    icon: Calculator,
    label: "Computed",
    className: "border-info/25 bg-info/10 text-info",
  },
  stub: {
    icon: FlaskConical,
    label: "Backend stub",
    className: "border-warning/25 bg-warning/10 text-warning",
  },
  session: {
    icon: History,
    label: "This session",
    className: "border-border bg-muted text-muted-foreground",
  },
} as const;

/**
 * Small transparency badge — tells the viewer exactly where a number
 * on screen came from: a live API call, a value computed client-side
 * from real fields, an as-shipped backend stub response, or a
 * client-only session log (the backend doesn't persist it).
 */
export function DataSourceBadge({
  source,
  className,
}: {
  source: keyof typeof SOURCES;
  className?: string;
}) {
  const { icon: Icon, label, className: toneClassName } = SOURCES[source];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        toneClassName,
        className
      )}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}
