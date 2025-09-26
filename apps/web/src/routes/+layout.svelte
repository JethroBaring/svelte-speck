<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { setSidebarStore } from '@/lib/stores/ui/sidebar-store.svelte';
	import { setToastStore, getToastStore } from '@/lib/stores/ui/toast-store.svelte';
	import { fly } from 'svelte/transition';
	import { Alert } from '@/lib/components/ui/alert';
	import { browser } from "$app/environment";

	let { children } = $props();
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	setSidebarStore();
	setToastStore();

	const toastStore = getToastStore();
</script>

<svelte:head>
	<link rel="icon" href={'/images/speck-logo.png'} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children?.()}
</QueryClientProvider>

<div class="fixed bottom-4 right-4 z-[999] flex flex-col space-y-2">
	{#each toastStore.toasts as toast (toast.id)}
		<div class="min-w-[450px]" in:fly={{ y: 30, duration: 300 }} out:fly={{ y: 30, duration: 300 }}>
			<Alert message={toast.message} title={toast.title} variant={toast.type} />
		</div>
	{/each}
</div>
