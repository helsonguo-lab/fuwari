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

推送与最终正式构建部署后，追加提交、实际 Worker 版本、正式域名内容/封面/资源哈希及线上验证结果。只部署 `fuwari/dist/`，不部署测试副本。
