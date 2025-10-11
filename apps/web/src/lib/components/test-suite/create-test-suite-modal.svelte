<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { CREATE_TEST_SUITE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useCreateTestSuite } from '$lib/queries/use-test-suites';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { toast } from 'svelte-sonner';

	const workspaceId = $derived(page.params.workspaceId);
	const projectId = $derived(page.params.projectId);
	const modalStore = getModalStore(CREATE_TEST_SUITE_MODAL_KEY);
	const createTestSuiteMutation = $derived(useCreateTestSuite(projectId));

	let testSuiteName = $state('');

	const handleCreateTestSuite = async () => {
		await createTestSuiteMutation.mutateAsync(testSuiteName, {
			onSuccess: (data) => {
				modalStore.close();
				toast.success('Test suite created successfully');
			},
			onError: () => {
				toast.error('Failed to create test suite');
			}
		});
		testSuiteName = '';
	};
</script>

<Dialog.Root bind:open={modalStore.isOpen} onOpenChange={(open) => {
	if (!open) {
		testSuiteName = '';
	}
}}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create Test Suite</Dialog.Title>
			<Dialog.Description>Create a new test suite to organize your tests.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-3">
				<Label for="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter test suite name"
					required
					bind:value={testSuiteName}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={handleCreateTestSuite}>Create Test Suite</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
