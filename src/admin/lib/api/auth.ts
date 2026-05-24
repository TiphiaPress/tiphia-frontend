import type { AuthStatus, GeetestConfig, PublicUser, TokenResponse } from "../../types";
import { post, request } from "./client";

export const authApi = {
  bootstrap: (input: {
    username: string;
    email: string;
    password: string;
    display_name?: string | null;
  }) => request<TokenResponse>("/api/v1/auth/bootstrap", post(input)),
  authStatus: () => request<AuthStatus>("/api/v1/auth/status"),
  geetestConfig: () => request<GeetestConfig>("/api/v1/geetest/config"),
  register: (input: {
    username: string;
    email: string;
    password: string;
    display_name?: string | null;
    captcha?: Record<string, unknown> | null;
  }) => request<TokenResponse>("/api/v1/auth/register", post(input)),
  login: (input: { account: string; password: string; captcha?: Record<string, unknown> | null }) =>
    request<TokenResponse>("/api/v1/auth/login", post(input)),
  me: () => request<PublicUser>("/api/v1/auth/me"),
};
