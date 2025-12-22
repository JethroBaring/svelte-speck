import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { FilesService } from "./files.service";
import { Public } from "@mguay/nestjs-better-auth";
import { ApiResponse } from "../interfaces/api-response.interface";
import * as fs from "fs";

const SCREENSHOT_BUCKET = "test-step-screenshots";

@Controller("files")
export class FilesController {
  constructor(private readonly files: FilesService) {}

  /**
   * Upload a screenshot image (base64-encoded) from the worker.
   * This stores the file on the local filesystem and returns the API URL.
   */
  @Post("upload-screenshot")
  @Public()
  async uploadScreenshot(
    @Body()
    body: {
      imageBase64: string;
      filename?: string;
    },
  ): Promise<ApiResponse<{ filename: string; url: string }>> {
    const { imageBase64, filename } = body;

    if (!imageBase64) {
      return {
        success: false,
        message: "imageBase64 is required",
        data: undefined,
      };
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const safeFilename =
      filename && filename.trim().length > 0
        ? filename.trim()
        : `screenshot-${Date.now()}.png`;

    await this.files.saveFile(SCREENSHOT_BUCKET, safeFilename, buffer);

    const url = `/files/${safeFilename}`;

    return {
      success: true,
      message: "Screenshot uploaded",
      data: { filename: safeFilename, url },
    };
  }

  /**
   * Return the public API URL for a given screenshot filename.
   * This keeps the existing frontend contract that expects an ApiResponse<string>.
   */
  @Get("access-url/:filename")
  @Public()
  async getAccessUrl(
    @Param("filename") filename: string,
  ): Promise<ApiResponse<string>> {
    const url = `/files/${filename}`;
    return {
      success: true,
      message: "OK",
      data: url,
    };
  }

  /**
   * Serve the screenshot file directly.
   */
  @Get(":filename")
  @Public()
  async serveFile(
    @Param("filename") filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = this.files.getFilePath(SCREENSHOT_BUCKET, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    res.setHeader("Content-Type", "image/png");
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  // Delete file
  @Delete(":filename")
  @Public()
  async deleteFile(@Param("filename") filename: string) {
    const result = await this.files.delete(SCREENSHOT_BUCKET, filename);
    return result;
  }
}

