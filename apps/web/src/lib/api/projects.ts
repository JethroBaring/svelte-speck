import axiosInstance from "../axios";
import type { ApiResponse } from "../interface"
import type { Project } from "@repo/types/zod"

export async function getProjects(organizationId: string): Promise<ApiResponse<Project[]>> {
  const response = await axiosInstance.get(`/organizations/${organizationId}/projects`)

  if(!response.data) {
    throw new Error("Failed to fetch projects")
  }

  return response.data
}

export async function getProjectById(id: string): Promise<ApiResponse<Project>> {

  const response = await axiosInstance.get(`/projects/${id}`)

  if(!response.data) {
    throw new Error("Failed to fetch project")
  }

  return response.data  
}

export async function createProject(id: string, name: string): Promise<ApiResponse<Project>> {
  const response = await axiosInstance.post(`/organizations/${id}/projects/`, { name })

  if(!response.data) {
    throw new Error("Failed to create project")
  }

  return response.data
}

export async function deleteProject(id: string): Promise<ApiResponse<Project>> {
  const response = await axiosInstance.delete(`/projects/${id}`)

  if(!response.data) {
    throw new Error("Failed to delete project")
  }

  return response.data
}