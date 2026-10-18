# 首页近况与回忆：实现与开源复用

## 选型（2026-10-18）

- 沿用 [Fuwari](https://github.com/saicaca/fuwari) 与本仓库 Astro 5.13.10 内容集合 / Zod（MIT），不增加框架或 Markdown 解析器。
- 沿用 `AlbumShelf.astro`、`FanMap.astro` 的原生 dialog、自定义元素、AbortController 和 Swup 移除清理模式。
- [Motion](https://github.com/motiondivision/motion) **14.3.0 / MIT**：仅使用 `motion/mini` 原生 Web Animations 封装，编排抽出、换层、回收两段 transform 动画；不复制任何付费示例。
- [use-gesture](https://github.com/pmndrs/use-gesture) **@use-gesture/vanilla 10.3.1 / MIT**：DragGesture 统一处理触屏 / 鼠标、横向锁定与取消；网站代码只判断阈值并维护照片队列。
- [fontkit](https://github.com/foliojs/fontkit) **2.0.4 / MIT**：仅构建时检查完整字体的字符覆盖，不进入浏览器包。
- 已有 markdown-it 14.1.0（MIT）、sanitize-html 2.17.0（MIT）：情绪正文只允许段落、换行、强调与基本文本；禁用可执行 HTML、图片、复杂文章功能。
- [志莽行书](https://github.com/google/fonts/tree/187e2123ad2710ad8c2fa9955332fe9073e834b1/ofl/zhimangxing)：Google Fonts 固定提交 `187e2123ad2710ad8c2fa9955332fe9073e834b1`，上游字体源提交 `15cb1b0d4c78da973e8459a8e2f23a9aef00d8a6`，SIL OFL 1.1；完整 TTF 与 OFL 本地托管，不做子集化，不请求字体 CDN。

字体只在 dialog 打开时按需加载，`font-display: swap` 与中文系统字体回退。缺字在构建时逐字警告，保留可读回退，不承诺所有生僻字都有行书。当前未提供正式情绪，正式字符检查须随未来内容再次构建执行。

第三方版权与许可见 `THIRD-PARTY-NOTICES.md`。依赖使用精确版本并提交 lockfile。本机已有 workspace 使用 pnpm 11 的 `allowBuilds`，统一 packageManager 为实际使用的 11.25.0，避免 pnpm 9 无法识别该文件。

## 内容与验收

日常编辑入口和同步流程见 `README-追星主页.md`；实际验证及尚缺素材见仓库外 `../交接-2026-10-18.md`。无正式内容时两个模块隐藏，测试数据不得作为用户记录发布。
