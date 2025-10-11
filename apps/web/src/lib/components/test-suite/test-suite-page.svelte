<script lang="ts">
	import { page } from '$app/state';
	import { CREATE_TEST_CASE_MODAL_KEY } from '$lib/constants/modal-keys';
	import { useTestSuite } from '$lib/queries/use-test-suites';
	import { setModalStore } from '$lib/stores/ui/modal-store.svelte';
	import { setTestCasesStore } from '$lib/stores/ui/test-cases-store.svelte';
	import { getTestSuiteStore } from '$lib/stores/ui/test-suite-store.svelte';
	import { setTestSuiteRunnerStore } from '$lib/stores/websocket/test-suite-runner-store.svelte';
	import TestRunnerIndicator from '$lib/components/test-runner-indicator.svelte';
	import MainSection from './main-section/main-section.svelte';
	import CreateTestCaseModal from './right-sidebar/tabs/test-cases-tab/create-test-case-modal.svelte';
	import TestSuiteRightSidebar from './right-sidebar/test-suite-right-sidebar.svelte';
	import { setResourcesStore } from '$lib/stores/ui/resources-store.svelte';
	import { useProjectVariables } from '$lib/queries/use-project-variables';
	import { useTestSuiteVariables } from '$lib/queries/use-test-suite-variables';
	import { useProjectFunctions } from '$lib/queries/use-project-functions';
	import { useTestSuiteFunctions } from '$lib/queries/use-test-suite-functions';

	const testSuiteId = $derived(page.params.testSuiteId);
	const testSuiteQuery = $derived(useTestSuite(testSuiteId));
	const testSuiteStore = getTestSuiteStore();

	$effect(() => {
		if (testSuiteQuery.data?.data) {
			testSuiteStore.updateTestSuite(testSuiteQuery.data.data);
		}
	});

	setModalStore(CREATE_TEST_CASE_MODAL_KEY);
	setTestCasesStore();
	const testSuiteRunnerStore = setTestSuiteRunnerStore();
	testSuiteRunnerStore.initialize();
	const resourcesStore = setResourcesStore();
	const projectId = $derived(page.params.projectId);
	const projectVariablesQuery = $derived(useProjectVariables(projectId));
	const testSuiteVariablesQuery = $derived(useTestSuiteVariables(testSuiteId));
	const projectFunctionsQuery = $derived(useProjectFunctions(projectId));
	const testSuiteFunctionsQuery = $derived(useTestSuiteFunctions(testSuiteId));

	$effect(() => {
		if (projectVariablesQuery.data?.data) {
			resourcesStore.updateProjectVariables(projectVariablesQuery.data.data);
		}
		if (testSuiteVariablesQuery.data?.data) {
			resourcesStore.updateTestSuiteVariables(testSuiteVariablesQuery.data.data);
		}
	});

	$effect(() => {
		if (projectFunctionsQuery.data?.data) {
			resourcesStore.updateProjectFunctions(projectFunctionsQuery.data.data);
		}
		if (testSuiteFunctionsQuery.data?.data) {
			resourcesStore.updateTestSuiteFunctions(testSuiteFunctionsQuery.data.data);
		}
	});
</script>

<div class="flex h-full w-full">
	<MainSection />
	<TestSuiteRightSidebar />
</div>
<CreateTestCaseModal />
<TestRunnerIndicator />