<script lang="ts">
	import type { Snippet } from 'svelte';
	interface DropdownProps {
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
		className?: string;
	}

	const { isOpen, onClose, children, className }: DropdownProps = $props();

	let dropdownRef = $state<HTMLDivElement | null>(null);
	$effect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef &&
				dropdownRef.contains(event.target as Node) &&
				!dropdownRef.contains(event.target as Node) &&
				!(event.target as HTMLElement).closest('.dropdown-toggle')
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
	const positionClass = 'right-0 mt-2';
</script>

{#if isOpen}
	<div
		bind:this={dropdownRef}
		class="absolute z-40 {positionClass} overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark {className}"
	>
		{@render children?.()}
	</div>
{/if}
