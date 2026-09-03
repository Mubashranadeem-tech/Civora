import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import { StorageAdapter, StorageUploadResult } from './storage.interface';
import { LocalStorageAdapter } from './adapters/local.adapter';
import { AliyunOssAdapter } from './adapters/aliyun-oss.adapter';

export interface FileUploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
];

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly adapter: StorageAdapter;
  private readonly maxFileSizeMb: number;
  private readonly maxFilesPerProblem: number;

  constructor(private readonly config: ConfigService) {
    const provider = config.get<string>('STORAGE_PROVIDER', 'local');
    this.maxFileSizeMb = config.get<number>('STORAGE_MAX_FILE_SIZE_MB', 10);
    this.maxFilesPerProblem = config.get<number>('STORAGE_MAX_FILES_PER_PROBLEM', 10);

    if (provider === 'aliyun-oss') {
      this.logger.log('Using Alibaba Cloud OSS storage');
      this.adapter = new AliyunOssAdapter(config);
    } else {
      this.logger.log('Using local file storage');
      this.adapter = new LocalStorageAdapter(config);
    }
  }

  validateFile(file: FileUploadInput): { type: 'image' | 'document' | 'other' } {
    const maxBytes = this.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File "${file.originalName}" exceeds the ${this.maxFileSizeMb}MB limit`,
      );
    }

    if (ALLOWED_IMAGE_TYPES.includes(file.mimeType)) {
      return { type: 'image' };
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.mimeType)) {
      return { type: 'document' };
    } else {
      // Block dangerous file types
      const dangerous = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-sh',
        'application/x-bat',
      ];
      if (dangerous.includes(file.mimeType)) {
        throw new BadRequestException(
          `File type "${file.mimeType}" is not allowed for security reasons`,
        );
      }
      return { type: 'other' };
    }
  }

  async uploadFile(
    file: FileUploadInput,
    folder: string,
  ): Promise<StorageUploadResult & { attachmentType: 'image' | 'document' | 'other' }> {
    const { type: attachmentType } = this.validateFile(file);

    const ext = path.extname(file.originalName).toLowerCase();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${uniqueId}${ext}`;

    const result = await this.adapter.upload(
      file.buffer,
      key,
      file.mimeType,
      file.originalName,
    );

    return { ...result, attachmentType };
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    return this.adapter.getSignedUrl(storageKey, expiresInSeconds);
  }

  async deleteFile(storageKey: string): Promise<void> {
    return this.adapter.delete(storageKey);
  }

  get maxFiles(): number {
    return this.maxFilesPerProblem;
  }
}
