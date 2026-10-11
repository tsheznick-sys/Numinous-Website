import { createFileRoute } from "@tanstack/react-router";

// Health probe for the availability/recovery story: an uptime monitor (or a
// human mid-rollback) can confirm the worker is serving and which service
// version is live. Deliberately stateless, unauthenticated, and cache-free -
// it exposes nothing but the version string already public in the repo.

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
	});
}

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () =>
				json({
					ok: true,
					service: "thenuminouses",
					version: "2.0.0",
					// Enforcement state only - never the secret itself.
					captchaEnforced: Boolean(
					process.env.HCAPTCHA_SECRET || process.env.RECAPTCHA_SECRET_KEY,
				),
				}),
			POST: () => json({ ok: false, error: "method_not_allowed" }, 405),
		},
	},
});
