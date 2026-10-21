export interface ExcerptPart {
	text: string;
	highlight: boolean;
}

// Parse in an inert template, never attach index HTML to the live document.
// Only text and the semantic mark flag cross into Svelte's escaped rendering.
export function excerptParts(html: string): ExcerptPart[] {
	const template = document.createElement("template");
	template.innerHTML = html;
	const parts: ExcerptPart[] = [];
	const walk = (node: Node, highlight = false) => {
		if (node.nodeType === Node.TEXT_NODE) {
			parts.push({ text: node.textContent ?? "", highlight });
		} else if (node instanceof Element && !["SCRIPT", "STYLE", "IFRAME", "OBJECT", "TEMPLATE"].includes(node.tagName)) {
			for (const child of node.childNodes) walk(child, highlight || node.tagName === "MARK");
		}
	};
	for (const child of template.content.childNodes) walk(child);
	return parts;
}

export function localSearchUrl(value: string, base = location.href): string | undefined {
	try {
		const baseUrl = new URL(base);
		const target = new URL(value, baseUrl);
		if (target.origin !== baseUrl.origin || !["http:", "https:"].includes(target.protocol) || target.username || target.password) return;
		// Return an absolute same-origin URL: a pathname beginning with "//"
		// would otherwise be interpreted as a protocol-relative host by the browser.
		return target.href;
	} catch {
		return;
	}
}
