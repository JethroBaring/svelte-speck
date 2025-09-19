<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setSidebarState } from '../stores/sidebar-state.svelte';
	
	let { children } = $props();
	
	// Initialize sidebar state context
	setSidebarState();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
