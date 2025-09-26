import type { TestSuiteFunctionCreateInput } from "@repo/types/schemas"
import type { ApiResponse } from "../interface"
import type { TestSuiteFunction } from "@repo/types/zod";
import axiosInstance from "../axios";

export async function getTestSuiteFunctions(testSuiteId: string): Promise<ApiResponse<TestSuiteFunction[]>> {
  const response = await axiosInstance.get(`/test-suites/${testSuiteId}/test-suite-functions`)

  if(!response.data) {
    throw new Error("Failed to fetch test suite functions")
  }

  return response.data
}

export async function getTestSuiteFunctionById(testSuiteId: string, testSuiteFunctionId: string): Promise<ApiResponse<TestSuiteFunction>> {

  const response = await axiosInstance.get(`/test-suites/${testSuiteId}/test-suite-functions/${testSuiteFunctionId}`)

  if(!response.data) {
    throw new Error("Failed to fetch test suite function")
  }

  return response.data  
}

export async function createTestSuiteFunction(testSuiteId: string, createTestSuiteFunctionDto: TestSuiteFunctionCreateInput): Promise<ApiResponse<TestSuiteFunction>> {
  const response = await axiosInstance.post(`/test-suites/${testSuiteId}/test-suite-functions`, createTestSuiteFunctionDto)

  if(!response.data) {
    throw new Error("Failed to create test suite function")
  }

  return response.data
}

export async function deleteTestSuiteFunction(testSuiteId: string, testSuiteFunctionId: string): Promise<ApiResponse<TestSuiteFunction>> {
  const response = await axiosInstance.delete(`/test-suites/${testSuiteId}/test-suite-functions/${testSuiteFunctionId}`)

  if(!response.data) {
    throw new Error("Failed to delete test suite function")
  }

  return response.data
}