import axiosInstance from "../axios";
import type { Organization, OrganizationMember, Project } from "@repo/types/zod"
import type { ApiResponse } from "../interface"

export async function createOrganization(name: string): Promise<ApiResponse<Organization>> {

  const response = await axiosInstance.post(`/organizations/`, { name })

  if(!response.data) {
    throw new Error("Failed to create organization")
  }

  return response.data  
}

export async function getOrganizations(): Promise<ApiResponse<Organization[]>> {
  const response = await axiosInstance.get(`/organizations`)

  if(!response.data) {
    throw new Error("Failed to fetch organizations")
  }

  return response.data
}

export async function getOrganizationMembers(id: string): Promise<ApiResponse<OrganizationMember[]>> {
  const response = await axiosInstance.get(`/organizations/${id}/members`)

  if(!response.data) {
    throw new Error("Failed to fetch organization members")
  }

  return response.data
}