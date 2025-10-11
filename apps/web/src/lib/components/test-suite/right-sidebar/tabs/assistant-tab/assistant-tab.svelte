<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, HistoryIcon, SettingsIcon } from '@lucide/svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChatSubTab from './chat-sub-tab.svelte';
	import HistorySubTab from './chat-history-sub-tab.svelte';
	import SettingsSubTab from './chat-settings-sub-tab.svelte';

	let activeSubTab = $state('test');

	const subTabTitle = $derived(
		activeSubTab === 'chat' ? 'Chat' : activeSubTab === 'history' ? 'History' : 'Settings'
	);
</script>

<div class="flex h-full flex-col">
	<div class="mb-3 flex items-center justify-between text-gray-400">
		<div class="flex items-center gap-1">
			{#if activeSubTab !== 'chat'}
				<Button
				    onclick={() => (activeSubTab = 'chat')}
					variant="ghost"
					class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
				>
					<ArrowLeft class="size-4" />
				</Button>
			{/if}
			<p class="text-sm">{subTabTitle}</p>
		</div>
		<div class="flex items-center gap-1">
			<Button
				onclick={() => (activeSubTab = 'chat')}
				variant="ghost"
				class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
			>
				<PlusIcon class="size-4" />
			</Button>
			<Button
				onclick={() => (activeSubTab = 'history')}
				variant="ghost"
				class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
			>
				<HistoryIcon class="size-4" />
			</Button>
			<Button
				onclick={() => (activeSubTab = 'settings')}
				variant="ghost"
				class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
			>
				<SettingsIcon class="size-4" />
			</Button>
		</div>
	</div>
	{#if activeSubTab === 'chat'}
		<ChatSubTab />
	{:else if activeSubTab === 'history'}
		<HistorySubTab />
	{:else}
		<SettingsSubTab />
	{/if}
</div>
