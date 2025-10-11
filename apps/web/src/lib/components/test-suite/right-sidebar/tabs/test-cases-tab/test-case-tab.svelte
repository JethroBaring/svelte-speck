<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CREATE_TEST_CASE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TestCaseCard from './test-case-card.svelte';

	const modalStore = getModalStore(CREATE_TEST_CASE_MODAL_KEY);
	const testCasesStore = getTestCasesStore();
</script>

<div class="test-sm flex h-full flex-col gap-2">
	<div class="flex items-center justify-between">
		<p class="text-sm text-gray-400">Test Cases ({testCasesStore.testCases.length})</p>
		<Button
			variant="ghost"
			class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
			onclick={() => modalStore.open()}
		>
			<PlusIcon class="size-4" />
		</Button>
	</div>
	<div class="flex-1 overflow-scroll">
		<div class="flex h-0 flex-col gap-2">
			{#if testCasesStore.testCases.length > 0}
				{#each testCasesStore.testCases as testCase}
					<TestCaseCard {testCase} />
				{/each}
			{:else}
				<div class="flex h-full items-center justify-center">
					<p class="text-sm text-gray-500">No test cases found</p>
				</div>
			{/if}
		</div>
	</div>
</div>
