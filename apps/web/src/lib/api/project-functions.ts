import type { ProjectFunctionCreateInput } from "@repo/types/schemas"
import type { ApiResponse } from "../interface"
import type { ProjectFunction } from "@repo/types/zod";
import axiosInstance from "../axios";

export async function getProjectFunctions(projectId: string): Promise<ApiResponse<ProjectFunction[]>> {
  const response = await axiosInstance.get(`/projects/${projectId}/project-functions`)

  if(!response.data) {
    throw new Error("Failed to fetch project functions")
  }

  return response.data
}

export async function getProjectFunctionById(projectId: string, projectFunctionId: string): Promise<ApiResponse<ProjectFunction>> {

  const response = await axiosInstance.get(`/projects/${projectId}/project-functions/${projectFunctionId}`)

  if(!response.data) {
    throw new Error("Failed to fetch project function")
  }

  return response.data  
}

export async function createProjectFunction(projectId: string, createProjectFunctionDto: ProjectFunctionCreateInput): Promise<ApiResponse<ProjectFunction>> {
  const response = await axiosInstance.post(`/projects/${projectId}/project-functions`, createProjectFunctionDto)

  if(!response.data) {
    throw new Error("Failed to create project function")
  }

  return response.data
}

export async function deleteProjectFunction(projectId: string, projectFunctionId: string): Promise<ApiResponse<ProjectFunction>> {
  const response = await axiosInstance.delete(`/projects/${projectId}/project-functions/${projectFunctionId}`)

  if(!response.data) {
    throw new Error("Failed to delete project function")
  }

  return response.data
}