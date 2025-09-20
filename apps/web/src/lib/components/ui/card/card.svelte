<script lang="ts">
	import type { Snippet } from 'svelte';

	interface CardProps {
		children: Snippet;
		className?: string; // Additional custom classes for styling
		desc?: string; // Description text
		ref?: HTMLDivElement;
	}

	let { children, className = '', desc = '', ref }: CardProps = $props();
</script>

<div
	class={`rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
	bind:this={ref}
>
	{@render children?.()}
</div>
