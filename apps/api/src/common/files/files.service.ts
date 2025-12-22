import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class FilesService {
  private readonly rootDir: string;

  constructor(private readonly configService: ConfigService) {
    // Base directory where screenshots will be stored locally
    this.rootDir =
      this.configService.get<string>("SCREENSHOTS_DIR") ||
      path.join(process.cwd(), "uploads");
  }

  private getBucketDir(bucket: string): string {
    return path.join(this.rootDir, bucket);
  }

  getFilePath(bucket: string, key: string): string {
    return path.join(this.getBucketDir(bucket), key);
  }

  async saveFile(bucket: string, key: string, buffer: Buffer): Promise<void> {
    const bucketDir = this.getBucketDir(bucket);

    await fs.promises.mkdir(bucketDir, { recursive: true });
    const filePath = this.getFilePath(bucket, key);
    await fs.promises.writeFile(filePath, buffer);
  }

  async delete(bucket: string, key: string) {
    const filePath = this.getFilePath(bucket, key);
    try {
      await fs.promises.unlink(filePath);
      return { bucket, key, deleted: true };
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File already removed / never existed
        return { bucket, key, deleted: false };
      }
      throw error;
    }
  }

  /**
   * For local storage we don't need signed URLs; instead we expose the
   * API route that serves the file. We keep this method for backwards
   * compatibility with existing callers.
   */
  async getSignedAccessUrl(
    bucket: string,
    key: string,
    _expiresIn = 3600,
  ): Promise<string> {
    // The actual serving is handled by the controller, this is just the path.
    return `/files/${key}`;
  }
}

