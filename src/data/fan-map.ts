export type FanMapGroup = "IVE" | "NMIXX";

export type FanMapEvent = {
	/** 唯一标识；新增场次时不要复用已有 id。 */
	id: string;
	group: FanMapGroup;
	/** 巡演或粉丝演唱会的官方名称。 */
	tour: string;
	/** 地图标记和弹层中使用的简短名称。 */
	shortName: string;
	/** 城市名，显示在地图标记下方。 */
	city: string;
	/** 场馆名。 */
	venue: string;
	/** 到场日期，ISO 格式；连看多天写多个日期。 */
	dates: string[];
	/** 场馆经纬度：[经度, 纬度]。 */
	coordinates: [number, number];
	/**
	 * 对应 src/data/photos.ts 中照片的 eventId。
	 * 留空时，弹层显示“敬请期待”，不会凭空引用照片。
	 */
	photoEventId?: string;
	/**
	 * 标记相对真实坐标的偏移，单位为地图视口单位。
	 * 只用于同一城市的标记避让，真实位置仍以锚点和虚线为准。
	 */
	pinOffset?: [number, number];
	/**
	 * 新增场次但暂时不想在首页地图展示时设为 false。
	 * 默认展示；首页不会渲染任何“未来行程”占位。
	 */
	showOnHome?: boolean;
};

// 新增看过的场次：在下面数组中追加一条记录即可。
// 没有上传照片时省略 photoEventId，弹层会自动显示“敬请期待”。
// 需要关联照片时，在 photos.ts 中给对应照片设置相同的 eventId。
export const fanMapEvents: FanMapEvent[] = [
	{
		id: "ive-show-what-i-have-tokyo-2024",
		group: "IVE",
		tour: "IVE THE 1ST WORLD TOUR “SHOW WHAT I HAVE” IN JAPAN",
		shortName: "SHOW WHAT I HAVE",
		city: "东京",
		venue: "东京巨蛋",
		dates: ["2024-09-04"],
		coordinates: [139.7519, 35.7056],
	},
	{
		id: "ive-dive-into-ive-incheon-2026",
		group: "IVE",
		tour: "2026 IVE THE 4TH FAN CONCERT “DIVE into IVE”",
		shortName: "DIVE into IVE",
		city: "仁川",
		venue: "Inspire Arena",
		dates: ["2026-03-21"],
		coordinates: [126.4437, 37.4713],
	},
	{
		id: "ive-show-what-i-am-hk-2026",
		group: "IVE",
		tour: "IVE WORLD TOUR “SHOW WHAT I AM” IN HONG KONG",
		shortName: "SHOW WHAT I AM",
		city: "香港",
		venue: "AsiaWorld-Arena",
		dates: ["2026-09-04"],
		coordinates: [113.945, 22.321],
		photoEventId: "ive-hk-2026",
		pinOffset: [130, 35],
	},
	{
		id: "nmixx-mixx-lab-macao-2025",
		group: "NMIXX",
		tour: "NMIXX 2ND FAN CONCERT “NMIXX CHANGE UP : MIXX LAB” IN MACAO",
		shortName: "CHANGE UP : MIXX LAB",
		city: "澳门",
		venue: "The Londoner Arena",
		dates: ["2025-06-28"],
		coordinates: [113.562, 22.147],
		pinOffset: [-150, -20],
	},
	{
		id: "nmixx-zero-frontier-hk-2026",
		group: "NMIXX",
		tour: "NMIXX 1ST WORLD TOUR “EPISODE 1: ZERO FRONTIER” IN HONG KONG",
		shortName: "EPISODE 1: ZERO FRONTIER",
		city: "香港",
		venue: "AsiaWorld-Expo, Hall 10",
		dates: ["2026-07-25", "2026-07-26"],
		coordinates: [113.945, 22.321],
		photoEventId: "nmixx-hk-2026",
		pinOffset: [130, -110],
	},
];
