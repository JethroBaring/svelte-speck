import type { TestCaseCreateInput, TestCaseUpdateInput } from "@repo/types/schemas"
import type { ApiResponse } from "../interface"
import type { TestCase } from "@repo/types/zod"
import axiosInstance from "../axios";

export async function getTestCases(testSuiteId: string): Promise<ApiResponse<TestCase[]>> {
  const response = await axiosInstance.get(`/test-suites/${testSuiteId}/test-cases`)

  if(!response.data) {
    throw new Error("Failed to fetch test cases")
  }

  return response.data
}

export async function getTestCaseById(testCaseId: string): Promise<ApiResponse<TestCase>> {

  const response = await axiosInstance.get(`/test-cases/${testCaseId}`)

  if(!response.data) {
    throw new Error("Failed to fetch test case")
  }

  return response.data  
}

export async function createTestCase(testSuiteId: string, createTestCaseDto: TestCaseCreateInput): Promise<ApiResponse<TestCase>> {
  const response = await axiosInstance.post(`/test-suites/${testSuiteId}/test-cases/`, createTestCaseDto)

  if(!response.data) {
    throw new Error("Failed to create test case")
  }

  return response.data
}

export async function deleteTestCase(testCaseId: string): Promise<ApiResponse<TestCase>> {
  const response = await axiosInstance.delete(`/test-cases/${testCaseId}`)

  if(!response.data) {
    throw new Error("Failed to delete test case")
  }

  return response.data
}

export async function updateTestCase(testCaseId: string, updateTestCaseDto: TestCaseUpdateInput, opts?: { signal?: AbortSignal }): Promise<ApiResponse<TestCase>> {
  const response = await axiosInstance.patch(`/test-cases/${testCaseId}`, updateTestCaseDto, {
    signal: opts?.signal,
  })

  if(!response.data) {
    throw new Error("Failed to update test case")
  }

  return response.data
}