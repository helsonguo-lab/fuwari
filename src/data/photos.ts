export type FanPhoto = {
	src: string;
	group: "IVE" | "NMIXX";
	alt: string;
	event?: string;
	date?: string;
	location?: string;
	width?: number;
	height?: number;
};

// 将照片放到 public/photos/，然后添加对应条目。日期与地点可不填。
// 示例格式：{ src: '/photos/your-photo.webp', group: 'IVE', alt: '照片说明' }
export const photos: FanPhoto[] = [
	{
		src: "/photos/ive/ive-5bdd3fd8a34b.webp",
		group: "IVE",
		alt: "IVE 线下现场 · 01",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/ive/ive-cb80aaecab7b.webp",
		group: "IVE",
		alt: "IVE 线下现场 · 02",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/ive/ive-98a7c199815a.webp",
		group: "IVE",
		alt: "IVE 线下现场 · 03",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/nmixx/nmixx-56bc484c8a25.webp",
		group: "NMIXX",
		alt: "NMIXX 线下现场 · 01",
		width: 1440,
		height: 1920,
	},
	{
		src: "/photos/nmixx/nmixx-e86db013da78.webp",
		group: "NMIXX",
		alt: "NMIXX 线下现场 · 02",
		width: 1366,
		height: 1821,
	},
	{
		src: "/photos/nmixx/nmixx-c65fb8f41413.webp",
		group: "NMIXX",
		alt: "NMIXX 线下现场 · 03",
		width: 1502,
		height: 2003,
	},
	{
		src: "/photos/nmixx/nmixx-2d84554780f3.webp",
		group: "NMIXX",
		alt: "NMIXX 线下现场 · 04",
		width: 2160,
		height: 2880,
	},
	{
		src: "/photos/nmixx/nmixx-0750793d8786.webp",
		group: "NMIXX",
		alt: "NMIXX 线下现场 · 05",
		width: 3000,
		height: 1688,
	},
];
