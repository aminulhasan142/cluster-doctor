import { create } from "zustand";
import { MOCK_USER } from "@/lib/mock-data";
import type { User } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
  logout: () => void;
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return MOCK_USER;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : MOCK_USER;
  } catch {
    return MOCK_USER;
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: MOCK_USER,
  accessToken: "mock_demo_token",
  refreshToken: "mock_demo_refresh_token",
  isAuthenticated: true,
  isLoading: false,
  hasHydrated: false,

  setSession: (user, accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    }

    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: () => {
    if (typeof window === "undefined") {
      set({ hasHydrated: true });
      return;
    }

    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    let user = readStoredUser();

    // Default to Demo Admin Session if not set
    if (!accessToken || !user) {
      accessToken = "mock_demo_token";
      refreshToken = "mock_demo_refresh_token";
      user = MOCK_USER;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      hasHydrated: true,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
