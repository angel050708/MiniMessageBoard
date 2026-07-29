import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_PORT = process.env.PORT ?? 3000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Mismo origen para el navegador, sin CORS que configurar.
    proxy: {
      "/api": `http://localhost:${API_PORT}`,
    },
  },
});
