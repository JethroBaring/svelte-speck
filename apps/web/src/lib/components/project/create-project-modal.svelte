<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CREATE_PROJECT_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useCreateProject } from '$lib/queries/use-projects';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { toast } from 'svelte-sonner';

	const workspaceId = $derived(page.params.workspaceId);
	const modalStore = getModalStore(CREATE_PROJECT_MODAL_KEY);
	const createProjectMutation = $derived(useCreateProject(workspaceId));

	let projectName = $state('');

	const handleCreateProject = async () => {
		await createProjectMutation.mutateAsync(projectName, {
			onSuccess: (data) => {
				modalStore.close();
				toast.success('Project created successfully');
				goto(`/workspace/${workspaceId}/project/${data.data?.id}`);
			},
			onError: () => {
				toast.error('Failed to create project');
			}
		});
		projectName = '';
	};
</script>

<Dialog.Root bind:open={modalStore.isOpen} onOpenChange={(open) => {
	if (!open) {
		projectName = '';
	}
}}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Project</Dialog.Title>
			<Dialog.Description>Create a new project to organize your tasks.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter project name"
					required
					bind:value={projectName}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateProject}>Create Project</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
