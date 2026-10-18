# 安全审计与结构精简（2026-10-18）

## 范围与基线

- 依据工作区 `docs/需求文档.md`；基线提交 `fa97e42`，开始时工作树干净。保留外观、真实内容、维护入口、Astro/Svelte/Tailwind/Swup 和现有 Worker。
- 先读代码、生成生产产物，再低频核验正式域名。仅测试本站；不进行压力、爆破或第三方测试；无登录、上传、数据库或在线内容写入接口，相关后台测试不适用。
- 基线完整构建：6 页，Pagefind 5 页 / 259 words。机器证据在工作区 `outputs/security-*`，不作为网站资源发布。
- `pnpm audit` 返回 219 条告警（4 critical / 107 high / 88 moderate / 20 low）；这不是 219 处本站可利用漏洞。逐项版本、条件、建议及后续处置单独记录，不能将静态站的构建依赖误判为在线服务。

## 第一阶段：发现及处理计划（只读审计）

| ID / 等级 | 位置、触发条件、影响、复现依据 | 建议 |
| --- | --- | --- |
| S-01 / 中，需内容写入权限 | 文章 JSON-LD 使用原始 JSON.stringify；元数据包含 `</script><script>…` 时可提前闭合，产生额外脚本。现有正式文章没有该输入，无访客提交入口。 | 在 JSON 序列化边界转义 `<`，隔离构建验证 |
| S-02 / 中，需内容写入权限 | GitHub 指令只要求 repo 含 `/`，配置可含引号并进入 fetch 的脚本文本；当前正文没有使用此指令，不能称线上已发生攻击。第三方描述已使用 innerText，不是 HTML 直出。 | 严格 owner/repo 白名单、编码脚本值、限制头像 HTTPS 来源、补 rel |
| S-03 / 防御加固 | Pagefind 本地生成索引 → item.data → 搜索摘要 `{@html}`，结果 URL 无独立校验。搜索词只传给 Pagefind，未发现当前内容可直接通过查询词实现 XSS。 | 摘要仅保留文字和 mark，高亮不丢失；结果仅限本站；本地恶意响应测试 |
| S-04 / 低，本地内容边界 | 图片路径 schema 拒绝明文 `..`，但未检查编码点段、URL 归一化和真实文件路径（符号链接）。 | schema 拒绝编码/点段；解码图片前 realpath 约束到允许目录 |
| S-05 / 加固 | 响应头不能仅由本地缺少 `_headers` 判定；以正式域名基线实测 JSON 为证。 | 使用现有静态资源 `_headers`，兼容 CSP、本域 HSTS，不加子域/preload |
| S-06 / 依赖与发布 | 依赖扫描含大量仅构建/开发工具；CI 的 astro build 未生成 Pagefind；Biome job 未显式最小权限且使用 latest。 | 优先兼容修复，冻结安装，完整构建纳入 CI，固定工具版本 |

## HTML 直出与信任边界

1. Markdown 正文：仅受版本控制的站主内容；无网络 Markdown/访客投稿。新增 `remark-content-safety.mjs` 在公式/代码/指令生成前检查源 HTML 和内联/引用链接：危险协议中和为 `#`，脚本、事件、srcdoc、非白名单标签/属性转成文本；允许的正文 HTML、公式和代码不变。若以后增加投稿，仍须另行设计完整净化与发布审核，不可把静态站升级为在线不可信 HTML 服务。
2. JSON-LD：站主元数据仍必须脚本安全编码，不能依赖“内容可信”跳过边界转义。
3. 回忆 emotion：markdown-it zero 模式，html:false，仅段落/强调/换行/行内代码，再经 sanitize-html 白名单且无属性；保留双重防护。
4. 地图 landPaths：本地固定 Natural Earth 派生 SVG 路径常量，不读取 URL、第三方响应或用户输入。
5. 搜索：本地生产 Pagefind 索引，额外约束到文字/mark 和本站路径；标题由 Svelte 文本插值。
6. RSS：受控 Markdown → 无原始 HTML 的 markdown-it → sanitize-html，XML 交由修复版本 RSS 序列化；不含近况、回忆或草稿文章。

