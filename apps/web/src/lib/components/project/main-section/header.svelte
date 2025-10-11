<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { CREATE_TEST_SUITE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getProjectsStore } from '$lib/stores/ui/projects-store.svelte';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import Folder from '@lucide/svelte/icons/folder';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PlusCircleIcon from '@lucide/svelte/icons/plus-circle';

	const projectsStore = getProjectsStore();
	const modalStore = getModalStore(CREATE_TEST_SUITE_MODAL_KEY);
</script>

<div class="flex items-start justify-between border-b p-3">
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-2 text-gray-400">
			<Folder class="size-5" />
			<h1 class="text-base font-semibold">{projectsStore.selectedProject?.name}</h1>
		</div>
		<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
			<div class="flex items-center gap-1">
				<FileTextIcon class="h-4 w-4 text-blue-500" />
				<span>10 test suites</span>
			</div>
			<div class="flex items-center gap-1">
				<CheckCircleIcon class="h-4 w-4 text-green-500" />
				<span> 12 test cases </span>
			</div>
			<div class="flex items-center gap-1">
				<ClockIcon class="h-4 w-4 text-gray-500" />
				<span>Last run: 2h ago</span>
			</div>
			<div class="flex items-center gap-1">
				<span>85% pass rate</span>
			</div>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<Button variant="outline" onclick={() => modalStore.open()}>
			<PlusCircleIcon class="h-4 w-4" />
			New Suite
		</Button>
		<Button>
			<PlayIcon class="h-4 w-4" />
			{#if 1 > 0}
				Run 1 Selected
			{:else}
				Run All Tests
			{/if}
		</Button>
	</div>
</div>
