import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import { whop } from '@whop/cli/vite';
import { defineConfig } from 'vite';
import { routeDocuments } from './scripts/route-documents.mjs';

// The approved Numinous 2.0 source is the single storefront. Keep its public
// media in one place rather than committing a second copy of the four films.
export default defineConfig({
  publicDir: 'sandbox/numinous2/public',
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    react(),
    routeDocuments(),
    whop({ disableTanstackDevtools: true }),
  ],
  build: { outDir: 'dist', emptyOutDir: true },
  environments: {
    client: { build: { outDir: 'dist/client' } },
    ssr: { build: { outDir: 'dist/server' } },
  },
  server: { host: '0.0.0.0', port: 5173, strictPort: true, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4174, strictPort: true, allowedHosts: true },
});
