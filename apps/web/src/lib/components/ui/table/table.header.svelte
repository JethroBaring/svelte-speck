<script lang="ts">
  import type { Snippet } from 'svelte';
  interface TableHeaderProps {
  children: Snippet; // Header row(s)
  className?: string; // Optional className for styling
}

const { children, className }: TableHeaderProps = $props();
</script>

<thead class={className}>
  {@render children?.()}
</thead>

