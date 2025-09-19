<script lang="ts">
	import type { Snippet } from 'svelte';

	interface CollapsibleProps {
		title: string | Snippet;
		children: Snippet;
		defaultOpen?: boolean;
		className?: string;
		headerClassName?: string;
		contentClassName?: string;
		showChevron?: boolean;
		headerActions?: Snippet;
		onToggle?: (isOpen: boolean) => void;
		onHeaderClick?: () => void;
	}

	const {
		title,
		children,
		defaultOpen = false,
		className,
		headerClassName,
		contentClassName,
		showChevron = true,
		headerActions,
		onToggle,
		onHeaderClick
	}: CollapsibleProps = $props();

	let isOpen = $state(false);
	let contentHeight = $state(0);
	let contentRef: HTMLDivElement | null = $state(null);

	const handleToggle = () => {
		isOpen = !isOpen;
		onToggle?.(isOpen);
	};

	$effect(() => {
		if (contentRef) {
			const height = (contentRef as HTMLDivElement).scrollHeight;
			contentHeight = isOpen ? height : 0;
		}
	});
</script>

<div class={className}>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		onclick={onHeaderClick}
		class={`flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-800 transition-all duration-200 dark:text-white/90 ${headerClassName}`}
	>
		<div class="flex items-center gap-2">
			{#if typeof title === 'string'}
				<span>{title}</span>
			{:else}
				{@render title?.()}
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1">
				{headerActions}
			</div>
			{#if showChevron}
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button
					class="flex items-center rounded-lg p-1 hover:bg-white/[0.3]"
					onclick={(e) => {
						e.stopPropagation();
						handleToggle();
					}}
				>
					<svg
						class={`h-4 w-4 transform transition-transform duration-200 ${
							isOpen ? 'rotate-180' : ''
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<div
		class="overflow-hidden transition-all duration-300 ease-out"
		style:height={`${contentHeight}px`}
	>
		<div bind:this={contentRef} class={`px-4 pb-4 ${contentClassName}`}>
			{children}
		</div>
	</div>
</div>
