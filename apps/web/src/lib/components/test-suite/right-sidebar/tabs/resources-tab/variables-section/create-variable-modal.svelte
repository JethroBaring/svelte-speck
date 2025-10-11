<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { useCreateProjectVariable } from '$lib/queries/use-project-variables';
	import { useCreateTestSuiteVariable } from '$lib/queries/use-test-suite-variables';
	import { ModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { toast } from 'svelte-sonner';
	import * as Select from '$lib/components/ui/select/index.js';

	interface CreateVariableModalProps {
		modalStore: ModalStore;
	}

	const { modalStore }: CreateVariableModalProps = $props();

	const projectId = $derived(page.params.projectId);
	const testSuiteId = $derived(page.params.testSuiteId);
	const createTestSuiteVariableMutation = $derived(useCreateTestSuiteVariable(testSuiteId));
	const createProjectVariableMutation = $derived(useCreateProjectVariable(projectId));

	let variableName = $state('');
	let variableValue = $state('');
	let variableType = $state('String');
	let scope = $state('Test Suite');

	const handleCreateVariable = async () => {
		if (scope === 'Test Suite') {
			await createTestSuiteVariableMutation.mutateAsync(
				{ name: variableName, value: variableValue, type: variableType },
				{
					onSuccess: (data) => {
						modalStore.close();
						toast.success('Variable created successfully');
					}
				}
			);
		} else {
			await createProjectVariableMutation.mutateAsync(
				{ name: variableName, value: variableValue, type: variableType },
				{
					onSuccess: (data) => {
						modalStore.close();
						toast.success('Variable created successfully');
					}
				}
			);
		}
		variableName = '';
		variableValue = '';
		variableType = 'String';
		scope = 'Test Suite';
	};
</script>

<Dialog.Root
	bind:open={modalStore.isOpen}
	onOpenChange={(open) => {
		if (!open) {
			variableName = '';
			variableValue = '';
			scope = 'Test Suite';
			variableType = 'String';
		}
	}}
>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Variable</Dialog.Title>
			<Dialog.Description>Create a new variable.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter variable name"
					required
					bind:value={variableName}
				/>
			</div>
			<div class="grid gap-3">
				<Label for="scope">Scope</Label>
				<Select.Root type="single" name="favoriteFruit" bind:value={scope}>
					<Select.Trigger class="w-full">
						{scope}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Scopes</Select.Label>
							{#each ['Test Suite', 'Project'] as scope (scope)}
								<Select.Item value={scope} label={scope}>
									{scope.charAt(0).toUpperCase() + scope.slice(1)}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-3">
				<Label for="type">Type</Label>
				<Select.Root type="single" name="variableType" bind:value={variableType}>
					<Select.Trigger class="w-full">
						{variableType}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Types</Select.Label>
							{#each ['String', 'Number', 'Boolean'] as type (type)}
								<Select.Item value={type} label={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-3">
				<Label for="value">Value</Label>
				<Textarea
					id="value"
					placeholder="Enter variable value"
					required
					bind:value={variableValue}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateVariable}>Create Variable</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
