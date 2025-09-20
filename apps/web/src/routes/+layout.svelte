<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { setSidebarState } from '@/lib/stores/sidebar-store.svelte';

	let { children } = $props();
	const queryClient = new QueryClient();

	setSidebarState();
</script>

<svelte:head>
	<link rel="icon" href={'/images/speck-logo.png'} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children?.()}
</QueryClientProvider>
