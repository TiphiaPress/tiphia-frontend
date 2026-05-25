import { requestPublic } from "../../framework/public-api";
import { post, request } from "../../admin/lib/api/client";
import type { AuthenticatorPublicConfig, AuthenticatorSetupResponse, AuthenticatorStatus } from "./types";

export function authenticatorConfig() {
  return requestPublic<AuthenticatorPublicConfig>("/api/v1/authenticator/config");
}

export function authenticatorStatus() {
  return request<AuthenticatorStatus>("/api/v1/authenticator/status");
}

export function authenticatorSetup() {
  return request<AuthenticatorSetupResponse>("/api/v1/authenticator/setup", post({}));
}

export function authenticatorDisable() {
  return request<AuthenticatorStatus>("/api/v1/authenticator/disable", post({}));
}