## 第一阶段：结构问题与候选清单

| 候选 | 证据 / 决策 |
| --- | --- |
| Layout.astro 浏览器脚本 | 布局状态、面板、滚动/公式、PhotoSwipe 混合；拆为明确职责模块，Swup 单一注册入口；首屏主题初始化留在布局 |
| 公式 IntersectionObserver | 每次 content:replace 新建且未 disconnect；为页面资源增加清理，不在缓存返回时重复套容器 |
| 滚动元素引用 | 初次获取的 TOC 在 Swup 后可能指向旧 DOM；刷新查询，定时器在下一次访问时取消 |
| Search.svelte | 事件监听/超时无卸载；异步结果可能在清空/后续输入后回写。增加销毁清理和请求序号 |
| 对话框 | AlbumShelf / FanMap / memory-stack 已使用自定义元素 + AbortController；保留不同焦点规则，不造通用弹层框架 |
| 样式职责 | global.css/variables.styl 为基础，baby-blue.css 为主题和首页，组件局部样式保持；Layout 中首页壳样式可原样移至主题文件，不改视觉值 |
| 历史注释代码 | Layout 中已注释的旧字体预加载与 Astro 3.2.4 flicker workaround 无执行路径，可删除 |
| 重复文章 render | 同页 entry.render 调用两次可合并 |
| 重复草稿过滤 | content-utils 三个入口共享同一可见性函数，保留开发可看草稿/生产排除约定 |
| 旧背景、原图、字体、许可证、模板 | 有历史/来源维护用途，全部保留，不因当前未引用而删资源 |
| 插件/依赖 | Markdown 指令属于维护接口，当前未用不等于可删；暂不删除依赖或跨大版本迁移 |

## 验收与发布记录

实施、复测、剩余风险、体积与发布版本在完成各阶段后追加；未执行项不计为通过。

### 第二阶段（安全修复批次）

- JSON-LD 脚本安全 JSON；GitHub repo 格式白名单、头像 HTTPS 域白名单和新窗口 rel；搜索改为文字/mark 的 Svelte 转义渲染、本站链接白名单，清理异步竞态及卸载资源；图片 schema 与 realpath 双边界检查。
- 兼容更新：Astro 5.13.10 → 5.18.2（仍为 5），Svelte 5.39.8 → 5.57.2，sanitize-html 2.17.0 → 2.18.1，markdown-it 14.1.0 → 14.3.3，RSS 4.0.14 → 4.0.19；无框架大版本迁移。pnpm 11.25.0 冻结安装成功，安装脚本许可仍仅原 allowBuilds 四项。
- 用无网络的 Node 版本检查替代 preinstall 的未固定 npx helper。Actions 保持 SHA 固定、显式只读权限、checkout 不保留凭据、Biome 版本与仓库一致；Node 22/24，生产构建包含 Pagefind 并检查索引文件。
- 线上基线 HTTP 实测 200，未重定向。为同时覆盖 HTTP 和静态 404，在现有 Worker 增加一个轻量包装层（ASSETS 仍为原 dist），统一 308 HTTPS 和浏览器响应头，无新增 Worker/域名。代价是请求经过 Worker invocation，不再完全绕过 Worker 执行；策略只有这一份，避免与 _headers 两处漂移。
- CSP 第一阶段允许现有内联脚本/样式；不含 unsafe-eval，仅允许本站脚本和 Cloudflare beacon，允许现有 Iconify/GitHub 请求，禁止 object、外站嵌入、base，限制 form-action。此 CSP 不是阻断所有内联 XSS 的严格 CSP；后续须配合 Swup 的脚本执行机制评估 hash/nonce，不虚称已消除 unsafe-inline。HSTS 仅本域，无 includeSubDomains/preload。
- 安全批次类型检查 0 errors/0 warnings/1 既有 hint；完整构建 6 页，Pagefind 5 页。原版两处脚本注入在隔离浏览器/VM 成功复现，修复后无执行且内容可 round-trip；真实 Pagefind 高亮、恶意摘要/链接、异步先后顺序/清空均复测通过（`outputs/security-browser-security-stage.json`）。
- 34 个可达历史提交、当前文本及产物模式扫描未发现凭据候选；9 张公开照片无 EXIF/XMP/IPTC。线上 `.env`、`.git/config`、`src/config.ts` 均 404。公开来源/许可证 Markdown 是有意发布的维护资料，不算源码泄漏；`.gitkeep` 是无敏感内容占位文件，不删除。

