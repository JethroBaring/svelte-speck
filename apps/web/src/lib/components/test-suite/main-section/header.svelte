<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CREATE_TEST_CASE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useLatestTestSuiteRun, useRunTestSuite } from '$lib/queries/use-test-suite-runs';
	import { getModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { getTestCasesStore } from "$lib/stores/ui/test-cases-store.svelte";
	import { getTestSuiteStore } from '$lib/stores/ui/test-suite-store.svelte';
	import { getTestSuiteRunnerStore } from '$lib/stores/websocket/test-suite-runner-store.svelte';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { default as FileText } from '@lucide/svelte/icons/file-text';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PlusCircleIcon from '@lucide/svelte/icons/plus-circle';
	import moment from "moment";

	const testSuiteId = $derived(page.params.testSuiteId);
	const modalStore = getModalStore(CREATE_TEST_CASE_MODAL_KEY);
	const testSuiteStore = getTestSuiteStore();
	const testSuiteRunnerStore = getTestSuiteRunnerStore();
	const runTestSuiteMutation = $derived(useRunTestSuite(testSuiteId));
	const latestTestSuiteRunQuery = $derived(useLatestTestSuiteRun(testSuiteId));
	const testCasesStore = getTestCasesStore()

	const isRunLocked = $derived(testSuiteRunnerStore.status === 'RUNNING');

	const handleRunTestSuite = () => {
		runTestSuiteMutation.mutateAsync(undefined, {
			onSuccess: (response) => {
				testSuiteRunnerStore.progress.completed = 0;
				testSuiteRunnerStore.progress.total = response.data.totalTestCases;
				testCasesStore.updateTestCaseRuns(response.data.testCaseRuns)
				testSuiteRunnerStore.joinTestSuiteRun(response.data.testSuiteRunId);
			},
			onError: () => {
			}
		});
	};

	$effect(() => {
		if (latestTestSuiteRunQuery.data?.data?.status === 'RUNNING') {
			console.log("joining existing test suite run", latestTestSuiteRunQuery.data.data.id);
			testSuiteRunnerStore.joinTestSuiteRun(latestTestSuiteRunQuery.data.data.id);
		}

		const latestRun = latestTestSuiteRunQuery.data?.data as any;
		if (latestRun?.testCaseRuns?.length > 0) {
			testCasesStore.updateTestCaseRuns(latestRun.testCaseRuns);
			console.log("latest test suite run", latestRun);
		}
	});
</script>

<div class="flex items-start justify-between border-b p-3">
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-2 text-gray-400">
			<FileText class="size-5" />
			<h1 class="text-base font-semibold">{testSuiteStore.testSuite?.name}</h1>
		</div>
		<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
			<div class="flex items-center gap-1">
				<CheckCircleIcon class="h-4 w-4 text-green-500" />
				<span> {latestTestSuiteRunQuery.data?.data?.totalTests} test cases </span>
			</div>
			<div class="flex items-center gap-1">
				<ClockIcon class="h-4 w-4 text-gray-500" />
				<span>Last run: {moment(latestTestSuiteRunQuery.data?.data?.completedAt).fromNow()}</span>
			</div>
			<div class="flex items-center gap-1">
				<span>{latestTestSuiteRunQuery.data?.data?.passedTests ? (latestTestSuiteRunQuery.data?.data?.passedTests / latestTestSuiteRunQuery.data?.data?.totalTests * 100).toFixed(2) : 0}% pass rate</span>
			</div>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<Button variant="outline" onclick={() => modalStore.open()}>
			<PlusCircleIcon class="h-4 w-4" />
			New Test Case
		</Button>
		<Button onclick={handleRunTestSuite} disabled={isRunLocked}>
			<PlayIcon class="h-4 w-4" />
			Run Test Suite
		</Button>
	</div>
</div>
