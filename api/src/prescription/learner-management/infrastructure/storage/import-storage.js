import fs from 'node:fs';
import path from 'node:path';

import { FileValidationError } from '../../../../../lib/domain/errors.js';
import { logErrorWithCorrelationIds } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { config } from '../../../../shared/config.js';
import { S3ObjectStorageProvider } from '../../../../shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';

class ImportStorage {
  #client;
  #basename;
  #createReadStream;

  constructor({ basename = path.basename, createReadStream = fs.createReadStream } = {}) {
    this.#client = S3ObjectStorageProvider.createClient(config.import.storage.client);
    this.#basename = basename;
    this.#createReadStream = createReadStream;
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
      logErrorWithCorrelationIds(error);
      throw new FileValidationError('INVALID_FILE');
    }
    await this.#client.startUpload({ filename, readableStream });
    return filename;
  }

  async readFile({ filename }) {
    const data = await this.#client.readFile({ key: filename });

    return data.Body;
  }

  async deleteFile({ filename }) {
    await this.#client.deleteFile({ key: filename });
  }
}

const importStorage = new ImportStorage();
export { ImportStorage, importStorage };
