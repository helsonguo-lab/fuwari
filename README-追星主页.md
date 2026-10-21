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
- 安全边界回归：`pnpm security:check`（Node 内置断言，无测试依赖）
- 预览正式构建及搜索：`pnpm preview`

### 安全与发布维护（2026-10-18）

- 审计与精简记录：`docs/security-review-2026-10-18.md`；逐项依赖告警：`docs/security-dependencies-2026-10-18.md`。剩余构建工具告警不等于线上可利用漏洞，也不代表零风险。
- 保持 pnpm 11.25.0、冻结锁文件及 `allowBuilds` 许可。新版本默认等待 24 小时且禁止自动绕过；Vite 的 Rollup 暂固定为已过等待期的兼容修复版 4.64.7。
- 发布前顺序：冻结安装 → `pnpm security:check` → `pnpm check` → `pnpm build`（包含 Pagefind）→ `git diff --check` → 浏览器回归。CI 的 Node 22/24 共用同一检查流程。
- `worker/index.ts` 是 HTTPS 308、CSP、HSTS 等响应头的唯一入口；`wrangler.jsonc` 的 ASSETS 仍指向本站 `dist/`，不新增 Worker。所有资源请求经过现有 Worker，需计入 Worker invocation。
- `pnpm preview` 只预览静态产物；响应头兼容性应使用 `npm.cmd exec --yes --package=wrangler@4 -- wrangler dev --local`，发布后再核验正式域名。部署仍用现有 `wrangler deploy --keep-vars`，仅在当次获得授权后执行。
- Markdown 正文保留允许的格式、公式、代码和指令；源 HTML 的脚本、事件属性、危险 URL 将显示为转义文字或中和链接。GitHub 指令仅接受合法 `owner/repo`。不要靠 Markdown 注入脚本扩展功能。
- 无新增测试依赖；工作区 `work/` 的浏览器脚本和隔离 fixture 不属于网站，绝不能部署。真实回忆草稿仍保持隐藏。

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
- 手机地图下方场次入口按双列等宽排列，城市 / 团体与日期分两层；奇数个入口的最后一项通栏，保留双日场次完整日期和原详情关联。桌面地图标记与数据不变。

## 内容修改

- 名称、简介、主题色、头像、封面及社交链接：src/config.ts
- 浏览器标签页图标：`src/config.ts` 的 `favicon` 配置；蓝粉双色星星原图位于 `public/favicon/blue-pink-star.svg`，另有 32px PNG 和根目录 `public/favicon.ico`（含 16/32/48px）作为兼容格式。图标链接使用独立文件名或版本参数，避免沿用旧图标缓存；浅色和深色模式均使用同一图案。
- 首页欢迎语：src/components/FanWelcome.astro
- 文章：src/content/posts/，复用 Fuwari 原生 Markdown；追星手记 category 只填“线下”或“生日”，科研文章填“科研手记”。
- 科研随笔模板：templates/research-note.md（可直接复制到 src/content/posts/）；Obsidian 版本：templates/obsidian/科研随笔.md。
- 追星随笔模板：templates/fan-note.md（可直接复制到 src/content/posts/）；Obsidian 版本：templates/obsidian/追星随笔.md。
- 模板默认 draft: true，确认内容、日期和事实后再改为 false；完整说明见 templates/README.md。
- 关于页面：src/content/spec/about.md
- 科研手记入口：src/pages/research.astro，按 category 自动收录；旧收藏入口重定向至科研手记。
- 专辑封面：src/data/albums.ts 与 public/images/albums/。简介区 Spotify、Threads、Instagram 均为 44×44 纯图标按钮；点击 Spotify 直接打开“我喜欢的专辑”九宫格，底部“打开 Spotify 主页”在新标签页跳转。无中间菜单、展开箭头或数量副标题；按 Esc、关闭图标或遮罩空白处关闭。
- 社交账号配置：src/data/social.ts；Threads、Instagram 直接在新标签页打开个人主页，Spotify 采用上述专辑弹层。
- 浅蓝配色与背景延伸：src/styles/baby-blue.css；页面使用浅蓝白色、淡紫渐变，顶部插图底部渐隐衔接，支持深色模式。首页使用 `surface-home` 稳定表面，玻璃材质集中在导航、菜单和弹层；内页沿用原卡片。原波点样式已移除。
- 顶部背景：public/images/background-3600.webp，由用户提供的 background-3600.png 生成 3600×3600 WebP 副本；原图保持不变。主题色已固定，历史浏览器配色不会覆盖新版主题。
- 首页标题为“欢迎来到Junnie的个人主页”，描述为“这里记录追星和科研日常”。原欢迎文章已删除；没有手记时首页仍显示欢迎区、团体卡片和追星地图。
- 追星地图：src/components/FanMap.astro 与 src/data/fan-map.ts；照片与场次通过 photos.ts 中的 eventId 关联。

## Obsidian 写作模板（2026-10-21）

- 仓库源文件：`templates/obsidian/科研随笔.md`、`templates/obsidian/追星随笔.md`。
- Obsidian vault 的 `90templates/` 目录存放模板；模板使用普通属性，没有 `{{...}}` 占位符，日期用日期属性、草稿用复选框。
- vault 的 `60site/` 是指向 `src/content/posts/` 的本地目录链接；在 Obsidian 的 `60site` 中新建或编辑的笔记就是站点文章，不需要再复制。该目录已加入 Nutstore Sync 排除规则，站点内容由 Git 保留；不要删除或移动这个链接目录。
- 在 `60site` 新建笔记后执行“模板：插入模板”，直接修改属性面板里的标题、日期、描述、标签和分类；确认后取消 `draft` 勾选，再构建/发布。
- 科研随笔的 category 固定为 `科研手记`；追星随笔只能是 `线下` 或 `生日`。`60site` 是真实站点目录的链接，不要删除或移动；完整流程见 `templates/README.md`。

