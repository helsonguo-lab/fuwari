// The navbar lives outside Swup's containers. Bind once for its document lifetime;
// delegation also covers client-only Svelte panels that mount after this module.
const panels = [
	{ panel: "nav-menu-panel", trigger: "nav-menu-switch" },
	{ panel: "search-panel", trigger: "search-switch" },
	{ panel: "display-setting", trigger: "display-settings-switch" },
];
const isOpen = (panel: HTMLElement) => !panel.classList.contains("float-panel-closed");
const setOpen = (panel: HTMLElement, open: boolean) => {
	if (isOpen(panel) !== open) panel.classList.toggle("float-panel-closed", !open);
};
const panelSelector = panels.map((entry) => `#${entry.panel}`).join(",");

export function closePanels() {
	for (const entry of panels) {
		const panel = document.getElementById(entry.panel);
		if (panel) setOpen(panel, false);
	}
}

export function setupPanels() {
	const events = new AbortController();
	const { signal } = events;
	const sync = () => {
		for (const entry of panels) {
			const panel = document.getElementById(entry.panel);
			if (!panel) continue;
			const open = isOpen(panel);
			if (panel.hasAttribute("inert") !== !open) panel.toggleAttribute("inert", !open);
			if (panel.getAttribute("aria-hidden") !== String(!open)) panel.setAttribute("aria-hidden", String(!open));
			const trigger = document.getElementById(entry.trigger);
			if (trigger && trigger.getAttribute("aria-expanded") !== String(open)) trigger.setAttribute("aria-expanded", String(open));
		}
	};
	const observer = new MutationObserver((records) => {
		// Ignore icon/theme/result churn; only panel state or mounting affects ARIA.
		const changed = records.some((record) => record.type === "attributes"
			? record.target instanceof Element && record.target.matches(panelSelector)
			: [...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element &&
				(node.matches(panelSelector) || node.querySelector(panelSelector))));
		if (changed) sync();
	});
	const navbar = document.getElementById("navbar");
	if (navbar) observer.observe(navbar, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
	document.addEventListener("click", (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const menu = document.getElementById("nav-menu-panel");
		const search = document.getElementById("search-panel");
		if (target.closest("#nav-menu-switch")) {
			if (search) setOpen(search, false);
			if (menu) setOpen(menu, !isOpen(menu));
		}
		if (target.closest("#search-switch") && menu) setOpen(menu, false);
		if (target.closest("#nav-menu-panel a") && menu) setOpen(menu, false);
		for (const entry of panels) {
			const panel = document.getElementById(entry.panel);
			const trigger = document.getElementById(entry.trigger);
			if (panel && trigger && isOpen(panel) && !panel.contains(target) && !trigger.contains(target)) setOpen(panel, false);
		}
		queueMicrotask(sync);
	}, { signal });
	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") return;
		for (const entry of panels) {
			const panel = document.getElementById(entry.panel);
			if (panel && isOpen(panel)) {
				setOpen(panel, false);
				document.getElementById(entry.trigger)?.focus({ preventScroll: true });
			}
		}
	}, { signal });
	sync();
	return () => { events.abort(); observer.disconnect(); };
}
