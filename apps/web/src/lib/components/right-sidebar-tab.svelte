<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	export interface Tab {
		value: string;
		label: string;
		minStatus?: number;
		icon?: any;
		showPlus?: boolean;
		onPlusClick?: () => void;
	}

	interface TabsProps {
		tabs: Tab[];
		activeTab: string;
		onTabChange: (tabValue: string) => void;
		className?: string;
		showScrollbar?: boolean;
	}

	let { tabs, activeTab, onTabChange, className = '', showScrollbar = true }: TabsProps = $props();

	let indicatorStyle = $state({ left: 0, width: 0 });
	let tabRefs = $state<(HTMLButtonElement | null)[]>([]);
	let navRef = $state<HTMLElement | null>(null);

	const baseNavClasses = '-mb-px flex overflow-x-auto relative';
	const scrollbarClasses = showScrollbar
		? '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5'
		: '';

	const navClasses = `${baseNavClasses} ${scrollbarClasses} ${className}`.trim();

	$effect(() => {
		const activeTabIndex = tabs.findIndex((tab: Tab) => tab.value === activeTab);
		if (activeTabIndex >= 0 && tabRefs[activeTabIndex] && navRef) {
			const activeTabElement = tabRefs[activeTabIndex];
			const navElement = navRef;

			const tabRect = activeTabElement.getBoundingClientRect();
			const navRect = navElement.getBoundingClientRect();

			indicatorStyle = {
				left: tabRect.left - navRect.left,
				width: tabRect.width
			};
		}
	});
</script>

<div class="border-b border-gray-200 dark:border-gray-800">
	<nav bind:this={navRef} class={navClasses}>
		{#each tabs as tab, index}
			<button
				type="button"
				bind:this={tabRefs[index]}
				onclick={() => onTabChange(tab.value)}
				class="inline-flex h-[42.5px] min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-2.5 py-2.5 text-sm font-medium transition-all duration-300 ease-out {activeTab ===
				tab.value
					? 'border-transparent text-brand-500 dark:text-brand-400'
					: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				{#if tab.icon}
					{@const Icon = tab.icon}
					<Icon class="h-4 w-4" />
				{/if}
				{tab.label}
			</button>
		{/each}

		<div
			class="absolute inset-0 bg-brand-50 transition-all duration-300 ease-out dark:bg-brand-500/[0.12]"
			style:left="{indicatorStyle.left}px"
			style:width="{indicatorStyle.width}px"
		></div>

		<div
			class="absolute bottom-0 h-[1px] bg-brand-500 transition-all duration-300 ease-out dark:bg-brand-400"
			style:left="{indicatorStyle.left}px"
			style:width="{indicatorStyle.width}px"
		></div>
	</nav>
</div>
