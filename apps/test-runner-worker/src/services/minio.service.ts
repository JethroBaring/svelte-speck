import * as Minio from 'minio';
import * as dotenv from 'dotenv';

interface UploadResult {
  filename: string;
  bucket: string;
  etag: string;
  url: string;
}
dotenv.config();

class MinioService {
  private client: Minio.Client;
  private bucketName: string;

  constructor() {
    const minioUrl = process.env.MINIO_URL;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    

    if (!minioUrl || !accessKey || !secretKey) {
      throw new Error('MinIO configuration is missing. Please check MINIO_URL, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.');
    }

    // Parse the URL to extract hostname and port
    const url = new URL(minioUrl);
    const endPoint = url.hostname;
    const port = 9000;
    const useSSL = url.protocol === 'https:';

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey
    });

    this.bucketName = 'test-step-screenshots';
  }

  async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`✅ Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  async uploadScreenshot(buffer: Buffer, filename: string): Promise<UploadResult> {
    try {
      await this.ensureBucketExists();
      
      const result = await this.client.putObject(
        this.bucketName,
        filename,
        buffer,
        buffer.length,
        {
          'Content-Type': 'image/png',
          'Cache-Control': 'max-age=31536000', // 1 year cache
        }
      );

      console.log(`✅ Screenshot uploaded: ${filename}`);
      return {
        filename,
        bucket: this.bucketName,
        etag: result.etag,
        url: `${process.env.MINIO_URL}/${this.bucketName}/${filename}`
      };
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
  }

  async getSignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await this.client.presignedUrl('GET', this.bucketName, filename, expiresIn);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  async deleteScreenshot(filename: string): Promise<{ filename: string; deleted: boolean }> {
    try {
      await this.client.removeObject(this.bucketName, filename);
      console.log(`✅ Screenshot deleted: ${filename}`);
      return { filename, deleted: true };
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      throw error;
    }
  }
}

export default new MinioService();
