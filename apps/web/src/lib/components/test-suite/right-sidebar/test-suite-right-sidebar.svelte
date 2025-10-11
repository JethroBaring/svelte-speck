<script lang="ts">
	import { page } from '$app/state';
	import { useTestCases } from '$lib/queries/use-test-cases';
	import { getTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	import Activity from '@lucide/svelte/icons/activity';
	import Box from '@lucide/svelte/icons/box';
	import CheckSquare from '@lucide/svelte/icons/check-square';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import RightSidebarTab from '../../right-sidebar-tab.svelte';
	import AssistantTab from './tabs/assistant-tab/assistant-tab.svelte';
	import ResourcesTab from './tabs/resources-tab/resources-tab.svelte';
	import TestCaseTab from './tabs/test-cases-tab/test-case-tab.svelte';
	const tabs = [
		{ label: 'Test Cases', value: 'test-cases', icon: CheckSquare },
		{ label: 'Resources', value: 'resources', icon: Box },
		{ label: 'Execution', value: 'execution', icon: Activity },
		{ label: 'Assistant', value: 'assistant', icon: Sparkles }
	];

	let activeTab = $state('test-cases');
	const onTabChange = (tab: string) => {
		activeTab = tab;
	};

	const testSuiteId = $derived(page.params.testSuiteId);
	const testCasesStore = getTestCasesStore();
	const testCasesQuery = $derived(useTestCases(testSuiteId));

	$effect(() => {
		if (testCasesQuery.data?.data) {
			testCasesStore.updateTestCases(testCasesQuery.data.data);
		}
	});
</script>

<div class="flex w-[650px] flex-col border-gray-800 dark:border-gray-800 dark:bg-gray-900">
	<RightSidebarTab {tabs} {activeTab} {onTabChange} />
	<div class="flex flex-1 flex-col gap-2 p-3">
		{#if activeTab === 'test-cases'}
			<TestCaseTab />
		{:else if activeTab === 'resources'}
			<ResourcesTab />
		{:else if activeTab === 'execution'}
			<!-- <ExecutionTab /> -->
		{:else if activeTab === 'assistant'}
			<AssistantTab />
		{/if}
	</div>
</div>
