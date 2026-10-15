import { socialProfiles } from "./data/social";
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
export const siteConfig: SiteConfig = {
	title: "Junnie的追星角落",
	subtitle: "IVE · NMIXX · 我的线下手记",
	lang: "zh_CN",
	themeColor: { hue: 300, fixed: false },
	banner: {
		enable: true,
		src: "/images/starlight.svg",
		position: "center",
		credit: { enable: false, text: "" },
	},
	toc: { enable: true, depth: 2 },
	favicon: [{ src: "/images/star.svg", sizes: "any" }],
};
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		{ name: "线下返图", url: "/gallery/" },
		{ name: "追星手记", url: "/archive/" },
		{ name: "心动收藏", url: "/collection/" },
		LinkPreset.About,
	],
};
export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar.svg",
	name: "Junnie",
	bio: "IVE & NMIXX ♡ 把喜欢带到现场，把心动留在照片里。",
	links: [
		...(socialProfiles.spotify
			? [
					{
						name: "Spotify",
						icon: "fa6-brands:spotify",
						url: socialProfiles.spotify,
					},
				]
			: []),
		...(socialProfiles.threads
			? [
					{
						name: "Threads",
						icon: "fa6-brands:threads",
						url: socialProfiles.threads,
					},
				]
			: []),
	],
};
export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
