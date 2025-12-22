import type { ApiResponse } from "../api-response.interface";
import axiosInstance from "../axios";

/**
 * Returns the public URL (served by the API) for a stored file/screenshot.
 */
export async function getFilePublicUrl(
  name: string,
): Promise<ApiResponse<string>> {
  const response = await axiosInstance.get(`/files/access-url/${name}`);

  if (!response.data) {
    throw new Error("Failed to get public file url");
  }

  return response.data as ApiResponse<string>;
}

