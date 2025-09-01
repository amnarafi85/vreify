// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // default, but we make it explicit
  },
  publicDir: "public", // everything in /public is copied to /dist
  server: {
    port: 5173, // local dev port
    open: true, // auto open in browser
  },
});
