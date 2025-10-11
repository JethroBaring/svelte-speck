<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CREATE_TEST_SUITE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useTestSuites } from '$lib/queries/use-test-suites';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { FileText, PlusCircleIcon } from '@lucide/svelte';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	const workspaceId = $derived(page.params.workspaceId);
	const projectId = $derived(page.params.projectId);
	const testSuitesQuery = $derived(useTestSuites(projectId));

	const modalStore = getModalStore(CREATE_TEST_SUITE_MODAL_KEY);
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
	<div class="flex w-[60%] items-center gap-2">
		<div class="relative flex-1">
			<Input id="search" placeholder="Search for test suites..." class="pl-8" />
			<SearchIcon
				class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
			/>
		</div>
		<Select.Root type="single">
			<Select.Trigger class="w-[180px]">Status</Select.Trigger>
			<Select.Content>
				<Select.Item value="light">Light</Select.Item>
				<Select.Item value="dark">Dark</Select.Item>
				<Select.Item value="system">System</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex-1 overflow-y-scroll">
		{#if testSuitesQuery.isLoading}
			<div class="flex h-full">
				<div class="flex flex-1 flex-col">
					<div class="flex flex-1 items-center justify-center">
						<div class="text-center">
							<div
								class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"
							></div>
							<p class="text-gray-600 dark:text-gray-400">Loading test suites...</p>
						</div>
					</div>
				</div>
			</div>
		{:else if testSuitesQuery.data?.data?.length === 0}
			<div class="flex h-full">
				<div class="flex flex-1 flex-col">
					<div class="flex flex-1 items-center justify-center">
						<div class="mx-auto max-w-md px-4 text-center">
							<div
								class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
							>
								<FileText class="h-10 w-10 text-gray-400 dark:text-gray-500" />
							</div>

							<h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
								No Test Suites Yet
							</h2>

							<p class="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
								This project doesn't have any test suites yet. Create your first test suite to start
								organizing and running your tests.
							</p>

							<div class="space-y-3">
								<Button class="w-full" onclick={() => modalStore.open()}>
									<PlusCircleIcon class="mr-2 h-5 w-5" />
									Create Test Suite
								</Button>

								<p class="text-sm text-gray-500 dark:text-gray-400">
									You can add, organize, and manage your test suites here.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="grid h-0 grid-cols-3 gap-4">
				{#if testSuitesQuery.data?.data}
					{#each testSuitesQuery.data?.data as testSuite}
						<a href={`/workspace/${workspaceId}/project/${projectId}/test-suite/${testSuite.id}`}>
							<Card.Root>
								<Card.Content>
									<div class="mb-4 flex items-start justify-between">
										<div class="flex items-start gap-3">
											<Checkbox />
											<div>
												<h3 class="text-sm font-semibold text-gray-900 dark:text-white">
													{testSuite.name}
												</h3>
											</div>
										</div>
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												<EllipsisIcon class="h-4 w-4 text-gray-400" />
												<span class="sr-only">More</span>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content class="w-48 rounded-lg" side="bottom" align="end">
												<DropdownMenu.Item>
													<CopyIcon class="text-muted-foreground" />
													<span>Duplicate Suite</span>
												</DropdownMenu.Item>
												<DropdownMenu.Separator />
												<DropdownMenu.Item>
													<Trash2Icon class="text-muted-foreground" />
													<span>Delete Suite</span>
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>

									<div class="mb-4">
										<!-- {getStatusBadge(suite.status)} -->
									</div>

									<div class="mb-4 space-y-3">
										<div class="flex items-center justify-between">
											<div class="text-center">
												<div class="text-xl font-bold text-gray-900 dark:text-white">1</div>
												<div class="text-xs text-gray-500 dark:text-gray-400">Total Tests</div>
											</div>
											<div class="mx-4 flex-1">
												<div
													class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
												>
													<span>Tests Status</span>
													<span>1/1</span>
												</div>
												<div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
													<div
														class="h-2 rounded-full bg-green-500 transition-all duration-300"
														style:width={`100%`}
													></div>
												</div>
											</div>
											<div class="text-center">
												<div class="text-xl font-bold text-green-600 dark:text-green-400">100%</div>
												<div class="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
											</div>
										</div>
									</div>

									<div
										class="mb-4 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
									>
										<ClockIcon class="h-4 w-4" />
										<span>2h ago</span>
									</div>
								</Card.Content>
							</Card.Root>
						</a>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
