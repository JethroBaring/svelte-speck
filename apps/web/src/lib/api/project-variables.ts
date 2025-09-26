import type { ProjectVariableCreateInput } from "@repo/types/schemas"
import type { ApiResponse } from "../interface"
import type { ProjectVariable } from "@repo/types/zod";
import axiosInstance from "../axios";

export async function getProjectVariables(projectId: string): Promise<ApiResponse<ProjectVariable[]>> {
  const response = await axiosInstance.get(`/projects/${projectId}/project-variables`)

  if(!response.data) {
    throw new Error("Failed to fetch project variables")
  }

  return response.data
}

export async function getProjectVariableById(projectId: string, projectVariableId: string): Promise<ApiResponse<ProjectVariable>> {

  const response = await axiosInstance.get(`/projects/${projectId}/project-variables/${projectVariableId}`)

  if(!response.data) {
    throw new Error("Failed to fetch project variable")
  }

  return response.data  
}

export async function createProjectVariable(projectId: string, createProjectVariableDto: ProjectVariableCreateInput): Promise<ApiResponse<ProjectVariable>> {
  const response = await axiosInstance.post(`/projects/${projectId}/project-variables`, createProjectVariableDto)

  if(!response.data) {
    throw new Error("Failed to create project variable")
  }

  return response.data
}

export async function deleteProjectVariable(projectId: string, projectVariableId: string): Promise<ApiResponse<ProjectVariable>> {
  const response = await axiosInstance.delete(`/projects/${projectId}/project-variables/${projectVariableId}`)

  if(!response.data) {
    throw new Error("Failed to delete project variable")
  }

  return response.data
}