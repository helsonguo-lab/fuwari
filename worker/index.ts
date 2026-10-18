// Keep HTTPS and browser policy on the existing Worker, including asset 404s.
// Static files are still served by the existing Workers Assets binding.
export const securityHeaders = {
	"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self' https://api.github.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
	"X-Frame-Options": "DENY",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
	"Strict-Transport-Security": "max-age=31536000",
};

interface Env {
	ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		// Local Wrangler preview uses HTTP; never send its users to an absent TLS server.
		if (url.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
			url.protocol = "https:";
			return new Response(null, { status: 308, headers: { ...securityHeaders, Location: url.href } });
		}
		const asset = await env.ASSETS.fetch(request);
		const response = new Response(asset.body, asset);
		for (const [key, value] of Object.entries(securityHeaders)) response.headers.set(key, value);
		return response;
	},
};
