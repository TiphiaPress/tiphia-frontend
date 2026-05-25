export interface AuthenticatorPublicConfig {
  enabled: boolean;
  issuer: string;
}

export interface AuthenticatorStatus {
  bound: boolean;
}

export interface AuthenticatorSetupResponse {
  secret: string;
  otpauth_url: string;
  qr_svg: string;
}