import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { config } from '../../../src/shared/config.js';

class ImportStorage {
  #client;

  constructor() {
    this.#client = S3ObjectStorageProvider.createClient(config.import.storage.client);
  }

  sendFile({ filename, readableStream }) {
    return this.#client.startUpload({ filename, readableStream });
  }

  async getFileReadableStream({ filename }) {
    const data = await this.#client.readFile({ key: filename });

    return data.Body;
  }
}

const importStorage = new ImportStorage();
export { importStorage, ImportStorage };
