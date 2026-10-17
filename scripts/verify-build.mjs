import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const client = 'dist/client';
const asset = (file) => join(client, file);
const check = (condition, message) => { if (!condition) throw new Error(`Production build verification: ${message}`); };
const html = readFileSync(asset('index.html'), 'utf8');
check(html.includes('/assets/index-') && html.includes('Numinous 2.0'), 'React home shell must be built');
check(!html.includes('numinous-clean.css'), 'old storefront must not be published');
for (const [route, title, image] of [
 ['gates/signal', 'The Signal', 'signal.jpg'],
 ['gates/watcher', 'The Watcher', 'watcher.jpg'],
 ['gates/vault', 'Wallpaper Vault', 'vault.jpg'],
 ['gates/numinary-agent', 'The Numinary Agent', 'numinary.jpg'],
 ['gates/signal/enter', 'Review The Signal', 'signal.jpg'],
 ['gates/watcher/enter', 'Review The Watcher', 'watcher.jpg'],
 ['returns', 'The Pact', 'bg_hero.jpg'],
 ['products/the-numinary-3e', 'The Watcher', 'watcher.jpg'],
]) {
 const doc = readFileSync(asset(`${route}/index.html`), 'utf8');
 check(doc.includes(`<title>${title} — Numinous</title>`), `${route} title`);
 check(doc.includes(`https://jointhenuminouses.whop.site/media/${image}`), `${route} social artwork`);
 check(doc.includes('/assets/index-'), `${route} hydration script`);
}
check(!existsSync(asset('checkout/_redirects')) && !existsSync(asset('_redirects')), 'legacy checkout path must not lose its plan ID');
const publicDir = 'sandbox/numinous2/public';
for (const filename of [
 'signal-briefing-1440.mp4', 'signal-briefing-720.webm', 'watcher-briefing-1440.mp4',
 'signal-invite-1440.mp4', 'signal-invite-720.webm', 'watcher-invite-1440.mp4',
 'signal-briefing-1440.vtt', 'watcher-briefing-1440.vtt',
 'signal-invite-1440.vtt', 'watcher-invite-1440.vtt',
]) {
 const original = readFileSync(join(publicDir, 'media', filename));
 const built = readFileSync(asset(`media/${filename}`));
 check(createHash('sha256').update(original).digest('hex') === createHash('sha256').update(built).digest('hex'), `${filename} media changed in packaging`);
}
const js = readFileSync(join(client, 'assets', readdirSync(asset('assets')).find((f) => f.endsWith('.js'))), 'utf8');
for (const id of ['ch_wYXFulML0v6LIoJ', 'plan_PQnMYNixMTjRQ', 'plan_Imfk0oedwYn7v', 'plan_Aew5DdipP3fKY']) {
 check(js.includes(id), `Whop checkout ${id} missing`);
}
check(js.includes('signal-briefing-720.webm') && js.includes('signal-invite-720.webm'), 'compatible Signal sources missing');
check(existsSync('dist/server/index.js') && existsSync('dist/server/wrangler.json'), 'Whop worker output missing');
const packed = execFileSync('unzip', ['-Z', '-1', 'dist/whop-build.zip'], { encoding: 'utf8' });
for (const file of ['client/index.html', 'client/gates/signal/index.html', 'client/media/signal-briefing-720.webm', 'client/media/signal-invite-720.webm', 'client/media/watcher-invite-1440.mp4', 'server/index.js']) {
 check(packed.includes(`${file}\n`), `${file} missing from Whop upload`);
}
console.log('verify-build: production React routes, social metadata, Whop handoffs, unchanged films, and upload archive passed');
