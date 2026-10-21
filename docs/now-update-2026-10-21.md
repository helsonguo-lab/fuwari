# 最近在……内容同步 · 2026-10-21

## 内容与来源

- 用户授权本次内容更新、GitHub 推送与现有 Cloudflare Worker 发布。基线提交 `4751b43`；发布前 Worker 版本实查为 `1bd525e8-03b6-4348-ad11-9df16baa8caf`。
- 最近在听：**WHIP (JIWOO & KYUJIN)**，艺人 NMIXX，专辑《Strange Muse - EP》。名称与封面按 Apple Music / iTunes 官方 API（trackId `6812956146`）核对；Spotify 对应英文条目使用逗号形式 `WHIP (JIWOO, KYUJIN)`。链接 `https://open.spotify.com/track/0QlRS2XCfC0A9cePXVqcDv`，不是搜索页或猜测 ID。
- 最近在看：**电锯人**，按用户原文显示；日本出版方正式原名《チェンソーマン》（藤本タツキ），东立繁体版名称《鏈鋸人》。链接 `https://www.shonenjump.com/j/rensai/chainsaw/` 为集英社官方作品页。豆瓣条目无法可靠核验，未猜测书目 ID。
- 最近在想：**NMIXX回归大发**，逐字保留。
- `updated` 固定记录本次同步日期 `2026-10-21`，没有增加从构建时间推导日期的逻辑。
- 新封面从 Apple Music、集英社官方书目所列图片下载，原件与元数据保存在工作区 `research_notes/now-assets-2026-10-21/`，本地 WebP、来源/原始及网页 SHA256 和版权声明在 `public/images/now/SOURCES.md`。第 1 卷仅作为作品代表封面，不声称用户当前阅读卷数。旧封面未删除。

## 实现与验证

- 单一内容入口仍为 `src/content/homepage/now.md`。增加可选 `reading.official`，只允许已支持的少年 Jump 官方漫画作品页 HTTPS 地址，无用户名/密码、非标准端口、查询或片段；优先于原 `douban`，旧配置仍兼容。不放宽为任意 URL。
- 封面/名称所在整行保持新标签页链接与 `noopener noreferrer`；官方链接辅助说明不再误标“豆瓣”。布局、CSS、动画、性能优化及其他业务逻辑没有修改。
- `npm.cmd run security:check`（含官方作品链接正/反例）、`npm.cmd run check`、完整 `npm.cmd run build`（含 Pagefind）及 `git diff --check` 通过。6 页，Pagefind 5 页 / 259 words；仅 1 个既有 `_cssVar` hint 与中文 stemming 提示。第一次内容同步仍有 now 缓存重复提示，随后完整 build 无该提示，实际源码仅一个 now.md。
- 本地 6 路由 × 3 尺寸 × 浅深色、安全摘要/URL/真实搜索及迟到初始化回归通过；5 轮 Swup/弹层/相册生命周期通过。新近况 390×844、320×568、1440×1000 浅深色共 6 组通过：文字、图片比例/解码、无横向溢出；封面及标题各自能触发正确的新窗口，opener 为 null；Swup 往返内容不丢。已人工查看 320 浅色和 1440 深色截图。
- 外链点击测试仅拦截已知目的页导航以核实 href/新窗口隔离，本站资源不替换；没有测试外站登录/播放。Spotify 本机直连重置，标题/艺人匹配以公开 Spotify 搜索条目和 Apple 官方元数据为据；不声称实际 Spotify 播放通过。
- 首次新内容浏览器测试等待 networkidle 超时，未计为通过；改用明确 DOM/交互初始化、封面解码及首屏动画完成条件后全矩阵重跑通过。原失败保留 `outputs/now-update-local-20261021-initial.json`。网络诊断保留导航/关闭 context 导致的 Pagefind ERR_ABORTED 以及一次 Iconify 连接失败，不把页面零异常扩大为所有请求零失败；独立真实搜索套件已通过。
- 证据：工作区 `outputs/now-assets-20261021.json`、`now-update-local-20261021.json`、`security-browser-now-update-20261021.json`、`security-lifecycle-now-update-20261021.json`。仅本机 Chromium，不声称 Safari/Firefox、真实手机或远端 CI 全绿；既有全仓 Biome 格式基线不在本次顺带整理。

## 发布

- 应用/内容提交 **`383b692`** 已推送 `origin/main`。从 `fuwari/` 再次完整构建后发布现有 Worker；只使用正式 `fuwari/dist/`，没有部署测试副本。
- 初次手动版本 `0ad41894-cc21-4293-8283-3c7022b45feb` 发布后，09:48:51 UTC 出现额外版本 **`025ba885-6338-44c6-9106-011da42aeb70`**，在验证中途替换资源，导致旧 props 模块 404 和一次浏览器等待超时。两份初次失败报告保留 `outputs/now-update-release-live-20261021-initial.json`、`now-update-20261021-live-release-initial.json`，不计为通过，也不把这次手动版本记作最终版本。
- 额外发布结束后，重新部署本机已验收 dist；最终版本为 **`81e50946-b7d4-4b59-9efc-99ad3e3d459f`**。沿用 fuwari、同一 Cloudflare 账户、域名与 ASSETS；CSP/安全头未改。
- 本地 Worker 下近况 6 组及真实搜索/CSP 专项通过。最终正式域名 `https://home.wonyoung.xyz/` 的 6 路由 × 3 尺寸 × 浅深色通过，无横向溢出/未捕获异常/CSP 违规；真实搜索/高亮、专辑/地图焦点、相册筛选/放大、HTTP 308、旧入口 301 与 RSS 范围通过。矩阵仅拦截可选 Cloudflare analytics；独立近况专项未屏蔽该资源，保留本机 DNS 错误。
- 线上近况另测 6 组，三个栏目、2026.10.21 日期和当前链接正确；封面与标题各自触发正确的新标签页，opener 为 null。此项只拦截已知外站目标导航，不声称外站播放/登录已测。Swup 往返通过；**两张新封面 SHA256 与本地原定 WebP 精确一致**，无旧封面误用。
- 8 条页面/RSS/站点地图路由引用与 **47 个 JS/CSS/Pagefind 文件 SHA256** 全部匹配最终本地构建，串行无网络重试。证据：`outputs/now-update-release-live-20261021.json`、`now-update-live-20261021.json`、`now-update-20261021-live-release.json`；本地 Worker 证据 `now-update-worker-local-20261021.json`、`security-policy-now-update-local-20261021.json`。
- 验收后仅文档发布记录使用 `[skip ci]`，应用提交未跳过检查。若需回退，先核对实际部署，再对原 fuwari 回退至 **`1bd525e8-03b6-4348-ad11-9df16baa8caf`**；这会恢复前一份近况而保留上一轮性能优化，不做破坏性 Git reset。
