import type { Page, PublicUser, UserRole, UserStatus } from "../../types";
import { post, put, query, request } from "./client";

export const usersApi = {
  listUsers: (params: { page?: number; per_page?: number }) =>
    request<Page<PublicUser>>("/api/v1/users" + query(params)),
  createUser: (input: {
    username: string;
    email: string;
    password: string;
    display_name: string;
    role: UserRole;
  }) => request<PublicUser>("/api/v1/users", post(input)),
  updateUser: (id: number, input: { email?: string; display_name?: string; role?: UserRole; status?: UserStatus }) =>
    request<PublicUser>("/api/v1/users/" + id, put(input)),
};
