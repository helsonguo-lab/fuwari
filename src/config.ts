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
	themeColor: { hue: 233, fixed: true },
	banner: {
		enable: true,
		src: "/images/background-3600.webp",
		position: "center",
		credit: { enable: false, text: "" },
	},
	toc: { enable: true, depth: 2 },
	favicon: [{ src: "/images/baby-blue-star.svg", sizes: "any" }],
};
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		{ name: "线下返图", url: "/gallery/" },
		{ name: "科研手记", url: "/research/" },
		{ name: "追星手记", url: "/archive/" },
		LinkPreset.About,
	],
};
export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar-19ba4ef73d94.webp",
	name: "Junnie",
	bio: "芙4 & 爻6，iz*one & ive & nmixx",
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
		...(socialProfiles.instagram
			? [
					{
						name: "Instagram",
						icon: "fa6-brands:instagram",
						url: socialProfiles.instagram,
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
