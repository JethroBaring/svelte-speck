<script lang="ts">
import { getContext } from 'svelte';
import type { Snippet } from 'svelte';
import { TABS_CTX, type TabsContext } from './context';

let { value, className = '', children }: { value: string; className?: string; children?: Snippet } = $props();
const ctx = getContext<TabsContext>(TABS_CTX);
const valueStore = ctx.value;

const isActive = $derived($valueStore === value);
</script>

{#if isActive}
  <div class={className}>
    {@render children?.()}
  </div>
{/if}


