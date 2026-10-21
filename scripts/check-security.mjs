import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { GithubCardComponent } from "../src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "../src/plugins/remark-directive-rehype.js";
import { remarkContentSafety } from "../src/plugins/remark-content-safety.mjs";
import { localSearchUrl } from "../src/utils/search-results.ts";
import { serializeJson } from "../src/utils/serialize-json.ts";
import worker, { securityHeaders } from "../worker/index.ts";

const payload = "</script><script>globalThis.probe=1</script>\u2028\u2029";
const json = serializeJson({ title: payload });
assert(!json.includes("<"));
assert.deepEqual(JSON.parse(json), { title: payload });
for (const repo of ["x/' + alert(1) + '", "x/</script><script>alert(1)</script>", "x/..", "//x/y", "x/y?z", "x/y\\z"]) {
	assert.equal(GithubCardComponent({ repo }, []).tagName, "div");
}
assert.equal(GithubCardComponent({ repo: "withastro/astro" }, []).tagName, "a");

const transform = remarkContentSafety();
for (const value of ["<script>alert(1)</script>", '<img src=x onerror="alert(1)">', '<a href="jav&#x61;script:alert(1)">x</a>', '<iframe srcdoc="x"></iframe>', '<a target="_blank" href="https://example.com">x</a>']) {
	const node = { type: "html", value };
	transform({ type: "root", children: [node] }, { message() {} });
	assert.equal(node.type, "text");
}
for (const type of ["link", "image", "definition"]) {
	const node = { type, url: "java\tscript:alert(1)" };
	transform({ type: "root", children: [node] }, { message() {} });
	assert.equal(node.url, "#");
}
const allowed = { type: "html", value: '<details><summary>safe</summary><strong>ok</strong></details>' };
transform({ type: "root", children: [allowed] }, { message() {} });
assert.equal(allowed.type, "html");

const directiveTransform = parseDirectiveNode();
const runDirective = (node) => {
	const tree = { type: "root", children: [node] };
	directiveTransform(tree, { message() {} });
	return tree;
};
const scriptTree = runDirective({ type: "textDirective", name: "script", attributes: {}, children: [{ type: "text", value: "window.__probe=1" }] });
assert.equal(scriptTree.children.some((node) => node.type === "textDirective"), false);
assert.equal(scriptTree.children.some((node) => node.data?.hName), false);
const imageTree = runDirective({ type: "leafDirective", name: "img", attributes: { src: "x", onerror: "alert(1)" }, children: [] });
assert.equal(imageTree.children.some((node) => node.data?.hName === "img"), false);
const iframeTree = runDirective({
	type: "containerDirective",
	name: "iframe",
	attributes: { srcdoc: "<script>alert(1)</script>" },
	children: [{ type: "paragraph", children: [{ type: "text", value: "fallback" }] }],
});
assert.equal(iframeTree.children.some((node) => node.data?.hName === "iframe"), false);
assert.equal(iframeTree.children[0]?.type, "paragraph");
const githubDirective = { type: "leafDirective", name: "github", attributes: { repo: "withastro/astro", onclick: "alert(1)" }, children: [] };
runDirective(githubDirective);
assert.equal(githubDirective.data.hName, "github");
assert.deepEqual(githubDirective.data.hProperties, { repo: "withastro/astro" });
const noteDirective = {
	type: "containerDirective",
	name: "note",
	attributes: { onclick: "alert(1)" },
	children: [
		{ type: "paragraph", data: { directiveLabel: true }, children: [{ type: "text", value: "标题" }] },
		{ type: "paragraph", children: [{ type: "text", value: "正文" }] },
	],
};
runDirective(noteDirective);
assert.equal(noteDirective.data.hName, "note");
assert.equal(noteDirective.data.hProperties["has-directive-label"], true);
assert.equal(noteDirective.data.hProperties.onclick, undefined);

const searchBase = "https://home.wonyoung.xyz/";
const sameOriginDoubleSlash = localSearchUrl("https://home.wonyoung.xyz//evil.com/x", searchBase);
assert.equal(new URL(sameOriginDoubleSlash).origin, "https://home.wonyoung.xyz");
assert.equal(localSearchUrl("//evil.com/x", searchBase), undefined);
assert.equal(localSearchUrl("https://evil.com/x", searchBase), undefined);
assert.equal(localSearchUrl("https://user:pass@home.wonyoung.xyz/x", searchBase), undefined);

const env = { ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } };
const redirect = await worker.fetch(new Request("http://home.wonyoung.xyz/gallery/?group=IVE"), env);
assert.equal(redirect.status, 308);
assert.equal(redirect.headers.get("location"), "https://home.wonyoung.xyz/gallery/?group=IVE");
const missing = await worker.fetch(new Request("https://home.wonyoung.xyz/missing/"), env);
assert.equal(missing.status, 404);
assert.equal(await missing.text(), "missing");
for (const [key, value] of Object.entries(securityHeaders)) assert.equal(missing.headers.get(key), value);
assert(!securityHeaders["Strict-Transport-Security"].match(/includeSubDomains|preload/));
assert(!securityHeaders["Content-Security-Policy"].includes("'unsafe-eval'"));
for (const [agent, expected] of [["pnpm/11.25.0 npm/? node/?", 0], ["pnpm/9.0.0", 1], ["npm/11.0.0", 1]]) {
	const result = spawnSync(process.execPath, ["scripts/check-package-manager.cjs"], { env: { ...process.env, npm_config_user_agent: agent } });
	assert.equal(result.status, expected);
}
console.log("Security boundary checks passed (JSON-LD, Markdown, directive allowlist, search URLs, Worker and package manager).");
