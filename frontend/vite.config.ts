import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Forward /api requests to the FastAPI backend
      // Uses localhost:8000 because Docker maps the backend port to localhost
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
  },
});