### 第二阶段补充复测与依赖处置

- 正文安全使用已存在的 sanitize-html 解析器解码 HTML 属性，配合 remark AST 转义/中和，不另写 Markdown/HTML 解析器。实际隔离构建验证 script、onerror、实体编码 javascript、Markdown 直接/引用链接和 iframe/srcdoc；允许 HTML、公式、代码、GitHub 指令保留。
- 图片的 8 种路径输入（明文/编码/双编码点段、单点段、反斜线、协议相对地址、查询、片段）与真实目录 junction 越界均被拒绝构建。正式源文件、public 和草稿没有为测试改动；安全 fixture 使用单独 public 副本，绝不部署。
- CSP 实际 Worker 预览发现 Pagefind WASM 以及打包后的 data 字体被初版策略拦截；已补最小的 `wasm-unsafe-eval`（不是 JS 的 unsafe-eval）与 font-src data:，复测搜索和 6 条内容路由无 CSP 违规（`security-policy-local.json`）。初次失败保留为 `security-policy-initial.json`，不计为通过。
- 间接依赖只在各上游既有兼容范围内更新，无强行跨主版本覆盖。pnpm 自动生成的发布年龄例外已移除，启用 24 小时 strict gate；`vite>rollup` 固定 4.64.7，避免刚发布的各平台二进制通过例外绕过。冻结安装及 peer 检查通过，allowBuilds 四项不变。
- 扫描由 219 条降为 **40 条（2 critical / 22 high / 12 moderate / 4 low）**。逐项旧/现版本、修复范围、触发条件与处置见 [依赖报告](security-dependencies-2026-10-18.md)。剩余项是静态框架/构建/开发工具约束，未发现能由现有访客入口触发的高风险链路；不将其标作已修复或零漏洞，不为清零扫描迁移 Astro 大版本。
- 仓库新增无依赖 `pnpm security:check`，覆盖 JSON-LD round-trip、正文协议/HTML、GitHub 指令、Worker 308/404/响应头和包管理器版本；CI 合并重复的 check/build job，配置为在 Node 22/24 完整运行。安全脚本另以本机 Node 22 实际复测通过；未声称已取得远端 CI 成功记录。

### 第三阶段：结构精简结果

| 职责 | 当前入口与生命周期 |
| --- | --- |
| 页面骨架/首屏 | Layout.astro 保留 meta、资源、首屏主题，不再混合交互脚本；历史不可执行 workaround 删除 |
| 导航/布局/滚动 | site-runtime.ts，文档生命周期只注册一次；每次 page:view 从新 DOM 同步布局/滚动，下一次 visit:start 取消上一轮定时器 |
| 面板 | panels.ts，持久导航只绑定一次，委托事件覆盖后挂载 Svelte；observer 同步 aria/inert；离开时关闭，保留 Escape 焦点规则 |
| 公式滚动条 | page-scrollbars.ts，body scrollbar 初始化一次；每页 observer/实例在替换前 disconnect/destroy，并拆除生成包装层 |
| 图片查看 | photo-lightbox.ts，每页单实例，替换前 destroy，进入后重建；沿用原 SVG、PhotoSwipe 和选项 |
| 样式 | layout.css 单独负责壳几何；baby-blue.css 保留主题/首页表面；组件局部样式不动，数值未改 |
| 可见内容 | content-utils.ts 的三个草稿过滤入口统一；文章 entry.render 合为一次；原五个维护入口不变 |

