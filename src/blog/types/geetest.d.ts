interface GeetestCaptcha {
  appendTo(selector: string): void;
  onReady(callback: () => void): void;
  onSuccess(callback: () => void): void;
  onError(callback: (error?: unknown) => void): void;
  reset(): void;
  getValidate(): Record<string, unknown> | null;
}

interface Window {
  initGeetest4?: (
    config: {
      captchaId: string;
      product?: "float" | "popup" | "bind";
      nativeButton?: { width?: string; height?: string };
      rem?: number;
      language?: string;
      protocol?: "http://" | "https://";
      timeout?: number;
      hideBar?: Array<"close" | "refresh">;
      mask?: { outside?: boolean; bgColor?: string };
      nextWidth?: string;
      hideSuccess?: boolean;
    },
    callback: (captcha: GeetestCaptcha) => void,
  ) => void;
}
