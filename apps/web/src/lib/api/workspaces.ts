import type { Workspace, WorkspaceMember } from '@repo/types/zod';
import type { ApiResponse } from '../api-response.interface';
import axiosInstance from '../axios';

export async function createWorkspace(name: string, icon: string): Promise<ApiResponse<Workspace>> {
	const response = await axiosInstance.post(`/workspaces/`, { name, icon });

	if (!response.data) {
		throw new Error('Failed to create workspace');
	}

	return response.data;
}

export async function getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
	const response = await axiosInstance.get(`/workspaces`);

	if (!response.data) {
		throw new Error('Failed to fetch workspaces');
	}

	return response.data;
}

export async function getWorkspaceMembers(id: string): Promise<ApiResponse<WorkspaceMember[]>> {
	const response = await axiosInstance.get(`/workspaces/${id}/members`);

	if (!response.data) {
		throw new Error('Failed to fetch workspace members');
	}

	return response.data;
}