## 首页布局（2026-10-18 手机优先改版）

首页已按 `docs/需求文档.md` 改为手机优先的单列 Apple 风格布局，内页继续保留原侧栏、分类、标签和目录。

### 页面顺序

第一页：欢迎区（玉桂狗短插画 + 紧凑身份 / 欢迎语 / 两个入口 / 社交）→ 近况便签 → IVE / NMIXX 双卡 → 追星地图 → 文章列表 → 分页 →「分类与标签」折叠区 → 页脚。

第二页及以后：`layout="home-list"`，只显示文章、分页、「分类与标签」和页脚，不重复首屏模块、不显示侧栏。第一页判断、分页数据与文章排序不变。

### 布局状态与组件

- `src/pages/[...page].astro` 通过 `MainGridLayout layout="home|home-list"` 切换首页布局；内页不传 `layout`，保持默认双列侧栏。
- `MainGridLayout.astro` 把 `SideBar` 放进 `main#swup-container`，所以 Swup 站内切换时首页 / 内页的侧栏会一起替换；`#main-grid[data-layout]` 提供布局标记，`src/scripts/site-runtime.ts` 在 `page:view` 读取并同步 `body.layout-home` / `body.layout-home-list`。
- `Layout.astro` 只保留骨架、元信息、资源和首屏主题初始化；`src/styles/layout.css` 管布局几何，`baby-blue.css` 管主题/首页表面。`site-runtime.ts` 统一注册 Swup；`panels.ts` 管持久导航面板；`page-scrollbars.ts` 和 `photo-lightbox.ts` 的页面资源在替换前销毁、进入后重新创建，不把旧 Observer/DOM 引用留给缓存页面。
- 首页首屏使用 `FanWelcome.astro`：`Profile compact` 只显示头像 / 名称 / 简介，社交入口由 `ProfileLinks.astro` 统一提供；`MemoryStack.astro` 仍只在有正式回忆时渲染。
- `HomepageNow.astro`、`FanGroups.astro`、`FanMap.astro`、`PostCard.astro`、`Footer.astro` 使用稳定的 `surface-home` 表面，不再叠加大量毛玻璃；玻璃只集中在导航、菜单和既有弹层。
- `HomeArchiveDetails.astro` 在分页后提供原生 `<details>`「分类与标签」；`Categories.astro` / `Tags.astro` 新增 `compact` 形态，仍读取原分类 / 标签数据。
- 首页近况、双卡、地图、文章和「分类与标签」共享同一对齐线；文章卡片外框与地图同宽，正文在卡片内部限宽，避免长行阅读。
- `Navbar.astro` / `NavMenuPanel.astro` / `LightDarkSwitch.svelte`：手机导航高 56px，首页固定可见；主题切换放在手机菜单内，支持浅色 / 深色 / 跟随系统；搜索和菜单互斥，关闭态使用 `inert` 且不可 Tab 聚焦。桌面 ≥1024px 显示导航链接。
- `PostCard.astro` / `PostMeta.astro`：首页文章为紧凑行式卡片，标题、摘要、元数据和字数保留，箭头独立显示，不会盖住长标题；分页按钮为 44px 触控目标。
- 首页 banner 由同一张 `/images/background-3600.webp` 缩短为插画带，不重复加载第二张大图；首页第 2 页隐藏该插画带。

### 验证与证据

- `pnpm check`：0 errors、1 个既有 `_cssVar` hint。
- `pnpm build`：6 个页面，Pagefind 索引 5 个页面。
- 浏览器矩阵与交互检查：`work/check-apple-redesign.mjs`；隔离分页 / 回忆检查：`work/check-apple-fixture.mjs`。截图和报告在 `outputs/mobile-apple-*.png`、`outputs/apple-redesign-report.json`、`outputs/apple-fixture-report.json`。
- 正式回忆仍为草稿，未为本次改版虚构内容；真实照片与情绪文案到齐后再按原流程启用。

## 首页近况与精选回忆

模块只出现在首页第一页，顺序：欢迎区（身份 / 入口 / 社交）→ 近况便签 → IVE / NMIXX → 追星地图 → 文章 → 分页 →「分类与标签」。欢迎区与团体卡片已拆分为 `FanWelcome.astro` / `FanGroups.astro`。

### 日常近况：直接编辑 Markdown

- **唯一编辑入口：`src/content/homepage/now.md`**；完整注释模板在 `templates/homepage-now.md`。
- 内容全在 frontmatter：`updated: "YYYY-MM-DD"`、`draft`，可选 `music`、`reading`、`thought`。不解析正文栏目，不从聊天或组件里保留另一份近况。
- 音乐填写 `title`、`cover`，可选 `artist` / `note`；阅读填写 `type`（漫画 / 书籍 / 电影）、`title`、`cover`，可选 `note`。
- 音乐可填 `spotify: "https://open.spotify.com/track/歌曲ID"`，阅读可填 `douban: "https://book.douban.com/subject/条目ID/"`（电影使用 `movie.douban.com`）。填写后整行的封面 / 名称可点击，在新标签页打开作品详情；留空仍显示普通内容。构建会拒绝错误平台、非 HTTPS、非作品详情页或漫画 / 书籍误链电影的地址，不自动猜链接，也不拉取播放数据。
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
