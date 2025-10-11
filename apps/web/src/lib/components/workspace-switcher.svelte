<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { CREATE_WORKSPACE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { getIcon } from '$lib/icons.svelte';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getWorkspacesStore } from '$lib/stores/ui/workspaces-store.svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Badge } from './ui/badge';

	const workspacesStore = getWorkspacesStore();
	const modalStore = getModalStore(CREATE_WORKSPACE_MODAL_KEY);

	let workspaceId = $derived(page.params.workspaceId);

	let activeWorkspace = $derived(
		workspacesStore.workspaces.find((workspace) => workspace.id === workspaceId) ||
			workspacesStore.workspaces[0]
	);

	$effect(() => {
		if (browser && activeWorkspace?.id) {
			localStorage.setItem('workspaceId', activeWorkspace.id);
			workspacesStore.setSelectedWorkspace(activeWorkspace);
		}
	});
</script>

<Sidebar.MenuItem class="px-1.5">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Sidebar.MenuButton
					{...props}
					class="w-full justify-between rounded-sm !bg-white/[0.03] px-2"
					variant="outline"
				>
					<div class="flex items-center gap-2">
						<div class="flex size-6 items-center justify-center rounded-sm border">
							{#if activeWorkspace?.icon}
								{@const Icon = getIcon(activeWorkspace?.icon)}
								<Icon class="size-4" />
							{/if}
						</div>
						<span class="truncate font-medium">{activeWorkspace?.name}</span>
					</div>

					<ChevronDownIcon class="opacity-50" />
				</Sidebar.MenuButton>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="w-[251px] space-y-1 rounded-sm"
			align="start"
			side="bottom"
			sideOffset={5}
		>
			<DropdownMenu.Label class="text-muted-foreground text-xs">Workspaces</DropdownMenu.Label>
			{#if workspacesStore.workspaces}
				{#each workspacesStore.workspaces as workspace, index (workspace.name)}
					<DropdownMenu.Item
						onSelect={() => goto(`/workspace/${workspace.id}`)}
						class="flex items-center gap-2 p-2"
					>
						<div class="flex flex-1 items-center gap-2">
							<div class="flex size-6 items-center justify-center rounded-sm border">
								{#if workspace.icon}
									{@const Icon = getIcon(workspace.icon)}
									<Icon class="size-4" />
								{/if}
							</div>
							<span class="inline-block max-w-[100px] truncate align-middle">{workspace.name}</span>
						</div>
						<div class="flex items-center gap-2">
							{#if (workspace as any).member.role === 'OWNER'}
								<Badge class="w-14 text-center text-xs">Owner</Badge>
							{:else if (workspace as any).member.role === 'ADMIN'}
								<Badge class="w-14 text-center text-xs" variant="secondary">Admin</Badge>
							{:else}
								<Badge class="w-14 text-center text-xs" variant="outline">Member</Badge>
							{/if}
							<div class="flex h-4 w-4 items-center justify-center">
								{#if workspace.name === activeWorkspace?.name}
									<CheckIcon class="size-4 text-green-500" />
								{/if}
							</div>
						</div>
					</DropdownMenu.Item>
				{/each}
			{/if}
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="gap-2 p-2" onSelect={() => modalStore.open()}>
				<div class="bg-background flex size-6 items-center justify-center rounded-sm border">
					<PlusIcon class="size-4" />
				</div>
				<div class="text-muted-foreground font-medium">Add workspace</div>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Sidebar.MenuItem>
