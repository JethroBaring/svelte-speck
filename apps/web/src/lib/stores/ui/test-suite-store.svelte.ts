import type { TestSuiteRun, TestSuites } from '@repo/types/zod';
import { getContext, setContext } from 'svelte';

export class TestSuiteStore {
	testSuite = $state<TestSuites | null>(null);
	testSuites = $state<TestSuites[]>([]);
	testSuiteRuns = $state<TestSuiteRun[]>([]);
	isLoading = $state(false);

	constructor(testSuite: TestSuites | null = null) {
		this.testSuite = testSuite;
	}

	updateTestSuite(testSuite: TestSuites) {
		this.testSuite = testSuite;
	}

	setIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}
}

const TEST_SUITE_KEY = Symbol('test-suite');

export function setTestSuiteStore(testSuite: TestSuites | null = null) {
	return setContext(TEST_SUITE_KEY, new TestSuiteStore(testSuite));
}

export function getTestSuiteStore() {
	return getContext<TestSuiteStore>(TEST_SUITE_KEY);
}
