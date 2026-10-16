import { build } from 'esbuild';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bundle local TSX only; dependencies remain the exact installed React versions.
const out = resolve('dist/smoke-entry.mjs');
await build({ entryPoints: ['scripts/smoke-entry.tsx'], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: out, logLevel: 'silent', jsx: 'automatic' });
const { render, lookupLegacyOffer } = await import(pathToFileURL(out).href);
const check = (condition, message) => { if (!condition) throw new Error(`Sandbox smoke failed: ${message}`); };
check(lookupLegacyOffer('/checkout/plan_PQnMYNixMTjRQ') === 'watcher', 'old Watcher checkout path');
check(lookupLegacyOffer('plan_Imfk0oedwYn7v') === 'watcher', 'old annual checkout path');
check(lookupLegacyOffer('plan_hIKLCR4hGiv9B') === 'agent', 'old Herald checkout path');
check(lookupLegacyOffer('plan_UNKNOWN') === null, 'unknown checkout must not become Signal');
const watcher = render('/gates/watcher/enter');
check(watcher.includes('7 days free, then $28 every 28 days'), 'monthly Watcher trial disclosure');
check(watcher.includes('plan_PQnMYNixMTjRQ') && watcher.includes('plan_Imfk0oedwYn7v'), 'monthly and annual Watcher doors');
const agent = render('/gates/numinary-agent/enter');
for (const id of ['plan_DfdY0zchDNFfd', 'plan_1D3t48PqoC0VO', 'plan_JVsIaspu0MCOs', 'plan_adTlNP9y9zjvP'])
 check(agent.includes(id), `Agent choice ${id}`);
for (const state of ['failed', 'declined', 'canceled', 'cancelled', 'pending', 'processing']) {
 const html = render(`/gates/confirmed?offer=watcher&status=${state}`);
 check(!html.includes('Verify library access with Whop') && !html.includes('confirmation-film'), `${state} must not imply access`);
}
check(render('/gates/confirmed?offer=watcher&status=completed').includes('Verify library access with Whop'), 'completed browser return should point to Whop verification');
check(render('/gates/confirmed?offer=watcher').includes('No recognized checkout status'), 'statusless return must be unverified');
check(render('/gates/confirmed?offer=unknown&status=success').includes('unknown gate'), 'unknown offer must not become Signal');
const home = render('/');
check(home.includes('aria-controls="mobile-gates-menu"') && home.includes('aria-expanded="false"'), 'mobile menu control');
check(home.includes('The Numinary Agent') && home.includes('The Watcher'), 'four-gate navigation');
check(render('/gates/vault').includes('Wallpaper Vault'), 'Vault route');
check(render('/returns').includes('7 days free'), 'return terms');
const source = [readFileSync('src/data.ts', 'utf8'), ...readdirSync('src/pages').map((f) => readFileSync(join('src/pages', f), 'utf8')), readFileSync('src/components/Layout.tsx','utf8'), readFileSync('src/index.css','utf8')].join('\n');
for (const asset of new Set([...source.matchAll(/\/media\/([\w.-]+\.(?:jpg|webp|png|mp4))/g)].map((m) => m[1]))) {
 check(existsSync(join('dist/media', asset)), `missing built media ${asset}`);
}
check(existsSync('dist/assets'), 'built client assets');
console.log('sandbox smoke: route, trial, checkout, confirmation, menu and media checks passed');
