import "./fan-gallery";
import { siteConfig } from "../config";
import { BANNER_HEIGHT, BANNER_HEIGHT_EXTEND, MAIN_PANEL_OVERLAPS_BANNER_HEIGHT } from "../constants/constants";
import { getHue, getStoredTheme, setHue, setTheme } from "../utils/setting-utils";
import { pathsEqual, url } from "../utils/url-utils";
import { initBodyScrollbar, initFormulaScrollbars } from "./page-scrollbars";
import { closePanels, setupPanels } from "./panels";
import { createPhotoLightbox } from "./photo-lightbox";

type LayoutMode = "default" | "home" | "home-list";
function layoutForPath(value: string): LayoutMode {
	try {
		const path = new URL(value, location.href).pathname;
		if (pathsEqual(path, url("/"))) return "home";
		if (/^\/\d+\/$/.test(path)) return "home-list";
	} catch { /* The DOM marker reconciles the layout after navigation. */ }
	return "default";
}
function setLayout(layout: LayoutMode) {
	document.body.classList.toggle("layout-home", layout === "home");
	document.body.classList.toggle("layout-home-list", layout === "home-list");
}
function syncLayout() {
	const mode = document.querySelector<HTMLElement>("#main-grid[data-layout]")?.dataset.layout;
	if (mode === "default" || mode === "home" || mode === "home-list") setLayout(mode);
	document.getElementById("navbar-wrapper")?.classList.remove("navbar-hidden");
}
function updateScroll() {
	const top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
	const bannerHeight = innerHeight * BANNER_HEIGHT / 100;
	document.getElementById("back-to-top-btn")?.classList.toggle("hide", top <= bannerHeight);
	if (!siteConfig.banner.enable) return;
	document.getElementById("toc-wrapper")?.classList.toggle("toc-hide", top <= bannerHeight);
	const isHome = document.body.classList.contains("layout-home") || document.body.classList.contains("layout-home-list");
	const threshold = bannerHeight - 72 - MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16 - 16;
	document.getElementById("navbar-wrapper")?.classList.toggle("navbar-hidden", !isHome && top >= threshold);
}
function updateSize() {
	const offset = Math.floor(innerHeight * BANNER_HEIGHT_EXTEND / 100);
	document.documentElement.style.setProperty("--banner-height-extend", `${offset - offset % 4}px`);
}

// Astro bundles this module once for the persistent document. Only page-owned
// resources reconnect; the nav/panel/document listeners never rebind per visit.
setTheme(getStoredTheme());
setHue(getHue());
setupPanels();
initBodyScrollbar();
document.getElementById("banner")?.classList.remove("opacity-0", "scale-105");
let cleanupFormulas: (() => void) | undefined;
let cleanupLightbox: (() => void) | undefined;
function cleanupPage() {
	cleanupFormulas?.();
	cleanupLightbox?.();
	cleanupFormulas = undefined;
	cleanupLightbox = undefined;
}
function initPage() {
	cleanupPage();
	syncLayout();
	cleanupFormulas = initFormulaScrollbars();
	cleanupLightbox = createPhotoLightbox();
	updateScroll();
}
initPage();
window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", () => { updateSize(); updateScroll(); });

let hooksRegistered = false;
let settleTimer: ReturnType<typeof setTimeout> | undefined;
function setupNavigation() {
	if (hooksRegistered) return;
	hooksRegistered = true;
	window.swup.hooks.on("link:click", () => {
		document.documentElement.style.setProperty("--content-delay", "0ms");
	});
	window.swup.hooks.on("visit:start", (visit: { to: { url: string } }) => {
		clearTimeout(settleTimer);
		closePanels();
		setLayout(layoutForPath(visit.to.url));
		document.getElementById("page-height-extend")?.classList.remove("hidden");
		document.getElementById("toc-wrapper")?.classList.add("toc-not-ready");
	});
	window.swup.hooks.on("content:replace", cleanupPage, { before: true });
	window.swup.hooks.on("page:view", initPage);
	window.swup.hooks.on("visit:end", () => {
		settleTimer = setTimeout(() => {
			document.getElementById("page-height-extend")?.classList.add("hidden");
			document.getElementById("toc-wrapper")?.classList.remove("toc-not-ready");
			updateScroll();
		}, 200);
	});
}
if (window.swup?.hooks) setupNavigation();
else document.addEventListener("swup:enable", setupNavigation, { once: true });
