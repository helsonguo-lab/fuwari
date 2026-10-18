import { DragGesture } from "@use-gesture/vanilla";
import { animate } from "motion/mini";

type Animation = ReturnType<typeof animate>;
const position = (depth: number) => `translate3d(${depth * 6}px, ${depth * 7}px, 0) rotate(${depth === 0 ? 0 : depth % 2 ? -3 : 3}deg) scale(${1 - depth * .025})`;
const dragged = (x: number, y = -Math.abs(x) * .08, rotation = x / 24) => `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(1)`;

class MemoryStack extends HTMLElement {
	private events?: AbortController;
	private gesture?: DragGesture;
	private animations = new Set<Animation>();
	private session = new AbortController();
	private queue: HTMLElement[] = [];
	private dialog?: HTMLDialogElement;
	private stage?: HTMLElement;
	private trigger?: HTMLButtonElement;
	private next?: HTMLButtonElement;
	private generation = 0;
	private busy = false;
	private dragging = false;
	private dragX = 0;
	private viewed = 0;
	private scrollState?: { x: number; y: number; overflow: string; padding: string };
	private reduced = matchMedia("(prefers-reduced-motion: reduce)");

	connectedCallback() {
		this.events?.abort();
		this.events = new AbortController();
		const { signal } = this.events;
		this.dialog = this.querySelector<HTMLDialogElement>("dialog") ?? undefined;
		this.stage = this.querySelector<HTMLElement>("[data-memory-stage]") ?? undefined;
		this.trigger = this.querySelector<HTMLButtonElement>("[data-memory-open]") ?? undefined;
		this.next = this.querySelector<HTMLButtonElement>("[data-memory-next]") ?? undefined;
		if (!this.dialog || !this.stage || !this.trigger) return;
		// Swup's HTML cache may contain an open dialog snapshot. Never restore it open.
		this.dialog.close();
		this.reset(false);
		this.trigger.addEventListener("click", () => this.open(), { signal });
		this.next?.addEventListener("click", () => { if (!this.dragging) void this.flip(1); }, { signal });
		this.querySelector("[data-memory-close]")?.addEventListener("click", () => this.dialog?.close(), { signal });
		this.dialog.addEventListener("close", () => this.reset(), { signal });
		let backdropDown = false;
		const outside = (event: PointerEvent) => {
			const box = this.dialog!.getBoundingClientRect();
			return event.target === this.dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
		};
		this.dialog.addEventListener("pointerdown", (event) => { backdropDown = outside(event); }, { signal });
		this.dialog.addEventListener("pointerup", (event) => {
			if (backdropDown && outside(event)) this.dialog?.close();
			backdropDown = false;
		}, { signal });
		this.dialog.addEventListener("pointercancel", () => { backdropDown = false; }, { signal });
		this.dialog.addEventListener("touchmove", (event) => {
			if (!(event.target instanceof Element && event.target.closest(".paper-caption"))) event.preventDefault();
		}, { signal, passive: false });
	}

	private open() {
		if (!this.dialog || !this.stage || this.dialog.open) return;
		// A closed dialog can be reopened before its queued `close` event fires.
		this.reset(false);
		this.queue = [...this.querySelectorAll<HTMLTemplateElement>("[data-memory-template]")]
			.map((template) => template.content.firstElementChild!.cloneNode(true) as HTMLElement);
		for (let i = this.queue.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
		}
		this.stage.replaceChildren(...this.queue);
		for (const card of this.queue) {
			const img = card.querySelector("img")!;
			const fallback = card.querySelector<HTMLElement>(".photo-fallback")!;
			img.addEventListener("error", () => { fallback.hidden = false; }, { signal: this.session.signal });
			img.addEventListener("load", () => { fallback.hidden = true; }, { signal: this.session.signal });
		}
		this.viewed = 0;
		this.layout();
		const root = document.documentElement;
		this.scrollState = { x: scrollX, y: scrollY, overflow: root.style.overflow, padding: document.body.style.paddingRight };
		const gutter = innerWidth - root.clientWidth;
		if (gutter) document.body.style.paddingRight = `${gutter + Number.parseFloat(getComputedStyle(document.body).paddingRight)}px`;
		root.style.overflow = "hidden";
		this.dialog.showModal();
		this.bindGesture();
		if (!this.reduced.matches) void this.tween(this.stage, ["translateY(10px) scale(.98)", "translateY(0) scale(1)"], .24);
	}

	private setBusy(value: boolean) {
		this.busy = value;
		if (this.next) this.next.disabled = value;
		this.stage?.setAttribute("aria-busy", String(value));
	}

	private layout(moving?: HTMLElement) {
		for (const [depth, card] of this.queue.entries()) {
			card.style.zIndex = String(Math.max(0, 3 - depth));
			card.style.visibility = depth < 3 || card === moving ? "visible" : "hidden";
			card.inert = depth !== 0;
			card.setAttribute("aria-hidden", String(depth !== 0));
			if (card !== moving) card.style.transform = position(Math.min(depth, 2));
			if (depth < 2) {
				const img = card.querySelector("img")!;
				if (!img.getAttribute("src")) img.src = img.dataset.src!;
			}
		}
		const count = this.querySelector("[data-memory-count]");
		if (count) count.textContent = `${this.viewed % this.queue.length + 1} / ${this.queue.length}`;
	}

