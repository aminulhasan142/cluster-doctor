/**
 * Every path here is relative to the axios baseURL
 * (`NEXT_PUBLIC_API_URL`, default `http://127.0.0.1:8000/api/v1`).
 * Verified directly against `backend/app/api/v1/**` — do not
 * "clean up" trailing slashes, several of these routes 307-redirect
 * (or 404) without them because they're FastAPI routes registered
 * with an explicit trailing slash.
 */
export const API_ENDPOINTS = {
  health: "/health/health",

  dashboard: {
    overview: "/dashboard/overview",
    summary: "/dashboard/summary",
  },

  auth: {
    login: "/login",
    register: "/register",
    me: "/me",
    refresh: "/refresh",
    logout: "/logout",
  },

  users: {
    me: "/users/me",
    byId: "/users",
    list: "/users",
  },

  clusters: {
    list: "/clusters/",
    mine: "/clusters/me",
    create: "/clusters/",
    byId: "/clusters",
    healthy: "/clusters/healthy/list",
    critical: "/clusters/critical/list",
  },

  nodes: {
    list: "/nodes/",
    create: "/nodes/",
    byId: "/nodes",
    byCluster: "/nodes/cluster",
    online: "/nodes/online/list",
    offline: "/nodes/offline/list",
    status: (id: number | string) => `/nodes/${id}/status`,
  },

  telemetry: {
    create: "/telemetry/",
    byId: "/telemetry",
    latest: "/telemetry/latest",
    history: "/telemetry/history",
    byCluster: "/telemetry/cluster",
  },

  predictions: {
    create: "/predictions/",
    byId: "/predictions",
    latest: "/predictions/latest",
    byNode: "/predictions/node",
    byModel: "/predictions/model",
    highRisk: "/predictions/high-risk",
    pending: "/predictions/pending",
  },

  notifications: {
    create: "/notifications/",
    byId: "/notifications",
    byUser: "/notifications/user",
    unreadByUser: (userId: number | string) =>
      `/notifications/user/${userId}/unread`,
    critical: "/notifications/critical",
    markRead: (id: number | string) => `/notifications/${id}/read`,
  },

  reports: {
    list: "/reports",
  },

  chatbot: {
    chat: "/chatbot/",
  },

  migration: {
    start: "/migration/start",
    history: "/migration/history",
    byId: "/migration",
  },

  recovery: {
    start: (nodeId: number | string) => `/recovery/start/${nodeId}`,
    status: (nodeId: number | string) => `/recovery/status/${nodeId}`,
    history: (nodeId: number | string) => `/recovery/history/${nodeId}`,
  },

  reality: {
    compare: (nodeId: number | string) => `/reality/compare/${nodeId}`,
    summary: "/reality/summary",
  },

  twin: {
    clusters: "/twin/clusters",
    clusterById: "/twin/clusters",
    rooms: "/twin/rooms",
    node: "/twin/node",
    snapshot: "/twin/snapshot",
  },

  simulator: {
    publish: "/simulator/publish",
  },

  iot: {
    safe: "/iot/test-safe",
    alert: "/iot/test-alert",
    custom: "/iot/test-custom",
  },
} as const;

export default API_ENDPOINTS;
