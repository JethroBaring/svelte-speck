<script lang="ts">
	import { page } from '$app/state';
	import { updateTestCase } from '$lib/api/test-cases';
	import TextEditor from '$lib/components/text-editor/text-editor.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { useAutosave } from '$lib/hooks/auto-save.svelte';
	import { getTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import type { TestCaseUpdateInput } from '@repo/types';
	import type { TestCase } from '@repo/types/zod';
	import Comments from './comments.svelte';
	import TestTubeDiagonal from '@lucide/svelte/icons/test-tube-diagonal';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { Badge } from '$lib/components/ui/badge';
	import { tick } from 'svelte';
	import { getResourcesStore } from '$lib/stores/ui/resources-store.svelte';
	import { Scanner, Parser, Interpreter, Environment } from '@repo/interpreter';
	
	const testCaseId = $derived(page.url.searchParams.get('testCaseId'));
	const testCasesStore = getTestCasesStore();

	let isCommentsOpen = $state(false);
	let code = $state('');
	let currentEditingId = $state<string | null>(null);
	let showSavedIndicator = $state(false);

	const testCase = $derived(
		testCasesStore.testCases.find((testCase) => testCase.id === testCaseId)
	);

	const autosave = useAutosave(
		() => code,
		async (value, signal) => {
			if (!currentEditingId) return;
			const payload = { code: value } as unknown as TestCaseUpdateInput;
			const res = await updateTestCase(currentEditingId, payload, { signal });
			if (res.data) {
				testCasesStore.updateTestCases(
					testCasesStore.testCases.map((testCase) =>
						testCase.id === res.data?.id ? (res.data as TestCase) : testCase
					)
				);
			}
		},
		{ delayMs: 800, enabled: true }
	);

	const onChange = (value: string) => {
		code = value;
	};

	const closeComments = () => {
		isCommentsOpen = false;
	};

	$effect(() => {
		if (testCaseId !== currentEditingId) {
			if (currentEditingId !== null) {
				autosave.flush();
			}

			if (testCase) {
				currentEditingId = testCaseId;
				code = testCase.code;
			}
		}
	});

	// Show saved indicator when save completes
	$effect(() => {
		if (autosave.lastSavedAt && !autosave.isSaving && !autosave.error) {
			showSavedIndicator = true;
			// Hide after 2 seconds
			setTimeout(() => {
				showSavedIndicator = false;
			}, 2000);
		}
	});

	let isEditingTitle = $state(false);
	let titleDraft = $state('');
	let titleEl: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (testCase) {
			titleDraft = testCase.name || '';
		}
	});

	async function saveTitle() {
		const res = await updateTestCase(testCaseId!, { name: titleDraft });
		if (res.data) {
			testCasesStore.updateTestCases(
				testCasesStore.testCases.map((testCase) =>
					testCase.id === res.data?.id ? (res.data as TestCase) : testCase
				)
			);
		}
	}

	async function beginEditTitle() {
		isEditingTitle = true;
		await tick();
		if (titleEl) {
			titleEl.focus();
			// place caret at end
			const selection = window.getSelection();
			if (selection) {
				const range = document.createRange();
				range.selectNodeContents(titleEl);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	}
	const resourcesStore = getResourcesStore();
	const variables = $derived(resourcesStore.getVariablesKeywords());
	const functions = $derived(resourcesStore.getFunctionsKeywords());
</script>

<div class="flex flex-1 gap-3 p-3">
	<div class="grid w-full flex-1 gap-3">
		{#if testCaseId}
			<InputGroup.Root>
				<InputGroup.Addon align="block-start" class="border-b">
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<InputGroup.Text class="text-base font-medium">
						<TestTubeDiagonal class="size-4" />
						<!-- Editable title with hover edit icon -->
						<div class="group relative flex items-center gap-2">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							{#if isEditingTitle}
								<div
									contenteditable="true"
									bind:this={titleEl}
									bind:innerText={titleDraft}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											isEditingTitle = false;
											saveTitle();
										}
									}}
									onblur={() => {
										isEditingTitle = false;
										saveTitle();
									}}
									class="outline-none"
								>
									{titleDraft}
								</div>
							{:else}
								<div onclick={beginEditTitle} class="cursor-text">
									{titleDraft}
								</div>
							{/if}
							{#if !isEditingTitle}
								<button
									type="button"
									onclick={beginEditTitle}
									class="opacity-0 transition-opacity group-hover:opacity-100"
									title="Edit title"
								>
									<Pencil class="size-3.5 text-gray-400" />
								</button>
							{/if}
						</div>
					</InputGroup.Text>
					<InputGroup.Button
						class="ml-auto"
						size="icon-xs"
						onclick={() => (isCommentsOpen = !isCommentsOpen)}
					>
						<MessageCircleIcon class={isCommentsOpen ? 'text-brand-500' : ''} />
					</InputGroup.Button>
				</InputGroup.Addon>
				<div class="relative w-full flex-1 p-3">
					<TextEditor {code} {onChange} {variables} {functions} />

					<!-- Enhanced saving indicator -->
					<div class="absolute bottom-3 right-3">
						{#if autosave.isSaving}
							<Badge variant="outline" class="absolute bottom-3 right-3">Saving...</Badge>
						{:else if autosave.error}
							<Badge variant="outline" class="absolute bottom-3 right-3">Save failed</Badge>
						{:else if showSavedIndicator}
							<Badge variant="outline" class="absolute bottom-3 right-3">Saved</Badge>
						{/if}
					</div>
				</div>
			</InputGroup.Root>
		{:else}
			<div class="flex h-full items-center justify-center">
				<p class="text-sm text-gray-500">No test case selected</p>
			</div>
		{/if}
	</div>
	{#if isCommentsOpen}
		<Comments {closeComments} />
	{/if}
</div>
