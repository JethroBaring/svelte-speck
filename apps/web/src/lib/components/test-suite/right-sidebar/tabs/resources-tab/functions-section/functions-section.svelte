<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { ModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getResourcesStore } from '$lib/stores/ui/resources-store.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CreateFunctionModal from './create-function-modal.svelte';

	const modalStore = new ModalStore();
	let isOpen = $state(true);
	const resourcesStore = getResourcesStore();
</script>

<Collapsible.Root class="flex flex-col gap-2 text-sm" bind:open={isOpen}>
	<Collapsible.Trigger onclick={(e) => e.stopPropagation()}>
		{#snippet child({ props })}
			<div class="flex items-center justify-between gap-2 text-gray-400">
				Functions
				<div class="flex items-center gap-[2px]">
					<button
						onclick={(e) => {
							e.stopPropagation();
							modalStore.open();
						}}
						class="flex size-6 items-center justify-center rounded-full hover:bg-gray-800 active:bg-gray-800"
					>
						<PlusIcon class="size-4" />
					</button>
					<button
						{...props}
						class="flex size-6 items-center justify-center rounded-full hover:bg-gray-800 active:bg-gray-800"
					>
						<ChevronDownIcon class="size-4" />
					</button>
				</div>
			</div>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content class="flex flex-col gap-2">
		{#each resourcesStore.projectFunctions as projectFunction}
			<Card.Root>
				<Card.Content>
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<p class="text-sm">{projectFunction.name}</p>
								<Badge>Project</Badge>
							</div>
							<p class="text-xs text-gray-400">No parameters</p>
							<!-- <p class="text-xs">Parameters: firstName, lastName</p> -->
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
		{#each resourcesStore.testSuiteFunctions as testSuiteFunction}
			<Card.Root>
				<Card.Content>
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-2">
							<p class="text-sm">{testSuiteFunction.name}</p>
							<p class="text-xs text-gray-400">No parameters</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</Collapsible.Content>
</Collapsible.Root>

<CreateFunctionModal {modalStore} />
