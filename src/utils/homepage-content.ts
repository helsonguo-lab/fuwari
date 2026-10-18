import { getCollection } from "astro:content";
import { createRequire } from "node:module";
import { realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import sharp from "sharp";
import { photos } from "../data/photos";

const publicRoot = resolve("public");
const markdown = new MarkdownIt("zero", { html: false, breaks: true })
	.enable(["paragraph", "emphasis", "escape", "newline", "backticks", "entity"]);

export interface MemoryContent {
	id: string;
	photo: string;
	alt: string;
	date: string;
	location: string;
	width: number;
	height: number;
	emotion: string;
}

async function imageSize(path: string) {
	try {
		const file = await realpath(resolve(publicRoot, path.slice(1)));
		const allowedRoot = await realpath(resolve(publicRoot, path.split("/")[1]));
		const rootWithin = relative(await realpath(publicRoot), allowedRoot);
		const within = relative(allowedRoot, file);
		if (rootWithin.startsWith("..") || isAbsolute(rootWithin) || within.startsWith("..") || isAbsolute(within)) throw new Error("图片越界");
		const { width, height } = await sharp(file).metadata();
		if (!width || !height) throw new Error("无尺寸");
		return { width, height };
	} catch {
		throw new Error(`[首页内容] 图片不存在或不能解码：${path}`);
	}
}

// Build-time only. No browser font parser or duplicate hardcoded homepage data.
export async function getHomepageContent() {
	const [homepage, entries] = await Promise.all([getCollection("homepage"), getCollection("memories")]);
	if (homepage.some((entry) => entry.slug !== "now")) throw new Error("近况请只维护 homepage/now.md");
	const now = homepage.find((entry) => entry.slug === "now")?.data;
	// Validate even supplied draft images; blank draft templates have no image paths.
	for (const item of [now?.music, now?.reading]) if (item) await imageSize(item.cover);
	const ids = new Set<string>();
	const memories: MemoryContent[] = [];
	const emotionTexts: string[] = [];
	for (const entry of entries) {
		const data = entry.data;
		if (ids.has(data.id)) throw new Error(`[首页内容] 回忆 id 重复：${data.id}`);
		ids.add(data.id);
		const size = data.photo ? await imageSize(data.photo) : undefined;
		const galleryPhoto = photos.find((photo) => photo.src === data.photo);
		if (data.eventId && !photos.some((photo) => photo.eventId === data.eventId && photo.src === data.photo)) {
			throw new Error(`[首页内容] ${data.id} 的 eventId 须匹配 photos.ts 中该照片的关联键`);
		}
		if (data.draft) continue;
		const body = entry.body.replace(/<!--[\s\S]*?-->/g, "").trim();
		const tokens = markdown.parse(body, {});
		const plain = tokens.flatMap((token) => token.children ?? [])
			.filter((token) => token.type === "text" || token.type === "code_inline").map((token) => token.content).join("");
		const emotion = sanitizeHtml(markdown.renderer.render(tokens, markdown.options, {}), {
			allowedTags: ["p", "em", "strong", "br", "code"], allowedAttributes: {},
		});
		if (!plain.trim()) {
			throw new Error(`[首页内容] 正式回忆 ${data.id} 缺少用户情绪正文`);
		}
		// Date and location can be inherited from the existing gallery record so
		// memories do not maintain a second, drifting copy of confirmed metadata.
		const date = data.date ?? galleryPhoto?.date;
		const location = data.location ?? galleryPhoto?.location;
		if (!data.photo || !data.alt || !date || !location || !size) {
			throw new Error(`[首页内容] 回忆 ${data.id} 缺少日期或地点，且没有匹配的线下返图记录`);
		}
		memories.push({ id: data.id, photo: data.photo, alt: data.alt, date,
			location, ...size, emotion });
		emotionTexts.push(plain);
	}
	if (memories.length) {
		const require = createRequire(import.meta.url);
		const fontkit = require("fontkit") as { openSync(path: string): { hasGlyphForCodePoint(code: number): boolean } };
		const font = fontkit.openSync(resolve(publicRoot, "fonts/zhimangxing/ZhiMangXing-Regular.ttf"));
		const plain = emotionTexts.join("");
		const missing = [...new Set([...plain].filter((char) => !/\s/.test(char) && !font.hasGlyphForCodePoint(char.codePointAt(0) ?? 0)))];
		if (missing.length) console.warn(`[首页字体] 以下字符使用系统字体回退：${missing.join(" ")}`);
	}
	return { now: now && !now.draft && (now.music || now.reading || now.thought) ? now : undefined, memories };
}
