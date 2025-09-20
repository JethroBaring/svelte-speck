<script lang="ts">
import { getContext } from 'svelte';
import type { Snippet } from 'svelte';
import { TABS_CTX, type TabsContext } from './context';

let { value, className = '', children, addon }: { value: string; className?: string; children?: Snippet; addon?: Snippet } = $props();
const ctx = getContext<TabsContext>(TABS_CTX);

const valueStore = ctx.value;

let el: HTMLButtonElement | null = null;

const isActive = $derived($valueStore === value);

function handleClick() {
  ctx.setValue(value);
}

$effect(() => {
  if (isActive) {
    ctx.registerActiveTrigger(el);
  }
});

</script>

<button
  bind:this={el}
  type="button"
  onclick={handleClick}
  class={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 border-b-2 px-2.5 py-3 text-sm font-medium transition-all duration-300 ease-out ${
    isActive
      ? 'border-transparent text-brand-500 dark:text-brand-400'
      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
  } ${className}`.trim()}
>
  {@render children?.()}
  {@render addon?.()}
</button>


