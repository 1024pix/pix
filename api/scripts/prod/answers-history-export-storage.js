import { Readable } from 'node:stream';

import { config } from '../../../api/src/shared/config.js';
import { FileValidationError } from '../../src/shared/domain/errors.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { S3ObjectStorageProvider } from '../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

export class AnswersHistoryExportStorage {
  #client;

  constructor() {
    const client = {
      accessKeyId: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_SECRET_ACCESS_KEY,
      endpoint: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_ENDPOINT,
      region: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_REGION,
      bucket: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_BUCKET_NAME,
      forcePathStyle: true,
    };
    this.#client = S3ObjectStorageProvider.createClient(client);
  }

  async sendFile({ filename, fileContent }) {
    let readableStream;
    try {
      readableStream = Readable.from(Buffer.from(fileContent));
      readableStream.on('error', function (error) {
        throw error;
      });
    } catch (error) {
      logger.error(error);
      throw new FileValidationError('INVALID_FILE');
    }
    return this.#client.startUpload({ filename, readableStream });
  }

  async deleteFile({ filename }) {
    return this.#client.deleteFile({ key: filename });
  }
}
