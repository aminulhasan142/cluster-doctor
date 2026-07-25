import { cn } from "@/lib/utils";
import { statusToTone } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const TONE_DOT: Record<string, string> = {
  success: "bg-success text-success",
  warning: "bg-warning text-warning",
  danger: "bg-danger text-danger",
  muted: "bg-muted-foreground/50 text-muted-foreground",
};

const TONE_BADGE: Record<string, string> = {
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/25 bg-danger/10 text-danger",
  muted: "border-border bg-muted text-muted-foreground",
};

export function StatusDot({
  status,
  pulse = false,
  className,
}: {
  status: string | null | undefined;
  pulse?: boolean;
  className?: string;
}) {
  const tone = statusToTone(status);

  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        pulse && "pulse-dot",
        TONE_DOT[tone],
        className
      )}
    />
  );
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string | null | undefined;
  label?: string;
  className?: string;
}) {
  const tone = statusToTone(status);

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", TONE_BADGE[tone], className)}
    >
      <StatusDot status={status} />
      {label ?? status ?? "Unknown"}
    </Badge>
  );
}
