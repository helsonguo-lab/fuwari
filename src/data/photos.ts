export type FanPhoto = {
	src: string;
	group: "IVE" | "NMIXX";
	alt: string;
	event?: string;
	date?: string;
	location?: string;
};

// 将照片放到 public/photos/，然后添加对应条目。日期与地点可不填。
// 示例格式：{ src: '/photos/your-photo.webp', group: 'IVE', alt: '照片说明' }
export const photos: FanPhoto[] = [];
