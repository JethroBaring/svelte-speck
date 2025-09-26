import type { TestSuiteVariableCreateInput } from '@repo/types/schemas';
import type { ApiResponse } from '../interface';
import type { TestSuiteVariable } from '@repo/types/zod';
import axiosInstance from '../axios';

export async function getTestSuiteVariables(
	testSuiteId: string
): Promise<ApiResponse<TestSuiteVariable[]>> {
	const response = await axiosInstance.get(`/test-suites/${testSuiteId}/test-suite-variables`);

	if (!response.data) {
		throw new Error('Failed to fetch test suite variables');
	}

	return response.data;
}

export async function getTestSuiteById(
	testSuiteId: string
): Promise<ApiResponse<TestSuiteVariable>> {
	const response = await axiosInstance.get(`/test-suites/${testSuiteId}`);

	if (!response.data) {
		throw new Error('Failed to fetch test suite variables');
	}

	return response.data;
}

export async function createTestSuiteVariable(
	testSuiteId: string,
	createTestSuiteVariableDto: TestSuiteVariableCreateInput
): Promise<ApiResponse<TestSuiteVariable>> {
	const response = await axiosInstance.post(
		`/test-suites/${testSuiteId}/test-suite-variables`,
		createTestSuiteVariableDto
	);

	if (!response.data) {
		throw new Error('Failed to create test suite variable');
	}

	return response.data;
}

export async function deleteTestSuiteVariable(
	testSuiteId: string,
	testSuiteVariableId: string
): Promise<ApiResponse<TestSuiteVariable>> {
	const response = await axiosInstance.delete(
		`/test-suites/${testSuiteId}/test-suite-variables/${testSuiteVariableId}`
	);

	if (!response.data) {
		throw new Error('Failed to delete test suite variable');
	}

	return response.data;
}
