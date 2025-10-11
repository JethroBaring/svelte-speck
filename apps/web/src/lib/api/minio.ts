import type { ApiResponse } from '../api-response.interface';
import axiosInstance from '../axios';

export async function getMinioPublicUrl(name: string): Promise<ApiResponse<string>> {
	const response = await axiosInstance.get(`/files/access-url/${name}`);

	if (!response.data) {
		throw new Error('Failed to get minio public url');
	}

	return response.data;
}
