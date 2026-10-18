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

1. Markdown 正文：仅受版本控制的站主内容；无网络 Markdown/访客投稿。Astro/remark/rehype 在构建时生成公式、代码和 HTML。原始 HTML 不应当作为不可信投稿接收；若以后增加投稿，须先新增全正文净化边界，不可复用“站主可信”假设。
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
