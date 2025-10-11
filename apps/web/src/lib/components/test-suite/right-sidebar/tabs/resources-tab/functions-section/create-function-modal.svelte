<script lang="ts">
	import { page } from '$app/state';
	import TextEditor from '$lib/components/text-editor/text-editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { useCreateProjectFunction } from '$lib/queries/use-project-functions';
	import { useCreateTestSuiteFunction } from '$lib/queries/use-test-suite-functions';
	import { ModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { toast } from 'svelte-sonner';
	import * as Select from '$lib/components/ui/select/index.js';

	interface CreateFunctionModalProps {
		modalStore: ModalStore;
	}

	const { modalStore }: CreateFunctionModalProps = $props();

	const projectId = $derived(page.params.projectId);
	const testSuiteId = $derived(page.params.testSuiteId);
	const createTestSuiteFunctionMutation = $derived(useCreateTestSuiteFunction(testSuiteId));
	const createProjectFunctionMutation = $derived(useCreateProjectFunction(projectId));

	let functionName = $state('');
	let functionCode = $state('');
	let scope = $state('Test Suite');

	const handleCreateTestCase = async () => {
		if (scope === 'Test Suite') {
			await createTestSuiteFunctionMutation.mutateAsync(
				{ name: functionName, code: functionCode },
				{
					onSuccess: (data) => {
						modalStore.close();
						toast.success('Function created successfully');
					}
				}
			);
		} else {
			await createProjectFunctionMutation.mutateAsync(
				{ name: functionName, code: functionCode },
				{
					onSuccess: (data) => {
						modalStore.close();
						toast.success('Function created successfully');
					}
				}
			);
		}
		functionName = '';
		functionCode = '';
	};

	const onChange = (value: string) => {
		functionCode = value;
	};
</script>

<Dialog.Root
	bind:open={modalStore.isOpen}
	onOpenChange={(open) => {
		if (!open) {
			functionName = '';
			functionCode = '';
			scope = 'Test Suite';
		}
	}}
>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Function</Dialog.Title>
			<Dialog.Description>Create a new function.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter function name"
					required
					bind:value={functionName}
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
								<Select.Item
									value={scope}
									label={scope}
								>
									{scope.charAt(0).toUpperCase() + scope.slice(1)}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-3">
				<Label for="value">Code</Label>
				<div class="min-h-[100px] rounded-sm border border-gray-800 p-2">
					<TextEditor class="h-full text-sm" code={functionCode} onChange={onChange} />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateTestCase}>Create Function</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
