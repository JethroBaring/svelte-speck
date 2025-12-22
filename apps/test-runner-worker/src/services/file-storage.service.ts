import * as dotenv from "dotenv";

interface UploadResult {
  filename: string;
  bucket: string;
  etag: string;
  url: string;
}

dotenv.config();

/**
 * Uploads PNG screenshots to the main API, which stores them on local disk
 * and serves them via `/files/:filename`.
 */
class FileStorageService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.MAIN_API_URL || "http://localhost:3000";
  }

  async uploadScreenshot(buffer: Buffer, filename: string): Promise<UploadResult> {
    const imageBase64 = buffer.toString("base64");

    const res = await fetch(`${this.apiBaseUrl}/files/upload-screenshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WORKER_API_KEY || "",
      },
      body: JSON.stringify({
        imageBase64,
        filename,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message =
        data?.message || `Screenshot upload failed: ${res.status} ${res.statusText}`;
      const err = new Error(message) as Error & { status?: number; data?: any };
      err.status = res.status;
      err.data = data;
      throw err;
    }

    const uploaded = data?.data || {};
    const finalFilename: string = uploaded.filename || filename;
    const url: string =
      uploaded.url || `${this.apiBaseUrl.replace(/\/$/, "")}/files/${finalFilename}`;

    return {
      filename: finalFilename,
      bucket: "local-files",
      etag: "",
      url,
    };
  }
}

export default new FileStorageService();

