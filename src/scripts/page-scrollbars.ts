import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbars } from "overlayscrollbars";

// Body scrollbar belongs to the persistent document, not an individual Swup page.
export function initBodyScrollbar() {
	OverlayScrollbars({ target: document.body, cancel: { nativeScrollbarsOverlaid: true } }, {
		scrollbars: { theme: "scrollbar-base scrollbar-auto py-1", autoHide: "move", autoHideDelay: 500, autoHideSuspend: false },
	});
}

// Each page owns its observer and formula scrollbar instances. The returned
// cleanup runs before replacement and unwraps generated containers for caching.
export function initFormulaScrollbars() {
	const cleanups: (() => void)[] = [];
	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
			const element = entry.target;
			observer.unobserve(element);
			if (!element.parentNode) continue;
			const container = document.createElement("div");
			container.className = "katex-display-container";
			container.setAttribute("aria-label", "scrollable container for formulas");
			element.before(container);
			container.appendChild(element);
			const scrollbar = OverlayScrollbars(container, {
				scrollbars: { theme: "scrollbar-base scrollbar-auto", autoHide: "leave", autoHideDelay: 500, autoHideSuspend: false },
			});
			cleanups.push(() => { scrollbar?.destroy(); container.replaceWith(element); });
		}
	}, { root: null, rootMargin: "100px", threshold: 0.1 });
	document.querySelectorAll<HTMLElement>(".katex-display").forEach((element) => { observer.observe(element); });
	return () => { observer.disconnect(); for (const cleanup of cleanups) cleanup(); };
}
