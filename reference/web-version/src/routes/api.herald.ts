import { createFileRoute } from "@tanstack/react-router";
import { clientIp, ipFingerprint, rateLimit } from "../lib/rate-limit";

// The herald gate. The home page's email form posts here before it hands the
// traveller to The Signal on Whop (where the real capture happens - no email
// is ever stored on this site). This endpoint validates server-side, enforces
// the strict rate tier, swallows honeypot bots silently, and verifies a
// captcha token: hCaptcha when HCAPTCHA_SECRET exists in the environment,
// otherwise Google reCAPTCHA when RECAPTCHA_SECRET_KEY exists.
//
// Until a secret key is configured the captcha check is skipped by design;
// providing a secret flips enforcement on with no code change. The matching
// public site key goes in src/home.html (the CAPTCHA constant) and the
// loader script for both providers is already prepared there.

const EMAIL =
	/^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,24}$/;

function json(body: unknown, status = 200, retryAfter?: number): Response {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"Cache-Control": "no-store",
	};
	if (retryAfter) headers["Retry-After"] = String(retryAfter);
	return new Response(JSON.stringify(body), { status, headers });
}

async function verifyHcaptcha(
	token: string,
	secret: string,
): Promise<boolean> {
	try {
		const res = await fetch("https://api.hcaptcha.com/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret, response: token }),
		});
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

async function verifyRecaptcha(
	token: string,
	secret: string,
): Promise<boolean> {
	try {
		const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret, response: token }),
		});
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

export const Route = createFileRoute("/api/herald")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const gate = rateLimit(`herald:${clientIp(request)}`, "strict");
				if (!gate.ok) {
					return json({ ok: false, error: "slow_down" }, 429, gate.retryAfter);
				}

				let body: {
					email?: unknown;
					terms?: unknown;
					honeypot?: unknown;
					captchaToken?: unknown;
					recaptchaToken?: unknown;
					captchaProvider?: unknown;
				};
				try {
					body = await request.json();
				} catch {
					return json({ ok: false, error: "invalid_body" }, 400);
				}

				// Honeypot: real users never see or fill this field. Answer bots
				// with a success so they do not adapt.
				if (typeof body.honeypot === "string" && body.honeypot !== "") {
					return json({ ok: true });
				}

				const email =
					typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
				if (email.length > 254 || !EMAIL.test(email)) {
					return json({ ok: false, error: "invalid_email" }, 400);
				}
				if (body.terms !== true) {
					return json({ ok: false, error: "consent_required" }, 400);
				}

				// hCaptcha is the house provider (matching Whop's own checkout);
				// Google reCAPTCHA remains supported during the migration. The
				// client declares which provider produced its token, so both
				// secrets can coexist and the cutover is safe in any order.
				const hcaptchaSecret = process.env.HCAPTCHA_SECRET;
				const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
				if (hcaptchaSecret || recaptchaSecret) {
					const token =
						typeof body.captchaToken === "string"
							? body.captchaToken
							: typeof body.recaptchaToken === "string"
								? body.recaptchaToken
								: "";
					const declared =
						typeof body.captchaProvider === "string"
							? body.captchaProvider
							: "";
					let passed = false;
					if (declared === "hcaptcha" && hcaptchaSecret) {
						passed = token ? await verifyHcaptcha(token, hcaptchaSecret) : false;
					} else if (declared === "recaptcha" && recaptchaSecret) {
						passed = token ? await verifyRecaptcha(token, recaptchaSecret) : false;
					} else if (hcaptchaSecret) {
						passed = token ? await verifyHcaptcha(token, hcaptchaSecret) : false;
					} else if (recaptchaSecret) {
						passed = token ? await verifyRecaptcha(token, recaptchaSecret) : false;
					}
					if (!passed) {
						return json({ ok: false, error: "captcha_failed" }, 403);
					}
				}

				// No PII in logs: a fingerprint only, so repeat abuse can be
				// correlated without storing an address.
				console.info(`herald.accept fp=${ipFingerprint(request)}`);
				return json({ ok: true });
			},
			GET: () =>
				new Response("Method Not Allowed", {
					status: 405,
					headers: { "Cache-Control": "no-store" },
				}),
		},
	},
});
