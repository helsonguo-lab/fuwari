export type FanPhoto = {
	src: string;
	group: "IVE" | "NMIXX";
	alt: string;
	event?: string;
	/** 对应 src/data/fan-map.ts 中的场次 id，用于首页追星地图。 */
	eventId?: string;
	date?: string;
	location?: string;
	width?: number;
	height?: number;
};

// 网页照片命名：yymmdd_组合_地点_序号.webp；日期与地点由本人确认。
// 示例格式：{ src: '/photos/your-photo.webp', group: 'IVE', alt: '照片说明' }
export const photos: FanPhoto[] = [
	{
		src: "/photos/ive/260904_IVE_Hongkong_01.webp",
		group: "IVE",
		alt: "260904_IVE_Hongkong_01",
		eventId: "ive-hk-2026",
		date: "2026-09-04",
		location: "Hongkong",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/ive/260904_IVE_Hongkong_02.webp",
		group: "IVE",
		alt: "260904_IVE_Hongkong_02",
		eventId: "ive-hk-2026",
		date: "2026-09-04",
		location: "Hongkong",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/ive/260904_IVE_Hongkong_03.webp",
		group: "IVE",
		alt: "260904_IVE_Hongkong_03",
		eventId: "ive-hk-2026",
		date: "2026-09-04",
		location: "Hongkong",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/ive/260904_IVE_Hongkong_04.webp",
		group: "IVE",
		alt: "260904_IVE_Hongkong_04",
		eventId: "ive-hk-2026",
		date: "2026-09-04",
		location: "Hongkong",
		width: 1688,
		height: 3000,
	},
	{
		src: "/photos/nmixx/260726_NMIXX_Hongkong_01.webp",
		group: "NMIXX",
		alt: "260726_NMIXX_Hongkong_01",
		eventId: "nmixx-hk-2026",
		date: "2026-07-26",
		location: "Hongkong",
		width: 1440,
		height: 1920,
	},
	{
		src: "/photos/nmixx/260725_NMIXX_Hongkong_02.webp",
		group: "NMIXX",
		alt: "260725_NMIXX_Hongkong_02",
		eventId: "nmixx-hk-2026",
		date: "2026-07-25",
		location: "Hongkong",
		width: 1366,
		height: 1821,
	},
	{
		src: "/photos/nmixx/260725_NMIXX_Hongkong_03.webp",
		group: "NMIXX",
		alt: "260725_NMIXX_Hongkong_03",
		eventId: "nmixx-hk-2026",
		date: "2026-07-25",
		location: "Hongkong",
		width: 1502,
		height: 2003,
	},
	{
		src: "/photos/nmixx/260726_NMIXX_Hongkong_04.webp",
		group: "NMIXX",
		alt: "260726_NMIXX_Hongkong_04",
		eventId: "nmixx-hk-2026",
		date: "2026-07-26",
		location: "Hongkong",
		width: 2160,
		height: 2880,
	},
	{
		src: "/photos/nmixx/260726_NMIXX_Hongkong_05.webp",
		group: "NMIXX",
		alt: "260726_NMIXX_Hongkong_05",
		eventId: "nmixx-hk-2026",
		date: "2026-07-26",
		location: "Hongkong",
		width: 3000,
		height: 1688,
	},
];