- 无资源或直接依赖删除：旧图、原图、字体、许可证、模板与 Markdown 插件均有维护用途，没有凭文本搜索盲删。
- 最终产物 223 → 221 文件，12,631,608 → 12,630,406 bytes（-1,202）；JS 463,985 → 474,860（+10,875，主要为 Svelte 安全更新/边界防护），CSS 269,623 → 261,362（-8,261）。锁定间接节点 1260 → 1269。不是以“删行/体积大降”作为质量结论。
- 首页在 390/320/1440 浅深色共 6 组截图尺寸相同，逐像素比较（通道差阈值 8）均 0 差异；已查看手机浅色和桌面深色截图。见 `security-visual-diff.json` 与 `security-{before,final}-*.png`。

### 第四阶段：本地验收

- 冻结安装、`pnpm security:check`、`pnpm check` 均通过：79 文件，0 errors / 0 warnings / 1 既有 `_cssVar` hint。完整 `pnpm build`：6 页、Pagefind 5 页 / 259 words。最终 `git diff --check` 于发布前复核。
- 正式内容经真实 Workers 本地生产预览验证：6 路由 × 390×844、320×568、1440×1000 × 浅/深色，无横向溢出、无未捕获脚本错误；Pagefind 真实索引及恶意响应边界通过。另原 redesign 套件 9 视口、200% 字号、减少动画、菜单/三态主题、地图、专辑、分类/标签、RSS、首页/文章/内页往返通过。
- 新生命周期套件 5 轮缓存往返，验证一次点击只调用一次 showModal、关闭/焦点回到入口、打开弹层后导航不残留、相册 9/4/5 筛选与放大关闭、只有一个公式 Observer，无整页刷新。生产不启用草稿回忆。
- 隔离 homepage-fixture 第 2 页与回忆循环通过；6 组回忆测试覆盖 desktop/mobile/320/横屏/深色/减少动画，双向触屏、短拖回弹、纵向不误翻、取消、洗牌与队列等通过。测试文案不是用户内容，保留隔离。
- 证据：`security-browser-final.json`、`apple-redesign-report.json`、`security-lifecycle-local.json`、`apple-fixture-report.json`、`homepage-modules-report.json`、`security-fixture-build.json`、`security-inventory-{before,local}.json`。机器上的浏览器脚本仍在仓库外 `work/`，未给网站添加测试依赖。
- 非通过/边界：全仓只读 Biome CI 仍有格式/导入顺序等历史基线问题（本次实测 83 errors / 7 warnings；未跑写模式）；新增 7 个脚本/工具模块独立 biome lint 通过。Browserslist 基线告警随兼容数据更新消失；中文 Pagefind stemming 提示保留。安全 fixture 早期测试因过于宽泛的字符串断言误把已引用的 meta 属性当脚本失败，已改为实际解析 JSON-LD/HTML 并重跑；另一次完整 fixture 测试超时，延长后通过，均不计初次为通过。
- 本轮只测本机 Chromium / CDP 触屏，不冒称真实 iOS/Android、Safari/Firefox 或独立渗透测试通过；外站登录/播放未测，后台接口不适用。凭据扫描为模式检查（当前文件、全部可达历史文本差异、产物），不是对不可达历史对象/所有潜在密钥格式的证明。

### 发布与回退（已发布并核验）

