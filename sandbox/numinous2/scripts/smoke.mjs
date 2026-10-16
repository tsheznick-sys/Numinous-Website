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
const signalReview = render('/gates/signal/enter');
check(signalReview.includes('/media/signal-briefing-1440.mp4') && watcher.includes('/media/watcher-briefing-1440.mp4'), 'each pre-checkout page must play its own briefing');
check(signalReview.includes('Join The Signal free on Whop') && signalReview.includes('ch_wYXFulML0v6LIoJ'), 'Signal entry CTA must describe its destination and keep the free Whop checkout ID');
check(render('/gates/signal').includes('href="/gates/signal/enter"'), 'Signal detail action must lead to its briefing before Whop');
check(watcher.includes('plan_PQnMYNixMTjRQ') && watcher.includes('plan_Imfk0oedwYn7v'), 'monthly and annual Watcher doors');
const agent = render('/gates/numinary-agent/enter');
for (const id of ['plan_DfdY0zchDNFfd', 'plan_1D3t48PqoC0VO', 'plan_JVsIaspu0MCOs', 'plan_adTlNP9y9zjvP'])
 check(agent.includes(id), `Agent choice ${id}`);
for (const state of ['failed', 'declined', 'canceled', 'cancelled', 'pending', 'processing']) {
 const html = render(`/gates/confirmed?offer=watcher&status=${state}`);
 check(!html.includes('How to verify access') && !html.includes('confirmation-film'), `${state} must not imply access`);
}
check(render('/gates/confirmed?offer=watcher&status=completed').includes('How to verify access'), 'completed browser return should point to Whop verification');
check(render('/gates/confirmed?offer=watcher').includes('No recognized checkout status'), 'statusless return must be unverified');
check(render('/gates/confirmed?offer=unknown&status=success').includes('unknown gate'), 'unknown offer must not become Signal');
const home = render('/');
const collection = render('/gates');
for (const [gate, title] of [['signal', 'The Signal'], ['watcher', 'The Watcher'], ['vault', 'Wallpaper Vault'], ['numinary-agent', 'The Numinary Agent']]) {
 check(home.includes(`aria-label="View ${title} details" href="/gates/${gate}"`), `home ${title} full-card destination`);
 check(collection.includes(`aria-label="View ${title} details" href="/gates/${gate}"`), `collection ${title} full-card destination`);
}
check((home.match(/class="gate-card__hit"/g) || []).length === 4, 'four linked home cards');
check((collection.match(/class="collection-card__hit"/g) || []).length === 4, 'four linked collection cards');
check(watcher.includes('class="checkout-offer__hit"') && watcher.includes('aria-label="Read details about The Watcher"'), 'pre-checkout product card links to details');
check(home.includes('muted=""') && home.includes('controls=""'), 'hero is silent but selected briefing has controls');
check(home.includes('Review The Signal') && home.includes('Explore The Watcher'), 'home CTAs must describe review rather than granted access');
check(readFileSync('src/main.tsx', 'utf8').includes("import './button-system.css'"), 'site-wide action styles loaded');
const buttonSystem = readFileSync('src/button-system.css', 'utf8');
check(buttonSystem.includes(':focus-visible') && buttonSystem.includes('prefers-reduced-motion') && buttonSystem.includes('touch-action: manipulation'), 'actions need keyboard, reduced-motion and touch affordances');
check(home.includes('Soundtrack credit pending review') && watcher.includes('Soundtrack credit pending review'), 'pre-entry music credit must await attribution');
check(render('/gates/confirmed?offer=watcher&status=completed').includes('Soundtrack credit pending review'), 'return music credit must await attribution');
check(home.includes('aria-controls="mobile-gates-menu"') && home.includes('aria-expanded="false"'), 'mobile menu control');
check(home.includes('The Numinary Agent') && home.includes('The Watcher'), 'four-gate navigation');
check(render('/gates/vault').includes('Wallpaper Vault'), 'Vault route');
check(render('/returns').includes('7 days free'), 'return terms');
const source = [readFileSync('src/data.ts', 'utf8'), ...readdirSync('src/pages').map((f) => readFileSync(join('src/pages', f), 'utf8')), readFileSync('src/components/Layout.tsx','utf8'), readFileSync('src/index.css','utf8')].join('\n');
for (const asset of new Set([...source.matchAll(/\/media\/([\w.-]+\.(?:jpg|webp|png|mp4))/g)].map((m) => m[1]))) {
 check(existsSync(join('dist/media', asset)), `missing built media ${asset}`);
}
for (const [film, end] of [['signal-briefing', 163], ['watcher-briefing', 162], ['signal-invite', 80], ['watcher-invite', 73]]) {
 const video = readFileSync(`dist/media/${film}-1440.mp4`);
 check(video.includes(Buffer.from('soun')) && video.includes(Buffer.from('mp4a')), `${film} needs AAC audio`);
 const captions = readFileSync(`dist/media/${film}-1440.vtt`, 'utf8');
 const cues = [...captions.matchAll(/(\d\d):(\d\d):(\d\d)\.(\d\d\d) --> (\d\d):(\d\d):(\d\d)\.(\d\d\d) line:18% position:50% size:84% align:center/g)];
 check(captions.startsWith('WEBVTT') && cues.length > 10, `${film} needs short, positioned English captions`);
 const last = cues.at(-1);
 const endSeconds = Number(last[5])*3600 + Number(last[6])*60 + Number(last[7]) + Number(last[8])/1000;
 check(endSeconds >= end - 12 && endSeconds <= end, `${film} narration captions must reach its final scene`);
 check(existsSync(`audio/${film === 'signal-briefing' ? film + '-scene-01' : film + '-1'}.mp3`), `${film} needs its first narrated block`);
}
const signalCues = readFileSync('dist/media/signal-briefing-1440.vtt', 'utf8');
const signalStarts = ['00:00:01.000', '00:00:12.000', '00:00:25.000', '00:00:35.000', '00:00:49.000', '00:01:04.000', '00:01:31.000', '00:01:47.000', '00:02:03.000', '00:02:28.000'];
for (const [i, start] of signalStarts.entries()) {
 check(signalCues.includes(`${start} -->`), `Signal narration needs scene cue at ${start}`);
 check(existsSync(`audio/signal-briefing-scene-${String(i + 1).padStart(2, '0')}.mp3`), `Signal scene ${i+1} needs its active narration`);
}
const signalRanges = [...signalCues.matchAll(/([\d:.]+) --> ([\d:.]+) line:18%/g)];
const seconds = (time) => { const [h,m,s] = time.split(':'); return Number(h)*3600 + Number(m)*60 + Number(s); };
for (const [i, cue] of signalRanges.entries()) {
 check(seconds(cue[1]) < seconds(cue[2]) && seconds(cue[2]) <= 163, `Signal caption ${i+1} fits the film`);
 if (i) check(seconds(signalRanges[i-1][2]) <= seconds(cue[1]), `Signal captions ${i} and ${i+1} cannot overlap`);
}
check(render('/gates/signal').includes('/media/signal-briefing-1440.vtt'), 'Signal briefing captions linked');
check(render('/gates/confirmed?offer=watcher&status=success').includes('/media/watcher-invite-1440.vtt'), 'Watcher invitation captions linked');
check(existsSync('dist/assets'), 'built client assets');
console.log('sandbox smoke: routes, clickable cards, trial, checkout, return states, menu, narrated media and captions passed');
