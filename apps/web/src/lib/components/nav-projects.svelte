<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import ForwardIcon from '@lucide/svelte/icons/forward';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { CREATE_PROJECT_MODAL_KEY } from '$lib/constants/modal-keys';
	import { page } from '$app/state';
	import { getProjectsStore } from '$lib/stores/ui/projects-store.svelte';
	import { browser } from '$app/environment';

	const sidebar = useSidebar();
	const modalStore = getModalStore(CREATE_PROJECT_MODAL_KEY);
	const workspaceId = $derived(page.params.workspaceId);
	const projectId = $derived(page.params.projectId);
	const projectsStore = getProjectsStore();
	
	const activeProject = $derived(
		projectsStore.projects.find((project) => project.id === projectId) ||
			projectsStore.projects[0]
	);

	$effect(() => {
		if (browser && activeProject?.id) {
			localStorage.setItem('projectId', activeProject.id);
			projectsStore.setSelectedProject(activeProject);
		}
	});
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel class="px-2.5">Projects</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton tooltipContent="New project" onclick={() => modalStore.open()}>
				<PlusIcon />
				<span class="text-gray-400">New project</span>
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
		{#if projectsStore.projects}
			{#each projectsStore.projects as item (item.name)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href={`/workspace/${workspaceId}/project/${item.id}`} {...props}>
								<FolderIcon />
								<span>{item.name}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuAction showOnHover {...props}>
									<EllipsisIcon />
									<span class="sr-only">More</span>
								</Sidebar.MenuAction>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							class="w-48 rounded-lg"
							side={sidebar.isMobile ? 'bottom' : 'right'}
							align={sidebar.isMobile ? 'end' : 'start'}
						>
							<DropdownMenu.Item>
								<FolderIcon class="text-muted-foreground" />
								<span>View Project</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<ForwardIcon class="text-muted-foreground" />
								<span>Share Project</span>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								<Trash2Icon class="text-muted-foreground" />
								<span>Delete Project</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			{/each}
		{/if}
	</Sidebar.Menu>
</Sidebar.Group>
