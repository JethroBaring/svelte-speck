<script lang="ts">
	import NotificationDropdown from '$lib/components/notification-dropdown.svelte';
	import SearchForm from '$lib/components/search-form.svelte';
	import { getWorkspacesStore } from '$lib/stores/ui/workspaces-store.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { getProjectsStore } from '$lib/stores/ui/projects-store.svelte';
	import { page } from '$app/state';
	import { getTestSuiteStore } from '$lib/stores/ui/test-suite-store.svelte';
	const projectId = $derived(page.params.projectId);
	const testSuiteId = $derived(page.params.testSuiteId);
	const workspacesStore = getWorkspacesStore();
	const projectsStore = getProjectsStore();
	const testSuiteStore = getTestSuiteStore();
</script>

<header
	class="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear"
>
	<div class="flex w-full items-center justify-between gap-2 px-3">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="/workspace/{workspacesStore.selectedWorkspace?.id}"
						>{workspacesStore.selectedWorkspace?.name}</Breadcrumb.Link
					>
				</Breadcrumb.Item>
				{#if projectId}
					<Breadcrumb.Separator class="hidden md:block" />
					{#if testSuiteId}
						<Breadcrumb.Item>
							<Breadcrumb.Link
								href="/workspace/{workspacesStore.selectedWorkspace?.id}/project/{projectsStore
									.selectedProject?.id}"
							>
								{projectsStore.selectedProject?.name}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>{testSuiteStore.testSuite?.name}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{:else}
						<Breadcrumb.Item>
							<Breadcrumb.Page>{projectsStore.selectedProject?.name}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				{/if}
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="flex h-8 items-center gap-3">
			<SearchForm />
			<Separator orientation="vertical" />
			<NotificationDropdown />
		</div>
	</div>
</header>
