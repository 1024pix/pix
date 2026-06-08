import { Readable } from 'node:stream';

import { FileValidationError } from '../../src/shared/domain/errors.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { S3ObjectStorageProvider } from '../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

const ASSESSMENT_ID_RANGE_SIZE = 1000;

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

  async findParquetWithAssessmentsIds(assessmentIds) {
    const rangeStart = Math.floor((assessmentIds[0] - 1) / ASSESSMENT_ID_RANGE_SIZE) * ASSESSMENT_ID_RANGE_SIZE + 1;
    const rangeEnd = rangeStart + ASSESSMENT_ID_RANGE_SIZE - 1;
    const prefix = `answers/${rangeStart}_${rangeEnd}/`;

    const allKeys = [];
    let continuationToken;

    do {
      const result = await this.#client.listFiles({ prefix, continuationToken });
      allKeys.push(...(result.Contents ?? []).map(({ Key }) => Key));
      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    return allKeys;
  }
}
