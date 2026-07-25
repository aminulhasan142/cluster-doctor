export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatTemperature(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}°C`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Client-side mirror of the backend's node health-score formula
 * (see `backend/app/orchestrator/healing_pipeline.py`), used so the
 * Migration Center can rank/preview candidates using the exact same
 * math the server applies when `/migration/start` actually runs.
 */
export function computeNodeHealthScore(node: {
  cpu_usage: number;
  gpu_usage: number;
  memory_usage: number;
  temperature: number;
}): number {
  const score =
    100 -
    (node.cpu_usage * 0.25 +
      node.gpu_usage * 0.25 +
      node.memory_usage * 0.25 +
      Math.min(node.temperature, 100) * 0.25);

  return Math.round(Math.max(0, score) * 100) / 100;
}

export function computeSafeScore(healthScore: number, memoryUsage: number): number {
  const freeMemory = 100 - memoryUsage;
  return Math.round((healthScore * 0.6 + freeMemory * 0.4) * 100) / 100;
}

export function statusToTone(
  status: string | null | undefined
): "success" | "warning" | "danger" | "muted" {
  const value = (status ?? "").toUpperCase();

  if (["HEALTHY", "ONLINE", "COMPLETED", "READ", "RECOVERED", "LOW"].includes(value)) {
    return "success";
  }

  if (["WARNING", "MAINTENANCE", "PENDING", "MEDIUM"].includes(value)) {
    return "warning";
  }

  if (["CRITICAL", "OFFLINE", "FAILED", "HIGH", "UNREAD"].includes(value)) {
    return "danger";
  }

  return "muted";
}
