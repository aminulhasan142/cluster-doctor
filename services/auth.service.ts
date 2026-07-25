import { MOCK_USER } from "@/lib/mock-data";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
  User,
} from "@/types";

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user: User = {
      ...MOCK_USER,
      email: data.email || MOCK_USER.email,
    };
    return {
      user,
      access_token: "mock_jwt_access_token_demo_admin",
      refresh_token: "mock_jwt_refresh_token_demo_admin",
      token_type: "bearer",
    };
  }

  async register(data: RegisterRequest): Promise<User> {
    return {
      ...MOCK_USER,
      email: data.email,
      full_name: data.full_name,
    };
  }

  async me(): Promise<User> {
    return MOCK_USER;
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    return {
      access_token: refreshToken || "mock_jwt_access_token_refreshed",
      token_type: "bearer",
    };
  }

  async logout(): Promise<void> {
    // Client-side local session cleanup handled by store
  }
}

export const authService = new AuthService();
