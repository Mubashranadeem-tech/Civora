import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter, StorageUploadResult } from '../storage.interface';

/**
 * Alibaba Cloud OSS Storage Adapter
 * Requires: ali-oss package to be installed
 * Set STORAGE_PROVIDER=aliyun-oss in .env to activate
 */
@Injectable()
export class AliyunOssAdapter implements StorageAdapter {
  private readonly logger = new Logger(AliyunOssAdapter.name);
  private client: any;
  private readonly bucket: string;
  private readonly cdnUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('ALIYUN_OSS_BUCKET');
    this.cdnUrl = config.get<string>('ALIYUN_OSS_CDN_URL');

    try {
      // Dynamically load ali-oss so it's optional
      const OSS = require('ali-oss');
      this.client = new OSS({
        accessKeyId: config.getOrThrow<string>('ALIYUN_OSS_ACCESS_KEY_ID'),
        accessKeySecret: config.getOrThrow<string>('ALIYUN_OSS_ACCESS_KEY_SECRET'),
        bucket: this.bucket,
        region: config.getOrThrow<string>('ALIYUN_OSS_REGION'),
        endpoint: config.get<string>('ALIYUN_OSS_ENDPOINT'),
      });
      this.logger.log('✅ Alibaba Cloud OSS initialized');
    } catch (err) {
      this.logger.error('❌ Failed to initialize Alibaba Cloud OSS', err);
      throw err;
    }
  }

  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    originalName: string,
  ): Promise<StorageUploadResult> {
    const result = await this.client.put(key, buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(originalName)}"`,
      },
    });

    const url = this.cdnUrl
      ? `${this.cdnUrl}/${key}`
      : result.url;

    this.logger.log(`File uploaded to OSS: ${key}`);
    return { storageKey: key, url, fileName: key.split('/').pop()! };
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    const url = this.client.signatureUrl(storageKey, {
      expires: expiresInSeconds,
      method: 'GET',
    });
    return url;
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.delete(storageKey);
    this.logger.log(`Deleted from OSS: ${storageKey}`);
  }
}
