import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

// Whop retains a source archive next to the built app. The full Git repository
// includes an obsolete 46 MB reference site and QA screenshots; uploading that
// history as source pushes Whop's 50 MB file limit. Keep it in Git, but send a
// reproducible, production-only source snapshot along with the verified build.
const root = resolve(import.meta.dirname, '..');
const selectedRoots = new Set([
 'LICENSE', 'README.md', 'index.html', 'package.json', 'package-lock.json',
 'vite.config.js', 'wrangler.jsonc', 'whop.app.json', 'src/worker.js',
 'scripts/route-documents.mjs', 'scripts/verify-build.mjs', 'scripts/stage-release.mjs',
]);
const all = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const files = all.filter((path) => selectedRoots.has(path) || path.startsWith('sandbox/numinous2/'));
const dir = mkdtempSync(join(tmpdir(), 'numinous-whop-release-'));
let bytes = 0;
for (const path of files) {
 const source = join(root, path), target = join(dir, path);
 mkdirSync(dirname(target), { recursive: true });
 copyFileSync(source, target);
 bytes += statSync(source).size;
}
// A conservative ceiling on raw bytes also bounds the compressed source zip.
if (bytes > 45 * 1024 * 1024) throw new Error(`Production-only source is too large: ${(bytes / 1048576).toFixed(1)} MB`);
const archive = 'dist/whop-build.zip';
mkdirSync(join(dir, 'dist'), { recursive: true });
copyFileSync(join(root, archive), join(dir, archive));
console.error(`Staged ${files.length} production source files (${(bytes / 1048576).toFixed(1)} MB raw) and verified Whop archive`);
console.log(dir);
