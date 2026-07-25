export const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },

  DASHBOARD: "/dashboard",

  CLUSTERS: "/clusters",

  NODES: "/nodes",

  TELEMETRY: "/telemetry",

  PREDICTIONS: "/predictions",

  DIGITAL_TWIN: "/digital-twin",

  MIGRATION: "/migration",

  RECOVERY: "/recovery",

  ALERTS: "/alerts",

  REPORTS: "/reports",

  CHATBOT: "/chatbot",

  SETTINGS: "/settings",
} as const;

export default ROUTES;