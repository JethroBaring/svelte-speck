<script lang="ts">
	import type { Snippet } from 'svelte';
	interface ComponentCardProps {
		header: Snippet;
		children: Snippet;
		className?: string; // Additional custom classes for styling
		desc?: string; // Description text
	}

	const { header, children, className = '', desc = '' }: ComponentCardProps = $props();
</script>

<div
	class={`rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
>
	<div class="px-6 py-5">
		{#if header}
			{@render header?.()}
		{/if}
		{#if desc}
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
				{desc}
			</p>
		{/if}
	</div>

	<div class="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
		<div class="space-y-6">{children}</div>
	</div>
</div>
