<script lang="ts">
  import type { Snippet } from 'svelte';

  interface TableRowProps {
  children: Snippet; // Cells (th or td)
  className?: string; // Optional className for styling
}

const { children, className }: TableRowProps = $props();
</script>

<tr class={className}>
	{@render children?.()}
</tr>