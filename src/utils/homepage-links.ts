// Only verified publisher work pages, never arbitrary URLs or embedded content.
export function isOfficialReadingUrl(value: string): boolean {
	try {
		const link = new URL(value);
		return link.protocol === "https:" && link.hostname === "www.shonenjump.com" &&
			!link.username && !link.password && !link.port && !link.search && !link.hash &&
			/^\/j\/rensai\/[a-z0-9-]+\/$/.test(link.pathname);
	} catch {
		return false;
	}
}
