<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '@/lib/components/common/app-sidebar.svelte';
	import { getSidebarState } from '@/lib/stores/sidebar-store.svelte';
	import AppHeader from '@/lib/components/common/app-header.svelte';

	interface LayoutProps {
		children: Snippet;
	}

	const { children }: LayoutProps = $props();
	const sidebar = getSidebarState();

	const mainContentMargin = $derived(
		sidebar.isMobileOpen
			? 'ml-0'
			: sidebar.isExpanded || sidebar.isHovered
				? 'lg:ml-[290px]'
				: 'lg:ml-[90px]'
	);
</script>

<div class="min-h-screen xl:flex dark:bg-gray-900">
	<Sidebar />
	<div class={`flex flex-1 flex-col transition-all  duration-300 ease-in-out ${mainContentMargin}`}>
		<AppHeader />
		<div class="flex-1">{@render children?.()}</div>
	</div>
</div>
