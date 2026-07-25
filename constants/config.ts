export const APP_CONFIG = {
  appName: "Cluster Doctor AI",

  version: "1.0.0",

  company: "Cluster Doctor AI",

  description:
    "AI Powered Cluster Monitoring, Prediction & Digital Twin Platform",

  theme: "dark",

  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1",

  websocketUrl:
    process.env.NEXT_PUBLIC_WS_URL ??
    "ws://127.0.0.1:8000/ws",

  pagination: {
    pageSize: 10,
    maxPageSize: 100,
  },

  animation: {
    duration: 0.25,
  },

  digitalTwin: {
    fps: 60,

    autoRotate: false,

    shadows: true,

    antialias: true,
  },
} as const;

export default APP_CONFIG;