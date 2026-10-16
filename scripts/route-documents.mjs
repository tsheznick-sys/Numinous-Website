import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Cloudflare's asset layer serves these documents to link-preview crawlers.
// They all hydrate the same React app; the pathname, not a static checkout
// rewrite, determines the live page. Do not create /checkout/<id> redirects:
// those legacy IDs must reach React intact.
const site = 'https://jointhenuminouses.whop.site';
const shared = 'Cinematic visions of the divine and mythical. Four gates into a living record.';
const works = [
  ['signal', 'The Signal', 'signal.jpg', 'The free first vision, Dispatches, the calendar, and the Sanctuary.'],
  ['watcher', 'The Watcher', 'watcher.jpg', 'One new being in four chapters across every 28-day moon.'],
  ['vault', 'Wallpaper Vault', 'vault.jpg', 'Fifteen Numinous worlds for phone, portrait and desktop.'],
  ['numinary-agent', 'The Numinary Agent', 'numinary.jpg', 'A private lore guide for Watchers of The Numinary.'],
];
const pages = [
  ['gates', 'The Four Gates', 'bg_hero.jpg', shared],
  ...works.flatMap(([slug, name, image, description]) => [
    [`gates/${slug}`, name, image, description],
    [`gates/${slug}/enter`, `Review ${name}`, image, `Review ${name} and its terms before continuing to Whop.`],
  ]),
  ['gates/confirmed', 'Return status', 'bg_hero.jpg', 'Check your Whop receipt and account to verify payment and access.'],
  ['access', 'Verify library access', 'bg_hero.jpg', 'Sign in to Whop to verify account and library access.'],
  ['returns', 'The Pact', 'bg_hero.jpg', 'The Watcher trial and seven-night return terms.'],
  ['refunds', 'Refund policy', 'bg_hero.jpg', 'How to request an eligible Watcher return.'],
  ['terms', 'Terms of service', 'bg_hero.jpg', 'Terms for entering and using the Numinous works.'],
  ['privacy', 'Privacy', 'bg_hero.jpg', 'How Whop and Numinous handle account and support information.'],
  ['eula', 'EULA', 'bg_hero.jpg', 'A license for the Numinous works.'],
  ['cookies', 'Cookies', 'bg_hero.jpg', 'Browser storage and service controls.'],
  // Old public links remain usable and preview the corresponding gate.
  ['collections/all', 'The Four Gates', 'bg_hero.jpg', shared, '/gates'],
  ['products/the-signal-e6', 'The Signal', 'signal.jpg', works[0][3], '/gates/signal'],
  ['products/the-numinary-3e', 'The Watcher', 'watcher.jpg', works[1][3], '/gates/watcher'],
  ['products/wallpaper-vault', 'Wallpaper Vault', 'vault.jpg', works[2][3], '/gates/vault'],
  ['products/herald-app', 'The Numinary Agent', 'numinary.jpg', works[3][3], '/gates/numinary-agent'],
];
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function routeDocuments() {
 return {
  name: 'numinous-route-documents',
  apply: 'build',
  closeBundle() {
   const dir = 'dist/client';
   const shell = join(dir, 'index.html');
   if (!existsSync(shell)) return; // The server environment builds first.
   const home = readFileSync(shell, 'utf8');
   for (const [route, title, image, description, canonicalPath] of pages) {
    const pageTitle = `${title} — Numinous`;
    const socialImage = `${site}/media/${image}`;
    const canonical = `${site}${canonicalPath || `/${route}`}`;
    const meta = `    <link rel="canonical" href="${canonical}" />\n`;
    let html = home
     .replace(/<title>[^<]*<\/title>/, `<title>${escape(pageTitle)}</title>`)
     .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(description)}" />\n${meta}`)
     .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escape(pageTitle)}" />`)
     .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escape(description)}" />`)
     .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${socialImage}" />`)
     .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escape(pageTitle)}" />`)
     .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escape(description)}" />`)
     .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${socialImage}" />`);
    const output = join(dir, route, 'index.html');
    mkdirSync(join(dir, route), { recursive: true });
    writeFileSync(output, html);
   }
   console.log(`[numinous] wrote ${pages.length} route-specific metadata documents`);
  },
 };
}
