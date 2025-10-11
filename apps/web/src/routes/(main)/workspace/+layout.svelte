<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Header from '$lib/components/header.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Snippet } from 'svelte';
	import { setModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { CREATE_WORKSPACE_MODAL_KEY, CREATE_PROJECT_MODAL_KEY } from '$lib/constants/modal-keys';
	import CreateWorkspaceModal from '$lib/components/workspace/create-workspace-modal.svelte';
	import CreateProjectModal from '$lib/components/project/create-project-modal.svelte';
	import { useWorkspaces } from '$lib/queries/use-workspaces';
	import { setWorkspacesStore } from '$lib/stores/ui/workspaces-store.svelte';
	import { useProjects } from '$lib/queries/use-projects';
	import { setProjectsStore } from '$lib/stores/ui/projects-store.svelte';
	import { page } from '$app/state';
	import { setTestSuiteStore } from '$lib/stores/ui/test-suite-store.svelte';
	import TestRunnerIndicator from '$lib/components/test-runner-indicator.svelte';
	let { children }: { children: Snippet } = $props();

	setModalStore(CREATE_WORKSPACE_MODAL_KEY);
	setModalStore(CREATE_PROJECT_MODAL_KEY);

	const workspacesQuery = useWorkspaces();
	const workspaceId = $derived(page.params.workspaceId);
	const projectsQuery = $derived(useProjects(workspaceId));
	const workspacesStore = setWorkspacesStore(workspacesQuery.data?.data ?? []);
	const projectsStore = setProjectsStore([]);
	setTestSuiteStore(null);

	$effect(() => {
		if (workspacesQuery.data?.data) {
			workspacesStore.updateWorkspaces(workspacesQuery.data.data);
		}
	});

	$effect(() => {
		if (projectsQuery.data?.data) {
			projectsStore.updateProjects(projectsQuery.data.data);
		}
	});

	$effect(() => {
		if (projectsQuery.isLoading) {
			projectsStore.setIsLoading(true);
		} else {
			projectsStore.setIsLoading(false);
		}
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<Header />
		{@render children?.()}
	</Sidebar.Inset>
</Sidebar.Provider>

<CreateWorkspaceModal />
<CreateProjectModal />