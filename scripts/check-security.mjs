import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { GithubCardComponent } from "../src/plugins/rehype-component-github-card.mjs";
import { remarkContentSafety } from "../src/plugins/remark-content-safety.mjs";
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
console.log("Security boundary checks passed (JSON-LD, Markdown, GitHub directive, Worker and package manager).");
