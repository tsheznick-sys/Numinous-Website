import { createFileRoute } from "@tanstack/react-router";
import { clientIp, rateLimit } from "../lib/rate-limit";

// Client error intake. Pages post a one-shot beacon when an unhandled error
// or rejection escapes; this lands it in the platform's worker logs (the only
// log sink this runtime has) with strict shaping: truncated, structured, no
// storage, no PII collected by us. External aggregation (Sentry etc.) can be
// layered later - see INFRASTRUCTURE-BLUEPRINT.md.

function text(body: string, status: number): Response {
	// workerd requires an explicit null body for null-body statuses like 204;
	// an empty-string body draws a platform warning.
	return new Response(body === "" ? null : body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

export const Route = createFileRoute("/api/errors")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const gate = rateLimit(`errors:${clientIp(request)}`, "loose");
				if (!gate.ok) {
					return text("", 429);
				}
				try {
					const raw = await request.text();
					const shaped = raw.slice(0, 600).replace(/[^\x20-\x7E\n]/g, "?");
					console.error(`[client-error] ${shaped}`);
				} catch {
					// A malformed beacon must never itself error.
				}
				return text("", 204);
			},
			GET: () =>
				new Response("Method Not Allowed", {
					status: 405,
					headers: { "Cache-Control": "no-store" },
				}),
		},
	},
});