- 当次用户已明确授权验证后推送并更新网站。发布前基线 Git 为 `fa97e42`，现有 Worker 上一版为 `b3947f8c-ba91-4bd3-a39c-e87db0a1f31c`（实际 deployments list 核对）。
- 若发布后回归失败，可对现有 fuwari 执行 `wrangler rollback b3947f8c-ba91-4bd3-a39c-e87db0a1f31c`；回退会恢复该版没有新增安全头/HTTP 308 的行为。源码回退应从已保留提交另建修复，不 reset 丢弃后续工作。
- 安全/构建修复 `52cdb29`、正文/依赖/检查 `6bdd842`、结构精简 `1885bb5` 已推送。发布后的慢加载复测发现搜索在 Pagefind 超过 2 秒才 ready 时没有恢复；补修 `45f399c` 移除过早的初始化短路，让 ready 状态重新触发预填查询。本地增加真实索引 HEAD/模块延迟测试并完整回归通过，再推送、重新构建和部署。
- 最终正式 Worker 版本 **`9eb10465-a8f2-4d3a-b88b-1f4f47692163`**（`wrangler deploy --keep-vars`，同一 fuwari、同一账户与 ASSETS），正式代码为 `45f399c`。此前手动 `47265885-d475-4e19-9b94-a881d20345e6` / `f59e42b5-473d-462a-ab3e-445606e8431d` 以及随后额外出现的发布均不是最终验收版本。源码基线标签 `rollback-before-security-20261018-fa97e42` 已推送保留。
- 发布盘点纠正：两次代码 push 后，手动部署约半分钟后都出现额外版本（`78cf43f5-…` / `fee6e4e2-…`），线上引用变成不同构建哈希；现象与 Git 自动构建一致，但未修改集成配置或声称已核对其完整日志。待额外发布结束后重新部署本机已验证 dist，逐一核对 **13 个 CSS/JS/Svelte component/renderer** 的线上 SHA256，全部一致。最终文档-only 提交使用 `[skip ci]` 避免重复自动构建；运行代码提交不跳过检查。不能继续假定该账户“push 绝不触发网站发布”，也不能把不同构建产物误记为哈希一致。
- 正式域名实测：HTTP `/` 及 `/gallery/?group=IVE` → HTTPS **308**，路径/查询保留；`/collection/` 仍为 **301 /research/**；首页/相册/RSS/站点地图/Pagefind 均 200，缺失页、`.env`、`.git/config`、源码与 security fixture 路由均 404。页面、资源、301 与 404 都有 CSP、X-Frame-Options、nosniff、Referrer-Policy、Permissions-Policy、仅本域 HSTS。
- TLS 实际验证链可信，TLSv1.3，证书 CN wonyoung.xyz，2026-10-15 至 2027-01-13，有效且无跳过校验。证据 `security-tls-live.json`。
- 正式站 6 路由 × 3 尺寸 × 浅/深色通过：布局、侧栏、无溢出、无未捕获错误、实际响应头及 0 CSP 违规；真实搜索/高亮、专辑与焦点、地图、9/4/5 相册筛选/放大/关闭、RSS/重定向通过。`security-live-release.json` 和 `security-release-live-*.png`；只屏蔽本机已知 DNS 失败的可选 Cloudflare analytics，本站 HTML/脚本/字体/图片/索引全是正式域名真实请求。
- 未屏蔽 analytics 的正式域名专项也通过：`security-policy-live.json` 查询文章成功、6 路由 0 页面错误/0 CSP 违规；仅可选 beacon DNS 网络报错。原始慢加载失败保留 `security-policy-live-initial.json`。5 轮正式域名 Swup/弹层/筛选/放大生命周期另通过 `security-lifecycle-live.json`。
- 最终发布产物一致性：`review-release-report.json` 核对 7 条页面/RSS 路由与当前构建引用，13 个直接 CSS/JS/Svelte component/renderer SHA256 均相同；串行低频验证没有网络重试。首次并行下载出现瞬态 fetch failure 后改为串行并重跑，不记初次为通过。正式内容未改变，fixture/草稿未混入。部署前后 `git diff --check` 通过。
- 线上旧完整 redesign 套件首次在导航阶段超时；未屏蔽 beacon 的 36 路由全安全套件也在 240 秒整体超时，均不计为通过。最终线上通过的是上面独立列出的真实域名矩阵/专项/生命周期/哈希检查，不扩大到超时套件、第三方服务或未测试浏览器。GitHub Actions API 当次返回无 runs，故不声称远端 CI 已执行成功；CI 配置和本地命令验证分别记录。
