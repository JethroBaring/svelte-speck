<script lang="ts">
	import RightSidebarTab from '../../right-sidebar-tab.svelte';
  import Box from '@lucide/svelte/icons/box';
  import Activity from '@lucide/svelte/icons/activity';
  import ChartColumnIncreasing from '@lucide/svelte/icons/chart-column-increasing';
  import UsersRound from '@lucide/svelte/icons/users-round';

	interface ProjectRightSidebarProps {
		projectId: string;
	}

	let { projectId }: ProjectRightSidebarProps = $props();

	const tabs = [
		{ label: 'Overview', value: 'overview', icon: ChartColumnIncreasing },
		{ label: 'Resources', value: 'resources', icon: Box },
		{ label: 'Execution', value: 'execution', icon: Activity },
		{ label: 'Members', value: 'members', icon: UsersRound }
	];

	let activeTab = $state('overview');
	const onTabChange = (tab: string) => {
		activeTab = tab;
	};
</script>

<div class="flex flex-col border-gray-800 dark:border-gray-800 dark:bg-gray-900 w-[650px]">
	<RightSidebarTab {tabs} {activeTab} {onTabChange} />
	<div class="flex flex-col gap-2 p-4">
		{#if activeTab === 'overview'}
			<!-- <OverviewTab /> -->
		{:else if activeTab === 'resources'}
			<!-- <ResourcesTab /> -->
		{:else if activeTab === 'execution'}
			<!-- <ExecutionTab /> -->
		{:else if activeTab === 'members'}
			<!-- <MembersTab /> -->
		{/if}
	</div>
</div>
