<script lang="ts">
	import { Modal } from '@/lib/components/ui/modal';
	import { Label } from '@/lib/components/ui/label';
	import { Input } from '@/lib/components/ui/input';
	import { Button } from '@/lib/components/ui/button';
	import { useCreateTestSuite } from '@/lib/queries/use-test-suites';
	import { getToastStore } from '@/lib/stores/ui/toast-store.svelte';

	interface ProjectModalProps {
		isOpen: boolean;
		onClose: () => void;
		projectId: string;
	}

	let { isOpen, onClose, projectId }: ProjectModalProps = $props();

	const createTestSuiteMutation = useCreateTestSuite(projectId);
	const toastStore = getToastStore();

	let testSuiteName = $state('');
	let testSuiteDescription = $state('');

	const handleSubmit = () => {
		$createTestSuiteMutation.mutate(
			{
				name: testSuiteName,
				description: testSuiteDescription
			},
			{
				onSuccess: () => {
					onClose();
					testSuiteName = '';
					testSuiteDescription = '';

					toastStore.addToast({
						id: crypto.randomUUID(),
						title: 'Test suite created successfully',
						message: 'Test suite created successfully',
						type: 'success'
					});
				}
			}
		);
	};
</script>

<Modal {isOpen} {onClose} className="max-w-[700px] m-4">
	<form
		onsubmit={(e) => e.preventDefault()}
		class="relative no-scrollbar w-full overflow-y-auto rounded-xl bg-white p-4 lg:p-11 dark:bg-gray-900"
	>
		<div class="px-2 pr-14">
			<h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
				Create new test suite
			</h4>
			<p class="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
				Create a new test suite for automated testing with test cases, and execution management.
			</p>
		</div>
		<div class="flex flex-col gap-6">
			<div class="custom-scrollbar overflow-y-auto px-2">
				<div class="flex flex-col gap-4">
					<div>
						<Label>Name</Label>
						<Input placeholder="Enter project name" bind:value={testSuiteName} />
					</div>
				</div>
			</div>
			<div class="custom-scrollbar overflow-y-auto px-2">
				<div class="flex flex-col gap-4">
					<div>
						<Label>Description (optional)</Label>
						<Input placeholder="Enter project name" bind:value={testSuiteDescription} />
					</div>
				</div>
			</div>
			<div class="flex items-center gap-3 px-2 lg:justify-end">
				<Button size="xs" variant="outline" onClick={onClose}>Cancel</Button>
				<Button size="xs" onClick={handleSubmit}>Create</Button>
			</div>
		</div>
	</form>
</Modal>
