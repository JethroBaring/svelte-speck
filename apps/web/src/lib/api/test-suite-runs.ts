import type { TestSuiteRun } from '@repo/types/zod';
import type { ApiResponse } from '../api-response.interface';
import axiosInstance from '../axios';

export async function runTestSuite(testSuiteId: string): Promise<ApiResponse<any>> {
	const response = await axiosInstance.post(`/test-suite-runs/run-suite/${testSuiteId}`);

	if (!response.data) {
		throw new Error('Failed to run test suite');
	}

	return response.data;
}

export async function getLatestTestSuiteRun(testSuiteId: string): Promise<ApiResponse<TestSuiteRun>> {
	const response = await axiosInstance.get(`/test-suite-runs/${testSuiteId}/latest-run`);

	if (!response.data) {
		throw new Error('Failed to fetch latest test suite run');
	}

	return response.data;
}
