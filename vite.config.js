import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        dashboard: resolve(root, "html/dashboard.html"),
      },
    },
  },
  base: "/lexis/",
});
