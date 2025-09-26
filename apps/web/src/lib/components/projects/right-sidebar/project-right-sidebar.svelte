<script lang="ts">
	import { Activity, Plus } from 'lucide-svelte';
	import RightSidebarTab from '../../common/right-sidebar-tab.svelte';
	import { Card } from '../../ui/card';
	import { OverviewTab } from './tabs/overview-tab';

	interface ProjectRightSidebarProps {
		projectId: string;
	}

	let { projectId }: ProjectRightSidebarProps = $props();

	const tabs = [
		{ label: 'Overview', value: 'overview' },
		{ label: 'Resources', value: 'resources' },
		{ label: 'Execution', value: 'execution' },
		{ label: 'Members', value: 'members' }
	];

	let activeTab = $state('overview');
	const onTabChange = (tab: string) => {
		activeTab = tab;
	};
</script>

<div class="flex w-md flex-col border-gray-200 lg:border-l dark:border-gray-800 dark:bg-gray-900">
	<RightSidebarTab {tabs} {activeTab} {onTabChange} />
	<div class="flex flex-col gap-2 p-4">
		{#if activeTab === 'overview'}
			<OverviewTab />
		{:else if activeTab === 'resources'}
			<!-- <ResourcesTab /> -->
		{:else if activeTab === 'execution'}
			<!-- <ExecutionTab /> -->
		{:else if activeTab === 'members'}
			<!-- <MembersTab /> -->
		{/if}
	</div>
</div>
