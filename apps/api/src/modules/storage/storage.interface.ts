export interface StorageUploadResult {
  storageKey: string;
  url: string;
  fileName: string;
}

export interface StorageAdapter {
  upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    originalName: string,
  ): Promise<StorageUploadResult>;

  getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;

  delete(storageKey: string): Promise<void>;
}
