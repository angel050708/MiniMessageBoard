import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_PORT = process.env.PORT ?? 3000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Evita CORS: el navegador solo habla con :5173 y Vite reenvia /api al backend.
    proxy: {
      "/api": `http://localhost:${API_PORT}`,
    },
  },
});
