<script lang="ts">
  import type { Snippet } from 'svelte';
  interface TableBodyProps {
  children: Snippet; // Header row(s)
  className?: string; // Optional className for styling
}

const { children, className }: TableBodyProps = $props();
</script>

<tbody class={className}>
  {@render children?.()}
</tbody>

