# Homepage modules — third-party notices

The site continues to use the existing Fuwari/Astro stack and their licenses.
This change reuses the following additional open-source capabilities:

| Project | Version | License | Scope |
| --- | --- | --- | --- |
| [Motion](https://github.com/motiondivision/motion) | 14.3.0 | MIT | `motion/mini`, native JS animation only; no paid examples |
| framer-motion / motion-dom / motion-utils (same repository) | 14.3.0 / 14.3.0 / 14.1.1 | MIT | Transitive non-React animation implementation |
| [use-gesture](https://github.com/pmndrs/use-gesture) | vanilla/core 10.3.1 | MIT | Unified touch/mouse drag recognition |
| [fontkit](https://github.com/foliojs/fontkit/tree/v2.0.4) | 2.0.4 | MIT | Build-time character coverage check only |
| [Zhi Mang Xing](https://github.com/google/fonts/tree/187e2123ad2710ad8c2fa9955332fe9073e834b1/ofl/zhimangxing) | Google Fonts commit 187e2123ad2710ad8c2fa9955332fe9073e834b1 | SIL OFL 1.1 | Unmodified local full font, emotion text only |

MIT copyright and permission notices are distributed with the static site at
[`public/licenses/homepage-modules.txt`](public/licenses/homepage-modules.txt).
Fontkit's upstream v2.0.4 declares MIT in its package.json and README; it does not
ship a separate LICENSE file. No fontkit code is served to browsers.

The font's original copyright and **complete** OFL license are retained verbatim
at [`public/fonts/zhimangxing/OFL.txt`](public/fonts/zhimangxing/OFL.txt).
The TTF is not renamed, modified, converted or subsetted. Source and hash are
recorded in [`public/fonts/zhimangxing/SOURCE.md`](public/fonts/zhimangxing/SOURCE.md).

Existing markdown-it 14.1.0 / sanitize-html 2.17.0 / Sharp and Astro's Zod/content
collections are reused, not replaced. Photo rights remain with their original
owners; the new feature reuses user-provided photos and invents no user content.

Now-section artwork is separately copyrighted, not MIT/OFL licensed. The NMIXX
Strange Muse cover is supplied by Apple Music (JYP Entertainment); the Chainsaw
Man volume 1 cover is supplied by Shueisha (© 藤本タツキ／集英社). Artwork is used
only to identify the user-selected works; no ownership or open reuse permission
is claimed. Sources, original/web-copy hashes and retained historical artwork
are documented in `public/images/now/SOURCES.md`.
