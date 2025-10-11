<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Circle from '@lucide/svelte/icons/circle';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { getTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	interface TestCaseCardProps {
		testCase: any;
	}

	let { testCase }: TestCaseCardProps = $props();

	const getUrl = () => {
		const url = new URL(page.url);
		url.searchParams.set('testCaseId', testCase.id);
		goto(url.toString());
	};

	const testCasesStore = getTestCasesStore();
	const testCaseRun = $derived(
		testCasesStore.testCaseRuns.find((testCaseRun) => testCaseRun.testCaseId === testCase.id)
	);
	const stepReults = $derived(
		testCase.code.split('\n').filter((line: string) => line.trim() !== '')
	);
</script>

<Card.Root onclick={getUrl}>
	<Card.Content>
		<Collapsible.Root class="flex flex-col gap-4 text-sm">
			<Collapsible.Trigger onclick={(e) => e.stopPropagation()}>
				{#snippet child({ props })}
					<div class="flex items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							{#if testCaseRun?.status === 'RUNNING'}
								<LoaderCircle class="size-4 animate-spin text-yellow-500" />
							{:else if testCaseRun?.status === 'PASSED'}
								<CircleCheck class="size-4 text-green-500" />
							{:else if testCaseRun?.status === 'FAILED'}
								<CircleX class="size-4 text-red-500" />
							{:else}
								<Circle class="size-4" />
							{/if}
							{testCase.name}
						</div>
						<Button
							variant="ghost"
							class="flex size-6 items-center justify-center rounded-[calc(var(--radius)-5px)] hover:bg-gray-800 active:bg-gray-800"
							{...props}
						>
							<ChevronDownIcon class="size-4" />
						</Button>
					</div>
				{/snippet}
			</Collapsible.Trigger>
			<Collapsible.Content class="flex flex-col gap-2">
				<div class="flex flex-col gap-4">
					{#each stepReults as testStep, index}
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								{#if testCaseRun?.stepResults?.[index]?.status === 'RUNNING'}
									<LoaderCircle class="size-4 animate-spin text-yellow-500" />
								{:else if testCaseRun?.stepResults?.[index]?.status === 'PASSED'}
									<CircleCheck class="size-4 text-green-500" />
								{:else if testCaseRun?.stepResults?.[index]?.status === 'FAILED'}
									<CircleX class="size-4 text-red-500" />
								{:else}
									<Circle class="size-4" />
								{/if}
								<p>{testStep}</p>
							</div>
							<div
								class="flex aspect-[16/9] w-full items-center justify-center rounded-sm bg-gray-800 p-2"
							>
								<img src={(testCaseRun?.stepResults?.[index]?.screenshot as any)?.url} alt="screenshot" class="w-full h-full object-cover" />
							</div>
						</div>
					{/each}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	</Card.Content>
</Card.Root>
