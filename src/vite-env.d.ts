/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TIPHIA_API_BASE?: string;
  readonly VITE_TIPHIA_FRONTEND_BASE?: string;
  readonly VITE_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.ico" {
  const src: string;
  export default src;
}