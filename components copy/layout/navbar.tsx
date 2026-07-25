"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Wifi, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { SIDEBAR_ITEMS } from "@/constants/sidebar";
import { useConnectionStore } from "@/store/connection-store";
import { useNotificationStore } from "@/store/notification-store";
import { useMarkNotificationRead } from "@/hooks/use-notifications";
import { Sidebar } from "@/components/layout/sidebar";
import { StatusDot } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AISimulatorWidget } from "@/components/common/ai-simulator-widget";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useMarkNotificationRead();

  const currentItem = SIDEBAR_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground">
          {currentItem?.title ?? "Cluster AI Doctor"}
        </h1>
      </div>

      <AISimulatorWidget />

      <Badge
        variant="outline"
        className={cn(
          "hidden items-center gap-1.5 sm:inline-flex",
          isConnected
            ? "border-success/25 bg-success/10 text-success"
            : "border-muted-foreground/20 bg-muted text-muted-foreground"
        )}
      >
        {isConnected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
        {isConnected ? "Live" : "Offline"}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-2 rounded-full bg-danger pulse-dot text-danger" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 && <Badge variant="outline">{unreadCount} new</Badge>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No AI events yet.
            </p>
          ) : (
            <div className="max-h-80 space-y-0.5 overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex flex-col items-start gap-0.5 whitespace-normal"
                  onClick={() => n.status === "UNREAD" && markRead.mutate(n.id)}
                >
                  <div className="flex w-full items-center gap-1.5">
                    <StatusDot status={n.threat_level} />
                    <span className="flex-1 truncate text-sm font-medium">{n.title}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/alerts" />}>View all alerts</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
