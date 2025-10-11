<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { ModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getResourcesStore } from '$lib/stores/ui/resources-store.svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CreateVariableModal from './create-variable-modal.svelte';

	const modalStore = new ModalStore();
	let isOpen = $state(true);
	const resourcesStore = getResourcesStore();
</script>

<Collapsible.Root class="flex flex-col gap-2 text-sm" bind:open={isOpen}>
	<Collapsible.Trigger onclick={(e) => e.stopPropagation()}>
		{#snippet child({ props })}
			<div class="flex items-center justify-between gap-2 text-gray-400">
				Variables
				<div class="flex items-center gap-[2px]">
					<Button
						onclick={(e) => {
							e.stopPropagation();
							modalStore.open();
						}}
						variant="ghost"
						class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
					>
						<PlusIcon class="size-4" />
					</Button>
					<Button
						{...props}
						variant="ghost"
						class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
					>
						<ChevronDownIcon class="size-4" />
					</Button>
				</div>
			</div>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content class="flex flex-col gap-2">
		{#each resourcesStore.projectVariables as variable}
			<Card.Root>
				<Card.Content>
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<p class="text-sm">{variable.name}</p>
								<Badge>Project</Badge>
							</div>
							<p class="text-xs text-gray-400">{variable.value}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
		{#each resourcesStore.testSuiteVariables as variable}
			<Card.Root>
				<Card.Content>
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-2">
							<p class="text-sm">{variable.name}</p>
							<p class="text-xs text-gray-400">{variable.value}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</Collapsible.Content>
</Collapsible.Root>

<CreateVariableModal {modalStore} />
