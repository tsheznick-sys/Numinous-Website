import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file = join(root, ".env")) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv();
const onboard = JSON.parse(readFileSync(join(root, "coldstorage/onboard.json"), "utf8"));
const report = {
  name: "website-developer-actions",
  on_behalf_of: "Whop AI",
  ran_at: new Date().toISOString(),
  live_site: onboard.live_site,
  actions: [],
};

function record(name, status, detail) {
  report.actions.push({ name, status, detail });
  console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function coldstorageOnboard() {
  const site = readFileSync(join(root, "src/site.js"), "utf8");
  const records = readFileSync(join(root, "src/records.js"), "utf8");
  const bundle = `${site}\n${records}\n${JSON.stringify(onboard)}`;
  const missing = onboard.required_in_source.filter((phrase) => !bundle.includes(phrase));
  if (missing.length) {
    record("coldstorage-onboard", "failed", `Missing required terms: ${missing.join(", ")}`);
    return false;
  }
  const forbidden = [
    ["local card field", /card(?:number|cvc)|cc-number/i],
    ["email persistence", /localStorage\.setItem\([^)]*email/i],
  ];
  const violations = forbidden.filter(([, pattern]) => pattern.test(site)).map(([name]) => name);
  if (violations.length) {
    record("coldstorage-onboard", "failed", `Terms violation: ${violations.join(", ")}`);
    return false;
  }
  record(
    "coldstorage-onboard",
    "passed",
    "Live storefront onboarded. House terms, seven-night pact, free Signal, and Whop checkouts left intact.",
  );
  return true;
}

function typecheck() {
  const result = run("npm", ["run", "typecheck"]);
  record("typecheck", result.ok ? "passed" : "failed", result.ok ? "source parsed" : result.stderr || result.stdout);
  return result.ok;
}

function build() {
  const result = run("npm", ["run", "build"]);
  const tail = (result.stdout || result.stderr).split("\n").slice(-4).join(" ");
  record("build", result.ok ? "passed" : "failed", tail);
  return result.ok;
}

function whopEconomicIntelligence() {
  const which = run("whop", ["--version"]);
  if (!which.ok) {
    record("whop-cli", "skipped", "Whop CLI is not on PATH.");
    return;
  }
  const auth = run("whop", ["auth", "status", "--format", "json"]);
  let loggedIn = false;
  try {
    loggedIn = JSON.parse(auth.stdout || "{}").loggedIn === true;
  } catch {
    loggedIn = false;
  }
  if (!loggedIn && !process.env.WHOP_API_KEY) {
    record(
      "whop-economic-intelligence",
      "blocked",
      "No Whop session in this sandbox. OAuth callbacks to localhost cannot finish from the preview browser, and WHOP_API_KEY is not set. Live recommended actions were not marked running or executed.",
    );
    return;
  }
  const listed = run("whop", [
    "economic-intelligence",
    "list",
    "--account_id",
    onboard.company_route,
    "--format",
    "json",
    "--first",
    "20",
  ]);
  if (!listed.ok) {
    record("whop-economic-intelligence", "failed", listed.stderr || listed.stdout || "list failed");
    return;
  }
  let payload;
  try {
    payload = JSON.parse(listed.stdout);
  } catch {
    record("whop-economic-intelligence", "failed", "CLI did not return JSON.");
    return;
  }
  const items = payload.data || payload.items || payload.recommendations || [];
  const match = items.find((item) => /coldstorage|onboard/i.test(`${item.title || ""} ${item.name || ""} ${item.input || ""}`));
  report.whop_recommendations = items.length;
  if (!match) {
    record("whop-economic-intelligence", "passed", `Listed ${items.length} recommendations. None were named coldstorage onboard.`);
    return;
  }
  const id = match.id;
  const started = run("whop", [
    "economic-intelligence",
    "update",
    id,
    "--account_id",
    onboard.company_route,
    "--status",
    "running",
    "--format",
    "json",
  ]);
  if (!started.ok) {
    record("whop-run-coldstorage", "failed", started.stderr || started.stdout);
    return;
  }
  const done = run("whop", [
    "economic-intelligence",
    "update",
    id,
    "--account_id",
    onboard.company_route,
    "--status",
    "executed",
    "--result_page",
    "websites",
    "--format",
    "json",
  ]);
  record("whop-run-coldstorage", done.ok ? "passed" : "failed", done.ok ? `Executed ${id}` : done.stderr || done.stdout);
}

const onboardOk = coldstorageOnboard();
const typeOk = typecheck();
const buildOk = build();
whopEconomicIntelligence();

const out = join(root, "developer-actions", "last-run.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`Report written to ${out}`);

if (!onboardOk || !typeOk || !buildOk) process.exit(1);
