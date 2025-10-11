<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CREATE_WORKSPACE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { icons } from '$lib/icons.svelte';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { useCreateWorkspace } from '$lib/queries/use-workspaces';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore(CREATE_WORKSPACE_MODAL_KEY);
	const createWorkspaceMutation = useCreateWorkspace();

	let workspaceName = $state('');
	let selectedIcon = $state('Building2');

	const handleCreateWorkspace = async () => {
		await createWorkspaceMutation.mutateAsync(
			{
				name: workspaceName,
				icon: selectedIcon
			},
			{
				onSuccess: (data) => {
					modalStore.close();
					toast.success('Workspace created successfully');
					goto(`/workspace/${data.data?.id}`);
				},
				onError: () => {
					toast.error('Failed to create workspace');
				}
			}
		);
		workspaceName = '';
		selectedIcon = 'Building2';
	};
</script>

<Dialog.Root
	bind:open={modalStore.isOpen}
	onOpenChange={(open) => {
		if (!open) {
			workspaceName = '';
			selectedIcon = 'Building2';
		}
	}}
>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Workspace</Dialog.Title>
			<Dialog.Description>Create a new workspace to organize your projects.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="flex items-center justify-center">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="size-9">
								{#if selectedIcon}
									{@const Icon = icons.find((icon) => icon.name === selectedIcon)?.component}
									<Icon class="size-4" />
								{/if}
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="center">
						<DropdownMenu.Group class="grid grid-cols-8 gap-2">
							{#each icons as icon}
								<DropdownMenu.Item
									class="flex size-9 items-center justify-center"
									onSelect={() => (selectedIcon = icon.name)}
								>
									<icon.component class="size-4" />
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter workspace name"
					required
					bind:value={workspaceName}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateWorkspace}>Create Workspace</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
