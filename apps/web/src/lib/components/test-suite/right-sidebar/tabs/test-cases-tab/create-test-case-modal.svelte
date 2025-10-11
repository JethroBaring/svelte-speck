<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CREATE_TEST_CASE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useCreateTestCase } from '$lib/queries/use-test-cases';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { toast } from 'svelte-sonner';

	const workspaceId = $derived(page.params.workspaceId);
	const projectId = $derived(page.params.projectId);
	const modalStore = getModalStore(CREATE_TEST_CASE_MODAL_KEY);
	const testSuiteId = $derived(page.params.testSuiteId);
	const createTestCaseMutation = $derived(useCreateTestCase(testSuiteId));

	let testCaseName = $state('');

	const handleCreateTestCase = async () => {
		await createTestCaseMutation.mutateAsync(testCaseName, {
			onSuccess: (data) => {
				modalStore.close();
				toast.success('Test case created successfully');
			},
			onError: () => {
				toast.error('Failed to create test case');
			}
		});
		testCaseName = '';
	};
</script>

<Dialog.Root bind:open={modalStore.isOpen} onOpenChange={(open) => {
	if (!open) {
		testCaseName = '';
	}
}}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Test Case</Dialog.Title>
			<Dialog.Description>Create a new test case.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter test case name"
					required
					bind:value={testCaseName}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateTestCase}>Create Test Case</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
