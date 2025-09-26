<script lang="ts">
	import { ModalStore } from '@/lib/stores/ui/modal-store.svelte';
	import ProjectModal from './modals/create-test-suite-modal.svelte';
	import { useProject } from '@/lib/queries/use-projects';
	import { useTestSuites } from '@/lib/queries/use-test-suites';
	import { useCreateTestSuite } from '@/lib/queries/use-test-suites';
	import { getToastStore } from '@/lib/stores/ui/toast-store.svelte';
	import type { TestSuites } from '@repo/types/zod';
	import { ProjectRightSidebar } from './right-sidebar';
	import { Button } from '../ui/button';
	import {
		CheckCircle,
		Clock,
		FileText,
		Folder,
		MoreVertical,
		Play,
		PlusCircle,
		Search
	} from 'lucide-svelte';
	import { Card } from '../ui/card';
	import { Checkbox } from '../ui/checkbox';
	import { Input } from '../ui/input';
	import { Select } from '../ui/select';
	import { RightSidebarTab } from "../common";

	interface ProjectProps {
		projectId: string;
	}

	let { projectId }: ProjectProps = $props();

	const modalStore = new ModalStore();
	const toastStore = getToastStore();

	let selectedTestSuites = $state<string[]>([]);
	let searchQuery = $state('');
	const projectQuery = useProject(projectId);
	const testSuitesQuery = useTestSuites(projectId);
	const createTestSuiteMutation = useCreateTestSuite(projectId);

	const handleTestSuitesSelection = (testSuiteId: string) => {
		if (selectedTestSuites.includes(testSuiteId)) {
			selectedTestSuites = selectedTestSuites.filter((id) => id !== testSuiteId);
		} else {
			selectedTestSuites = [...selectedTestSuites, testSuiteId];
		}
	};

	const filteredSuites: any[] = $derived(
		testSuitesQuery?.data?.data
			? testSuitesQuery?.data?.data.filter(
					(suite: TestSuites) =>
						suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						suite.description?.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: []
	);

	const tabs = [
		{ label: 'Test Suites', value: 'test-suites', content: Button  },
		{ label: 'Test Cases', value: 'test-cases' },
		{ label: 'Test Runs', value: 'test-runs' }
	];

	let activeTab = $state('test-suites');
	const onTabChange = (tab: string) => {
		activeTab = tab;
	};
</script>

<div class="flex h-full">
	<div class="flex h-full flex-1 flex-col">
		<div class="border-b border-gray-200 lg:border-l dark:border-gray-800 dark:bg-gray-900">
			<div class="flex items-start justify-between p-4">
				<div class="flex flex-col gap-2">
					<div class="flex items-center gap-2 text-gray-400">
						<Folder class="h-6 w-6" />
						<h1 class="text-lg font-semibold">{projectQuery?.data?.data?.name}</h1>
					</div>
					<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
						<div class="flex items-center gap-1">
							<FileText class="h-4 w-4 text-blue-500" />
							<span>{(projectQuery?.data?.data as any)?._count?.testSuites} test suites</span>
						</div>
						<div class="flex items-center gap-1">
							<CheckCircle class="h-4 w-4 text-green-500" />
							<span>
								{(projectQuery?.data?.data as any)?.testSuites?.reduce(
									(total: number, suite: any) => total + (suite._count?.testCases || 0),
									0
								) || 0} test cases
							</span>
						</div>
						<div class="flex items-center gap-1">
							<Clock class="h-4 w-4 text-gray-500" />
							<span>Last run: 2h ago</span>
						</div>
						<div class="flex items-center gap-1">
							<span>85% pass rate</span>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Button size="xs">
						<Play class="h-4 w-4" />
						{#if selectedTestSuites.length > 0}
							Run {selectedTestSuites.length} Selected
						{:else}
							Run All Tests
						{/if}
					</Button>
					<Button size="xs" variant="outline" onClick={modalStore.openModal}>
						<PlusCircle class="h-4 w-4" />
						New Suite
					</Button>
				</div>
			</div>
		</div>
		<div class="flex flex-1 flex-col space-y-4 p-4">
			<div class="flex items-center justify-between">
				<div class="flex flex-1 items-center gap-3">
					<div class="relative max-w-md flex-1">
						<Search
							class="absolute top-1/2 left-3 z-9 h-4 w-4 -translate-y-1/2 transform text-gray-400"
						/>
						<Input
							bind:value={searchQuery}
							placeholder="Search test suites..."
							className="!pl-10 !pr-4"
						/>
					</div>

					<Select
						className="max-w-40"
						options={[
							{ value: 'All Status', label: 'All Status' },
							{ value: 'Passed', label: 'Passed' },
							{ value: 'Failed', label: 'Failed' },
							{ value: 'Running', label: 'Running' },
							{ value: 'Not Run', label: 'Not Run' }
						]}
						onChange={() => {}}
					/>
				</div>
			</div>

			{#if filteredSuites.length === 0}
				<div class="flex flex-1 items-center justify-center">
					<div class="mx-auto max-w-md px-4 text-center">
						<div
							class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
						>
							{#if testSuitesQuery?.data?.data && testSuitesQuery?.data?.data.length > 0}
								<Search class="h-12 w-12 text-gray-400 dark:text-gray-500" />
							{:else}
								<FileText class="h-12 w-12 text-gray-400 dark:text-gray-500" />
							{/if}
						</div>

						<h2 class="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
							{#if testSuitesQuery?.data?.data && testSuitesQuery?.data?.data.length > 0}
								No test suites found
							{:else}
								No test suites in this project
							{/if}
						</h2>

						<p class="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
							{#if testSuitesQuery?.data?.data && testSuitesQuery?.data?.data.length > 0}
								Try adjusting your search or filter criteria.
							{:else}
								Get started by creating your first test suite to organize and manage your test
								cases.
							{/if}
						</p>

						{#if !testSuitesQuery?.data?.data || testSuitesQuery?.data?.data.length === 0}
							<div class="space-y-3">
								<Button size="xs" className="w-full" onClick={modalStore.openModal}>
									<PlusCircle class="mr-2 h-5 w-5" />
									Create Test Suite
								</Button>

								<p class="text-sm text-gray-500 dark:text-gray-400">
									Organize your test cases and track execution results
								</p>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredSuites as suite (suite.id)}
						<a href="/projects/{projectId}/test-suites/{suite.id}">
							<Card className="p-6 hover:shadow-lg transition-shadow">
								<div class="mb-4 flex items-start justify-between">
									<div class="flex items-start gap-3">
										<Checkbox
											checked={selectedTestSuites.includes(suite.id)}
											onChange={() => handleTestSuitesSelection(suite.id)}
										/>
										<div>
											<h3 class="font-semibold text-gray-900 dark:text-white">{suite.name}</h3>
											<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
												{suite.description}
											</p>
										</div>
									</div>
									<button class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
										<MoreVertical class="h-4 w-4 text-gray-400" />
									</button>
								</div>

								<div class="mb-4">
									<!-- {getStatusBadge(suite.status)} -->
								</div>

								<div class="mb-4 space-y-3">
									<div class="flex items-center justify-between">
										<div class="text-center">
											<div class="text-2xl font-bold text-gray-900 dark:text-white">
												{suite.totalTests}
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400">Total Tests</div>
										</div>
										<div class="mx-4 flex-1">
											<div
												class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
											>
												<span>Tests Status</span>
												<span>{suite.passedTests}/{suite.totalTests}</span>
											</div>
											<div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
												<div
													class="h-2 rounded-full bg-green-500 transition-all duration-300"
													style:width={`${suite.successRate}%`}
												></div>
											</div>
										</div>
										<div class="text-center">
											<div class="text-2xl font-bold text-green-600 dark:text-green-400">
												{suite.successRate}%
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
										</div>
									</div>
								</div>

								<div class="mb-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
									<Clock class="h-4 w-4" />
									<span>{suite.lastRun}</span>
								</div>

								<div class="flex gap-2">
									<Button className="flex-1" size="xs">
										<Play class="h-4 w-4" />
										Run Suite
									</Button>
								</div>
							</Card>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<ProjectRightSidebar {projectId} />
</div>

<ProjectModal isOpen={modalStore.isOpen} onClose={modalStore.closeModal} projectId={projectId} />
