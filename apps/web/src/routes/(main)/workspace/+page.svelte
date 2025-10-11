<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { getWorkspacesStore } from '$lib/stores/ui/workspaces-store.svelte';

	const workspacesStore = getWorkspacesStore();
	let hasRedirected = $state(false);

	onMount(() => {
		if (browser) {
			// Check if there's a saved workspace ID
			const savedWorkspaceId = localStorage.getItem('workspaceId');
			
			if (savedWorkspaceId) {
				// Redirect to saved workspace
				hasRedirected = true;
				goto(`/workspace/${savedWorkspaceId}`);
				return;
			}
		}
	});

	// React to workspace data changes
	$effect(() => {
		if (browser && !hasRedirected && workspacesStore.workspaces && workspacesStore.workspaces.length > 0) {
			const firstWorkspace = workspacesStore.workspaces[0];
			hasRedirected = true;
			localStorage.setItem('workspaceId', firstWorkspace.id);
			goto(`/workspace/${firstWorkspace.id}`);
		}
	});
</script>
<svelte:head>
	<title>Workspace - Speck</title>
</svelte:head>
<div class="flex h-full">
	<div class="flex flex-1 flex-col">
		<div class="flex flex-1 items-center justify-center">
			<div class="text-center">
				<div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
				<p class="text-gray-600 dark:text-gray-400">Redirecting to workspace...</p>
			</div>
		</div>
	</div>
</div>
