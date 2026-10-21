import { z } from "astro:content";
import { isOfficialReadingUrl } from "./homepage-links";

// Whitespace-only optional fields are absent, not empty UI rows.
const blankToUndefined = (value: unknown) => value == null ? undefined : typeof value === "string" ? value.trim() || undefined : value;
const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const text = z.string().trim().min(1, "请填写非空文字");
const localImage = text.refine(
	// biome-ignore lint/suspicious/noControlCharactersInRegex: URL control characters must be rejected at this security boundary.
	(value) => /^\/(photos|images)\/[^%?#\\\u0000-\u0020]+$/.test(value) && !value.slice(1).split("/").some((part) => part === "." || part === ".." || !part),
	"图片须使用 public 下的 /photos/ 或 /images/ 本地路径",
);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期须为带引号的 YYYY-MM-DD")
	.refine((value) => {
		const parsed = new Date(`${value}T00:00:00Z`);
		return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
	}, "日期无效");
const optionalDate = z.preprocess(blankToUndefined, date.optional());
const optionalImage = z.preprocess(blankToUndefined, localImage.optional());
const optionalServiceLink = (hosts: string[], path: RegExp) => z.preprocess(blankToUndefined,
	text.url("请填写完整链接").refine((value) => {
		try {
			const link = new URL(value);
			return link.protocol === "https:" && hosts.includes(link.hostname) &&
				!link.username && !link.password && !link.port && path.test(link.pathname);
		} catch {
			return false;
		}
	}, "请填写对应平台的 HTTPS 作品详情页链接").optional());
const spotifyLink = optionalServiceLink(["open.spotify.com"], /^\/(?:intl-[a-z]{2}\/)?track\/[A-Za-z0-9]{22}\/?$/);
const doubanLink = optionalServiceLink(["book.douban.com", "movie.douban.com"], /^\/subject\/\d+\/?$/);
const officialReadingLink = z.preprocess(blankToUndefined,
	text.url("请填写完整链接").refine(isOfficialReadingUrl, "请填写已支持的出版社官方作品页 HTTPS 链接").optional());

export const homepageSchema = z.object({
	updated: optionalDate,
	draft: z.boolean().default(true),
	music: z.preprocess(blankToUndefined, z.object({ title: text, cover: localImage, artist: optionalText, note: optionalText, spotify: spotifyLink }).optional()),
	reading: z.preprocess(blankToUndefined, z.object({ type: z.enum(["漫画", "书籍", "电影"]), title: text, cover: localImage, note: optionalText, douban: doubanLink, official: officialReadingLink }).optional()),
	thought: optionalText,
}).superRefine((data, ctx) => {
	if (!data.draft && (data.music || data.reading || data.thought) && !data.updated) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["updated"], message: "正式近况须填写日期" });
	}
	if (data.reading?.douban) {
		const expectedHost = data.reading.type === "电影" ? "movie.douban.com" : "book.douban.com";
		if (!data.reading.douban.startsWith(`https://${expectedHost}/`)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reading", "douban"], message: "漫画 / 书籍请链接豆瓣读书，电影请链接豆瓣电影" });
		}
	}
});

export const memorySchema = z.object({
	id: text.regex(/^[a-z0-9][a-z0-9-]*$/, "id 请使用小写字母、数字和连字符"),
	draft: z.boolean().default(true),
	photo: optionalImage,
	alt: optionalText,
	date: optionalDate,
	location: optionalText,
	group: z.enum(["IVE", "NMIXX"]).optional(),
	eventId: optionalText,
}).superRefine((data, ctx) => {
	if (data.draft) return;
	// date / location / group may be inherited from the matching gallery photo.
	// homepage-content.ts rejects published entries that cannot resolve them.
	for (const field of ["photo", "alt"] as const) {
		if (!data[field]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: "正式回忆必填" });
	}
});
