import fs from 'node:fs';
import path from 'node:path';

import { config } from '../../../../shared/config.js';
import { DomainError, FileValidationError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { getDataBuffer as gDB } from '../utils/bufferize/get-data-buffer.js';

class S3UploadError extends Error {}

class S3ReadError extends Error {}

class S3FileDoesNotExistError extends DomainError {}

class S3DeleteError extends DomainError {}

class ImportStorage {
  #client;
  #basename;
  #createReadStream;
  #getDataBuffer;

  constructor({ basename = path.basename, createReadStream = fs.createReadStream, getDataBuffer = gDB } = {}) {
    this.#client = S3ObjectStorageProvider.createClient(config.import.storage.client);
    this.#basename = basename;
    this.#createReadStream = createReadStream;
    this.#getDataBuffer = getDataBuffer;
  }

  async sendFile({ filepath }) {
    const filename = this.#basename(filepath);
    let readableStream;
    try {
      readableStream = this.#createReadStream(filepath);
      readableStream.on('error', function (error) {
        throw error;
      });
    } catch (error) {
      logger.error(error);
      throw new FileValidationError('INVALID_FILE');
    }
    try {
      await this.#client.startUpload({ filename, readableStream });
    } catch (err) {
      logger.error(err);
      throw new S3UploadError(err.message);
    }
    return filename;
  }

  async readFile({ filename }) {
    try {
      const data = await this.#client.readFile({ key: filename });

      return data.Body;
    } catch (error) {
      logger.error(error);
      if (error.Code === 'NoSuchKey') throw new S3FileDoesNotExistError(error.message);
      throw new S3ReadError(error.message);
    }
  }

  async getParser({ Parser, filename }, ...args) {
    const readableStream = await this.readFile({ filename });
    const buffer = await this.#getDataBuffer(readableStream);
    const parser = Parser.buildParser(buffer, ...args);
    return parser;
  }

  async deleteFile({ filename }) {
    try {
      await this.#client.deleteFile({ key: filename });
    } catch (err) {
      logger.error(err);
      throw new S3DeleteError(err.message);
    }
  }
}

const importStorage = new ImportStorage();
export { ImportStorage, importStorage, S3DeleteError, S3FileDoesNotExistError, S3ReadError, S3UploadError };
