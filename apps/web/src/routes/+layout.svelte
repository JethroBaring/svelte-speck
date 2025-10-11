<script lang="ts">
	import '../app.css';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import '@fontsource-variable/outfit';
	import { Toaster } from '$lib/components/ui/sonner';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';

	let { children } = $props();
	setMode('dark');
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={'/images/speck-logo.png'} />
</svelte:head>

<ModeWatcher />
<Toaster richColors/>
<QueryClientProvider client={queryClient}>
	{@render children?.()}
</QueryClientProvider>
