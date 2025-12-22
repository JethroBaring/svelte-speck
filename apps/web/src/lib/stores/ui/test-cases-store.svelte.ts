import { getFilePublicUrl } from "$lib/api/files";
import type { TestCase, TestCaseRun, TestStepResult, TestStepStatusType } from '@repo/types/zod';
import { getContext, setContext } from 'svelte';

type TestCaseRuns = TestCaseRun & {
	stepResults?: TestStepResult[];
};

export class TestCasesStore {
	testCase = $state<TestCase | null>(null);
	testCases = $state<TestCase[]>([]);
	testCaseRuns = $state<TestCaseRuns[]>([]);
	isLoading = $state(false);

	constructor(testCases: TestCase[] = [], testCaseRuns: TestCaseRuns[] = []) {
		this.testCases = testCases;
		this.testCaseRuns = testCaseRuns;
	}

	updateTestCases(testCases: TestCase[]) {
		this.testCases = testCases;
	}

	setIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setTestCase(testCase: TestCase) {
		this.testCase = testCase;
	}

	updateTestCaseRuns(testCaseRuns: TestCaseRuns[]) {
		this.testCaseRuns = testCaseRuns;
	}

	startTestCaseRun(testCaseRunId: string) {
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId ? { ...testCaseRun, status: 'RUNNING' } : testCaseRun
		);
	}

	completeTestCaseRun(testCaseRunId: string, status: TestStepStatusType) {
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId ? { ...testCaseRun, status: status } : testCaseRun
		);
		console.log('completeTestCaseRun', this.testCaseRuns.find((testCaseRun) => testCaseRun.id === testCaseRunId)?.stepResults);
	}

	cancelTestCaseRun(testCaseRunId: string) {
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId ? { ...testCaseRun, status: 'FAILED' } : testCaseRun
		);
	}

	startTestStep(testCaseRunId: string, testStep: any) {
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId
				? {
						...testCaseRun,
						stepResults: [...(testCaseRun.stepResults || []), testStep]
					}
				: testCaseRun
		);
	}

	async completeTestStep(testCaseRunId: string, testStep: any) {
		console.log("completeTestStep", testStep);
		// Extract only the filename from the screenshotUrl (strip any URL prefix/path)
		const screenshotFilename = testStep.screenshotUrl?.split('/').pop();
		const screenshotUrl = screenshotFilename ? await getFilePublicUrl(screenshotFilename) : { data: undefined };
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId
				? {
						...testCaseRun,
						stepResults: testCaseRun.stepResults?.map((stepResult) =>
							stepResult.stepNumber === testStep.stepNumber
								? { ...stepResult, status: testStep.status, screenshot: screenshotUrl.data! }
								: stepResult
						)
					}
				: testCaseRun
		);
	}

	cancelTestStep(testCaseRunId: string, testStep: any) {
		this.testCaseRuns = this.testCaseRuns.map((testCaseRun) =>
			testCaseRun.id === testCaseRunId
				? {
						...testCaseRun,
						stepResults: testCaseRun.stepResults?.map((stepResult) =>
							stepResult.stepNumber === stepResult.stepNumber ? { ...stepResult, status: testStep.status } : stepResult
						)
					}
				: testCaseRun
		);
	}
}

const TEST_CASES_KEY = Symbol('test-cases');

export function setTestCasesStore(testCases: TestCase[] = []) {
	return setContext(TEST_CASES_KEY, new TestCasesStore(testCases));
}

export function getTestCasesStore() {
	return getContext<TestCasesStore>(TEST_CASES_KEY);
}
