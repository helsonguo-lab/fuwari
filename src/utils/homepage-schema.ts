import { z } from "astro:content";

// Whitespace-only optional fields are absent, not empty UI rows.
const blankToUndefined = (value: unknown) => value == null ? undefined : typeof value === "string" ? value.trim() || undefined : value;
const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const text = z.string().trim().min(1, "请填写非空文字");
const localImage = text.refine(
	(value) => /^\/(photos|images)\/[^?#\\\u0000-\u001f]+$/.test(value) && !value.split("/").includes(".."),
	"图片须使用 public 下的 /photos/ 或 /images/ 本地路径",
);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期须为带引号的 YYYY-MM-DD")
	.refine((value) => {
		const parsed = new Date(`${value}T00:00:00Z`);
		return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
	}, "日期无效");
const optionalDate = z.preprocess(blankToUndefined, date.optional());
const optionalImage = z.preprocess(blankToUndefined, localImage.optional());

export const homepageSchema = z.object({
	updated: optionalDate,
	draft: z.boolean().default(true),
	music: z.preprocess(blankToUndefined, z.object({ title: text, cover: localImage, artist: optionalText, note: optionalText }).optional()),
	reading: z.preprocess(blankToUndefined, z.object({ type: z.enum(["漫画", "书籍", "电影"]), title: text, cover: localImage, note: optionalText }).optional()),
	thought: optionalText,
}).superRefine((data, ctx) => {
	if (!data.draft && (data.music || data.reading || data.thought) && !data.updated) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["updated"], message: "正式近况须填写日期" });
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
