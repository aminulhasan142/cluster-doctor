import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1",

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT Token Automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/refresh`, {
        refresh_token: refreshToken,
      })
      .then((res) => {
        const token = res.data?.access_token as string | undefined;
        if (token) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token);
          return token;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth_user");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Handle Unauthorized: try a token refresh once, otherwise sign out.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !originalRequest.url?.includes("/refresh") &&
      !originalRequest.url?.includes("/login")
    ) {
      originalRequest._retried = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

export const TOKEN_KEYS = {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} as const;
