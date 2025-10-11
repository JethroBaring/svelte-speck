import type { TestSuiteRun, TestSuites } from '@repo/types/zod';
import type { ApiResponse } from '../api-response.interface';
import axiosInstance from '../axios';

export async function getTestSuites(projectId: string): Promise<ApiResponse<TestSuites[]>> {
	const response = await axiosInstance.get(`/projects/${projectId}/test-suites`);

	if (!response.data) {
		throw new Error('Failed to fetch test suites');
	}

	return response.data;
}

export async function getTestSuiteById(testSuiteId: string): Promise<ApiResponse<TestSuites>> {
	const response = await axiosInstance.get(`/test-suites/${testSuiteId}`);

	if (!response.data) {
		throw new Error('Failed to fetch test suite');
	}

	return response.data;
}

export async function createTestSuite(
	projectId: string,
	name: string
): Promise<ApiResponse<TestSuites>> {
	const response = await axiosInstance.post(`/projects/${projectId}/test-suites`, { name });

	if (!response.data) {
		throw new Error('Failed to create test suite');
	}

	return response.data;
}

export async function deleteTestSuite(
	projectId: string,
	testSuiteId: string
): Promise<ApiResponse<TestSuites>> {
	const response = await axiosInstance.delete(`/projects/${projectId}/test-suites/${testSuiteId}`);

	if (!response.data) {
		throw new Error('Failed to delete test suite');
	}

	return response.data;
}

export async function runTestSuite(testSuiteId: string): Promise<ApiResponse<any>> {
	const response = await axiosInstance.post(`/test-runner/run-suite/${testSuiteId}`);

	if (!response.data) {
		throw new Error('Failed to run test suite');
	}

	return response.data;
}

export async function getLatestTestSuiteRun(testSuiteId: string): Promise<ApiResponse<TestSuiteRun>> {
	const response = await axiosInstance.get(`/test-suites/${testSuiteId}/latest-run`);

	if (!response.data) {
		throw new Error('Failed to fetch latest test suite run');
	}

	return response.data;
}
