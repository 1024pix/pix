import { Readable } from 'node:stream';

import { config } from '../../../shared/config.js';
import { FileValidationError } from '../../../shared/domain/errors.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { S3ObjectStorageProvider } from '../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

export class AnswersHistoryRepository {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(config.answersHistoryExport.storage.client);
  }

  static createClient() {
    return new AnswersHistoryRepository();
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
    // file path constraint to avoid policies issues with the buckets
    // eslint-disable-next-line no-useless-escape
    const regex = 'answers/.*\.parquet';
    if (filename.search(regex) !== -1) {
      return this.#client.deleteFile({ key: filename });
    } else {
      logger.error(`Invalid path for filename ${filename}`);
      throw new FileValidationError('INVALID_FILE');
    }
  }
}
