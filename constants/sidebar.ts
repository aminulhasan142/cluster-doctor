import {
  Activity,
  AlertTriangle,
  Bot,
  Boxes,
  Gauge,
  LayoutDashboard,
  Network,
  Settings,
  ShieldCheck,
  Sparkles,
  Waypoints,
  FileBarChart2,
} from "lucide-react";

import ROUTES from "./routes";

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    badge: null,
  },

  {
    id: "clusters",
    title: "Clusters",
    href: ROUTES.CLUSTERS,
    icon: Boxes,
    badge: null,
  },

  {
    id: "nodes",
    title: "Nodes",
    href: ROUTES.NODES,
    icon: Network,
    badge: null,
  },

  {
    id: "telemetry",
    title: "Telemetry",
    href: ROUTES.TELEMETRY,
    icon: Activity,
    badge: null,
  },

  {
    id: "predictions",
    title: "Predictions",
    href: ROUTES.PREDICTIONS,
    icon: Sparkles,
    badge: "AI",
  },

  {
    id: "digital-twin",
    title: "Digital Twin",
    href: ROUTES.DIGITAL_TWIN,
    icon: Waypoints,
    badge: "AI",
  },

  {
    id: "migration",
    title: "Migration Center",
    href: ROUTES.MIGRATION,
    icon: Gauge,
    badge: null,
  },

  {
    id: "recovery",
    title: "Recovery Center",
    href: ROUTES.RECOVERY,
    icon: ShieldCheck,
    badge: null,
  },

  {
    id: "alerts",
    title: "Alerts",
    href: ROUTES.ALERTS,
    icon: AlertTriangle,
    badge: null,
  },

  {
    id: "reports",
    title: "Reports",
    href: ROUTES.REPORTS,
    icon: FileBarChart2,
    badge: null,
  },

  {
    id: "chatbot",
    title: "AI Chat",
    href: ROUTES.CHATBOT,
    icon: Bot,
    badge: "AI",
  },

  {
    id: "settings",
    title: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    badge: null,
  },
] as const;

export default SIDEBAR_ITEMS;
