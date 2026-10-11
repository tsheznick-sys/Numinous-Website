import { createFileRoute } from "@tanstack/react-router";
import { createApiProxy } from "@whop/template-kit/server";
import { MANIFEST } from "../api-manifest";
import { clientIp, rateLimit } from "../lib/rate-limit";

// Public data proxy (Whop-backed reads). The manifest allowlist already
// limits what can be called; the standard rate tier now limits how often -
// 30 requests per minute per address, then 429 with Retry-After. Read-only,
// so failing closed here cannot strand a purchase: checkout, order states,
// and the herald gate do not touch this proxy.

type ProxyHandler = (ctx: {
	request: Request;
	params: Record<string, string>;
}) => Response | Promise<Response>;

function noStore(response: Response): Response {
	const headers = new Headers(response.headers);
	headers.set("Cache-Control", "no-store");
	const body = [204, 205, 304].includes(response.status) ? null : response.body;
	return new Response(body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

const proxied = createApiProxy(MANIFEST) as unknown as Record<
	string,
	ProxyHandler
>;

const limited = Object.fromEntries(
	Object.entries(proxied).map(([method, handler]) => [
		method,
		async (ctx: { request: Request; params: Record<string, string> }) => {
			const gate = rateLimit(`proxy:${clientIp(ctx.request)}`, "standard");
			if (!gate.ok) {
				return new Response(JSON.stringify({ error: "slow_down" }), {
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": String(gate.retryAfter),
						"Cache-Control": "no-store",
					},
				});
			}
			return noStore(await handler(ctx));
		},
	]),
);

export const Route = createFileRoute("/api/$")({
	server: { handlers: limited },
});
