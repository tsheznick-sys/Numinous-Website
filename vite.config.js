import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";
import { whop } from "@whop/cli/vite";

const routes = [
  "products/the-signal-e6",
  "products/the-numinary-3e",
  "products/herald-app",
  "products/wallpaper-vault",
  "collections/all",
  "returns",
  "terms",
  "privacy",
  "cookies",
];

function copySpaRoutes() {
  return {
    name: "numinous-spa-routes",
    apply: "build",
    closeBundle() {
      const clientDir = join(process.cwd(), "dist", "client");
      const index = join(clientDir, "index.html");
      for (const route of routes) {
        const dest = join(clientDir, route, "index.html");
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(index, dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [copySpaRoutes(), whop({ disableTanstackDevtools: true })],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
});
