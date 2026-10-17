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

1. 把照片放进 `public/photos/`，使用 `yymmdd_组合_地点_序号.webp` 命名，例如 `260904_IVE_Hongkong_01.webp`。同场照片加序号，下载目录中的原片保留不动。
2. 在 `src/data/photos.ts` 中添加条目，例如：

```ts
export const photos: FanPhoto[] = [
  {
    src: '/photos/ive/260904_IVE_Hongkong_01.webp',
    group: 'IVE', // 或 NMIXX
    alt: '260904_IVE_Hongkong_01',
    date: '2026-09-04',
    location: 'Hongkong',
    // 日期与地点使用本人确认的信息。
  },
];
```

相册支持团体筛选和点击放大。尚未提供照片时显示整理中的提示。

## 内容修改

- 名称、简介、主题色、头像、封面及社交链接：src/config.ts
- 首页欢迎语：src/components/FanWelcome.astro
- 文章：src/content/posts/，复用 Fuwari 原生 Markdown；追星手记 category 只填“线下”或“生日”，科研文章填“科研手记”。
- 科研手记模板：templates/research-note.md，复制并修改后再放进 src/content/posts/，不要直接把模板作为文章发布。
- 关于页面：src/content/spec/about.md
- 科研手记入口：src/pages/research.astro，按 category 自动收录；旧收藏入口重定向至科研手记。
- 专辑封面：src/data/albums.ts 与 public/images/albums/。简介区 Spotify、Threads、Instagram 均为 40×40 纯图标按钮；点击 Spotify 直接打开“我的专辑”九宫格，底部“打开 Spotify 主页”在新标签页跳转。无中间菜单、展开箭头或数量副标题；按 Esc、关闭图标或遮罩空白处关闭。
- 社交账号配置：src/data/social.ts；Threads、Instagram 直接在新标签页打开个人主页，Spotify 采用上述专辑弹层。
- 浅蓝毛玻璃配色与背景延伸：src/styles/baby-blue.css；页面使用浅蓝白色、淡紫渐变，顶部插图底部渐隐衔接，支持深色模式。原波点样式已移除。
- 顶部背景：public/images/background-3600.webp，由用户提供的 background-3600.png 生成 3600×3600 WebP 副本；原图保持不变。主题色已固定，历史浏览器配色不会覆盖新版主题。
- 首页标题为“欢迎来到Junnie的个人主页”，描述为“这里记录追星和科研日常”。原欢迎文章已删除；没有手记时首页仍显示欢迎区和团体卡片。

## 更新线上网站

将修改推送到 GitHub 的 main 分支后，还需实际发布现有 Cloudflare Worker；目前仅推送代码不会更新正式站。

- 构建命令：`pnpm build`
- 输出目录：`dist`
- Node.js 版本：22 或更新版本

现有 Cloudflare Workers 项目是 `fuwari`，配置见 `wrangler.jsonc`。如未启用 Git 自动部署，可在已登录 Cloudflare 的电脑上先运行 `pnpm build`，再运行 `npx wrangler@4 deploy --keep-vars`，发布到现有项目。

网站默认地址已设为 `https://home.wonyoung.xyz/`，用于 RSS、站点地图和分享链接。如果 Cloudflare 中已设置 `SITE_URL` 环境变量，请将其同步为该地址。

更新后检查首页、线下返图、追星手记的线下与生日分类、科研手记、Spotify 封面弹层、搜索及 RSS。现有域名解析无需因本次内容更新而修改。
