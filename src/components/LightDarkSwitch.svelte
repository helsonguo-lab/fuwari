<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

let {
	class: className = "",
	variant = "compact",
}: {
	class?: string;
	variant?: "compact" | "inline";
} = $props();

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);

onMount(() => {
	mode = getStoredTheme();
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}

function showPanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.add("float-panel-closed");
}

const options = [
	{ mode: LIGHT_MODE, icon: "material-symbols:wb-sunny-outline-rounded", label: I18nKey.lightMode },
	{ mode: DARK_MODE, icon: "material-symbols:dark-mode-outline-rounded", label: I18nKey.darkMode },
	{ mode: AUTO_MODE, icon: "material-symbols:radio-button-partial-outline", label: I18nKey.systemMode },
] as const;
</script>

{#if variant === "inline"}
  <div class={`theme-inline ${className}`} role="group" aria-label="主题">
    {#each options as option}
      <button
        type="button"
        class="theme-inline-btn"
        class:current-theme-btn={mode === option.mode}
        aria-pressed={mode === option.mode}
        onclick={() => switchScheme(option.mode)}
      >
        <Icon icon={option.icon} class="text-[1.25rem]" />
        <span>{i18n(option.label)}</span>
      </button>
    {/each}
  </div>
{:else}
  <!-- z-50 make the panel higher than other float panels -->
  <div class={`relative z-50 ${className}`} role="menu" tabindex="-1" onmouseleave={hidePanel}>
    <button aria-label="Light/Dark Mode" role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme} onmouseenter={showPanel}>
      <div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
      </div>
      <div class="absolute" class:opacity-0={mode !== DARK_MODE}>
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
      </div>
      <div class="absolute" class:opacity-0={mode !== AUTO_MODE}>
        <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
      </div>
    </button>

    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
      <div class="card-base float-panel p-2">
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                class:current-theme-btn={mode === LIGHT_MODE}
                onclick={() => switchScheme(LIGHT_MODE)}
        >
          <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
          {i18n(I18nKey.lightMode)}
        </button>
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                class:current-theme-btn={mode === DARK_MODE}
                onclick={() => switchScheme(DARK_MODE)}
        >
          <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
          {i18n(I18nKey.darkMode)}
        </button>
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
                class:current-theme-btn={mode === AUTO_MODE}
                onclick={() => switchScheme(AUTO_MODE)}
        >
          <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>
          {i18n(I18nKey.systemMode)}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .theme-inline {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .375rem;
    padding: .25rem;
    border-radius: 12px;
    background: color-mix(in srgb, var(--btn-regular-bg) 55%, transparent);
  }
  .theme-inline-btn {
    min-height: 44px;
    padding: .4rem .25rem;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .2rem;
    border-radius: 9px;
    color: var(--btn-content);
    font-size: .6875rem;
    font-weight: 600;
    transition: background-color .16s ease, color .16s ease;
  }
  .theme-inline-btn:hover {
    background: var(--btn-plain-bg-hover);
  }
  .theme-inline-btn.current-theme-btn {
    background: var(--card-bg);
    color: var(--primary);
    box-shadow: 0 1px 2px rgb(32 51 68 / 8%);
  }
  .theme-inline-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
</style>
