import sanitizeHtml from "sanitize-html";
import { visit } from "unist-util-visit";

const tags = new Set([...sanitizeHtml.defaults.allowedTags, "img", "details", "summary"]);
const attributes = new Set(["id", "class", "title", "lang", "dir", "href", "src", "alt", "width", "height", "target", "rel", "colspan", "rowspan", "open", "loading", "decoding"]);

function safeUrl(value, image = false) {
	try {
		const link = new URL(value, "https://content.invalid/");
		return (image ? ["https:", "http:"] : ["https:", "http:", "mailto:", "tel:"]).includes(link.protocol);
	} catch { return false; }
}

// Check source HTML before math/code/directive plugins generate trusted markup.
// Unsafe HTML stays readable as escaped text; unsafe link targets become '#'.
// Do not throw here: Astro's content loader can cache a last-good render on error.
export function remarkContentSafety() {
	return (tree, file) => {
		visit(tree, (node) => {
			if (["link", "image", "definition"].includes(node.type) && !safeUrl(node.url, node.type === "image")) {
				node.url = "#";
				file.message("Unsafe Markdown URL neutralized", node);
			}
			if (node.type !== "html") return;
			let unsafe = false;
			// sanitize-html's parser decodes entities before the callback. Its output
			// is intentionally unused, so partial raw HTML tags retain their structure.
			sanitizeHtml(node.value, { onOpenTag(name, attrs) {
				if (!tags.has(name)) unsafe = true;
				for (const [key, value] of Object.entries(attrs)) {
					if (!attributes.has(key) && !key.startsWith("aria-") && !key.startsWith("data-")) unsafe = true;
					if ((key === "href" || key === "src") && !safeUrl(value, key === "src")) unsafe = true;
				}
				if (attrs.target === "_blank" && !["noopener", "noreferrer"].every(value => attrs.rel?.split(/\s+/).includes(value))) unsafe = true;
			} });
			if (unsafe) {
				node.type = "text";
				file.message("Unsafe Markdown HTML rendered as text", node);
			}
		});
	};
}
