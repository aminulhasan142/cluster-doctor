import { MOCK_USER } from "@/lib/mock-data";
import type { User } from "@/types";

export interface UserUpdateInput {
  full_name?: string;
  password?: string;
  is_active?: boolean;
}

class UserService {
  async updateMe(data: UserUpdateInput): Promise<User> {
    return {
      ...MOCK_USER,
      full_name: data.full_name ?? MOCK_USER.full_name,
    };
  }
}

export const userService = new UserService();
