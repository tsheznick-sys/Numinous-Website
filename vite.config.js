import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
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

// The onboard record still lists the older app-domain checkout form for three
// works. On the live host nothing serves /checkout/*, so that form lands on the
// storefront home instead of a checkout. Every button is pointed at the
// canonical hosted checkout on whop.com as the bundle is built.
function canonicalCheckouts() {
  const virtual = "\0canonical-onboard";
  return {
    name: "canonical-checkouts",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.endsWith("coldstorage/onboard.json")) return null;
      return virtual;
    },
    load(id) {
      if (id !== virtual) return null;
      const file = join(process.cwd(), "coldstorage", "onboard.json");
      const data = JSON.parse(readFileSync(file, "utf8"));
      for (const work of Object.keys(data.checkout || {})) {
        data.checkout[work] = data.checkout[work].replace(
          "://jointhenuminouses.whop.site/checkout/",
          "://whop.com/checkout/",
        );
      }
      return "export default " + JSON.stringify(data) + ";";
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
    canonicalCheckouts(),
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
