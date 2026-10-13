# Motion, vendored

**What this is.** `motion.mjs` is [Motion](https://motion.dev) — the animation
engine formerly shipped as Framer Motion — pre-bundled down to the four things
the Numinous motion layer actually uses:

    animate · inView · scroll · stagger

**Why vendored and not a dependency.** The storefront deploys through the kit
channel: a zip lands in the Drive slot, the Bootstrap run `git add`s a fixed
list of paths, and `npm ci` then installs from the lockfile that is already on
`main`. `package.json` is not one of those paths, so a normal dependency would
need a workflow edit to ride along. Vendoring here means the whole engine —
code, licence, provenance — travels inside the kit with everything else, and
nothing about the deploy chain has to change.

**Provenance.** `motion@14.1.0` from the public npm registry, MIT (see
`LICENSE.md`, which travels with it). Bundle command, run once, output committed
as-is:

    npm i --no-save motion@14.1.0 esbuild
    printf 'export { animate, inView, scroll, stagger } from "motion";\n' > entry.mjs
    npx esbuild entry.mjs --bundle --format=iife --global-name=__numinousMotionVendor \
      --minify --target=es2020 --outfile=reference/vendor/motion/motion.mjs

**Why an IIFE and not ESM.** An `--format=esm` bundle ends with
`export { Un as animate, … }` — an alias to a *minified local*, which creates no
binding named `animate` in the module body. The layer is concatenated into the
same file and would throw `ReferenceError` on every call. `--format=iife` with
`--global-name` hands the functions back as `__numinousMotionVendor.animate`
(and `inView`, `scroll`, `stagger`), which is a real binding the layer can read.

**Measurements at 14.1.0.** 63,241 bytes raw · 23,500 bytes gzip. The full
library would be 145,142 bytes raw (50,305 gzip) and an eleven-export set
67,589 (24,932) — this is the lean set that still covers buttons, reveals,
staggered groups and scroll-linked drift.

**Rebuilding later.** Re-run the two commands above with a newer version, then
re-check the site: the layer only calls `animate`, `inView`, `scroll` and
`stagger`, so a version whose API for those four is unchanged is a drop-in.

**Never do this instead:** `motion`'s own `dist/es/index.mjs` is a two-line
re-export of `framer-motion/dom`, and `dist/motion.js` is a UMD build — neither
can be copied into the tree as a working module. Always bundle, and always
check that `__numinousMotionVendor.animate` is a function afterwards.