	private async tween(element: HTMLElement, frames: string[], duration: number) {
		if (this.reduced.matches) { element.style.transform = frames[frames.length - 1]; return; }
		const animation = animate(element, { transform: frames }, { duration, ease: [.22, .68, .22, 1] });
		this.animations.add(animation);
		const { signal } = this.session;
		try {
			await new Promise<void>((resolve) => {
				const finish = () => { signal.removeEventListener("abort", finish); resolve(); };
				signal.addEventListener("abort", finish, { once: true });
				void animation.finished.then(finish, finish);
			});
		} finally { this.animations.delete(animation); }
	}

	private async flip(direction: number, from = 0) {
		if (this.busy || !this.dialog?.open || this.queue.length < 2) return;
		this.setBusy(true);
		const generation = this.generation;
		const [card, following] = this.queue;
		const width = card.getBoundingClientRect().width;
		const extracted = dragged(direction * width * .82, -Math.min(48, card.offsetHeight * .13), direction * 12);
		try {
			// 1. Pull the current sheet sideways/up. The next sheet settles beneath it.
			await Promise.all([
				this.tween(card, [dragged(from), extracted], .28),
				this.tween(following, [position(1), position(0)], .28),
				...(this.queue[2] ? [this.tween(this.queue[2], [position(2), position(1)], .28)] : []),
			]);
			if (generation !== this.generation || !this.dialog.open) return;
			this.queue.push(this.queue.shift()!);
			this.viewed++;
			this.layout(card);
			// 2. Change layer only while extracted, then visibly tuck the old sheet UNDER.
			card.style.transform = extracted;
			await this.tween(card, [extracted, position(Math.min(this.queue.length - 1, 2))], .36);
			if (generation !== this.generation || !this.dialog.open) return;
			this.layout();
			// Don't strand focus on a caption that just became inert.
			if (card.contains(document.activeElement)) this.next?.focus({ preventScroll: true });
		} finally {
			if (generation === this.generation) this.setBusy(false);
		}
	}

	private bindGesture() {
		this.gesture?.destroy();
		if (!this.stage || this.queue.length < 2) return;
		this.gesture = new DragGesture(this.stage, ({ active, first, last, canceled, movement: [x], velocity: [velocity], event, cancel }) => {
			if (!this.dialog?.open || this.busy) { if (active) cancel(); return; }
			// Caption owns vertical scrolling, with the same horizontal gesture as the photo.
			if (first) { this.dragging = true; this.dragX = 0; }
			const card = this.queue[0];
			if (active) {
				this.dragX = Math.max(-card.offsetWidth, Math.min(card.offsetWidth, x));
				card.style.transform = dragged(this.dragX);
			}
			if (last || canceled || event.type === "pointercancel") {
				const displacement = this.dragX;
				this.dragging = false;
				this.dragX = 0;
				if (!canceled && event.type !== "pointercancel" && (Math.abs(displacement) >= card.offsetWidth * .25 || (Math.abs(displacement) > 30 && velocity > .5))) {
					void this.flip(displacement < 0 ? -1 : 1, displacement);
				} else {
					const generation = this.generation;
					this.setBusy(true);
					void this.tween(card, [dragged(displacement), position(0)], .2).then(() => {
						if (generation === this.generation) this.setBusy(false);
					});
				}
			}
		}, { axis: "x", threshold: 8, filterTaps: true, pointer: { capture: true }, eventOptions: { passive: false } });
	}

	private reset(focus = true) {
		// Ignore the queued close event from a previous session after a rapid reopen.
		if (focus && this.dialog?.open) return;
		this.generation++;
		this.gesture?.destroy();
		this.gesture = undefined;
		// stop() commits current styles and throws on a closed (non-rendered) dialog.
		// Teardown needs cancellation, not a style commit. Release awaiting phases too.
		for (const animation of this.animations) animation.cancel();
		this.session.abort();
		this.session = new AbortController();
		this.animations.clear();
		this.dragging = false;
		this.dragX = 0;
		this.setBusy(false);
		this.stage?.replaceChildren();
		this.stage?.style.removeProperty("transform");
		this.queue = [];
		if (this.scrollState) {
			document.documentElement.style.overflow = this.scrollState.overflow;
			document.body.style.paddingRight = this.scrollState.padding;
			window.scrollTo({ left: this.scrollState.x, top: this.scrollState.y, behavior: "instant" });
			this.scrollState = undefined;
		}
		if (focus && this.isConnected) this.trigger?.focus({ preventScroll: true });
	}

	disconnectedCallback() {
		this.events?.abort();
		this.dialog?.close();
		this.reset(false);
	}
}

if (!customElements.get("memory-stack")) customElements.define("memory-stack", MemoryStack);
