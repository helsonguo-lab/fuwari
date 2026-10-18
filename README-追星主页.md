# Junnie的追星角落

基于 Fuwari 的个人粉丝主页，记录 IVE、NMIXX 和 Junnie 拍摄的线下照片。

- 域名：https://home.wonyoung.xyz/
- 仓库：https://github.com/helsonguo-lab/fuwari
- 托管：Cloudflare

## 本地预览

需要 Node.js 22 或更新版本及 pnpm 11.25.0（与 packageManager、既有 allowBuilds 配置一致）。

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

## 追星地图

首页“追星地图”栏目由 `src/components/FanMap.astro` 渲染，数据在 `src/data/fan-map.ts`，使用本地绘制的东亚地图，不请求在线地图瓦片。地图轮廓为 Natural Earth 公有领域数据的简化投影，已内联为 SVG，不增加运行时依赖。

- 每个场次一条 `fanMapEvents` 记录：官方巡演名、城市、场馆、日期、经纬度。
- 想在地图弹层显示某场的一张照片时，给该场次设置 `photoEventId`，并在 `src/data/photos.ts` 给对应照片加上相同的 `eventId`。弹层取该场次的第一张照片。
- 没有照片的场次不需要额外处理，弹层会自动显示“敬请期待”。
- 同城场次使用 `pinOffset` 做标记避让，虚线仍指向真实场馆位置。
- 后续新增看过的场次：直接追加记录即可。暂时不想在首页展示时设置 `showOnHome: false`；首页不会展示未来行程或占位条目。
- 修改场次数据后重新构建即可，无需安装新的地图依赖。

## 内容修改

- 名称、简介、主题色、头像、封面及社交链接：src/config.ts
- 浏览器标签页图标：`src/config.ts` 的 `favicon` 配置；蓝粉双色星星原图位于 `public/favicon/blue-pink-star.svg`，另有 32px PNG 和根目录 `public/favicon.ico`（含 16/32/48px）作为兼容格式。图标链接使用独立文件名或版本参数，避免沿用旧图标缓存；浅色和深色模式均使用同一图案。
- 首页欢迎语：src/components/FanWelcome.astro
- 文章：src/content/posts/，复用 Fuwari 原生 Markdown；追星手记 category 只填“线下”或“生日”，科研文章填“科研手记”。
- 科研手记模板：templates/research-note.md，复制并修改后再放进 src/content/posts/，不要直接把模板作为文章发布。
- 关于页面：src/content/spec/about.md
- 科研手记入口：src/pages/research.astro，按 category 自动收录；旧收藏入口重定向至科研手记。
- 专辑封面：src/data/albums.ts 与 public/images/albums/。简介区 Spotify、Threads、Instagram 均为 40×40 纯图标按钮；点击 Spotify 直接打开“我的专辑”九宫格，底部“打开 Spotify 主页”在新标签页跳转。无中间菜单、展开箭头或数量副标题；按 Esc、关闭图标或遮罩空白处关闭。
- 社交账号配置：src/data/social.ts；Threads、Instagram 直接在新标签页打开个人主页，Spotify 采用上述专辑弹层。
- 浅蓝毛玻璃配色与背景延伸：src/styles/baby-blue.css；页面使用浅蓝白色、淡紫渐变，顶部插图底部渐隐衔接，支持深色模式。原波点样式已移除。
- 顶部背景：public/images/background-3600.webp，由用户提供的 background-3600.png 生成 3600×3600 WebP 副本；原图保持不变。主题色已固定，历史浏览器配色不会覆盖新版主题。
- 首页标题为“欢迎来到Junnie的个人主页”，描述为“这里记录追星和科研日常”。原欢迎文章已删除；没有手记时首页仍显示欢迎区、团体卡片和追星地图。
- 追星地图：src/components/FanMap.astro 与 src/data/fan-map.ts；照片与场次通过 photos.ts 中的 eventId 关联。

## 首页近况与精选回忆

模块只出现在首页第一页，顺序：欢迎语与入口 → 近况便签 → IVE / NMIXX → 地图 → 文章。欢迎区与团体卡片已拆分为 `FanWelcome.astro` / `FanGroups.astro`。

### 日常近况：直接编辑 Markdown

