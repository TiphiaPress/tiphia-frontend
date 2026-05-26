import { requestPublic } from "../../framework/public-api";

export interface PublicConfig {
  enabled: boolean;
  comment_push_enabled: boolean;
  password_reset_enabled: boolean;
}

export function publicConfig() {
  return requestPublic<PublicConfig>("/api/v1/comment-mail-push/config");
}

export function requestPasswordReset(account: string) {
  return requestPublic<{ accepted: boolean }>("/api/v1/comment-mail-push/password/forgot", {
    method: "POST",
    body: JSON.stringify({ account }),
  });
}

export function resetPassword(token: string, password: string) {
  return requestPublic<{ reset: boolean }>("/api/v1/comment-mail-push/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}