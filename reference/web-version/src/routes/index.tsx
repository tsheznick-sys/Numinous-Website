import { createFileRoute } from "@tanstack/react-router";
import { HOMEPAGE_CACHE_CONTROL } from "../lib/cache-policy";
import homeHtml from "../home.html?raw";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: async () =>
				new Response(homeHtml, {
					headers: {
						"Content-Type": "text/html; charset=utf-8",
						"Cache-Control": HOMEPAGE_CACHE_CONTROL,
					},
				}),
		},
	},
});