- **唯一编辑入口：`src/content/homepage/now.md`**；完整注释模板在 `templates/homepage-now.md`。
- 内容全在 frontmatter：`updated: "YYYY-MM-DD"`、`draft`，可选 `music`、`reading`、`thought`。不解析正文栏目，不从聊天或组件里保留另一份近况。
- 音乐填写 `title`、`cover`，可选 `artist` / `note`；阅读填写 `type`（漫画 / 书籍 / 电影）、`title`、`cover`，可选 `note`。
- 封面须使用本地 `/images/now/` 或其他已有 `/images/` 路径；同封面可直接复用 `/images/albums/`。新封面用用户提供或确认的素材，生成网页副本、保留原件并记录来源。
- 日期由用户维护，只显示 `YYYY.MM.DD`，绝不用构建时间替代。草稿、三栏全空时整块隐藏，空白栏目不渲染；有音乐 / 阅读项时名称与真实封面不可缺。
- 改为 `draft: false` 且填好素材后重新构建即可显示，不用改组件。

### 精选回忆：一张照片一份 Markdown

- `src/content/memories/*.md`；模板：`templates/memory.md`。`first-memory.md` 目前仅为无素材草稿，不是正式回忆。
- 正式条目必填唯一 `id`、`photo`、`alt` 和非空情绪正文。`date` / `location` / `group` 可省略，会按相同照片路径自动同步 `src/data/photos.ts` 中已确认的线下返图日期、地点和团体；照片没有线下记录时构建会报错，不会生成空元数据。`eventId` 仍可选。
- 复用 `/photos/` 返图路径，不将所有相册照片自动转为回忆；`eventId` 匹配 `photos.ts` 中该照片的关联键，经地图 `photoEventId` 对应，不直接填地图场次 id。
- 正文支持段落、自然换行、强调和行内代码，不执行 HTML；长文案可在白相纸下边框内部滚动。志莽行书仅用于情绪正文，完整字体、OFL、来源在 `public/fonts/zhimangxing/`。
- 0 条隐藏入口；1 条无翻页 / 手势；2 条只有两张相纸。每次打开洗牌，轮内无重复，完整看完按队列循环。按钮和左右滑动都执行抽出 → 换层 → 送底；短拖 / 取消回弹。
- 使用原生中央 dialog，支持 Escape、关闭按钮、遮罩、焦点 / 滚动恢复、Swup 清理与减少动画。图片 / 字体仅在打开后按需加载，最多预载下一张图；图片失败仍可翻动和关闭。

### 每次同步网站都执行

1. 读最新 `now.md` 和所有正式回忆文件，检查 Git 状态；不使用旧聊天内容或硬编码副本。
2. 校验必填字段、日期、唯一 ID、本地图片及 eventId；`getHomepageContent()` 在每次构建读取 Astro 内容集合，Sharp 检查图片，fontkit 检查正式情绪字符，缺字警告并使用系统字体回退。
3. 运行 `pnpm check`、`pnpm build`、`git diff --check`，验证首页、弹层、触屏交互与原功能。回忆的 `date` / `location` / `group` 留空时，按相同照片路径自动读取线下返图记录。
4. **仅当本次请求授权发布时**提交 / 推送 / 发布现有 Worker，再查正式域名、记录版本与交接。自动读取不代表定时任务或不构建就实时更新。

2026-10-18 已按用户提供的内容正式启用近况：最近在听 `drop dead`（Olivia Rodrigo，官方专辑封面）、最近在看 `来自深渊`（漫画第 1 卷官方封面）、最近在想 `NMIXX回归大发`；封面来源与哈希见 `public/images/now/SOURCES.md`。精选回忆仍没有用户确认的照片情绪原话，因此保持草稿并隐藏入口，不能为演示发布虚构感受。选型、固定版本、许可与适配理由见 `docs/homepage-modules.md` / `THIRD-PARTY-NOTICES.md`。

## 更新线上网站

将修改推送到 GitHub 的 main 分支后，还需实际发布现有 Cloudflare Worker；目前仅推送代码不会更新正式站。

- 构建命令：`pnpm build`
- 输出目录：`dist`
- Node.js 版本：22 或更新版本

现有 Cloudflare Workers 项目是 `fuwari`，配置见 `wrangler.jsonc`。如未启用 Git 自动部署，可在已登录 Cloudflare 的电脑上先运行 `pnpm build`，再运行 `npx wrangler@4 deploy --keep-vars`，发布到现有项目。

网站默认地址已设为 `https://home.wonyoung.xyz/`，用于 RSS、站点地图和分享链接。如果 Cloudflare 中已设置 `SITE_URL` 环境变量，请将其同步为该地址。

更新后检查首页、线下返图、追星手记的线下与生日分类、科研手记、Spotify 封面弹层、搜索及 RSS。现有域名解析无需因本次内容更新而修改。
