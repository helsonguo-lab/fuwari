class FanGallery extends HTMLElement {
	private controller?: AbortController;

	connectedCallback() {
		this.controller?.abort();
		this.controller = new AbortController();
		const selectGroup = (value: string) => {
			const group = ["IVE", "NMIXX"].includes(value) ? value : "all";
			let visible = 0;
			this.querySelectorAll<HTMLElement>("[data-group]").forEach((photo) => {
				photo.hidden = group !== "all" && photo.dataset.group !== group;
				if (!photo.hidden) visible++;
			});
			this.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(
				(button) => {
					button.setAttribute(
						"aria-pressed",
						String(button.dataset.filter === group),
					);
				},
			);
			const count = this.querySelector("[data-count]");
			if (count)
				count.textContent = `${group === "all" ? "共" : `${group} ·`} ${visible} 张照片`;
			const empty = this.querySelector<HTMLElement>("[data-empty]");
			if (empty) empty.hidden = visible > 0;
		};
		selectGroup(new URLSearchParams(location.search).get("group") || "all");
		this.addEventListener(
			"click",
			(event) => {
				const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
					"[data-filter]",
				);
				if (!button) return;
				const group = button.dataset.filter || "all";
				selectGroup(group);
				const target = new URL(location.href);
				if (group === "all") target.searchParams.delete("group");
				else target.searchParams.set("group", group);
				history.replaceState(history.state, "", target);
			},
			{ signal: this.controller.signal },
		);
		this.addEventListener(
			"keydown",
			(event) => {
				if (
					(event.key === "Enter" || event.key === " ") &&
					event.target instanceof HTMLImageElement
				) {
					event.preventDefault();
					event.target.click();
				}
			},
			{ signal: this.controller.signal },
		);
	}

	disconnectedCallback() {
		this.controller?.abort();
	}
}
if (!customElements.get("fan-gallery"))
	customElements.define("fan-gallery", FanGallery);
