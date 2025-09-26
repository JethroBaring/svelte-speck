import type { ApiResponse } from "../interface"
import type { Organization, OrganizationMember, Role } from "@repo/types/zod"
import type { RoleCreateInput } from "@repo/types"
import axiosInstance from "../axios";

export async function createRole(id: string, createRoleDto: RoleCreateInput): Promise<ApiResponse<Role>> {

  const response = await axiosInstance.post(`/organizations/${id}/roles`, createRoleDto)

  if(!response.data) {
    throw new Error("Failed to create role")
  }

  return response.data  
}

export async function getRoleById(id: string): Promise<ApiResponse<Role>> {
  const response = await axiosInstance.get(`/organizations/${id}/roles`)

  if(!response.data) {
    throw new Error("Failed to fetch role")
  }

  return response.data
}

export async function getRoles(id: string): Promise<ApiResponse<Role[]>> {
  const response = await axiosInstance.get(`/organizations/${id}/roles`)

  if(!response.data) {
    throw new Error("Failed to fetch organization roles")
  }

  return response.data
}