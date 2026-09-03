import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { StorageAdapter, StorageUploadResult } from '../storage.interface';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly basePath: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.basePath = config.get<string>('STORAGE_LOCAL_PATH', './uploads');
    this.baseUrl = config.get<string>('API_URL', 'http://localhost:4000');
  }

  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    originalName: string,
  ): Promise<StorageUploadResult> {
    const dir = path.dirname(path.join(this.basePath, key));
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(this.basePath, key);
    await fs.writeFile(filePath, buffer);

    const url = `${this.baseUrl}/uploads/${key}`;
    this.logger.log(`File stored locally: ${key}`);

    return { storageKey: key, url, fileName: path.basename(key) };
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    // Local storage: generate a time-limited token
    const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto
      .createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET'))
      .update(`${storageKey}:${expiry}`)
      .digest('hex');

    return `${this.baseUrl}/api/v1/storage/file/${encodeURIComponent(storageKey)}?token=${token}&exp=${expiry}`;
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.basePath, storageKey);
    try {
      await fs.unlink(filePath);
    } catch {
      this.logger.warn(`Could not delete file: ${storageKey}`);
    }
  }
}
