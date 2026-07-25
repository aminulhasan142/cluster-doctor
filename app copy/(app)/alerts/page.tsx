"use client";

import { Check } from "lucide-react";

import { useCriticalNotifications, useMarkNotificationRead, useMyNotifications } from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { StatusBadge, StatusDot } from "@/components/common/status";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/common/state";
import type { AppNotification } from "@/types";

function NotificationList({
  notifications,
  onMarkRead,
}: {
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
}) {
  if (notifications.length === 0) {
    return <EmptyState title="Nothing here" description="No notifications in this view." />;
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-white/5"
        >
          <StatusDot status={n.threat_level} pulse={n.status === "UNREAD"} className="mt-1.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
              <StatusBadge status={n.threat_level} />
            </div>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              {n.category} · {formatDateTime(n.created_at)}
            </p>
          </div>
          {n.status === "UNREAD" && (
            <Button size="icon-sm" variant="ghost" title="Mark as read" onClick={() => onMarkRead(n.id)}>
              <Check className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AlertsPage() {
  const mine = useMyNotifications();
  const critical = useCriticalNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <div>
      <PageHeader title="Alerts" description="Every AI-generated notification, from routine to critical." />

      <Card className="glass-panel">
        <CardContent>
          <Tabs defaultValue="mine">
            <TabsList className="mb-4">
              <TabsTab value="mine">My notifications</TabsTab>
              <TabsTab value="critical">Critical (all users)</TabsTab>
            </TabsList>

            <TabsPanel value="mine">
              {mine.isLoading && <LoadingBlock rows={4} />}
              {mine.isError && <ErrorState onRetry={() => mine.refetch()} message="Could not load notifications." />}
              {mine.data && (
                <NotificationList notifications={mine.data} onMarkRead={(id) => markRead.mutate(id)} />
              )}
            </TabsPanel>

            <TabsPanel value="critical">
              {critical.isLoading && <LoadingBlock rows={4} />}
              {critical.data && (
                <NotificationList notifications={critical.data} onMarkRead={(id) => markRead.mutate(id)} />
              )}
            </TabsPanel>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
