import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Inside docker compose the backend is reachable at the "backend" service
// name; running the frontend bare with `npm run dev` on a host machine, set
// API_PROXY_TARGET=http://localhost:8000 instead.
const apiProxyTarget = process.env.API_PROXY_TARGET || "http://backend:8000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      "/media": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
