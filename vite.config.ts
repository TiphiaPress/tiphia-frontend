import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    root: __dirname,
    base: normalizeBase(env.VITE_TIPHIA_FRONTEND_BASE || env.VITE_BASE || "/"),
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          app: resolve(__dirname, "index.html"),
        },
      },
    },
    server: {
      port: 5173,
      host: "127.0.0.1",
    },
  };
});

function normalizeBase(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") {
    return "/";
  }
  if (/^https?:\/\//.test(trimmed)) {
    return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  }
  if (/^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:\/.*)?$/i.test(trimmed)) {
    return trimmed.endsWith("/") ? `https://${trimmed}` : `https://${trimmed}/`;
  }
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}