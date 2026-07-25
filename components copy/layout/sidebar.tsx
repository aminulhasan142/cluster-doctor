"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/constants/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="glass-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[var(--ai)] shadow-[var(--shadow-glow-primary)]">
          <Cpu className="size-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Cluster AI Doctor</p>
          <p className="text-[11px] text-muted-foreground">Autonomous Ops Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all",
                "hover:bg-white/5 hover:text-foreground",
                active && "bg-primary/10 text-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
              )}
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <Badge
                  variant="outline"
                  className="border-[var(--ai)]/30 bg-[var(--ai)]/10 px-1.5 text-[10px] text-[var(--ai)]"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(user?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.full_name ?? "Guest"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.role ?? "—"}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => signOut()} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
