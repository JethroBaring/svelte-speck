<script lang="ts">
import { getContext, onMount } from 'svelte';
import type { Snippet } from 'svelte';
import { TABS_CTX, type TabsContext } from './context';

let { className = '', showScrollbar = true, children, separator }: { className?: string; showScrollbar?: boolean; children?: Snippet; separator?: Snippet } = $props();

const ctx = getContext<TabsContext>(TABS_CTX);
const indicator = ctx.indicator;
const activeTriggerStore = ctx.activeTriggerEl;

let navEl: HTMLElement | null = null;

onMount(() => {
  ctx.setNavRef(navEl);
});

const baseNavClasses = '-mb-px flex overflow-x-auto relative';
const scrollbarClasses = showScrollbar
  ? '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5'
  : '';
const navClasses = `${baseNavClasses} ${scrollbarClasses} ${className}`.trim();

$effect(() => {
  const activeTrigger: HTMLButtonElement | null = $activeTriggerStore;
  const nav: HTMLElement | null = navEl;
  if (activeTrigger && nav) {
    const tabRect = activeTrigger.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    ctx.setIndicatorStyle({ left: tabRect.left - navRect.left, width: tabRect.width });
  }
});
</script>

<div class="border-b border-gray-200 dark:border-gray-800">
  <nav bind:this={navEl} class={navClasses}>
    {@render children?.()}

    <div
      class="absolute inset-0 bg-brand-50 transition-all duration-300 ease-out dark:bg-brand-500/[0.12]"
      style:left={`${$indicator.left}px`}
      style:width={`${$indicator.width}px`}
    ></div>

    <div
      class="absolute bottom-0 h-0.5 bg-brand-500 transition-all duration-300 ease-out dark:bg-brand-400"
      style:left={`${$indicator.left}px`}
      style:width={`${$indicator.width}px`}
    ></div>
  </nav>
  {@render separator?.()}
</div>


