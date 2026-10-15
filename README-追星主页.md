# Junnie的追星角落

基于 Fuwari 的个人粉丝主页，记录 IVE、NMIXX 和 Junnie 拍摄的线下照片。

- 域名：https://home.wonyoung.xyz/
- 仓库：https://github.com/helsonguo-lab/fuwari
- 托管：Cloudflare

## 本地预览

需要 Node.js 22 或更新版本及 pnpm。

- 安装依赖：`pnpm install --frozen-lockfile`
- 本地预览：`pnpm dev`
- 正式构建：`pnpm build`，静态文件位于 dist 文件夹。
- 检查代码：`pnpm check`
- 预览正式构建及搜索：`pnpm preview`

## 添加照片

1. 把照片放进 `public/photos/`，建议使用经过压缩的 JPG 或 WebP，保留原片作为备份。
2. 在 `src/data/photos.ts` 中添加条目，例如：

```ts
export const photos: FanPhoto[] = [
  {
    src: '/photos/ive-001.webp',
    group: 'IVE', // 或 NMIXX
    alt: '为照片填写一段说明',
    // event、date、location 均可不填；有准确资料时再添加。
  },
];
```

相册支持团体筛选和点击放大。尚未提供照片时显示整理中的提示。

## 内容修改

- 名称、简介、主题色、头像、封面及社交链接：src/config.ts
- 首页欢迎语：src/components/FanWelcome.astro
- 追星日记：src/content/posts/
- 关于页面：src/content/spec/about.md
- 收藏链接：src/data/collection.ts
- Spotify、Threads 个人主页链接：src/data/social.ts，填好后自动在头像简介下显示图标。

## 更新线上网站

将修改推送到 Cloudflare 所关联的 GitHub 生产分支。如果已启用自动部署，Cloudflare 会拉取代码并更新网站。

- 构建命令：`pnpm build`
- 输出目录：`dist`
- Node.js 版本：22 或更新版本

现有 Cloudflare Workers 项目是 `fuwari`，配置见 `wrangler.jsonc`。如未启用 Git 自动部署，可在已登录 Cloudflare 的电脑上先运行 `pnpm build`，再运行 `npx wrangler@4 deploy --keep-vars`，发布到现有项目。

网站默认地址已设为 `https://home.wonyoung.xyz/`，用于 RSS、站点地图和分享链接。如果 Cloudflare 中已设置 `SITE_URL` 环境变量，请将其同步为该地址。

更新后检查首页、线下返图、追星手记、收藏、搜索及 RSS。现有域名解析无需因本次内容更新而修改。
