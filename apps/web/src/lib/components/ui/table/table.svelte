<script lang="ts">
	import type { Snippet } from 'svelte';

	interface TableProps {
		children: Snippet; // Table content (thead, tbody, etc.)
		className?: string; // Optional className for styling
	}

	const { children, className }: TableProps = $props();
</script>

<table class={`min-w-full  ${className}`}>
	{@render children?.()}
</table>
;
