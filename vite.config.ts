import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "next/image": new URL("./src/adapters/next-image.tsx", import.meta.url)
        .pathname,
      "next/link": new URL("./src/adapters/next-link.tsx", import.meta.url)
        .pathname,
      "next/navigation": new URL(
        "./src/adapters/next-navigation.ts",
        import.meta.url,
      ).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/search": { target: "http://127.0.0.1:4174", changeOrigin: false },
    },
  },
  preview: {
    proxy: {
      "/api/search": { target: "http://127.0.0.1:4174", changeOrigin: false },
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: new URL("./index.html", import.meta.url).pathname,
        preview: new URL("./preview.html", import.meta.url).pathname,
      },
    },
  },
});
