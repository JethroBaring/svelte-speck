<script lang="ts">
	import type { Snippet } from 'svelte';

	interface DropdownItemProps {
		tag?: 'a' | 'button';
		href?: string;
		onClick?: () => void;
		onItemClick?: () => void;
		className?: string;
		children: Snippet;
	}

	const {
		tag = 'button',
		href,
		onClick,
		onItemClick,
		className = '',
		children
	}: DropdownItemProps = $props();

	const baseClassName =
		'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900';

	const handleClick = (event: MouseEvent) => {
		if (tag === 'button') {
			event.preventDefault();
		}
		if (onClick) onClick();
		if (onItemClick) onItemClick();
	};
</script>

{#if tag === 'a' && href}
	<a {href} class="{baseClassName} {className}" onclick={handleClick}>
		{@render children?.()}
	</a>
{:else}
	<button type="button" onclick={handleClick} class="{baseClassName} {className}">
		{@render children?.()}
	</button>
{/if}
