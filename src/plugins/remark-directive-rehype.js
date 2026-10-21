import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";

const allowedDirectives = new Set(["github", "note", "tip", "important", "caution", "warning"]);
const directiveTypes = new Set(["containerDirective", "leafDirective", "textDirective"]);

export function parseDirectiveNode() {
	return (tree, file) => {
		visit(tree, (node, index, parent) => {
			if (!directiveTypes.has(node.type)) return;

			// Unknown directives must never become arbitrary tags or attributes.
			// Unwrap their children so authored text survives without executing HTML.
			if (!allowedDirectives.has(node.name)) {
				file?.message?.(`Unsupported Markdown directive "${node.name}" rendered as plain text`, node);
				const children = node.children ?? [];
				if (parent && index != null) {
					parent.children.splice(index, 1, ...children);
					return [SKIP, index];
				}
				node.type = "text";
				node.value = "";
				delete node.data;
				delete node.attributes;
				delete node.name;
				return;
			}

			const attributes = {};
			if (node.name === "github" && typeof node.attributes?.repo === "string") {
				attributes.repo = node.attributes.repo;
			}
			if (node.children?.[0]?.data?.directiveLabel) {
				// Add a flag to the node to indicate it has a directive label
				attributes["has-directive-label"] = true;
			}
			node.attributes = attributes;
			const hast = h(node.name, attributes);
			node.data = node.data || {};
			node.data.hName = hast.tagName;
			node.data.hProperties = hast.properties;
		});
	};
}
