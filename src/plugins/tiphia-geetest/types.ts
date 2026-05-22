export type GeetestProduct = "float" | "popup" | "bind";

export interface GeetestPublicConfig {
  enabled: boolean;
  captcha_id?: string | null;
  verify_login: boolean;
  verify_register: boolean;
  verify_comment: boolean;
  product?: GeetestProduct | null;
  native_button_width?: string | null;
  native_button_height?: string | null;
  rem?: number | null;
  language?: string | null;
  protocol?: "http://" | "https://" | null;
  timeout?: number | null;
  hide_bar?: Array<"close" | "refresh"> | null;
  mask_outside?: boolean | null;
  mask_bg_color?: string | null;
  next_width?: string | null;
  hide_success?: boolean | null;
}

export interface GeetestHookContext {
  mode: "login" | "register" | "comment";
  onVerify?: (value: Record<string, unknown> | null) => void;
}
