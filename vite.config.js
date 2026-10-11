import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
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
      if (!existsSync(index)) return;
      for (const route of routes) {
        const dest = join(clientDir, route, "index.html");
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(index, dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    // Whop hosting builds on Cloudflare Workers. Keep the Cloudflare plugin
    // first so it owns the worker ("ssr") environment before the other plugins,
    // and set the two output directories Whop hosting expects: dist/client for
    // static assets, dist/server for the worker modules (entry index.js).
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    copySpaRoutes(),
    whop({ disableTanstackDevtools: true }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  environments: {
    client: {
      build: {
        outDir: "dist/client",
      },
    },
    ssr: {
      build: {
        outDir: "dist/server",
      },
    },
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
