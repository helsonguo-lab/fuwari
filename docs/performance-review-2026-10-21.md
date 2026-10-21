# 性能优化与发布记录 · 2026-10-21

## 范围

- 用户授权：优化性能与动效开销，不改变运行逻辑或动画速度；验证后直接推送 GitHub 并发布现有 Cloudflare Worker。另明确选择将工作区已有的安全加固、日期兼容和 Obsidian 模板改动一并发布，分开提交。
- 性能基线为这些已有改动下的当前工作区，而不是只使用旧的 HEAD。未改变正式文章、近况、回忆、相册/地图数据、资源、依赖、Worker 策略及 CSS 动画。
- 本次不顺带修改审查中发现的存储容错、默认发布状态、搜索关闭竞态、时区显示或日期强校验行为。

## 优化

1. `src/scripts/site-runtime.ts`：滚动/窗口调整在一个 requestAnimationFrame 内合并；缓存壳元素引用并在每次 Swup 页面初始化刷新；相同状态不重复写 class 和尺寸变量。显隐阈值、导航钩子及 200ms 稳定计时不变。
2. `src/scripts/panels.ts`：观察器仅对面板自身 class 或面板挂载/移除做同步，忽略图标、主题控件和搜索结果的无关变化；ARIA、inert 和开关 class 仅在值变化时写入。保留菜单/搜索互斥、Escape、点击外部、焦点和延迟挂载行为。
3. `src/components/MemoryStack.astro` / `site-runtime.ts`：移除 Astro 无条件提升的回忆脚本，由页面初始化在确有 memory-stack 元素时动态加载。正式回忆为空时不下载手势/动画模块；内页首次进入首页和 Swup 缓存返回同样可初始化。回忆动画实现 `src/scripts/memory-stack.ts` 未修改，构建模块内容哈希仍为 `8eiofAkc`。
4. `src/components/Search.svelte`：Pagefind 查询返回后，若请求已过期，在加载结果片段前返回。最终结果与已有竞态规则不变，不增加 debounce 或等待时间。

## 测量

同机 Chromium、同一份正式内容、本地完整生产构建，测量脚本位于仓库外 `work/check-performance-20261021.mjs`。

| 指标 | 优化前 | 优化后 |
| --- | ---: | ---: |
| 首页首次 JS 资源 decodedBodySize 合计 | 265,570 bytes | 230,213 bytes |
| 同任务派发 500 次、不改变位置的 scroll：显隐 class toggle 调用 | 1,500 | 0 |
| 同场景滚动路径 getElementById 调用 | 1,500 | 0 |
| 100 次无关导航子元素 class 变化：ARIA 写入 | 500 | 0 |
| 已过期查询返回后的结果片段 data() 调用 | 1 | 0 |

首次 JS 解压后减少 **35,357 bytes / 13.31%**；不是整站下载体积、网络传输体积或加载耗时提升 13.31% 的声明。合成事件验证消除重复工作，不等于真实手机 FPS 或跑分测试。

6 组首页截图（390×844、320×568、1440×1000 × 浅/深色）尺寸一致，在通道差阈值 8 下均为 0 差异；已人工查看手机浅色和桌面深色截图。所测元素 computed animation/transition、几何数据，以及首页/相册/文章的 15 组滚动状态结果前后一致。无 CSS、动画时长/曲线或手势阈值变更。

证据：工作区 `outputs/performance-{before,after}.json`、`performance-comparison-20261021.json` 和同前缀截图。

## 验证

- 仅使用已有依赖；没有安装站点依赖、执行 pnpm 或重建其 store。`npm.cmd run security:check`、`npm.cmd run check`、完整 `npm.cmd run build`（含 Pagefind）和 `git diff --check` 通过。正式站仍为 6 页、Pagefind 5 页 / 259 words；保留 1 个既有 `_cssVar` hint 及中文 stemming 提示。
- 正式内容：6 路由 × 3 尺寸 × 浅深色，无横向溢出/未捕获错误；真实搜索、高亮、迟到 ready、恶意摘要/链接及快慢/清空竞态通过；5 轮 Swup 往返、面板焦点、相册筛选和 PhotoSwipe 通过。
- 原 redesign 套件 9 视口、200% 字号、主题、菜单、地图/专辑、正文和 RSS 通过。
- 本地实际 Worker 4351：6 路由、安全头、Pagefind 搜索及 0 CSP 违规通过（`security-policy-performance-local-20261021.json`）。不是只靠 Astro preview 判断策略。
- 新建隔离 `work/performance-fixture-20261021/`，仅它含假文章/回忆；没有生产 wrangler.jsonc，明确禁止部署。第 2 页、4 张回忆循环、6 组尺寸/深色/减少动画、真实 CDP 触屏、短拖/纵向/取消、动画中关闭/切页、焦点/滚动恢复、图片/字体失败均通过。
- 新增延迟加载专项：从内页首次进入有回忆的首页、模块下载未结束时离页后再返回、各 3 轮首页/第 2 页往返通过。初次断言只等待 URL 就检查旧 DOM，因 Swup URL 先更新而失败；已改为等待页面标记/元素脱离后重跑。原失败保留 `performance-memory-20261021-initial.json`，不计为通过。
- 两个修改的 runtime 模块只读 Biome lint 通过；全仓 Biome 在审查时已有 81 errors / 7 warnings（主要格式/导入顺序），本次不做无关批量格式化，不声称全仓/远端 CI 全绿。
- 本机仅 Chromium/CDP，没有真实手机、Safari/Firefox 的新验证；依赖实时告警不在本次性能任务重新扫描范围。

主要机器证据在工作区 `outputs/security-browser-performance-20261021.json`、`security-lifecycle-performance-20261021.json`、`performance-memory-20261021.json`、`apple-redesign-report.json`、`apple-fixture-report.json`、`homepage-modules-report.json` 和 `homepage-lifecycle-report.json`；这些不作为网站资源发布。

## 发布与回退

- 发布前 Git 基线：`bd615ca`；实查现有 Worker 当前版本：`9eb10465-a8f2-4d3a-b88b-1f4f47692163`。后者为保留安全策略的发布前回退目标。
- 推送不等于部署成功。正式 `fuwari/dist/` 是唯一部署产物；不部署任何 fixture。发布后须再次核对正式域名、资源 SHA256 和实际部署版本，防止 Git 自动构建覆盖已验产物。
- 实际提交、部署、域名验证记录在完成后追加。
