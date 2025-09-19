<script lang="ts">
	import type { Snippet } from 'svelte';
	interface TableCellProps {
		children: Snippet; // Cell content
		isHeader?: boolean; // If true, renders as <th>, otherwise <td>
		className?: string; // Optional className for styling
	}

	const { children, isHeader, className }: TableCellProps = $props();
</script>

{#if isHeader}
	<th class={` ${className}`}>
		{@render children?.()}
	</th>
{:else}
	<td class={` ${className}`}>
		{@render children?.()}
	</td>
{/if}
